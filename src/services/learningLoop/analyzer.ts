/* Pattern analysis engine for the learning loop (Step 10.1).
   Analyzes feedback/correction patterns after 15+ questions.
   Proposes rule refinements with dampening.
   Never throws; runs in background. */

import type { TelemetryEntry } from "../telemetry/types";
import type { Rating, StateCorrection, TechniqueId } from "../../stores/types";
import type { AnalysisResult, RefinementProposal } from "./types";

const ANALYSIS_THRESHOLD = 15;
const CONFIDENCE_THRESHOLD = 50; // min confidence % to propose a refinement
const LOW_RATING = 2; // 1-2 stars
const HIGH_RATING = 4; // 4-5 stars
const MIN_SAMPLE_SIZE = 3; // need at least 3 runs to count a pattern

interface PatternData {
  techniqueFrequency: Map<TechniqueId, number[]>; // technique → array of ratings
  complexityFrequency: Map<string, number[]>; // complexity level → ratings
  autoDetectRatings: number[]; // ratings when auto-detect was used
  manualRatings: number[]; // ratings when user picked techniques manually
  feedbackKeywords: Map<string, number>; // keyword → frequency
}

export function analyzePatterns(
  telemetryEntries: TelemetryEntry[],
  ratings: Rating[],
  stateCorrections: StateCorrection[]
): AnalysisResult {
  const timestamp = Date.now();

  // Early exit if not enough data
  if (telemetryEntries.length < ANALYSIS_THRESHOLD) {
    return {
      totalQuestionsAnalyzed: telemetryEntries.length,
      analysisTimestamp: timestamp,
      proposals: [],
      patterns: {
        techniques: [],
        routing: [],
        states: [],
      },
      confidenceScore: 0,
    };
  }

  const patterns = extractPatterns(telemetryEntries, ratings, stateCorrections);
  const proposals = generateProposals(patterns);
  const confidenceScore = calculateConfidence(patterns, proposals);

  return {
    totalQuestionsAnalyzed: telemetryEntries.length,
    analysisTimestamp: timestamp,
    proposals,
    patterns,
    confidenceScore,
  };
}

interface PatternResult {
  techniques: Array<{
    techniqueId: TechniqueId;
    totalRuns: number;
    avgRating: number;
    lowRatingRuns: number;
    highRatingRuns: number;
    commonFeedback: Map<string, number>;
    recommendedAdjustment: "increase" | "decrease" | "none";
  }>;
  routing: Array<{
    complexity: string;
    avgRating: number;
    lowRatingRuns: number;
    highRatingRuns: number;
    commonFeedback: Map<string, number>;
  }>;
  states: Array<{
    dimension: string;
    value: string;
    correctionCount: number;
    correctedToValues: Map<string, number>;
  }>;
}

function extractPatterns(
  telemetry: TelemetryEntry[],
  ratings: Rating[],
  stateCorrections: StateCorrection[]
): PatternResult {
  const ratingMap = new Map(ratings.map((r) => [r.messageId, r]));
  const patternData: PatternData = {
    techniqueFrequency: new Map(),
    complexityFrequency: new Map(),
    autoDetectRatings: [],
    manualRatings: [],
    feedbackKeywords: new Map(),
  };

  // Analyze telemetry entries with their ratings
  for (const entry of telemetry) {
    if (entry.outcome !== "done") continue;

    const rating = ratingMap.get(entry.id);
    const ratingValue = rating?.stars ?? 3; // default middle if no rating

    // Track technique patterns
    if (entry.techniques && entry.techniques.length > 0) {
      for (const tech of entry.techniques) {
        const ratings = patternData.techniqueFrequency.get(tech) ?? [];
        ratings.push(ratingValue);
        patternData.techniqueFrequency.set(tech, ratings);
      }
    }

    // Track complexity patterns
    const complexity = categorizeComplexity(entry.complexity);
    const complexRatings = patternData.complexityFrequency.get(complexity) ?? [];
    complexRatings.push(ratingValue);
    patternData.complexityFrequency.set(complexity, complexRatings);

    // Track auto-detect vs manual
    if (entry.techniqueMode === "auto-detect") {
      patternData.autoDetectRatings.push(ratingValue);
    } else if (entry.techniqueMode === "manual") {
      patternData.manualRatings.push(ratingValue);
    }

    // Extract feedback keywords (low ratings only)
    if (rating?.comment && ratingValue <= LOW_RATING) {
      const keywords = extractFeedbackKeywords(rating.comment);
      for (const kw of keywords) {
        patternData.feedbackKeywords.set(
          kw,
          (patternData.feedbackKeywords.get(kw) ?? 0) + 1
        );
      }
    }
  }

  // Build technique patterns
  const techniquePatterns = Array.from(patternData.techniqueFrequency.entries()).map(
    ([techId, ratings]) => {
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b) / ratings.length : 3;
      const lowCount = ratings.filter((r) => r <= LOW_RATING).length;
      const highCount = ratings.filter((r) => r >= HIGH_RATING).length;

      // Dampening: need consistent signal, not one low rating
      const needsDampening = ratings.length < MIN_SAMPLE_SIZE;
      const adjustment = computeAdjustment(
        avgRating,
        lowCount,
        highCount,
        needsDampening
      );

      return {
        techniqueId: techId,
        totalRuns: ratings.length,
        avgRating,
        lowRatingRuns: lowCount,
        highRatingRuns: highCount,
        commonFeedback: patternData.feedbackKeywords,
        recommendedAdjustment: adjustment,
      };
    }
  );

  // Build routing patterns
  const routingPatterns = Array.from(patternData.complexityFrequency.entries()).map(
    ([complexity, ratings]) => {
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b) / ratings.length : 3;
      return {
        complexity,
        avgRating,
        lowRatingRuns: ratings.filter((r) => r <= LOW_RATING).length,
        highRatingRuns: ratings.filter((r) => r >= HIGH_RATING).length,
        commonFeedback: patternData.feedbackKeywords,
      };
    }
  );

  // Build state patterns from corrections
  const statePatternMap = new Map<
    string,
    { correctionCount: number; correctedTo: Map<string, number> }
  >();

  for (const correction of stateCorrections) {
    const key = `${correction.dimension}:${correction.from}`;
    if (!statePatternMap.has(key)) {
      statePatternMap.set(key, { correctionCount: 0, correctedTo: new Map() });
    }
    const pattern = statePatternMap.get(key)!;
    pattern.correctionCount++;
    pattern.correctedTo.set(
      correction.to,
      (pattern.correctedTo.get(correction.to) ?? 0) + 1
    );
  }

  const statePatterns = Array.from(statePatternMap.entries()).map(
    ([key, data]) => {
      const [dimension, value] = key.split(":");
      return {
        dimension: dimension ?? "unknown",
        value: value ?? "unknown",
        correctionCount: data.correctionCount,
        correctedToValues: data.correctedTo,
      };
    }
  );

  return {
    techniques: techniquePatterns,
    routing: routingPatterns,
    states: statePatterns,
  } as PatternResult;
}

