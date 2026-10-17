import { describe, expect, it } from "vitest";
import type { SessionRecord } from "../../stores/types";
import { runPersonalOptimization } from "./personalOptimizer";

function session(id: string, messages: string[]): SessionRecord {
  return {
    id,
    createdAt: 1,
    archived: true,
    model: "auto",
    directness: 2,
    techniques: ["auto-detect"],
    context: [],
    variables: {},
    conversation: messages.map((content, index) => ({
      id: `${id}-${index}`,
      role: "user" as const,
      content,
      timestamp: index + 1,
    })),
  };
}

describe("personal optimizer", () => {
  it("never lowers the minimum and never learns from a single session", () => {
    for (const records of [
      [session("one", ["overwhelm", "overwhelm", "overwhelm"])],
      [session("one", ["overwhelm"]), session("two", ["overwhelm"])],
    ]) {
      const run = runPersonalOptimization({ sessions: records, goals: ["reduce-overwhelm"],
        currentPreferences: { routing: {}, technique: {} }, minimumEvidence: 1, apply: true });
      expect(run.changes).toEqual([]);
      expect(run.status).toBe("preview");
    }
  });

  it("keeps evidence to references and counts without retaining conversation text", () => {
    const run = runPersonalOptimization({
      sessions: [session("one", ["overwhelm"]), session("two", ["overwhelm"]), session("three", ["overwhelm"])],
      goals: ["reduce-overwhelm"], currentPreferences: { routing: {}, technique: {} }, apply: false,
    });
    expect(run.scannedSessions).toBe(3);
    expect(run.changes.length).toBeGreaterThan(0);
    expect(run.evidence).toHaveLength(3);
    for (const evidence of run.evidence) {
      expect(evidence).not.toHaveProperty("excerpt");
      expect(evidence.sessionId).toBeTruthy();
      expect(evidence.messageId).toBeTruthy();
    }
    expect(run.afterPreferences.technique.simplify.weight).toBe(1);
    expect(run.beforePreferences.technique).toEqual({});
  });

  it("scans conversations automatically and applies only threshold-backed changes", () => {
    const result = runPersonalOptimization({
      sessions: [session("s1", ["overwhelm"]), session("s2", ["overwhelm"]), session("s3", ["overwhelm"])],
      goals: ["reduce-overwhelm"],
      currentPreferences: { routing: {}, technique: {} },
      minimumEvidence: 3,
      apply: true,
      now: 100,
    });
    expect(result.status).toBe("applied");
    expect(result.scannedSessions).toBe(3);
    expect(result.evidence).toHaveLength(3);
    expect(result.afterPreferences.technique.simplify?.weight).toBe(1);
    expect(result.afterPreferences.technique.detailed?.weight).toBe(-1);
  });

  it("does not change preferences when evidence is below threshold", () => {
    const result = runPersonalOptimization({
      sessions: [session("s1", ["I am confused"])],
      goals: ["increase-clarity"],
      currentPreferences: { routing: {}, technique: {} },
      minimumEvidence: 3,
      apply: true,
    });
    expect(result.status).toBe("preview");
    expect(result.changes).toEqual([]);
    expect(result.afterPreferences).toEqual(result.beforePreferences);
  });
});
