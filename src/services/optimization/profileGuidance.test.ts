import { describe, expect, it } from "vitest";
import type { CustomerPersonalizationProfile, PersonalizationRule } from "../../stores/types";
import { buildPersonalizationGuidance, getPersonalizationUiPreferences } from "./profileGuidance";

function rule(overrides: Partial<PersonalizationRule>): PersonalizationRule {
  return {
    id: "rule-1",
    categoryId: "C01",
    datasetIds: ["G01-D01"],
    instruction: "Start with a short answer.",
    contexts: [],
    exclusions: [],
    evidenceIds: ["e1"],
    counterEvidenceIds: [],
    evidenceKind: "explicit",
    evidenceStrength: "direct",
    confidence: 0.9,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

function profile(): CustomerPersonalizationProfile {
  return {
    schemaVersion: 1,
    version: 2,
    rules: {
      C01: [rule({})],
      C06: [rule({
        id: "rule-2",
        categoryId: "C06",
        datasetIds: ["G06-D01"],
        instruction: "Preserve the stated objective and exclusions.",
        contexts: ["long-running tasks"],
        exclusions: ["the customer explicitly changes the objective"],
      })],
      C10: [rule({ id: "rule-3", categoryId: "C10", datasetIds: ["G10-D01"] })],
    },
    ui: { density: "compact", progressiveDisclosure: true, preferredChoiceCount: 1 },
    processedSessionHashes: {},
    updatedAt: 10,
  };
}

describe("personalization profile consumers", () => {
  it("puts relevant rules into translation and response guidance while keeping the current request authoritative", () => {
    const guidance = buildPersonalizationGuidance(profile());
    expect(guidance.translation.join(" ")).toContain("current request");
    expect(guidance.translation.join(" ")).toContain("Preserve the stated objective");
    expect(guidance.translation.join(" ")).not.toContain("Start with a short answer");
    expect(guidance.response.join(" ")).toContain("Start with a short answer");
    expect(guidance.response.join(" ")).toContain("long-running tasks");
    expect(guidance.response.join(" ")).toContain("explicitly changes the objective");
    expect(guidance.response.join(" ")).not.toContain("rule-3");
  });

  it("returns no prompt guidance without validated rules and exposes only the supported UI preferences", () => {
    expect(buildPersonalizationGuidance(undefined)).toEqual({ translation: [], response: [] });
    expect(getPersonalizationUiPreferences(profile())).toEqual({
      density: "compact",
      progressiveDisclosure: true,
      preferredChoiceCount: 1,
    });
  });
});
