/* Auto-select scoring heuristic for debate partners (Step 8.3).
   ROUTING.md DEBATE PARTNERS: "Auto-select: a scoring function matches the
   roster's stated role against the question's domain/complexity (reusing
   routing.js's existing dimension signals where practical, rather than
   inventing a second classifier) and picks the single best-fit partner by
   default, expanding to 2-3 partners only when complexity/scope signals are
   high."

   This is a SIMPLIFIED heuristic, not routing.js's full scorer. It reads the
   question text for domain keywords and estimates complexity from signal
   presence (analysis verbs, multi-part structure, constraints), then returns
   1-3 best-fit partner IDs. The logic is deterministic per question. */

import { DEBATE_PARTNER_IDS, type DebatePartnerId } from "./roster";

interface PartnerScore {
  id: DebatePartnerId;
  score: number;
}

/** Estimate complexity from the question text using signal presence.
    Returns a number 1-10 for categorization. */
function estimateComplexity(question: string): number {
  const lower = question.toLowerCase();

  // Analysis verbs (synthesis, reasoning)
  const analysisVerbs =
    /\b(analyze|evaluate|compare|contrast|synthesize|argue|explain|interpret|critique)\b/i;
  // Constraints or conditions
  const constraints = /\b(must|should|constraint|condition|but|however|unless|except)\b/i;
  // Multi-part markers
  const multiPart = /(\?.*\?|\.\s*[A-Z].*\.|\d+\.\s+|\band\b|\bor\b)/;
  // Design/architecture
  const design = /\b(design|architecture|build|create|system|structure|organize)\b/i;
  // Proof or rigor
  const proof = /\b(prove|show|demonstrate|verify|evidence|support)\b/i;
  // Technical depth
  const technical = /\b(algorithm|data structure|optimization|complexity|performance)\b/i;

  const signals = [
    analysisVerbs.test(lower) ? 2 : 0,
    constraints.test(lower) ? 1 : 0,
    multiPart.test(question) ? 1 : 0,
    design.test(lower) ? 2 : 0,
    proof.test(lower) ? 2 : 0,
    technical.test(lower) ? 1 : 0,
  ];

  const complexity = signals.reduce((a, b) => a + b, 0);
  // Anchor: short question stays low, length adds a point per 100 chars
  const lengthBonus = Math.floor(question.length / 100);
  return Math.min(10, Math.max(1, complexity + lengthBonus));
}

/** Score all partners against the question and return the best 1-3.
    - Complexity 1-3 (simple): return 1 partner (best-fit)
    - Complexity 4-6 (moderate): return 1-2 partners (best + secondary)
    - Complexity 7+ (high): return 2-3 partners (best + secondary + third)
*/
export function autoSelectPartners(question: string): DebatePartnerId[] {
  const lower = question.toLowerCase();
  const complexity = estimateComplexity(question);

  const scores: PartnerScore[] = DEBATE_PARTNER_IDS.map((id) => {
    let score = 0;

    if (id === "gpt-5.5") {
      // Agentic generalist — practical reasoning, planning
      score += /\b(practical|plan|execute|build|step-by-step|how to)\b/i.test(lower) ? 3 : 0;
      score += /\b(code|implement|real-world)\b/i.test(lower) ? 2 : 0;
    } else if (id === "gemini-3.1-pro") {
      // Abstract/reframing reasoning, multimodal
      score += /\b(abstract|conceptual|theory|philosophy|meaning|why)\b/i.test(lower) ? 3 : 0;
      score += /\b(reframe|perspective|pattern|meta)\b/i.test(lower) ? 2 : 0;
      score += /\b(image|visual|diagram|chart|multimodal)\b/i.test(lower) ? 2 : 0;
    } else if (id === "grok-4.3") {
      // Real-time grounded, current events, blunt
      score += /\b(current|today|recent|news|real-time|latest|breaking)\b/i.test(lower) ? 3 : 0;
      score += /\b(controversial|debate|argument|take|opinion)\b/i.test(lower) ? 2 : 0;
    } else if (id === "deepseek-v4-pro") {
      // Near-frontier, especially for high-complexity reasoning
      score += complexity >= 7 ? 2 : 0; // Boosts for hard questions
      score += /\b(cutting edge|frontier|advanced|frontier-tier)\b/i.test(lower) ? 2 : 0;
    }

    return { id, score };
  });

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  // Return 1-3 based on complexity
  if (complexity >= 7) {
    // High complexity: 3 partners (best, second, third)
    return scores.slice(0, 3).map((s) => s.id);
  } else if (complexity >= 4) {
    // Moderate: 2 partners (best, second)
    return scores.slice(0, 2).map((s) => s.id);
  } else {
    // Simple: 1 partner (best-fit)
    return [scores[0].id];
  }
}
