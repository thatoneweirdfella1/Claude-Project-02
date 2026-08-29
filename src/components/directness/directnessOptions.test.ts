import { describe, expect, it } from "vitest";
import { DIRECTNESS_DROPDOWN_OPTIONS } from "./directnessOptions";

describe("DIRECTNESS_DROPDOWN_OPTIONS", () => {
  it("keeps stable persisted values 1/2/3", () => {
    expect(DIRECTNESS_DROPDOWN_OPTIONS.map((option) => option.value)).toEqual(["1", "2", "3"]);
  });

  it("uses the approved labels and one-line previews", () => {
    expect(DIRECTNESS_DROPDOWN_OPTIONS).toEqual([
      { value: "1", label: "Supportive — gentle guidance", preview: "Encouraging, empathetic tone." },
      { value: "2", label: "Balanced — clear and human", preview: "Straightforward, natural language." },
      { value: "3", label: "Blunt — brief and direct", preview: "Concise, no extra softening." },
    ]);
  });
});
