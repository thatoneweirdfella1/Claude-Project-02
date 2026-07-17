/* Composition prompt templates (Step 4.3). The text building blocks the
   composition engine assembles, kept separate from the assembly logic so a
   later step (or an audit) can retune wording without touching compose().

   Directness encodings live HERE (composition owns the assembled prompt text);
   Step 4.4 builds the selector UI that chooses which level feeds compose() —
   it does not redefine these strings. */

import type { DirectnessLevel } from "../../stores/types";

/** Section 1 — the base template that frames the whole prompt. */
export const BASE_TEMPLATE =
  "You are the answering model behind DIVERGENCE.AI, an ADHD communication bridge. The user's scattered input has already been translated into a clear request. Answer that request, following every instruction below in order.";

/** Section 2 fallback — used when neither an explicit role nor the Role-Prime
    technique supplies one. */
export const DEFAULT_ROLE_PRIME =
  "Answer as a knowledgeable, clear-thinking assistant.";

/** Section 4 — directness encodings (CANON Feature 3 / PIPELINE.md DIRECTNESS:
    1 supportive, 2 balanced default, 3 blunt). Keyed by DirectnessLevel. */
export const DIRECTNESS_ENCODINGS: Record<DirectnessLevel, string> = {
  1: "Tone: supportive and encouraging. Scaffold the answer generously — extra context, gentle framing, and reassurance. Assume the user may feel overwhelmed and keep them oriented.",
  2: "Tone: clear and warm, with moderate detail. Balanced — neither hand-holding nor terse.",
  3: "Tone: direct and concise. Minimal preamble and explanation; lead with the answer and keep it tight.",
};

/** Section 6 fallback — the default output format enforces CANON's ADHD
    "Cognitive load" hard rules (no dense info walls, max 3 paragraphs, break
    into sections, lead with the point). */
export const DEFAULT_OUTPUT_FORMAT =
  "Format for an ADHD reader: no dense walls of text — at most 3 short paragraphs, then break into clearly labeled sections or bullet points. Lead with the single most important point. Keep it scannable.";

/** Section 7 — the confidence requirement. When the translation confidence is
    known and moderate (<80, the Step 2.3 gate band that still proceeds), the
    model is told to double-check it is answering what was actually asked. */
export function confidenceRequirement(confidence?: number): string {
  const base =
    "If any part of the request is ambiguous, state your interpretation in one line before answering. Flag anything you are uncertain about rather than guessing silently.";
  if (typeof confidence === "number" && confidence < 80) {
    return `${base} (The request was reconstructed with moderate confidence — ${Math.round(
      confidence,
    )}/100 — so make sure you are answering what was actually asked.)`;
  }
  return base;
}
