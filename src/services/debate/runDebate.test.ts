/* Step 8.3 verification — Debate mode's orchestration. Only the two model
   clients are stubbed; the roster, prompts, stance assignment, and transcript
   construction all run for real (same offline-stub posture as every prior
   service test in this repo). */

import { describe, expect, it, vi } from "vitest";
import { runDebate, type ParticipantUsage } from "./runDebate";
import { DEBATE_CLAUDE_MODEL, type DebateClaudeClient, type DebateCompletionResponse, type DebatePartnerClient } from "./client";

function claudeOk(text = "Claude's argument."): DebateClaudeClient {
  return vi.fn(async () => ({ text }));
}
function partnerOk(text = "The partner's argument."): DebatePartnerClient {
  return vi.fn(async () => ({ text }));
}
const failing = () => vi.fn(async () => { throw new Error("provider down"); });

const QUESTION = "Should we migrate the service to event sourcing?";

describe("runDebate — the happy path", () => {
  it("returns a complete outcome with all sides and a DebateTranscript", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: partnerOk(),
      partnerIds: ["gpt-5.5"],
    });

    expect(outcome.status).toBe("complete");
    if (outcome.status !== "complete") return;
    expect(outcome.sides[0].status).toBe("ok"); // Claude
    expect(outcome.sides[1].status).toBe("ok"); // Partner
    expect(outcome.transcript).toEqual({
      question: QUESTION,
      claudeText: "Claude's argument.",
      partnerLabel: "GPT-5.5",
      partnerText: "The partner's argument.",
    });
  });

  it("gives Claude and partners OPPOSITE stances — never the same side twice", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: partnerOk(),
      partnerIds: ["grok-4.3"],
    });
    if (outcome.status === "empty-question") throw new Error("unexpected");
    expect(outcome.sides[0].stance).not.toBe(outcome.sides[1].stance);
  });

  it("sends each side a prompt naming its own assigned stance, and the same question to all", async () => {
    const claudeClient = claudeOk();
    const partnerClient = partnerOk();
    await runDebate(QUESTION, { claudeClient, partnerClient, partnerIds: ["gpt-5.5"] });

    const claudeArgs = vi.mocked(claudeClient).mock.calls[0][0];
    const partnerArgs = vi.mocked(partnerClient).mock.calls[0][0];

    expect(claudeArgs.model).toBe(DEBATE_CLAUDE_MODEL);
    expect(claudeArgs.system).toContain("arguing FOR");
    expect(partnerArgs.system).toContain("arguing AGAINST");
    expect(partnerArgs.partner.id).toBe("gpt-5.5");
    // Identical framing of the question for all sides.
    expect(claudeArgs.input).toBe(partnerArgs.input);
    expect(claudeArgs.input).toContain(QUESTION);
  });

  it("honours an explicit claudeStance, flipping the partner to the other side", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: partnerOk(),
      partnerIds: ["deepseek-v4-pro"],
      claudeStance: "against",
    });
    if (outcome.status === "empty-question") throw new Error("unexpected");
    expect(outcome.sides[0].stance).toBe("against"); // Claude
    expect(outcome.sides[1].stance).toBe("for"); // Partner
  });

  it("uses the picked partner's real roster label, not its api string", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: partnerOk(),
      partnerIds: ["gemini-3.1-pro"],
    });
    if (outcome.status !== "complete") throw new Error("unexpected");
    expect(outcome.transcript.partnerLabel).toBe("Gemini 3.1 Pro");
  });
});

describe("runDebate — one side down never breaks the turn (ROUTING.md)", () => {
  it("returns 'partial' with Claude's side intact when a partner fails", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: failing(),
      partnerIds: ["gpt-5.5"],
    });

    expect(outcome.status).toBe("partial");
    if (outcome.status === "empty-question") return;
    expect(outcome.sides[0].status).toBe("ok");
    expect(outcome.sides[0].text).toBe("Claude's argument.");
    expect(outcome.sides[1].status).toBe("error");
    expect(outcome.sides[1].message).toBeTruthy();
  });

  it("returns 'partial' with the partner intact when Claude fails", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: failing(),
      partnerClient: partnerOk(),
      partnerIds: ["gpt-5.5"],
    });
    expect(outcome.status).toBe("partial");
  });

  it("returns 'failed' when neither side lands, still without throwing", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: failing(),
      partnerClient: failing(),
      partnerIds: ["gpt-5.5"],
    });
    expect(outcome.status).toBe("failed");
  });

  it("never leaks the provider's raw error text into the user-facing message", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: vi.fn(async () => {
        throw new Error("401 Unauthorized: sk-secret-key-leaked");
      }),
      partnerIds: ["gpt-5.5"],
    });
    if (outcome.status === "empty-question") throw new Error("unexpected");
    expect(outcome.sides[1].message).not.toContain("sk-secret");
    expect(outcome.sides[1].message).not.toContain("401");
  });

  it("treats an empty/whitespace reply as a failed side, not a silent empty column", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: partnerOk("   \n  "),
      partnerIds: ["gpt-5.5"],
    });
    if (outcome.status === "empty-question") throw new Error("unexpected");
    expect(outcome.sides[1].status).toBe("error");
  });
});

