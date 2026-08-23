import { describe, expect, it } from "vitest";
import { MANUAL_TECHNIQUE_IDS, techniqueSummaryLabel } from "./techniqueOptions";

describe("MANUAL_TECHNIQUE_IDS", () => {
  it("contains the composable techniques and excludes the Auto mode", () => {
    expect(MANUAL_TECHNIQUE_IDS).toHaveLength(11);
    expect(MANUAL_TECHNIQUE_IDS).not.toContain("auto-detect");
  });
});

describe("techniqueSummaryLabel", () => {
  it("shows the current automatic recommendation instead of a generic mode label", () => {
    expect(techniqueSummaryLabel(["auto-detect"], ["socratic"])).toBe("Socratic");
    expect(techniqueSummaryLabel(["auto-detect"], ["examples", "comparative"])).toBe("2 techniques");
  });

  it("shows manual selections and an actionable empty state", () => {
    expect(techniqueSummaryLabel([])).toBe("Choose technique");
    expect(techniqueSummaryLabel(["socratic"])).toBe("Socratic");
    expect(techniqueSummaryLabel(["examples", "metaphor"])).toBe("2 techniques");
  });
});
