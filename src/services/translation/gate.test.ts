/* Step 2.3 verification — the confidence gate logic. Boundary values (the
   80/60 thresholds), the full outcome→gated mapping, and the neutral tone of
   the clarifying question. */

import { describe, expect, it } from "vitest";
import {
  buildClarifyingQuestion,
  evaluateConfidenceGate,
  gateTranslation,
} from "./gate";
import type { TranslationResult } from "./schema";
import type { TranslationOutcome } from "./translate";

const result = (confidence: number): TranslationResult => ({
  translatedPrompt: "How do I add a Postgres index?",
  confidence,
  detectedGaps: [],
  reasoning: "Best guess from the input.",
});

describe("evaluateConfidenceGate — boundaries", () => {
  it("80+ proceeds", () => {
    expect(evaluateConfidenceGate(80)).toMatchObject({ level: "proceed", proceed: true });
    expect(evaluateConfidenceGate(100)).toMatchObject({ level: "proceed", proceed: true });
  });
  it("60-79 is moderate (still proceeds)", () => {
    expect(evaluateConfidenceGate(79)).toMatchObject({ level: "moderate", proceed: true });
    expect(evaluateConfidenceGate(60)).toMatchObject({ level: "moderate", proceed: true });
  });
  it("below 60 clarifies (does not proceed)", () => {
    expect(evaluateConfidenceGate(59)).toMatchObject({ level: "clarify", proceed: false });
    expect(evaluateConfidenceGate(0)).toMatchObject({ level: "clarify", proceed: false });
  });
  it("clamps and rounds", () => {
    expect(evaluateConfidenceGate(79.6).level).toBe("proceed"); // rounds to 80
    expect(evaluateConfidenceGate(140).confidence).toBe(100);
  });
});

describe("gateTranslation — maps every outcome", () => {
  it("ok → proceed / moderate / clarify by confidence", () => {
    expect(gateTranslation({ status: "ok", result: result(90) }).kind).toBe("proceed");
    expect(gateTranslation({ status: "ok", result: result(70) }).kind).toBe("moderate");
    expect(gateTranslation({ status: "ok", result: result(40) }).kind).toBe("clarify");
  });
  it("moderate carries the note; clarify carries the question", () => {
    const mod = gateTranslation({ status: "ok", result: result(70) });
    if (mod.kind === "moderate") expect(mod.note.length).toBeGreaterThan(0);
    const clar = gateTranslation({ status: "ok", result: result(40) });
    if (clar.kind === "clarify") expect(clar.question).toContain("Postgres index");
  });
  it("passes non-ok outcomes straight through", () => {
    const cases: TranslationOutcome[] = [
      { status: "empty" },
      { status: "too-large", chars: 99, limit: 10 },
      { status: "error", message: "boom" },
    ];
    expect(cases.map((c) => gateTranslation(c).kind)).toEqual([
      "empty",
      "too-large",
      "error",
    ]);
  });
});

describe("buildClarifyingQuestion — neutral and curious", () => {
  it("reflects the best guess and invites more, without corrective language", () => {
    const q = buildClarifyingQuestion(result(30));
    expect(q).toContain("How do I add a Postgres index");
    // Never blames the user (CANON ADHD Feedback rule).
    expect(q.toLowerCase()).not.toMatch(/unclear|confusing|wrong|didn't|vague|stupid/);
  });
});
