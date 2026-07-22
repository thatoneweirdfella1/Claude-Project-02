/* Translation output schema — "the schema in code" deliverable of Step 2.1
   (design spec: TRANSLATION-SPEC.md). Defines the gap taxonomy, the shape the
   Translation Engine returns, and a tolerant validator that turns the model's
   JSON into a trusted, typed TranslationResult.

   The runtime service (Step 2.2) calls claude-sonnet-5 with the system prompt
   from ./prompt.ts, JSON-parses the reply, and runs it through
   parseTranslationOutput() here. Validation is deliberately tolerant of an
   LLM's imperfections (clamps out-of-range confidence, drops unknown gap ids,
   dedupes) but strict about the load-bearing field (a usable translatedPrompt)
   — a malformed reply throws rather than silently yielding a bad request. */

/* The six gap types from PIPELINE.md "TRANSLATION ENGINE" / CANON Feature 1.
   Ids are the stable contract shared by the model output, this schema, the
   detected-gaps UI, and the transparency card. Do not rename without updating
   TRANSLATION-SPEC.md and prompt.ts. */
export const GAP_TYPES = [
  "tangential-preamble",
  "emotional-intensity-distortion",
  "compound-buried-request",
  "typo-pronoun-wrapper-corruption",
  "scope-ambiguity",
  "unstated-assumptions",
] as const;

export type GapType = (typeof GAP_TYPES)[number];

/** Human-readable labels for the six gap types (for the detected-gaps UI and
    the transparency card built in later steps). */
export const GAP_TYPE_LABELS: Record<GapType, string> = {
  "tangential-preamble": "Tangential preamble",
  "emotional-intensity-distortion": "Emotional intensity distortion",
  "compound-buried-request": "Compound buried request",
  "typo-pronoun-wrapper-corruption": "Typo / pronoun / wrapper corruption",
  "scope-ambiguity": "Scope ambiguity",
  "unstated-assumptions": "Unstated assumptions",
};

/** The Translation Engine's output. `translatedPrompt`, `confidence`, and
    `detectedGaps` are the schema Step 2.1 is required to define; `reasoning`
    is added per CONVENTIONS.md rule 6 ("No black boxes ... design the data
    shape for the Transparency card even in steps before it exists"). */
export interface TranslationResult {
  /** The buried real request, reframed clear and self-contained. */
  translatedPrompt: string;
  /** Integer 0-100. Means "did the engine identify the RIGHT request"
      (PIPELINE.md), NOT whether a good answer exists. Downstream confidence
      gates (Step 2.3) read this. */
  confidence: number;
  /** Which of the six gap types were present in the raw input. */
  detectedGaps: GapType[];
  /** One or two plain, non-judgmental sentences on how the input was read.
      User-facing (transparency card); never blank. */
  reasoning: string;
}

/** Thrown when the model reply can't be coerced into a usable
    TranslationResult (missing/empty translatedPrompt, or not an object). */
export class TranslationSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TranslationSchemaError";
  }
}

export function isGapType(value: unknown): value is GapType {
  return (
    typeof value === "string" && (GAP_TYPES as readonly string[]).includes(value)
  );
}

function clampConfidence(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) {
    // Missing/garbage confidence is treated as "unsure" rather than fabricated
    // as high — safer for the gates, which escalate/clarify on low confidence.
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeGaps(raw: unknown): GapType[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<GapType>();
  for (const item of raw) {
    if (isGapType(item)) seen.add(item);
  }
  return [...seen];
}

/** Validate and normalize an already-JSON-parsed model reply into a
    TranslationResult. Tolerant of LLM noise (clamps confidence, drops unknown
    gaps, dedupes) but throws TranslationSchemaError if the reply has no usable
    translated prompt. */
export function parseTranslationOutput(parsed: unknown): TranslationResult {
  if (parsed === null || typeof parsed !== "object") {
    throw new TranslationSchemaError(
      "Translation reply was not a JSON object.",
    );
  }

  const obj = parsed as Record<string, unknown>;

  const translatedPrompt =
    typeof obj.translatedPrompt === "string" ? obj.translatedPrompt.trim() : "";
  if (translatedPrompt.length === 0) {
    throw new TranslationSchemaError(
      "Translation reply is missing a non-empty translatedPrompt.",
    );
  }

  const reasoning =
    typeof obj.reasoning === "string" && obj.reasoning.trim().length > 0
      ? obj.reasoning.trim()
      : "No interpretation notes were provided.";

  return {
    translatedPrompt,
    confidence: clampConfidence(obj.confidence),
    detectedGaps: normalizeGaps(obj.detectedGaps),
    reasoning,
  };
}
