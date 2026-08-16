import { describe, expect, it } from "vitest";
import { DIRECTNESS_DROPDOWN_OPTIONS } from "./directnessOptions";

describe("DIRECTNESS_DROPDOWN_OPTIONS", () => {
  it("keeps stable persisted values 1/2/3", () => {
    expect(DIRECTNESS_DROPDOWN_OPTIONS.map((option) => option.value)).toEqual(["1", "2", "3"]);
  });
  it("uses the approved plain-language labels and previews", () => {
    expect(DIRECTNESS_DROPDOWN_OPTIONS.map((option) => option.label)).toEqual([
      "Supportive — gentle and reassuring",
      "Balanced — clear and considerate",
      "Blunt — direct with no cushioning",
    ]);
  });
});
