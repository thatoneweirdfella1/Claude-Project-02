/* Step 4.4 verification — the Directness dropdown options (pure data). */

import { describe, expect, it } from "vitest";
import { DIRECTNESS_DROPDOWN_OPTIONS } from "./directnessOptions";

describe("DIRECTNESS_DROPDOWN_OPTIONS", () => {
  it("is the three levels with string values 1/2/3", () => {
    expect(DIRECTNESS_DROPDOWN_OPTIONS.map((o) => o.value)).toEqual(["1", "2", "3"]);
  });

  it("labels match the screenshot ('Directness Level N', no descriptor)", () => {
    expect(DIRECTNESS_DROPDOWN_OPTIONS.map((o) => o.label)).toEqual([
      "Directness Level 1",
      "Directness Level 2",
      "Directness Level 3",
    ]);
  });
});
