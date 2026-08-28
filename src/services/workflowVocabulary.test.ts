import { describe, expect, it } from "vitest";
import { WORKFLOW_STAGE_LABEL, WORKFLOW_STAGE_DESCRIPTION, type WorkflowStage } from "./workflowVocabulary";

const ALL_STAGES: WorkflowStage[] = [
  "local-preparation", "provider-configured", "verified", "sending",
  "answered", "failed", "cancelled", "manual-handoff",
];

describe("R29: workflowVocabulary", () => {
  it("defines exactly the eight stages named in the work order — no more, no fewer", () => {
    expect(Object.keys(WORKFLOW_STAGE_LABEL).sort()).toEqual([...ALL_STAGES].sort());
  });

  it("every stage has both a short label and a full description", () => {
    for (const stage of ALL_STAGES) {
      expect(WORKFLOW_STAGE_LABEL[stage].length).toBeGreaterThan(0);
      expect(WORKFLOW_STAGE_DESCRIPTION[stage].length).toBeGreaterThan(0);
    }
  });

  it("never claims success in a failed/cancelled description", () => {
    expect(WORKFLOW_STAGE_DESCRIPTION.failed.toLowerCase()).not.toContain("success");
    expect(WORKFLOW_STAGE_DESCRIPTION.cancelled.toLowerCase()).not.toContain("success");
  });

  it("failed and cancelled both state plainly that nothing further was charged", () => {
    expect(WORKFLOW_STAGE_DESCRIPTION.failed).toContain("Nothing further was charged");
    expect(WORKFLOW_STAGE_DESCRIPTION.cancelled).toContain("Nothing further was charged");
  });

  it("'verified' is the only stage whose description claims an actual health check ran", () => {
    const verifiedOnly = ALL_STAGES.filter((s) => WORKFLOW_STAGE_DESCRIPTION[s].toLowerCase().includes("health check"));
    expect(verifiedOnly).toEqual(["verified"]);
  });
});
