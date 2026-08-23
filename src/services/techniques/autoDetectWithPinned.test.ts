import { describe, expect, it } from "vitest";
import { autoDetectWithPinned } from "./autoDetectWithPinned";

describe("autoDetectWithPinned", () => {
  it("keeps manually checked techniques while Auto recommend is on", () => {
    const selection = autoDetectWithPinned("Explain this in simple terms", ["examples"]);
    expect(selection.selected).toContain("examples");
    expect(selection.selected).toContain("simplify");
    expect(selection.selected.length).toBeLessThanOrEqual(4);
  });

  it("does not displace four manually checked choices", () => {
    const pinned = ["quote-first", "role-prime", "examples", "metaphor"] as const;
    const selection = autoDetectWithPinned("Give a detailed step-by-step comparison", [...pinned]);
    expect(selection.selected).toEqual([...pinned]);
  });

  it("never introduces a conflict with a pinned choice", () => {
    const selection = autoDetectWithPinned("Give me a detailed explanation", ["simplify"]);
    expect(selection.selected).toContain("simplify");
    expect(selection.selected).not.toContain("detailed");
  });
});
