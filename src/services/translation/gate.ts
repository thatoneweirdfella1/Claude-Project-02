/* Confidence gates (Step 2.3) — the logic that turns a translation's confidence
   into the next step, wired to the translation service's output.

   Gates (PIPELINE.md line 30 / CONFIDENCE_COUPLING.md):
     80+   proceed, showing the score
     60-79 proceed, with a visible moderate-confidence note
     <60   do NOT proceed — ask a clarifying question instead

   This is the TRANSLATION-side gate (proceed vs clarify + the note). The
   ROUTING-side coupling (escalate one step at 60-79, floor at 4 below 60) lives
   in routing.js and is not duplicated here (CONVENTIONS: don't rebuild). */

import type { TranslationResult } from "./schema";
import type { TranslationOutcome } from "./translate";

/** Gate thresholds. 80+ proceed, 60-79 moderate, below 60 clarify. */
export const CONFIDENCE_GATES = {
  proceed: 80,
  moderate: 60,
} as const;

export type GateLevel = "proceed" | "moderate" | "clarify";

export interface GateDecision {
  level: GateLevel;
  /** False only for "clarify": below 60 does not proceed (PIPELINE.md). */
  proceed: boolean;
  confidence: number;
}

export function evaluateConfidenceGate(confidence: number): GateDecision {
  const c = Math.max(0, Math.min(100, Math.round(confidence)));
  if (c >= CONFIDENCE_GATES.proceed) return { level: "proceed", proceed: true, confidence: c };
  if (c >= CONFIDENCE_GATES.moderate) return { level: "moderate", proceed: true, confidence: c };
  return { level: "clarify", proceed: false, confidence: c };
}

/** Shown at the 60-79 gate. Neutral and informative, not judgmental. */
export const MODERATE_CONFIDENCE_NOTE =
  "Interpreted with moderate confidence — worth a glance to check it's the question you meant.";

/** A neutral, curious clarifying question for the <60 gate. It reflects the
    engine's best-guess translation back and invites correction. Templated in
    code (not model-generated) so the tone is guaranteed non-judgmental per
    CANON's ADHD Feedback rule — never corrective, never "you were unclear,"
    never making the user feel they did something wrong. */
export function buildClarifyingQuestion(result: TranslationResult): string {
  const guess = result.translatedPrompt.trim().replace(/[?.\s]+$/, "");
  return `I want to make sure I answer the right thing. It sounds like you might be asking: “${guess}?” Is that it, or would you like to add a little more?`;
}

/** UI-ready mapping of a translation attempt to its next step — the gate logic
    wired to translate()'s TranslationOutcome. The conversation-area UI switches
    on `kind`. */
export type GatedTranslation =
  | { kind: "proceed"; result: TranslationResult; gate: GateDecision }
  | { kind: "moderate"; result: TranslationResult; gate: GateDecision; note: string }
  | { kind: "clarify"; result: TranslationResult; gate: GateDecision; question: string }
  | { kind: "empty" }
  | { kind: "too-large"; chars: number; limit: number }
  | { kind: "error"; message: string };

export function gateTranslation(outcome: TranslationOutcome): GatedTranslation {
  switch (outcome.status) {
    case "empty":
      return { kind: "empty" };
    case "too-large":
      return { kind: "too-large", chars: outcome.chars, limit: outcome.limit };
    case "error":
      return { kind: "error", message: outcome.message };
    case "ok": {
      const gate = evaluateConfidenceGate(outcome.result.confidence);
      if (gate.level === "proceed") {
        return { kind: "proceed", result: outcome.result, gate };
      }
      if (gate.level === "moderate") {
        return { kind: "moderate", result: outcome.result, gate, note: MODERATE_CONFIDENCE_NOTE };
      }
      return {
        kind: "clarify",
        result: outcome.result,
        gate,
        question: buildClarifyingQuestion(outcome.result),
      };
    }
  }
}
