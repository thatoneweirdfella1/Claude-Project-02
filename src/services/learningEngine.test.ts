import { describe, expect, it } from "vitest";
import {
  applySignalLearning,
  computeAccuracyScore,
  computeEditDistance,
  computeSignalWeight,
  createSignal,
  recommendModelAndTechniques,
  recordSecondarySignals,
  recordTertiarySignals,
} from "./learningEngine";
import { generateLearningReport, validateSignalWeights } from "./debug/learningAuditViewer";
import { createInitialAccountState, useAccountStore } from "../stores/accountStore";
import { autoDetectTechniques } from "./techniques/autoDetect";

const context = { sessionId: "s1", messageId: "m1", modelUsed: "auto" as const, techniquesUsed: ["simplify" as const] };

describe("Learnable Signal Patterns", () => {
  it("computes exact edit distance even when text lengths match", () => {
    expect(computeEditDistance("cat", "cut")).toBe(1);
    expect(computeEditDistance("kitten", "sitting")).toBe(3);
    expect(computeEditDistance("same", "same")).toBe(0);
  });

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

  it("applies each completed signal batch once and nudges the real auto selector", () => {
    useAccountStore.setState(createInitialAccountState());
    for (let index = 0; index < 5; index += 1) {
      useAccountStore.getState().recordSignal(
        createSignal(context, "rating", 5, "positive", true, index + 1),
      );
    }
    const learned = useAccountStore.getState().learnedPreferences;
    expect(learned.technique.simplify?.weight).toBe(1);
    const selection = autoDetectTechniques("A neutral request", {
      learnedTechniqueWeights: { simplify: learned.technique.simplify?.weight ?? 0 },
    });
    expect(selection.scores.find((score) => score.id === "simplify")?.reasons)
      .toContain("learned from confirmed feedback");
  });

  it("processes a completed batch when one rating action adds two signals", () => {
    useAccountStore.setState(createInitialAccountState());
    for (let index = 0; index < 4; index += 1) {
      useAccountStore.getState().recordSignal(createSignal(context, "rating", 5, "positive", true, index + 1));
    }
    useAccountStore.getState().setRating({ messageId: "answer-batch", stars: 5, comment: "Useful", timestamp: 10, techniquesUsed: ["simplify"] });
    const state = useAccountStore.getState();
    expect(state.learningSignalCount).toBe(6);
    expect(state.learningSignalBuffer).toHaveLength(1);
    expect(state.learnedPreferences.technique.simplify?.weight).toBe(1);
  });

  it("continues batching after the capped audit log reaches 500 entries", () => {
    useAccountStore.setState(createInitialAccountState());
    for (let index = 0; index < 505; index += 1) {
      useAccountStore.getState().recordSignal(createSignal(context, "rating", 5, "positive", true, index + 1));
    }
    const state = useAccountStore.getState();
    expect(state.learningAuditLog).toHaveLength(500);
    expect(state.learningSignalCount).toBe(505);
    expect(state.learningSignalBuffer).toHaveLength(0);
    expect(state.learnedPreferences.technique.simplify?.totalAdjustments).toBe(101);
  });

  it("persists a real rating and comment as primary audit signals", () => {
    useAccountStore.setState(createInitialAccountState());
    useAccountStore.getState().setRating({
      messageId: "answer-1",
      stars: 5,
      comment: "Clear and useful",
      timestamp: 10,
    });
    const signals = useAccountStore.getState().learningAuditLog.filter((entry) => entry.kind === "signal");
    expect(signals.map((entry) => entry.signalType)).toEqual(["rating", "comment"]);
    expect(useAccountStore.getState().getLearnedPreferences()).toEqual({ routing: {}, technique: {} });
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
