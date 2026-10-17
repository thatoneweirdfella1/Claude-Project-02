import { describe, expect, it, vi } from "vitest";
import type { SessionRecord } from "../../stores/types";
import type { ProxyCompletionRequest } from "../proxyClient";
import { runPersonalOptimizationWithAi } from "./personalOptimizationRunner";

// Independent synthetic sessions exercise the evidence rule; the provider is injected.
const sessions: SessionRecord[] = Array.from({ length: 3 }, (_, index) => ({
  id: `synthetic-session-${index}`, createdAt: index, archived: true,
  model: "auto", directness: 2, techniques: ["auto-detect"], context: [], variables: {},
  conversation: [{ id: `synthetic-message-${index}`, role: "user", content: "overwhelm", timestamp: index }],
}));

describe("AI-validated personal optimization", () => {
  it("sends only compact evidence and applies only AI-accepted targets", async () => {
    const complete = vi.fn(async (_request: ProxyCompletionRequest) => JSON.stringify({
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
