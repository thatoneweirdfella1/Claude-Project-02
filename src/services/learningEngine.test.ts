import { describe, expect, it } from "vitest";
import {
  applySignalLearning,
  computeAccuracyScore,
  computeSignalWeight,
  createSignal,
  recommendModelAndTechniques,
  recordSecondarySignals,
  recordTertiarySignals,
} from "./learningEngine";
import { generateLearningReport, validateSignalWeights } from "./debug/learningAuditViewer";

const context = { sessionId: "s1", messageId: "m1", modelUsed: "auto" as const, techniquesUsed: ["simplify" as const] };

describe("Learnable Signal Patterns", () => {
  it("classifies and weights primary, secondary, and tertiary signals", () => {
    expect(computeSignalWeight("rating")).toBe(1);
    expect(computeSignalWeight("model_switch")).toBe(0.85);
    expect(computeSignalWeight("download")).toBe(0.7);
    expect(createSignal(context, "rating", 5, "positive", true).hierarchy).toBe("primary");
    expect(recordSecondarySignals(context, { modelSwitched: true })[0].hierarchy).toBe("secondary");
    expect(recordTertiarySignals(context, { downloaded: true })[0].hierarchy).toBe("tertiary");
  });

  it("degrades confidence only when noisier hierarchy tiers are consulted", () => {
    const primary = createSignal(context, "rating", 5, "positive", true);
    const secondary = recordSecondarySignals(context, { editDistance: 0.2 })[0];
    const tertiary = recordTertiarySignals(context, { downloaded: true })[0];
    expect(computeAccuracyScore([])).toBe(0.5);
    expect(computeAccuracyScore([primary])).toBe(1);
    expect(computeAccuracyScore([primary, secondary])).toBe(0.85);
    expect(computeAccuracyScore([primary, secondary, tertiary])).toBe(0.7);
  });

  it("learns after five consistent signals and feeds technique recommendations", () => {
    const signals = Array.from({ length: 5 }, (_, index) =>
      createSignal(context, "rating", 5, "positive", true, index + 1),
    );
    const learned = applySignalLearning({ routing: {}, technique: {} }, signals);
    expect(learned.technique.simplify?.weight).toBe(1);
    const recommendation = recommendModelAndTechniques("Explain this simply", learned, ["detailed", "simplify"]);
    expect(recommendation.techniques[0]).toBe("simplify");
    expect(recommendation.confidence).toBe(0.85);
  });

  it("produces a transparent bounded report and validates classifications", () => {
    const entries = [
      createSignal(context, "rating", 4, "positive", true, 1),
      ...recordSecondarySignals(context, { techniqueSwitched: false }),
      ...recordTertiarySignals(context, { searches: 1 }),
    ];
    const report = generateLearningReport(entries, 2);
    expect(report.total).toBe(2);
    expect(report.hierarchyCounts.secondary).toBe(1);
    expect(report.hierarchyCounts.tertiary).toBe(1);
    expect(validateSignalWeights(entries).every((row) => row.valid)).toBe(true);
  });
});
