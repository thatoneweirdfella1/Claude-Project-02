import { describe, it, expect } from "vitest";
import { applyRefinements, MAX_TECHNIQUE_WEIGHT, MIN_TECHNIQUE_WEIGHT } from "./applier";
import type { LearnedPreferences } from "../../stores/types";
import type { RefinementProposal } from "./types";

function proposal(overrides: Partial<RefinementProposal> = {}): RefinementProposal {
  return {
    type: "technique-weight",
    target: "detailed",
    adjustment: "decrease",
    reasoning: "Low ratings (5 runs) with \"detailed\"",
    confidence: 70,
    affectedRunCount: 5,
    feedbackSignals: ["too verbose"],
    ...overrides,
  };
}

function emptyPreferences(): LearnedPreferences {
  return { routing: {}, technique: {} };
}

describe("applyRefinements", () => {
  it("applies a decrease proposal, moving weight from 0 to -1", () => {
    const { updated } = applyRefinements(emptyPreferences(), [proposal()]);
    expect(updated.technique.detailed?.weight).toBe(-1);
    expect(updated.technique.detailed?.totalAdjustments).toBe(1);
  });

  it("applies an increase proposal, moving weight from 0 to +1", () => {
    const { updated } = applyRefinements(emptyPreferences(), [
      proposal({ target: "socratic", adjustment: "increase" }),
    ]);
    expect(updated.technique.socratic?.weight).toBe(1);
  });

  it("accumulates weight across multiple applications to the same technique", () => {
    const current = emptyPreferences();
    const first = applyRefinements(current, [proposal({ target: "detailed" })]);
    const second = applyRefinements(first.updated, [proposal({ target: "detailed" })]);
    expect(second.updated.technique.detailed?.weight).toBe(-2);
    expect(second.updated.technique.detailed?.totalAdjustments).toBe(2);
  });

  it("clamps weight at MIN_TECHNIQUE_WEIGHT, never going lower", () => {
    let current = emptyPreferences();
    for (let i = 0; i < 20; i++) {
      current = applyRefinements(current, [proposal({ target: "detailed" })]).updated;
    }
    expect(current.technique.detailed?.weight).toBe(MIN_TECHNIQUE_WEIGHT);
  });

  it("clamps weight at MAX_TECHNIQUE_WEIGHT, never going higher", () => {
    let current = emptyPreferences();
    for (let i = 0; i < 20; i++) {
      current = applyRefinements(current, [
        proposal({ target: "socratic", adjustment: "increase" }),
      ]).updated;
    }
    expect(current.technique.socratic?.weight).toBe(MAX_TECHNIQUE_WEIGHT);
  });

  it("produces one audit entry per applied technique-weight proposal", () => {
    const { auditEntries } = applyRefinements(emptyPreferences(), [
      proposal({ target: "detailed" }),
      proposal({ target: "socratic", adjustment: "increase" }),
    ]);
    expect(auditEntries).toHaveLength(2);
    expect(auditEntries[0]?.target).toBe("detailed");
    expect(auditEntries[0]?.previousWeight).toBe(0);
    expect(auditEntries[0]?.newWeight).toBe(-1);
    expect(auditEntries[1]?.target).toBe("socratic");
  });

  it("audit entry carries the proposal's reasoning and confidence verbatim", () => {
    const { auditEntries } = applyRefinements(emptyPreferences(), [
      proposal({ reasoning: "custom reasoning text", confidence: 82 }),
    ]);
    expect(auditEntries[0]?.reasoning).toBe("custom reasoning text");
    expect(auditEntries[0]?.confidence).toBe(82);
  });

  it("every audit entry has a unique id", () => {
    const { auditEntries } = applyRefinements(emptyPreferences(), [
      proposal({ target: "detailed" }),
      proposal({ target: "socratic" }),
    ]);
    expect(auditEntries[0]?.id).not.toBe(auditEntries[1]?.id);
  });

  it("skips unrecognized proposal types without throwing or emitting an audit entry", () => {
    const weird = proposal({ type: "detection-threshold" as RefinementProposal["type"] });
    const { updated, auditEntries } = applyRefinements(emptyPreferences(), [weird]);
    expect(auditEntries).toHaveLength(0);
    expect(Object.keys(updated.technique)).toHaveLength(0);
  });

  it("leaves routing untouched — no routing-targeted proposals exist yet", () => {
    const current: LearnedPreferences = { routing: { someKey: "someValue" }, technique: {} };
    const { updated } = applyRefinements(current, [proposal()]);
    expect(updated.routing).toEqual({ someKey: "someValue" });
  });

  it("does not mutate the input LearnedPreferences object", () => {
    const current = emptyPreferences();
    applyRefinements(current, [proposal()]);
    expect(current.technique).toEqual({});
  });

  it("returns empty results for an empty proposal list", () => {
    const { updated, auditEntries } = applyRefinements(emptyPreferences(), []);
    expect(auditEntries).toHaveLength(0);
    expect(updated.technique).toEqual({});
  });

  it("preserves existing technique preferences for techniques not touched by this batch", () => {
    const current: LearnedPreferences = {
      routing: {},
      technique: { examples: { weight: 3, lastAdjustedAt: 100, totalAdjustments: 3 } },
    };
    const { updated } = applyRefinements(current, [proposal({ target: "detailed" })]);
    expect(updated.technique.examples).toEqual({
      weight: 3,
      lastAdjustedAt: 100,
      totalAdjustments: 3,
    });
    expect(updated.technique.detailed?.weight).toBe(-1);
  });
});
