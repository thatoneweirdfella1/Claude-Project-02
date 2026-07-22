/* Step 4.5 verification — technique dropdown pure data/labels. */

import { describe, expect, it } from "vitest";
import { MANUAL_TECHNIQUE_IDS, techniqueSummaryLabel } from "./techniqueOptions";

describe("MANUAL_TECHNIQUE_IDS", () => {
  it("is the 11 composable techniques, excluding auto-detect", () => {
    expect(MANUAL_TECHNIQUE_IDS).toHaveLength(11);
    expect(MANUAL_TECHNIQUE_IDS).not.toContain("auto-detect");
  });
});

describe("techniqueSummaryLabel", () => {
  it("reads 'Auto-detect' for auto mode or an empty selection", () => {
    expect(techniqueSummaryLabel(["auto-detect"])).toBe("Auto-detect");
    expect(techniqueSummaryLabel([])).toBe("Auto-detect");
  });

  it("shows the single technique's label, matching the screenshot's 'Socratic'", () => {
    expect(techniqueSummaryLabel(["socratic"])).toBe("Socratic");
  });

  it("shows a count for multiple manually-selected techniques", () => {
    expect(techniqueSummaryLabel(["examples", "metaphor"])).toBe("2 techniques");
  });
});
