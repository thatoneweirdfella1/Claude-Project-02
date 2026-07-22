/* Directness control (Step 4.4) — CANON Feature 3 / PIPELINE.md DIRECTNESS.
   Three levels (1 supportive, 2 balanced default, 3 blunt) that persist in the
   session store and feed the composition engine's TONE section (Step 4.3's
   DIRECTNESS_ENCODINGS). This module owns the level METADATA (labels, the
   default) and the state→level auto-recommendation; the per-level prompt TEXT
   lives in composition/templates.ts (Step 4.3 settled that boundary). */

import type { DirectnessLevel, EmotionState } from "../stores/types";

export interface DirectnessLevelInfo {
  level: DirectnessLevel;
  /** Dropdown label, matching the V3 screenshot's "Directness Level N". */
  label: string;
  /** Short tone description (for tooltips / the selector UI, Step 4.5). */
  tone: string;
}

export const DEFAULT_DIRECTNESS: DirectnessLevel = 2;

export const DIRECTNESS_LEVELS: DirectnessLevelInfo[] = [
  { level: 1, label: "Directness Level 1", tone: "Supportive, with extra scaffolding" },
  { level: 2, label: "Directness Level 2", tone: "Clear and warm, balanced (default)" },
  { level: 3, label: "Directness Level 3", tone: "Direct and concise" },
];

export function isDirectnessLevel(value: unknown): value is DirectnessLevel {
  return value === 1 || value === 2 || value === 3;
}

/** State-detection auto-recommendation (PIPELINE.md: "Overwhelmed recommends
    directness Level 1"). Returns null when there is no strong recommendation —
    the caller keeps the user's / default level. Consumed once state detection
    exists (Phase 6); the hook is defined here so 6.x wires to it, not reinvents
    it. Only Overwhelmed maps to a directness level in the spec (the other
    emotions map to techniques, not directness). */
export function recommendDirectnessFromEmotion(
  emotion: EmotionState | null | undefined,
): DirectnessLevel | null {
  if (emotion === "overwhelmed") return 1;
  return null;
}
