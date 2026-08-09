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
  it("scans conversations automatically and applies only threshold-backed changes", () => {
    const result = runPersonalOptimization({
      sessions: [session("s1", ["This is too much", "I feel overwhelmed", "Please simplify this"] )],
      goals: ["reduce-overwhelm"],
      currentPreferences: { routing: {}, technique: {} },
      minimumEvidence: 3,
      apply: true,
      now: 100,
    });
    expect(result.status).toBe("applied");
    expect(result.scannedSessions).toBe(1);
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
