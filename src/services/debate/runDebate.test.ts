/* Step 8.3 verification — Debate mode's orchestration. Only the two model
   clients are stubbed; the roster, prompts, stance assignment, and transcript
   construction all run for real (same offline-stub posture as every prior
   service test in this repo). */

import { describe, expect, it, vi } from "vitest";
import { retryDebateSide, runDebate, type ParticipantUsage } from "./runDebate";
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
      participants: [
        { label: "Claude", provider: "anthropic", model: "claude-sonnet-5", text: "Claude's argument." },
        { label: "GPT-5.5", provider: "openai", model: "gpt-5.5", text: "The partner's argument." },
      ],
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
    expect(outcome.transcript.participants[1].label).toBe("Gemini 3.1 Pro");
  });
});

describe("runDebate — R23: 3- and 4-way transcripts include every participant", () => {
  it("includes all 3 participants (Claude + 2 partners) in the transcript, in stable order", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk("Claude says A."),
      partnerClient: vi.fn(async (req) => ({ text: `${req.partner.label} says something.` })),
      partnerIds: ["gpt-5.5", "gemini-3.1-pro"],
    });

    expect(outcome.status).toBe("complete");
    if (outcome.status !== "complete") return;
    expect(outcome.transcript.participants).toHaveLength(3);
    expect(outcome.transcript.participants.map((p) => p.label)).toEqual([
      "Claude", "GPT-5.5", "Gemini 3.1 Pro",
    ]);
    expect(outcome.transcript.participants[0].text).toBe("Claude says A.");
    expect(outcome.transcript.participants[1].text).toContain("GPT-5.5 says");
    expect(outcome.transcript.participants[2].text).toContain("Gemini 3.1 Pro says");
  });

  it("includes all 4 participants (Claude + 3 partners) in the transcript, in stable order", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk("Claude says A."),
      partnerClient: vi.fn(async (req) => ({ text: `${req.partner.label} says something.` })),
      partnerIds: ["gpt-5.5", "gemini-3.1-pro", "grok-4.3"],
    });

    expect(outcome.status).toBe("complete");
    if (outcome.status !== "complete") return;
    expect(outcome.transcript.participants).toHaveLength(4);
    expect(outcome.transcript.participants.map((p) => p.label)).toEqual([
      "Claude", "GPT-5.5", "Gemini 3.1 Pro", "Grok 4.3",
    ]);
  });

  it("a 3-way debate stays 'partial' (no transcript) if even one of three partners fails", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: vi.fn(async (req) => {
        if (req.partner.id === "gemini-3.1-pro") throw new Error("down");
        return { text: `${req.partner.label} argument.` };
      }),
      partnerIds: ["gpt-5.5", "gemini-3.1-pro"],
    });

    expect(outcome.status).toBe("partial");
    if (outcome.status === "empty-question" || outcome.status === "complete") return;
    expect(outcome.sides.filter((s) => s.status === "ok")).toHaveLength(2);
    expect(outcome.sides.find((s) => s.partnerId === "gemini-3.1-pro")?.status).toBe("error");
  });
});

describe("retryDebateSide — R22: retrying one participant makes exactly one call", () => {
  it("calls only the partner client, never the Claude client, when retrying a partner", async () => {
    const claudeClient = claudeOk();
    const partnerClient = partnerOk("Retried partner argument.");

    const side = await retryDebateSide(QUESTION, {
      claudeClient,
      partnerClient,
      stance: "against",
      partnerId: "gpt-5.5",
    });

    expect(claudeClient).not.toHaveBeenCalled();
    expect(partnerClient).toHaveBeenCalledTimes(1);
    expect(side.status).toBe("ok");
    expect(side.text).toBe("Retried partner argument.");
    expect(side.stance).toBe("against");
    expect(side.partnerId).toBe("gpt-5.5");
  });

  it("calls only the Claude client, never the partner client, when retrying Claude's side", async () => {
    const claudeClient = claudeOk("Retried Claude argument.");
    const partnerClient = partnerOk();

    const side = await retryDebateSide(QUESTION, {
      claudeClient,
      partnerClient,
      stance: "for",
      // No partnerId — this is Claude's own side.
    });

    expect(partnerClient).not.toHaveBeenCalled();
    expect(claudeClient).toHaveBeenCalledTimes(1);
    expect(side.status).toBe("ok");
    expect(side.text).toBe("Retried Claude argument.");
    expect(side.label).toBe("Claude");
  });

  it("preserves the passed-in stance rather than recomputing one", async () => {
    const claudeClient = claudeOk();
    const partnerClient = partnerOk();

    const side = await retryDebateSide(QUESTION, {
      claudeClient,
      partnerClient,
      stance: "against",
      partnerId: "grok-4.3",
    });

    expect(side.stance).toBe("against");
  });

  it("reports a neutral error and still makes exactly one call when the retried side fails", async () => {
    const claudeClient = claudeOk();
    const partnerClient = failing();

    const side = await retryDebateSide(QUESTION, {
      claudeClient,
      partnerClient,
      stance: "for",
      partnerId: "deepseek-v4-pro",
    });

    expect(partnerClient).toHaveBeenCalledTimes(1);
    expect(side.status).toBe("error");
    expect(side.message).toBeTruthy();
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

  it("a failed side carries no usage at all — never a null-filled object, never a fake 0", async () => {
    // Second-pass correction: this test's title previously claimed usage
    // IS included on a failed side, but never actually checked `.usage` —
    // only `.status`. A failed side never called the API, so it must have
    // no usage object at all (undefined), not usage with 0/null fields
    // pretending a call happened.
    const failingWithMetadata: DebatePartnerClient = vi.fn(async () => {
      throw new Error("API down");
    });

    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: failingWithMetadata,
      partnerIds: ["gpt-5.5"],
    });

    if (outcome.status === "empty-question") return;
    expect(outcome.sides[1].status).toBe("error");
    expect(outcome.sides[1].usage).toBeUndefined();
  });
});
