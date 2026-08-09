import { describe, expect, it, vi } from "vitest";
import type { SessionRecord } from "../../stores/types";
import { runPersonalOptimizationWithAi } from "./personalOptimizationRunner";

const sessions: SessionRecord[] = [{
  id: "s1",
  createdAt: 1,
  archived: true,
  model: "auto",
  directness: 2,
  techniques: ["auto-detect"],
  context: [],
  variables: {},
  conversation: ["This is too much", "I am overwhelmed", "Please simplify this"].map((content, index) => ({
    id: `m${index}`,
    role: "user" as const,
    content,
    timestamp: index + 1,
  })),
}];

describe("AI-validated personal optimization", () => {
  it("sends only compact evidence and applies only AI-accepted targets", async () => {
    const complete = vi.fn(async () => JSON.stringify({
      decisions: [
        { target: "simplify", accept: true, confidence: 0.9, reason: "Three distinct overload signals." },
        { target: "step-by-step", accept: false, confidence: 0.4, reason: "Not specific enough." },
        { target: "detailed", accept: false, confidence: 0.4, reason: "Not specific enough." },
      ],
    }));
    const result = await runPersonalOptimizationWithAi({
      sessions,
      goals: ["reduce-overwhelm"],
      currentPreferences: { routing: {}, technique: {} },
      minimumEvidence: 3,
      apply: true,
      now: 100,
    }, {
      authorize: async () => ({ authorized: true }),
      complete,
    });
    expect(result?.status).toBe("applied");
    expect(result?.changes.map((change) => change.target)).toEqual(["simplify"]);
    expect(result?.afterPreferences.technique.simplify?.weight).toBe(1);
    const request = complete.mock.calls[0][0];
    expect(request.input).toContain("minimumEvidence");
    expect(request.input).not.toContain("conversation");
  });

  it("fails closed when validation does not return valid JSON", async () => {
    const result = await runPersonalOptimizationWithAi({
      sessions,
      goals: ["reduce-overwhelm"],
      currentPreferences: { routing: {}, technique: {} },
      minimumEvidence: 3,
      apply: true,
    }, {
      authorize: async () => ({ authorized: true }),
      complete: async () => "not json",
    });
    expect(result?.status).toBe("failed");
    expect(result?.changes).toEqual([]);
    expect(result?.afterPreferences).toEqual(result?.beforePreferences);
  });
});
