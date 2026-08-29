import { describe, expect, it } from "vitest";
import type { ConversationMessage, SessionRecord } from "../../stores/types";
import { runPersonalOptimization } from "./personalOptimizer";

function session(id: string, conversation: ConversationMessage[]): SessionRecord {
  return {
    id,
    createdAt: 1,
    archived: true,
    model: "auto",
    directness: 2,
    techniques: ["auto-detect"],
    context: [],
    variables: {},
    conversation,
  };
}

describe("customer optimizer candidate preparation", () => {
  it("creates contextual evidence windows without turning locator matches into preferences", () => {
    const result = runPersonalOptimization({
      sessions: [session("s1", [
        { id: "a1", role: "assistant", content: "Here are nine things to do.", timestamp: 1 },
        { id: "u1", role: "user", content: "Please give me one thing at a time. This is too much.", timestamp: 2 },
        { id: "a2", role: "assistant", content: "Start with opening the file.", timestamp: 3, ratingStars: 5 },
      ])],
      goals: ["C04"],
      currentPreferences: { routing: {}, technique: {} },
      apply: true,
      now: 100,
    });

    expect(result.status).toBe("preview");
    expect(result.scannedSessions).toBe(1);
    expect(result.evidence).toHaveLength(2);
    expect(result.evidence[0]).toMatchObject({
      categoryId: "C04",
      sessionId: "s1",
      messageId: "u1",
      explicit: true,
    });
    expect(result.evidence[0].contextBefore).toContain("nine things");
    expect(result.evidence[0].contextAfter).toContain("opening the file");
    expect(result.evidence[0].observedOutcome).toContain("5/5");
    expect(result.changes).toEqual([]);
    expect(result.afterPreferences.technique).toEqual({});
    expect(result.afterPreferences.personalization?.rules).toEqual({});
  });

  it("skips unchanged category-session pairs and rescans changed sessions", () => {
    const original = session("s1", [
      { id: "u1", role: "user", content: "Please keep this concise.", timestamp: 1 },
    ]);
    const first = runPersonalOptimization({
      sessions: [original],
      goals: ["C01"],
      currentPreferences: { routing: {}, technique: {} },
      apply: false,
      now: 100,
    });
    const unchanged = runPersonalOptimization({
      sessions: [original],
      goals: ["C01"],
      currentPreferences: first.afterPreferences,
      apply: true,
      now: 200,
    });

    expect(unchanged.status).toBe("no-change");
    expect(unchanged.scannedSessions).toBe(0);
    expect(unchanged.skippedUnchangedSessions).toBe(1);
    expect(unchanged.evidence).toEqual([]);

    const changed = session("s1", [
      ...original.conversation,
      { id: "u2", role: "user", content: "More detail on the second part, please.", timestamp: 2 },
    ]);
    const rescanned = runPersonalOptimization({
      sessions: [changed],
      goals: ["C01"],
      currentPreferences: first.afterPreferences,
      apply: false,
      now: 300,
    });
    expect(rescanned.scannedSessions).toBe(1);
    expect(rescanned.evidence.map((item) => item.messageId)).toEqual(["u1", "u2"]);
  });

  it("collects only selected categories and treats ratings as outcomes, not automatic findings", () => {
    const result = runPersonalOptimization({
      sessions: [session("s1", [
        { id: "u1", role: "user", content: "Just answer directly and keep it brief.", timestamp: 1 },
        { id: "a1", role: "assistant", content: "Answer.", timestamp: 2 },
      ])],
      ratings: [{ messageId: "a1", sessionId: "s1", stars: 1, comment: "Still too indirect.", timestamp: 3 }],
      goals: ["C03"],
      currentPreferences: { routing: {}, technique: {} },
      apply: false,
    });

    expect(new Set(result.evidence.map((item) => item.categoryId))).toEqual(new Set(["C03"]));
    expect(result.evidence.some((item) => item.signal.includes("observed customer outcome"))).toBe(true);
    expect(result.changes).toEqual([]);
  });
});
