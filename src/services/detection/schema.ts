import type { StatePills } from "../../stores/types";

/** Current approved request-scoped State Detection vocabulary. The persisted
 * session type still accepts legacy values through migration-era casts so old
 * saved sessions remain readable; new detection and correction UI emit only
 * these values. */
export const EMOTION_STATES = [
  "neutral", "calm", "focused", "frustrated", "overwhelmed", "anxious", "low-energy", "excited",
] as const;
export const RSD_LEVELS = ["low", "medium", "high"] as const;
export const INTEREST_LEVELS = ["low", "medium", "high"] as const;
export const COGNITIVE_MODES = ["exploratory", "analytical", "creative", "decision", "execution"] as const;

export type DetectedEmotion = (typeof EMOTION_STATES)[number];
export type DetectedRsd = (typeof RSD_LEVELS)[number];
export type DetectedInterest = (typeof INTEREST_LEVELS)[number];
export type DetectedCognitive = (typeof COGNITIVE_MODES)[number];

export interface DimensionReading<T> {
  value: T;
  confidence: number;
}

export interface StateDetectionResult {
  emotion: DimensionReading<DetectedEmotion> | null;
  rsd: DimensionReading<DetectedRsd> | null;
  interest: DimensionReading<DetectedInterest> | null;
  cognitive: DimensionReading<DetectedCognitive> | null;
  summary: string;
}

export class DetectionSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DetectionSchemaError";
  }
}

function clampConfidence(raw: unknown): number {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function parseDimension<T extends string>(raw: unknown, allowed: readonly T[]): DimensionReading<T> | null {
  if (typeof raw === "string") {
    return (allowed as readonly string[]).includes(raw) ? { value: raw as T, confidence: 0 } : null;
  }
  if (raw !== null && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.value === "string" && (allowed as readonly string[]).includes(obj.value)) {
      return { value: obj.value as T, confidence: clampConfidence(obj.confidence) };
    }
  }
  return null;
}

export function parseDetectionOutput(parsed: unknown): StateDetectionResult {
  if (parsed === null || typeof parsed !== "object") throw new DetectionSchemaError("Detection reply was not a JSON object.");
  const obj = parsed as Record<string, unknown>;
  const summary = typeof obj.summary === "string" && obj.summary.trim()
    ? obj.summary.trim()
    : "No state read was available for this message.";
  return {
    emotion: parseDimension(obj.emotion, EMOTION_STATES),
    rsd: parseDimension(obj.rsd, RSD_LEVELS),
    interest: parseDimension(obj.interest, INTEREST_LEVELS),
    cognitive: parseDimension(obj.cognitive, COGNITIVE_MODES),
    summary,
  };
}

/** The store keeps its legacy union for backward-readable saved sessions.
 * New request-scoped values are intentionally written through this boundary;
 * every current consumer uses the approved detector maps rather than assuming
 * the historical union is the current taxonomy. */
export function toStatePills(result: StateDetectionResult): StatePills {
  return {
    emotion: (result.emotion?.value ?? null) as StatePills["emotion"],
    rsd: (result.rsd?.value ?? null) as StatePills["rsd"],
    interest: (result.interest?.value ?? null) as StatePills["interest"],
    cognitive: (result.cognitive?.value ?? null) as StatePills["cognitive"],
  };
}
