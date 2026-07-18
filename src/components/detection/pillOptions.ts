/* Pill display config (Step 6.3) — one entry per dimension, matching the
   screenshot exactly: label, color token, and the valid alternate values a
   correction control offers. Colors reuse the Step 1.2 tokens (--state-emotion
   aliases --accent-purple per MATERIALS.md's explicit "Emotion pill is purple,
   this is intended"; --state-rsd/--state-interest/--state-cognitive). Value
   lists are re-exported from services/detection (Step 6.1/6.2), never
   redeclared — this file is UI config only, not a second taxonomy. */

import {
  COGNITIVE_MODES,
  EMOTION_STATES,
  INTEREST_LEVELS,
  RSD_LEVELS,
  type CorrectionDimension,
} from "../../services/detection";

/** Same four-value union as StateCorrection["dimension"] (stores/types.ts,
    Step 6.4) and services/detection's CorrectionDimension — aliased, not
    redeclared, so the store/service/UI layers can't drift apart. */
export type PillDimension = CorrectionDimension;

export interface PillConfig {
  dimension: PillDimension;
  /** Screenshot label prefix, e.g. "Emotion: Overwhelmed". */
  label: string;
  colorVar: string;
  values: readonly string[];
}

export const PILL_CONFIGS: PillConfig[] = [
  { dimension: "emotion", label: "Emotion", colorVar: "var(--state-emotion)", values: EMOTION_STATES },
  { dimension: "rsd", label: "RSD", colorVar: "var(--state-rsd)", values: RSD_LEVELS },
  { dimension: "interest", label: "Interest", colorVar: "var(--state-interest)", values: INTEREST_LEVELS },
  { dimension: "cognitive", label: "Cognitive Mode", colorVar: "var(--state-cognitive)", values: COGNITIVE_MODES },
];

export function capitalizeValue(value: string): string {
  return value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}
