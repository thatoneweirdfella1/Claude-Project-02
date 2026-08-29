/* Output schemas for Consensus and Synthesis (Step 8.4).

   PIPELINE.md MULTI-AI ACTIONS: "Consensus: common ground after a debate
   (disagreement, common ground, unified view). Synthesis: combine
   perspectives into one refined answer the user can use to replace the
   original or merge below." Both schemas are strict on their whole output —
   unlike translation's one load-bearing field among several optional ones,
   every field here IS the deliverable, so a reply missing any of them is not
   a usable result. */

export interface ConsensusResult {
  disagreement: string;
  commonGround: string;
  unifiedView: string;
}

export interface SynthesisResult {
  refinedAnswer: string;
}

export class MultiAiSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MultiAiSchemaError";
  }
}

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new MultiAiSchemaError(`Reply is missing a non-empty "${field}".`);
  }
  return value.trim();
}

export function parseConsensusOutput(parsed: unknown): ConsensusResult {
  if (parsed === null || typeof parsed !== "object") {
    throw new MultiAiSchemaError("Consensus reply was not a JSON object.");
  }
  const obj = parsed as Record<string, unknown>;
  return {
    disagreement: requireNonEmptyString(obj.disagreement, "disagreement"),
    commonGround: requireNonEmptyString(obj.commonGround, "commonGround"),
    unifiedView: requireNonEmptyString(obj.unifiedView, "unifiedView"),
  };
}

export function parseSynthesisOutput(parsed: unknown): SynthesisResult {
  if (parsed === null || typeof parsed !== "object") {
    throw new MultiAiSchemaError("Synthesis reply was not a JSON object.");
  }
  const obj = parsed as Record<string, unknown>;
  return {
    refinedAnswer: requireNonEmptyString(obj.refinedAnswer, "refinedAnswer"),
  };
}
