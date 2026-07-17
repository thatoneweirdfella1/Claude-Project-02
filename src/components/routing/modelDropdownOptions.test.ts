/* Step 3.2 verification — the Model dropdown's option list. Pure data, no
   renderer needed (this repo has no React Testing Library — Step 1.9's
   deliberate choice). Confirms the option shape/order and, specifically,
   that Opus's label matches the V3 screenshot exactly. */

import { describe, expect, it } from "vitest";
import { MODEL_DROPDOWN_OPTIONS } from "./modelDropdownOptions";

describe("MODEL_DROPDOWN_OPTIONS", () => {
  it("is Auto followed by the three models, in registry order", () => {
    expect(MODEL_DROPDOWN_OPTIONS.map((o) => o.value)).toEqual([
      "auto",
      "claude-haiku-4-5",
      "claude-sonnet-5",
      "claude-opus-4-8",
    ]);
  });

  it("matches the screenshot's exact label for Opus", () => {
    const opus = MODEL_DROPDOWN_OPTIONS.find((o) => o.value === "claude-opus-4-8");
    expect(opus?.label).toBe("Opus 4.8 — smartest");
  });

  it("labels every model option as '{label} — {descriptor}'", () => {
    for (const option of MODEL_DROPDOWN_OPTIONS) {
      if (option.value === "auto") continue;
      expect(option.label).toMatch(/^.+ — .+$/);
    }
  });
});
