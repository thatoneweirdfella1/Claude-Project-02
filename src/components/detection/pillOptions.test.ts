/* Step 6.3 verification — the pill display config (pure data). Same
   repo-wide no-RTL choice as every other dropdown/popover (Steps 3.2/4.4/4.5):
   the pure data is unit-tested here; the components are typecheck+build
   verified only (see BUILD-LOG.md PARKED). */

import { describe, expect, it } from "vitest";
import { PILL_CONFIGS, capitalizeValue } from "./pillOptions";
import {
  COGNITIVE_MODES,
  EMOTION_STATES,
  INTEREST_LEVELS,
  RSD_LEVELS,
} from "../../services/detection";

describe("PILL_CONFIGS", () => {
  it("has exactly the four dimensions, in screenshot order", () => {
    expect(PILL_CONFIGS.map((c) => c.dimension)).toEqual(["emotion", "rsd", "interest", "cognitive"]);
  });

  it("labels match the screenshot exactly", () => {
    expect(PILL_CONFIGS.map((c) => c.label)).toEqual(["Emotion", "RSD", "Interest", "Cognitive Mode"]);
  });

  it("colors are the screenshot-matched tokens: purple/red/green/blue", () => {
    expect(PILL_CONFIGS.map((c) => c.colorVar)).toEqual([
      "var(--state-emotion)",
      "var(--state-rsd)",
      "var(--state-interest)",
      "var(--state-cognitive)",
    ]);
  });

  it("each dimension's values are the SAME arrays services/detection exports (no second taxonomy)", () => {
    const byDimension = Object.fromEntries(PILL_CONFIGS.map((c) => [c.dimension, c.values]));
    expect(byDimension.emotion).toBe(EMOTION_STATES);
    expect(byDimension.rsd).toBe(RSD_LEVELS);
    expect(byDimension.interest).toBe(INTEREST_LEVELS);
    expect(byDimension.cognitive).toBe(COGNITIVE_MODES);
  });
});

describe("capitalizeValue", () => {
  it("capitalizes the first letter, matching the screenshot's 'Overwhelmed'/'High'/'Analytical'", () => {
    expect(capitalizeValue("overwhelmed")).toBe("Overwhelmed");
    expect(capitalizeValue("high")).toBe("High");
    expect(capitalizeValue("analytical")).toBe("Analytical");
  });

  it("handles an empty string without throwing", () => {
    expect(capitalizeValue("")).toBe("");
  });
});
