/* Step 8.4 verification — Consensus service. Only the model client is
   stubbed (no network in this sandbox, same standing residual as every
   model call since 1.10); transcript validation, prompt selection, and
   schema parsing all run for real. */

import { describe, expect, it, vi } from "vitest";
import { runConsensus } from "./consensus";
import { MULTI_AI_RUNTIME_MODEL, type MultiAiCompletionRequest } from "./client";
import { CONSENSUS_SYSTEM_PROMPT } from "./prompt";
import type { DebateTranscript } from "./transcript";

type ClientFn = (req: MultiAiCompletionRequest) => Promise<string>;

function participant(label: string, text: string, provider = "anthropic", model = "claude-sonnet-5") {
  return { label, provider, model, text };
}

function transcript(overrides: Partial<DebateTranscript> = {}): DebateTranscript {
  return {
    question: "Should we use microservices?",
    participants: [
      participant("Claude", "Only once you have a real scaling or team-boundary problem."),
      participant("GPT-5.5", "Start with microservices so you never have to migrate later.", "openai", "gpt-5.5"),
    ],
    ...overrides,
  };
}

function consensusJson(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    disagreement: "Claude says wait for a real need; GPT-5.5 says start early.",
    commonGround: "Both agree microservices add operational overhead.",
    unifiedView: "Start monolithic, split out services once a concrete need appears.",
    ...overrides,
  });
}

describe("runConsensus — the happy path", () => {
  it("returns a parsed ConsensusResult from a well-formed reply", async () => {
    const client = vi.fn(async () => consensusJson());
    const outcome = await runConsensus(transcript(), { client });

    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(outcome.result.disagreement).toContain("wait");
    expect(outcome.result.unifiedView).toContain("monolithic");
  });

  it("calls the runtime model (claude-opus-4-8) with the Consensus prompt and the combined transcript", async () => {
    const client = vi.fn<ClientFn>(async () => consensusJson());
    await runConsensus(transcript(), { client });

    expect(client).toHaveBeenCalledTimes(1);
    const req = client.mock.calls[0][0];
    expect(req.model).toBe(MULTI_AI_RUNTIME_MODEL);
    expect(req.model).toBe("claude-opus-4-8");
    expect(req.system).toBe(CONSENSUS_SYSTEM_PROMPT);
    expect(req.input).toContain("QUESTION:");
    expect(req.input).toContain("GPT-5.5 [openai · gpt-5.5]'S ANSWER:");
  });

  it("tolerates a reply wrapped in prose / code fences", async () => {
    const client = vi.fn(
      async () => "Here you go:\n```json\n" + consensusJson() + "\n```",
    );
    const outcome = await runConsensus(transcript(), { client });
    expect(outcome.status).toBe("ok");
  });
});

describe("runConsensus — an incomplete transcript", () => {
  it("returns 'incomplete-transcript' without calling the model", async () => {
    const client = vi.fn(async () => consensusJson());
    const outcome = await runConsensus(transcript({
      participants: [participant("Claude", "Only once you have a real scaling problem."), participant("GPT-5.5", "", "openai", "gpt-5.5")],
    }), { client });

    expect(outcome.status).toBe("incomplete-transcript");
    expect(client).not.toHaveBeenCalled();
  });
});

describe("runConsensus — R23: every participant in a 3-/4-way debate", () => {
  it("includes a third participant's argument in the model input for a 3-way debate", async () => {
    const client = vi.fn<ClientFn>(async () => consensusJson());
    await runConsensus(transcript({
      participants: [
        participant("Claude", "Claude's argument."),
        participant("GPT-5.5", "GPT's argument.", "openai", "gpt-5.5"),
        participant("Gemini 3.1 Pro", "Gemini's argument.", "google", "gemini-3.1-pro"),
      ],
    }), { client });

    const req = client.mock.calls[0][0];
    expect(req.input).toContain("GEMINI 3.1 PRO [google · gemini-3.1-pro]'S ANSWER:");
    expect(req.input).toContain("Gemini's argument.");
  });

  it("includes all four participants' arguments for a 4-way debate", async () => {
    const client = vi.fn<ClientFn>(async () => consensusJson());
    await runConsensus(transcript({
      participants: [
        participant("Claude", "Claude's argument."),
        participant("GPT-5.5", "GPT's argument.", "openai", "gpt-5.5"),
        participant("Gemini 3.1 Pro", "Gemini's argument.", "google", "gemini-3.1-pro"),
        participant("Grok 4.3", "Grok's argument.", "xai", "grok-4.3"),
      ],
    }), { client });

    const req = client.mock.calls[0][0];
    expect(req.input).toContain("GPT-5.5 [openai · gpt-5.5]'S ANSWER:");
    expect(req.input).toContain("GEMINI 3.1 PRO [google · gemini-3.1-pro]'S ANSWER:");
    expect(req.input).toContain("GROK 4.3 [xai · grok-4.3]'S ANSWER:");
  });
});

describe("runConsensus — failure paths", () => {
  it("returns 'error' on a transport failure", async () => {
    const client = vi.fn(async () => {
      throw new Error("network down");
    });
    const outcome = await runConsensus(transcript(), { client });
    expect(outcome.status).toBe("error");
    if (outcome.status !== "error") return;
    expect(outcome.message).toContain("network down");
  });

  it("returns 'error' on a reply missing a required field", async () => {
    const client = vi.fn(async () => consensusJson({ unifiedView: "" }));
    const outcome = await runConsensus(transcript(), { client });
    expect(outcome.status).toBe("error");
  });

  it("returns 'error' on unparseable JSON", async () => {
    const client = vi.fn(async () => "not json at all");
    const outcome = await runConsensus(transcript(), { client });
    expect(outcome.status).toBe("error");
  });
});
