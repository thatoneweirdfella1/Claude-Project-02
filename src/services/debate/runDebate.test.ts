import { describe, expect, it, vi } from "vitest";
import { runDebate, runDebateParticipant } from "./runDebate";
import { DEBATE_CLAUDE_MODEL, type DebateClaudeClient, type DebatePartnerClient } from "./client";

function claudeOk(text = "Claude's argument."): DebateClaudeClient { return vi.fn(async () => text); }
function partnerOk(text = "The partner's argument."): DebatePartnerClient { return vi.fn(async () => text); }
const failing = () => vi.fn(async () => { throw new Error("provider down"); });
const QUESTION = "Should we migrate the service to event sourcing?";

describe("runDebate — happy path", () => {
  it("returns a complete two-way transcript with attribution", async () => {
    const outcome = await runDebate(QUESTION, { claudeClient: claudeOk(), partnerClient: partnerOk(), partnerIds: ["gpt-5.5"] });
    expect(outcome.status).toBe("complete");
    if (outcome.status !== "complete") return;
    expect(outcome.sides).toHaveLength(2);
    expect(outcome.transcript.participants).toEqual([
      { label: "Claude", providerId: "anthropic", modelId: DEBATE_CLAUDE_MODEL, text: "Claude's argument." },
      { label: "GPT-5.5", providerId: "openai", modelId: "gpt-5.5", text: "The partner's argument." },
    ]);
    expect(outcome.transcript.claudeText).toBe("Claude's argument.");
    expect(outcome.transcript.partnerLabel).toBe("GPT-5.5");
  });

  it.each([
    [["gpt-5.5", "gemini-3.1-pro"] as const, 3],
    [["gpt-5.5", "gemini-3.1-pro", "grok-4.3"] as const, 4],
  ])("preserves every participant for multi-way consensus/synthesis", async (partnerIds, expectedCount) => {
    const partnerClient: DebatePartnerClient = vi.fn(async ({ partner }) => `${partner.label} argument`);
    const outcome = await runDebate(QUESTION, { claudeClient: claudeOk(), partnerClient, partnerIds: [...partnerIds] });
    expect(outcome.status).toBe("complete");
    if (outcome.status !== "complete") return;
    expect(outcome.transcript.participants).toHaveLength(expectedCount);
    expect(outcome.transcript.participants?.map((participant) => participant.label)).toEqual([
      "Claude",
      ...partnerIds.map((id) => id === "gpt-5.5" ? "GPT-5.5" : id === "gemini-3.1-pro" ? "Gemini 3.1 Pro" : "Grok 4.3"),
    ]);
  });

  it("gives Claude and partners opposite stances", async () => {
    const outcome = await runDebate(QUESTION, { claudeClient: claudeOk(), partnerClient: partnerOk(), partnerIds: ["grok-4.3"] });
    if (outcome.status === "empty-question") throw new Error("unexpected");
    expect(outcome.sides[0].stance).not.toBe(outcome.sides[1].stance);
  });

  it("sends each side its assigned stance and the same question", async () => {
    const claudeClient = claudeOk(); const partnerClient = partnerOk();
    await runDebate(QUESTION, { claudeClient, partnerClient, partnerIds: ["gpt-5.5"] });
    const claudeArgs = vi.mocked(claudeClient).mock.calls[0][0];
    const partnerArgs = vi.mocked(partnerClient).mock.calls[0][0];
    expect(claudeArgs.model).toBe(DEBATE_CLAUDE_MODEL);
    expect(claudeArgs.system).toContain("arguing FOR");
    expect(partnerArgs.system).toContain("arguing AGAINST");
    expect(claudeArgs.input).toBe(partnerArgs.input);
    expect(claudeArgs.input).toContain(QUESTION);
  });

  it("honours an explicit Claude stance", async () => {
    const outcome = await runDebate(QUESTION, { claudeClient: claudeOk(), partnerClient: partnerOk(), partnerIds: ["deepseek-v4-pro"], claudeStance: "against" });
    if (outcome.status === "empty-question") throw new Error("unexpected");
    expect(outcome.sides[0].stance).toBe("against");
    expect(outcome.sides[1].stance).toBe("for");
  });
});

describe("runDebateParticipant — retry exactly one side", () => {
  it("retries only the selected partner and does not call Claude or other partners", async () => {
    const claudeClient = claudeOk();
    const partnerClient = partnerOk("retry landed");
    const result = await runDebateParticipant(QUESTION, {
      claudeClient,
      partnerClient,
      side: { stance: "against", partnerId: "gemini-3.1-pro" },
    });
    expect(result.status).toBe("ok");
    expect(result.partnerId).toBe("gemini-3.1-pro");
    expect(claudeClient).not.toHaveBeenCalled();
    expect(partnerClient).toHaveBeenCalledTimes(1);
    expect(vi.mocked(partnerClient).mock.calls[0][0].partner.id).toBe("gemini-3.1-pro");
  });

  it("retries only Claude when the failed side is Claude", async () => {
    const claudeClient = claudeOk("retry landed");
    const partnerClient = partnerOk();
    const result = await runDebateParticipant(QUESTION, { claudeClient, partnerClient, side: { stance: "for" } });
    expect(result.status).toBe("ok");
    expect(claudeClient).toHaveBeenCalledTimes(1);
    expect(partnerClient).not.toHaveBeenCalled();
  });
});

describe("runDebate — failures", () => {
  it("keeps Claude intact when a partner fails", async () => {
    const outcome = await runDebate(QUESTION, { claudeClient: claudeOk(), partnerClient: failing(), partnerIds: ["gpt-5.5"] });
    expect(outcome.status).toBe("partial");
    if (outcome.status === "empty-question") return;
    expect(outcome.sides[0].status).toBe("ok");
    expect(outcome.sides[1].status).toBe("error");
  });

  it("keeps a partner intact when Claude fails", async () => {
    expect((await runDebate(QUESTION, { claudeClient: failing(), partnerClient: partnerOk(), partnerIds: ["gpt-5.5"] })).status).toBe("partial");
  });

  it("returns failed when no side lands", async () => {
    expect((await runDebate(QUESTION, { claudeClient: failing(), partnerClient: failing(), partnerIds: ["gpt-5.5"] })).status).toBe("failed");
  });

  it("never leaks raw provider errors", async () => {
    const outcome = await runDebate(QUESTION, { claudeClient: claudeOk(), partnerClient: vi.fn(async () => { throw new Error("401 Unauthorized: sk-secret-key-leaked"); }), partnerIds: ["gpt-5.5"] });
    if (outcome.status === "empty-question") throw new Error("unexpected");
    expect(outcome.sides[1].message).not.toContain("sk-secret");
    expect(outcome.sides[1].message).not.toContain("401");
  });
});

describe("runDebate — guards", () => {
  it("short-circuits an empty question without calls", async () => {
    const claudeClient = claudeOk(); const partnerClient = partnerOk();
    expect((await runDebate("   ", { claudeClient, partnerClient, partnerIds: ["gpt-5.5"] })).status).toBe("empty-question");
    expect(claudeClient).not.toHaveBeenCalled(); expect(partnerClient).not.toHaveBeenCalled();
  });

  it("runs all sides concurrently", async () => {
    let active = 0; let peak = 0;
    const slow = async () => { active += 1; peak = Math.max(peak, active); await new Promise((resolve) => setTimeout(resolve, 5)); active -= 1; return "text"; };
    await runDebate(QUESTION, { claudeClient: slow, partnerClient: slow, partnerIds: ["gpt-5.5", "gemini-3.1-pro"] });
    expect(peak).toBe(3);
  });
});
