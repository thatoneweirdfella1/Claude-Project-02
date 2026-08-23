import { describe, expect, it } from "vitest";
import type { TranslateAskRequest } from "../composer";
import { buildStateRecommendation, stateChoiceSignature } from "./recommendation";
import type { StateDetectionResult } from "./schema";

const REQUEST: TranslateAskRequest = {
  rawInput: "Please help me fix this step by step.",
  model: "auto",
  destination: { providerId: "universal", modelId: "universal" },
  translatorEngine: "auto-free-first",
  reviewBeforeSend: true,
  directness: 2,
  techniques: ["auto-detect"],
  context: [],
};

function result(patch: Partial<StateDetectionResult>): StateDetectionResult {
  return { emotion: null, rsd: null, interest: null, cognitive: null, summary: "read", ...patch };
}

describe("buildStateRecommendation", () => {
  it("returns null when detection does not change the current request", () => {
    expect(buildStateRecommendation(result({ emotion: { value: "neutral", confidence: 80 } }), REQUEST)).toBeNull();
  });

  it("states the exact directness adjustment for overwhelm", () => {
    const recommendation = buildStateRecommendation(
      result({ emotion: { value: "overwhelmed", confidence: 80 } }),
      REQUEST,
    );
    expect(recommendation?.directness).toBe(1);
    expect(recommendation?.changes.join(" ")).toMatch(/Supportive/);
  });

  it("uses only the approved cognitive vocabulary", () => {
    const recommendation = buildStateRecommendation(
      result({ cognitive: { value: "execution", confidence: 80 } }),
      { ...REQUEST, rawInput: "Do it." },
    );
    expect(recommendation?.techniqueCandidates).toContain("examples");
  });
});

describe("stateChoiceSignature", () => {
  it("is stable and request-state specific", () => {
    expect(stateChoiceSignature(result({ emotion: { value: "focused", confidence: 70 } })))
      .toBe("emotion:focused|rsd:none|interest:none|cognitive:none");
  });
});
