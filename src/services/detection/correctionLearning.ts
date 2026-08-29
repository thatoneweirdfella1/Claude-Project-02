/* Correction learning (Step 6.4) — CANON Feature 5 / PIPELINE.md STATE
   DETECTION: "Pills are ... correctable ... After 15 or more corrections for
   a given state, detection adapts for that user."

   Pure functions over the account store's `stateCorrections` array (Step 6.4
   STORE ADD, accountStore.ts) — no store import here (CONVENTIONS: services/
   is non-UI logic; the store dependency stays at the wiring point,
   CenterColumn, same layering every other service in this build follows).

   "For a given state" is read as per (dimension, correctedValue) PAIR, not
   per dimension alone: knowing only "emotion gets corrected a lot" gives
   detection nothing actionable to adapt WITH, whereas "this user's emotion
   reads get corrected to frustrated 15+ times" is a concrete, applicable
   adaptation. CORRECTION_THRESHOLD = 15, verbatim from CANON/PIPELINE.md. */

import type { StateCorrection } from "../../stores/types";
import { COGNITIVE_MODES, EMOTION_STATES, INTEREST_LEVELS, RSD_LEVELS } from "./schema";

export const CORRECTION_THRESHOLD = 15;

export type CorrectionDimension = StateCorrection["dimension"];

const ALL_DIMENSIONS: readonly CorrectionDimension[] = ["emotion", "rsd", "interest", "cognitive"];

const APPROVED_VALUES: Record<CorrectionDimension, readonly string[]> = {
  emotion: EMOTION_STATES,
  rsd: RSD_LEVELS,
  interest: INTEREST_LEVELS,
  cognitive: COGNITIVE_MODES,
};

/** How many times the user has corrected `dimension` TO `value`. */
export function countCorrectionsTo(
  corrections: readonly StateCorrection[],
  dimension: CorrectionDimension,
  value: string,
): number {
  return corrections.filter((c) => c.dimension === dimension && c.to === value).length;
}

/** The value THIS dimension has adapted to, or null if none has reached
    CORRECTION_THRESHOLD. If more than one value for the same dimension has
    crossed the threshold, the highest count wins (the best current read of
    what's actually true for this user); ties break toward whichever was
    corrected to most recently (more likely to reflect their current state
    than an older run of corrections). */
export function adaptedValueFor(
  corrections: readonly StateCorrection[],
  dimension: CorrectionDimension,
): string | null {
  const counts = new Map<string, number>();
  const lastSeenAt = new Map<string, number>();
  for (const c of corrections) {
    if (c.dimension !== dimension) continue;
    if (!APPROVED_VALUES[dimension].includes(c.to)) continue;
    counts.set(c.to, (counts.get(c.to) ?? 0) + 1);
    lastSeenAt.set(c.to, Math.max(lastSeenAt.get(c.to) ?? 0, c.timestamp));
  }

  let best: { value: string; count: number; lastSeen: number } | null = null;
  for (const [value, count] of counts) {
    if (count < CORRECTION_THRESHOLD) continue;
    const lastSeen = lastSeenAt.get(value) ?? 0;
    if (!best || count > best.count || (count === best.count && lastSeen > best.lastSeen)) {
      best = { value, count, lastSeen };
    }
  }
  return best?.value ?? null;
}

/** Every dimension that has adapted, mapped to its adapted value. Only
    dimensions with a value past CORRECTION_THRESHOLD appear — most users,
    most of the time, produce {}. */
export function adaptedValues(
  corrections: readonly StateCorrection[],
): Partial<Record<CorrectionDimension, string>> {
  const out: Partial<Record<CorrectionDimension, string>> = {};
  for (const dimension of ALL_DIMENSIONS) {
    const value = adaptedValueFor(corrections, dimension);
    if (value !== null) out[dimension] = value;
  }
  return out;
}

const DIMENSION_LABELS: Record<CorrectionDimension, string> = {
  emotion: "emotion",
  rsd: "RSD level",
  interest: "interest",
  cognitive: "cognitive mode",
};

/** A short, auditable addendum to the detection classifier prompt (the Step
    6.2 DETECTION_SYSTEM_PROMPT), appended ONLY when at least one dimension
    has adapted (detectState's `adaptationNote` option, detect.ts). This is a
    WEIGHTED HINT the model still reasons over — never a silent override — so
    a clearly different signal in one specific message can still win; it just
    tips ambiguous reads toward what this user has repeatedly told the app is
    actually true. Returns "" when nothing has adapted, the common case, so
    detectState() sends the unmodified Step 6.2 prompt by default. */
export function buildAdaptationNote(corrections: readonly StateCorrection[]): string {
  const adapted = adaptedValues(corrections);
  const entries = Object.entries(adapted) as [CorrectionDimension, string][];
  if (entries.length === 0) return "";

  const lines = entries.map(
    ([dimension, value]) =>
      `- ${DIMENSION_LABELS[dimension]}: this user has repeatedly corrected this reading to "${value}" — weigh that possibility more heavily when the signal is ambiguous, but still choose a different value if THIS message clearly signals otherwise.`,
  );
  return `\n\nADAPTATION FOR THIS USER (learned from their past corrections; a clear per-message signal still wins):\n${lines.join("\n")}`;
}