function generateProposals(patterns: PatternResult): RefinementProposal[] {
  const proposals: RefinementProposal[] = [];

  // Technique proposals
  for (const tech of patterns.techniques) {
    if (
      tech.recommendedAdjustment === "none" ||
      tech.totalRuns < MIN_SAMPLE_SIZE
    ) {
      continue;
    }

    const confidence = computeConfidence(
      tech.totalRuns,
      tech.lowRatingRuns,
      tech.highRatingRuns,
      tech.recommendedAdjustment
    );

    if (confidence < CONFIDENCE_THRESHOLD) continue;

    const signals: string[] = [];
    tech.commonFeedback.forEach((count, kw) => {
      if (count >= 2) signals.push(kw);
    });

    proposals.push({
      type: "technique-weight",
      target: tech.techniqueId,
      adjustment: tech.recommendedAdjustment,
      reasoning:
        tech.recommendedAdjustment === "decrease"
          ? `Low ratings (${tech.lowRatingRuns} runs) with "${tech.techniqueId}"`
          : `High ratings (${tech.highRatingRuns} runs) with "${tech.techniqueId}"`,
      confidence,
      affectedRunCount: tech.totalRuns,
      feedbackSignals: signals,
    });
  }

  return proposals.sort((a, b) => b.confidence - a.confidence);
}

function categorizeComplexity(complexity: number | null): string {
  if (complexity === null) return "unknown";
  if (complexity <= 2) return "low";
  if (complexity <= 5) return "medium";
  return "high";
}

function extractFeedbackKeywords(comment: string): string[] {
  const keywords = new Set<string>();
  const lowercased = comment.toLowerCase();

  // Match common feedback patterns
  const patterns = [
    /too\s+verbose|too\s+long|too\s+detailed/,
    /too\s+short|too\s+brief|not\s+enough/,
    /too\s+technical|hard\s+to\s+understand/,
    /too\s+simple|not\s+thorough/,
    /too\s+fast|too\s+slow/,
    /repetitive|redundant/,
    /confusing|unclear/,
  ];

  for (const pattern of patterns) {
    if (pattern.test(lowercased)) {
      keywords.add(pattern.source.replace(/\|/g, " "));
    }
  }

  return Array.from(keywords);
}

function computeAdjustment(
  _avgRating: number,
  lowCount: number,
  highCount: number,
  needsDampening: boolean
): "increase" | "decrease" | "none" {
  if (needsDampening) return "none";
  if (lowCount > highCount * 2) return "decrease";
  if (highCount > lowCount * 2) return "increase";
  return "none";
}

function computeConfidence(
  totalRuns: number,
  lowCount: number,
  highCount: number,
  adjustment: "increase" | "decrease"
): number {
  // Base confidence on sample size: 3+ = 50%, 5+ = 70%, 8+ = 90%
  let sizeConfidence = Math.min(90, 50 + (totalRuns - 3) * 5);

  // Boost confidence if signal is clear
  const majorityCount = adjustment === "decrease" ? lowCount : highCount;
  const majorityRatio = majorityCount / totalRuns;

  return Math.round(sizeConfidence * majorityRatio);
}

function calculateConfidence(
  _patterns: PatternResult,
  proposals: RefinementProposal[]
): number {
  if (proposals.length === 0) return 0;
  const avgConfidence =
    proposals.reduce((sum, p) => sum + p.confidence, 0) / proposals.length;
  return Math.round(avgConfidence);
}
