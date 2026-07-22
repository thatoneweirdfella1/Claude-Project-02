/* State-detection output schema (Step 6.1 — detection architecture).

   PIPELINE.md STATE DETECTION (Feature 5): on the TRANSLATE & ASK press, one
   on-demand classification (claude-haiku-4-5 through the proxy) scores the
   input across FOUR dimensions — Emotion, RSD Level, Interest, Cognitive Mode
   — and returns a result the pills render. This file defines the shape that
   result takes and a tolerant validator turning the model's JSON into a
   trusted, typed StateDetectionResult.

   The four dimension VALUE unions live in stores/types.ts (Step 1.7 fixed them:
   EmotionState / RsdLevel / InterestLevel / CognitiveMode) so the store's
   StatePills and this result speak the exact same vocabulary — a detection
   result maps to StatePills with no translation (toStatePills, below).

   Step 6.2 owns the classifier PROMPT and finalizes/tunes the schema detail
   (per-state system impacts, signal lists). This step establishes the runtime
   SHAPE the service parses; 6.2 refines the prompt that fills it. If the two
   ever drift, this code is authoritative (same rule as translation/schema.ts). */

import type {
  CognitiveMode,
  EmotionState,
  InterestLevel,
  RsdLevel,
  StatePills,
} from "../../stores/types";

/* The valid values per dimension — mirrors CANON Feature 5 / PIPELINE.md's
   named options, kept as arrays here (not just the type unions) so the
   validator can membership-check the model's reply and the prompt (Step 6.2)
   can reference one authoritative list. */
export const EMOTION_STATES: readonly EmotionState[] = [
  "overwhelmed",
  "frustrated",
  "calm",
  "excited",
  "anxious",
];
export const RSD_LEVELS: readonly RsdLevel[] = ["low", "medium", "high"];
export const INTEREST_LEVELS: readonly InterestLevel[] = ["low", "medium", "high"];
export const COGNITIVE_MODES: readonly CognitiveMode[] = [
  "analytical",
  "creative",
  "processing",
  "racing",
  "stuck",
];

/** One classified dimension: the detected value plus a 0-100 confidence.
    Null (at the result level, below) means the model had no confident read
    for that dimension — the pill for it simply isn't shown, rather than a
    neutral value being fabricated (CANON: pills are what the app actually
    detected, correctable, never a black box). */
export interface DimensionReading<T> {
  value: T;
  /** Integer 0-100 — how confident the classifier is in THIS dimension's
      value. Kept per-dimension (not one overall score) because the four are
      independent reads; the transparency card (Feature 8) surfaces them. */
  confidence: number;
}

/** The Detection Engine's output. The four dimension fields are each a reading
    or null; `summary` is the one-line, user-facing explanation the State
    Detection panel shows ("You sound overwhelmed. I told the AI to be extra
    supportive…"). Never-blank summary (validator fills a fallback). */
export interface StateDetectionResult {
  emotion: DimensionReading<EmotionState> | null;
  rsd: DimensionReading<RsdLevel> | null;
  interest: DimensionReading<InterestLevel> | null;
  cognitive: DimensionReading<CognitiveMode> | null;
  /** Plain, non-judgmental one/two sentences on what was read and why —
      user-facing (the panel's explanatory line). CANON ADHD Feedback: never
      corrective, never making the user feel judged. */
  summary: string;
}

/** Thrown only when the reply isn't a usable object at all. Unlike
    translation (which throws on a missing load-bearing field), detection has
    NO single required field — every dimension may independently be null — so
    this fires just for a non-object reply. */
export class DetectionSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DetectionSchemaError";
  }
}

function clampConfidence(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return 0; // missing/garbage → unsure, never fabricated high
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Parse one dimension: accept either a bare value string ("calm") or an
    object ({ value, confidence }). Anything not in `allowed` → null (no
    fabricated neutral). A bare value with no confidence defaults to 0 —
    tolerant, and safe: a low-confidence pill is at worst dismissed. */
function parseDimension<T extends string>(
  raw: unknown,
  allowed: readonly T[],
): DimensionReading<T> | null {
  if (typeof raw === "string") {
    return (allowed as readonly string[]).includes(raw)
      ? { value: raw as T, confidence: 0 }
      : null;
  }
  if (raw !== null && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    const value = obj.value;
    if (typeof value === "string" && (allowed as readonly string[]).includes(value)) {
      return { value: value as T, confidence: clampConfidence(obj.confidence) };
    }
  }
  return null;
}

/** Validate and normalize an already-JSON-parsed model reply into a
    StateDetectionResult. Tolerant of LLM noise per dimension (unknown value →
    that dimension null; garbage confidence → 0) but throws
    DetectionSchemaError only if the whole reply isn't an object. */
export function parseDetectionOutput(parsed: unknown): StateDetectionResult {
  if (parsed === null || typeof parsed !== "object") {
    throw new DetectionSchemaError("Detection reply was not a JSON object.");
  }
  const obj = parsed as Record<string, unknown>;

  const summary =
    typeof obj.summary === "string" && obj.summary.trim().length > 0
      ? obj.summary.trim()
      : "No state read was available for this message.";

  return {
    emotion: parseDimension<EmotionState>(obj.emotion, EMOTION_STATES),
    rsd: parseDimension<RsdLevel>(obj.rsd, RSD_LEVELS),
    interest: parseDimension<InterestLevel>(obj.interest, INTEREST_LEVELS),
    cognitive: parseDimension<CognitiveMode>(obj.cognitive, COGNITIVE_MODES),
    summary,
  };
}

/** Project a detection result onto the store's StatePills shape (Step 1.7) —
    just the four values (or null), dropping confidence/summary. This is what a
    later step (6.3 pills UI / 6.5 state feeds) writes via setStatePills. */
export function toStatePills(result: StateDetectionResult): StatePills {
  return {
    emotion: result.emotion?.value ?? null,
    rsd: result.rsd?.value ?? null,
    interest: result.interest?.value ?? null,
    cognitive: result.cognitive?.value ?? null,
  };
}
