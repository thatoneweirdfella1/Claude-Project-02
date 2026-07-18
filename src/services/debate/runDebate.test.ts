/* Step 8.3 verification — Debate mode's orchestration. Only the two model
   clients are stubbed; the roster, prompts, stance assignment, and transcript
   construction all run for real (same offline-stub posture as every prior
   service test in this repo). */

import { describe, expect, it, vi } from "vitest";
import { runDebate } from "./runDebate";
import { DEBATE_CLAUDE_MODEL, type DebateClaudeClient, type DebatePartnerClient } from "./client";

function claudeOk(text = "Claude's argument."): DebateClaudeClient {
  return vi.fn(async () => text);
}
function partnerOk(text = "The partner's argument."): DebatePartnerClient {
  return vi.fn(async () => text);
}
const failing = () => vi.fn(async () => { throw new Error("provider down"); });

const QUESTION = "Should we migrate the service to event sourcing?";

describe("runDebate — the happy path", () => {
  it("returns a complete outcome with both sides and a DebateTranscript", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: partnerOk(),
      partnerId: "gpt-5.5",
    });

    expect(outcome.status).toBe("complete");
    if (outcome.status !== "complete") return;
    expect(outcome.claude.status).toBe("ok");
    expect(outcome.partner.status).toBe("ok");
    expect(outcome.transcript).toEqual({
      question: QUESTION,
      claudeText: "Claude's argument.",
      partnerLabel: "GPT-5.5",
      partnerText: "The partner's argument.",
    });
  });

  it("gives the two sides OPPOSITE stances — never the same side twice", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: partnerOk(),
      partnerId: "grok-4.3",
    });
    if (outcome.status === "empty-question") throw new Error("unexpected");
    expect(outcome.claude.stance).not.toBe(outcome.partner.stance);
  });

  it("sends each side a prompt naming its own assigned stance, and the same question to both", async () => {
    const claudeClient = claudeOk();
    const partnerClient = partnerOk();
    await runDebate(QUESTION, { claudeClient, partnerClient, partnerId: "gpt-5.5" });

    const claudeArgs = vi.mocked(claudeClient).mock.calls[0][0];
    const partnerArgs = vi.mocked(partnerClient).mock.calls[0][0];

    expect(claudeArgs.model).toBe(DEBATE_CLAUDE_MODEL);
    expect(claudeArgs.system).toContain("arguing FOR");
    expect(partnerArgs.system).toContain("arguing AGAINST");
    expect(partnerArgs.partner.id).toBe("gpt-5.5");
    // Identical framing of the question for both sides.
    expect(claudeArgs.input).toBe(partnerArgs.input);
    expect(claudeArgs.input).toContain(QUESTION);
  });

  it("honours an explicit claudeStance, flipping the partner to the other side", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: partnerOk(),
      partnerId: "deepseek-v4-pro",
      claudeStance: "against",
    });
    if (outcome.status === "empty-question") throw new Error("unexpected");
    expect(outcome.claude.stance).toBe("against");
    expect(outcome.partner.stance).toBe("for");
  });

  it("uses the picked partner's real roster label, not its api string", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: partnerOk(),
      partnerId: "gemini-3.1-pro",
    });
    if (outcome.status !== "complete") throw new Error("unexpected");
    expect(outcome.transcript.partnerLabel).toBe("Gemini 3.1 Pro");
  });
});

describe("runDebate — one side down never breaks the turn (ROUTING.md)", () => {
  it("returns 'partial' with Claude's side intact when the partner fails", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: failing(),
      partnerId: "gpt-5.5",
    });

    expect(outcome.status).toBe("partial");
    if (outcome.status === "empty-question") return;
    expect(outcome.claude.status).toBe("ok");
    expect(outcome.claude.text).toBe("Claude's argument.");
    expect(outcome.partner.status).toBe("error");
    expect(outcome.partner.message).toBeTruthy();
  });

  it("returns 'partial' with the partner intact when Claude fails", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: failing(),
      partnerClient: partnerOk(),
      partnerId: "gpt-5.5",
    });
    expect(outcome.status).toBe("partial");
  });

  it("returns 'failed' when neither side lands, still without throwing", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: failing(),
      partnerClient: failing(),
      partnerId: "gpt-5.5",
    });
    expect(outcome.status).toBe("failed");
  });

  it("never leaks the provider's raw error text into the user-facing message", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: vi.fn(async () => {
        throw new Error("401 Unauthorized: sk-secret-key-leaked");
      }),
      partnerId: "gpt-5.5",
    });
    if (outcome.status === "empty-question") throw new Error("unexpected");
    expect(outcome.partner.message).not.toContain("sk-secret");
    expect(outcome.partner.message).not.toContain("401");
  });

  it("treats an empty/whitespace reply as a failed side, not a silent empty column", async () => {
    const outcome = await runDebate(QUESTION, {
      claudeClient: claudeOk(),
      partnerClient: partnerOk("   \n  "),
      partnerId: "gpt-5.5",
    });
    if (outcome.status === "empty-question") throw new Error("unexpected");
    expect(outcome.partner.status).toBe("error");
  });
});

describe("runDebate — guards", () => {
  it("short-circuits an empty question without spending either call", async () => {
    const claudeClient = claudeOk();
    const partnerClient = partnerOk();
    const outcome = await runDebate("   ", { claudeClient, partnerClient, partnerId: "gpt-5.5" });

    expect(outcome.status).toBe("empty-question");
    expect(claudeClient).not.toHaveBeenCalled();
    expect(partnerClient).not.toHaveBeenCalled();
  });

  it("runs both sides concurrently rather than one after the other", async () => {
    let active = 0;
    let peak = 0;
    const slow = async () => {
      active += 1;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active -= 1;
      return "text";
    };

    await runDebate(QUESTION, {
      claudeClient: slow,
      partnerClient: slow,
      partnerId: "gpt-5.5",
    });
    expect(peak).toBe(2);
  });
});