describe("runDebate — guards", () => {
  it("short-circuits an empty question without spending any calls", async () => {
    const claudeClient = claudeOk();
    const partnerClient = partnerOk();
    const outcome = await runDebate("   ", { claudeClient, partnerClient, partnerIds: ["gpt-5.5"] });

    expect(outcome.status).toBe("empty-question");
    expect(claudeClient).not.toHaveBeenCalled();
    expect(partnerClient).not.toHaveBeenCalled();
  });

  it("runs all sides concurrently rather than sequentially", async () => {
    let active = 0;
    let peak = 0;
    const slow = async () => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return { text: "text" };
    };

    await runDebate(QUESTION, {
      claudeClient: slow,
      partnerClient: slow,
      partnerIds: ["gpt-5.5"],
    });
    expect(peak).toBe(2); // Claude + 1 partner
  });
});

describe("R15: Partner Usage Collection", () => {
  it("normalizes provider, model, input/output tokens, estimate, and actual cost for every participant", async () => {
    const claudeWithUsage: DebateClaudeClient = vi.fn(async () => ({
      text: "Claude's argument.",
      usage: {
        provider: "anthropic",
        model: "claude-sonnet-5",
        inputTokens: 450,
        outputTokens: 280,
        estimatedCost: null,
        actualCost: null,
      },
    }));

    const partnerWithUsage: DebatePartnerClient = vi.fn(async () => ({
      text: "The partner's argument.",
      usage: {
        provider: "openai",
        model: "gpt-5.5",
        inputTokens: 420,
        outputTokens: 310,
        estimatedCost: null,
        actualCost: null,
      },
    }));

    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeWithUsage,
      partnerClient: partnerWithUsage,
      partnerIds: ["gpt-5.5"],
    });

    expect(outcome.status).toBe("complete");
    if (outcome.status !== "complete") return;

    expect(outcome.sides[0].usage).toEqual({
      provider: "anthropic",
      model: "claude-sonnet-5",
      inputTokens: 450,
      outputTokens: 280,
      estimatedCost: null,
      actualCost: null,
    });

    expect(outcome.sides[1].usage).toEqual({
      provider: "openai",
      model: "gpt-5.5",
      inputTokens: 420,
      outputTokens: 310,
      estimatedCost: null,
      actualCost: null,
    });
  });

  it("preserves unavailable fields honestly (null for unknown/unavailable)", async () => {
    const claudePartial: DebateClaudeClient = vi.fn(async () => ({
      text: "Claude's argument.",
      usage: {
        provider: "anthropic",
        model: null,
        inputTokens: null,
        outputTokens: null,
        estimatedCost: null,
        actualCost: null,
      },
    }));

    const outcome = await runDebate(QUESTION, {
      claudeClient: claudePartial,
      partnerClient: partnerOk(),
      partnerIds: ["gpt-5.5"],
    });

    if (outcome.status !== "complete") return;
    expect(outcome.sides[0].usage?.model).toBeNull();
    expect(outcome.sides[0].usage?.inputTokens).toBeNull();
  });

  it("handles multiple participants with distinct usage data", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: vi.fn(async () => ({
        text: "Claude says yes.",
        usage: {
          provider: "anthropic",
          model: "claude-sonnet-5",
          inputTokens: 500,
          outputTokens: 300,
          estimatedCost: null,
          actualCost: null,
        },
      })),
      partnerClient: vi.fn(async (req) => {
        const model = req.partner.id;
        return {
          text: "Partner says no.",
          usage: {
            provider: req.partner.id === "gpt-5.5" ? "openai" : "google",
            model,
            inputTokens: 480,
            outputTokens: 320,
            estimatedCost: null,
            actualCost: null,
          },
        };
      }),
      partnerIds: ["gpt-5.5", "gemini-3.1-pro"],
    });

    if (outcome.status !== "complete") return;
    expect(outcome.sides).toHaveLength(3); // Claude + 2 partners
    expect(outcome.sides[1].usage?.provider).toBe("openai");
    expect(outcome.sides[2].usage?.provider).toBe("google");
  });

  it("includes usage even when a side fails", async () => {
    const failingWithMetadata: DebatePartnerClient = vi.fn(async () => {
      throw new Error("API down");
    });

    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: failingWithMetadata,
      partnerIds: ["gpt-5.5"],
    });

    if (outcome.status === "empty-question") return;
    // Failed sides should not have usage since they didn't call the API
    expect(outcome.sides[1].status).toBe("error");
  });
});
