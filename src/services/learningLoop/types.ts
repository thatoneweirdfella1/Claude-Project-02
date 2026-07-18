/* Learning loop types (Step 10.1).
   Data structures for pattern analysis and rule refinement proposals. */

import type { TechniqueId } from "../../stores/types";

export interface RefinementProposal {
  type: "technique-weight" | "detection-threshold";
  target: TechniqueId | string;
  adjustment: "increase" | "decrease";
  reasoning: string;
  confidence: number; // 0-100, based on sample size and consistency
  affectedRunCount: number;
  feedbackSignals: string[]; // keyword evidence
}

export interface AnalysisResult {
  totalQuestionsAnalyzed: number;
  analysisTimestamp: number;
  proposals: RefinementProposal[];
  patterns: {
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
  };
  confidenceScore: number;
}
