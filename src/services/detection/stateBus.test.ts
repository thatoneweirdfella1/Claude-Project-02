/* Step 6.5 verification — the state bus: one source (StatePills), four
   named outputs, each traceable to STATE_IMPACTS (Step 6.2) with zero
   duplication of the mapping data. */

import { describe, expect, it } from "vitest";
import { deriveStateFeeds } from "./stateBus";
import { STATE_IMPACTS } from "./impacts";
import type { StatePills } from "../../stores/types";

const EMPTY_PILLS: StatePills = { emotion: null, rsd: null, interest: null, cognitive: null };

describe("deriveStateFeeds — the empty case", () => {
  it("returns all-null/empty feeds when nothing was detected", () => {
    expect(deriveStateFeeds(EMPTY_PILLS)).toEqual({
      directnessSuggestion: null,
      techniqueCandidates: [],
      toneGuidance: null,
      transparency: [],
    });
  });
});

describe("deriveStateFeeds — directness consumer", () => {
  it("recommends Level 1 for Overwhelmed, matching STATE_IMPACTS.emotion.overwhelmed", () => {
    const feeds = deriveStateFeeds({ ...EMPTY_PILLS, emotion: "overwhelmed" });
    expect(feeds.directnessSuggestion).toBe(1);
    expect(feeds.directnessSuggestion).toBe(STATE_IMPACTS.emotion.overwhelmed.directness);
  });

  it("is null for every other emotion", () => {
    for (const emotion of ["frustrated", "calm", "excited", "anxious"] as const) {
      expect(deriveStateFeeds({ ...EMPTY_PILLS, emotion }).directnessSuggestion).toBeNull();
    }
  });

  it("is null when emotion wasn't detected", () => {
    expect(deriveStateFeeds({ ...EMPTY_PILLS, rsd: "high" }).directnessSuggestion).toBeNull();
  });
});

describe("deriveStateFeeds — technique-selection consumer", () => {
  it("collects candidates from emotion, interest, and cognitive — but not RSD (tone-only)", () => {
    const feeds = deriveStateFeeds({
      emotion: "frustrated", // simplify
      rsd: "high", // tone only, no technique
      interest: "high", // detailed, comparative
      cognitive: "stuck", // examples
    });
    expect(feeds.techniqueCandidates).toEqual(
      expect.arrayContaining(["simplify", "detailed", "comparative", "examples"]),
    );
    expect(feeds.techniqueCandidates).toHaveLength(4);
  });

  it("de-duplicates when two dimensions point at the same technique", () => {
    const feeds = deriveStateFeeds({
      emotion: "frustrated", // simplify
      rsd: null,
      interest: "low", // also simplify
      cognitive: null,
    });
    expect(feeds.techniqueCandidates).toEqual(["simplify"]);
  });

  it("is [] when no dimension carries a technique impact (only RSD detected)", () => {
    expect(deriveStateFeeds({ ...EMPTY_PILLS, rsd: "low" }).techniqueCandidates).toEqual([]);
  });
});

describe("deriveStateFeeds — answer-tone consumer", () => {
  it("comes only from RSD, matching STATE_IMPACTS.rsd", () => {
    for (const rsd of ["low", "medium", "high"] as const) {
      expect(deriveStateFeeds({ ...EMPTY_PILLS, rsd }).toneGuidance).toBe(STATE_IMPACTS.rsd[rsd].tone);
    }
  });

  it("is null when RSD wasn't detected", () => {
    expect(deriveStateFeeds({ ...EMPTY_PILLS, emotion: "calm" }).toneGuidance).toBeNull();
  });
});

describe("deriveStateFeeds — transparency-card consumer", () => {
  it("includes one entry per non-null dimension, in dimension order, with the impact's own description", () => {
    const feeds = deriveStateFeeds({
      emotion: "excited",
      rsd: "medium",
      interest: "high",
      cognitive: "racing",
    });
    expect(feeds.transparency.map((t) => t.dimension)).toEqual(["emotion", "rsd", "interest", "cognitive"]);
    expect(feeds.transparency[0]).toEqual({
      dimension: "emotion",
      value: "excited",
      description: STATE_IMPACTS.emotion.excited.description,
    });
  });

  it("omits null dimensions", () => {
    const feeds = deriveStateFeeds({ ...EMPTY_PILLS, cognitive: "analytical" });
    expect(feeds.transparency).toHaveLength(1);
    expect(feeds.transparency[0].dimension).toBe("cognitive");
  });
});
