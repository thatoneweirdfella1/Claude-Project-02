/* Step 4.4 verification — directness levels, the auto-recommendation, and that
   a chosen level actually reaches the composition engine's TONE section. */

import { describe, expect, it } from "vitest";
import { composeFinalPrompt } from "./composition";
import {
  DEFAULT_DIRECTNESS,
  DIRECTNESS_LEVELS,
  isDirectnessLevel,
  recommendDirectnessFromEmotion,
} from "./directness";

describe("directness levels", () => {
  it("has exactly three levels with Level 2 as default", () => {
    expect(DIRECTNESS_LEVELS.map((l) => l.level)).toEqual([1, 2, 3]);
    expect(DEFAULT_DIRECTNESS).toBe(2);
  });

  it("labels match the screenshot's 'Directness Level N'", () => {
    expect(DIRECTNESS_LEVELS.find((l) => l.level === 2)!.label).toBe("Directness Level 2");
  });

  it("isDirectnessLevel guards", () => {
    expect(isDirectnessLevel(2)).toBe(true);
    expect(isDirectnessLevel(0)).toBe(false);
    expect(isDirectnessLevel("2")).toBe(false);
  });
});

describe("recommendDirectnessFromEmotion (PIPELINE.md)", () => {
  it("Overwhelmed recommends Level 1", () => {
    expect(recommendDirectnessFromEmotion("overwhelmed")).toBe(1);
  });

  it("other emotions and null give no directness recommendation", () => {
    for (const e of ["frustrated", "calm", "excited", "anxious"] as const) {
      expect(recommendDirectnessFromEmotion(e)).toBeNull();
    }
    expect(recommendDirectnessFromEmotion(null)).toBeNull();
  });
});

describe("directness feeds the composition engine", () => {
  it("each level composes a distinct TONE section", () => {
    const tone = (level: 1 | 2 | 3) =>
      composeFinalPrompt({ question: "help me focus", directness: level }).sections.find(
        (s) => s.name === "directness",
      )!.content;
    expect(tone(1)).toContain("supportive");
    expect(tone(2)).toContain("Balanced");
    expect(tone(3)).toContain("direct");
  });

  it("the recommend→compose flow works end to end (Overwhelmed → Level 1 → supportive tone)", () => {
    const recommended = recommendDirectnessFromEmotion("overwhelmed")!;
    const composed = composeFinalPrompt({ question: "help me focus", directness: recommended });
    expect(composed.sections.find((s) => s.name === "directness")!.content).toContain("supportive");
  });
});
