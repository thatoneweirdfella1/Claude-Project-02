/* Step 8.4 verification — Synthesis service. Same stubbed-client posture as
   consensus.test.ts; the two are deliberately parallel siblings. */

import { describe, expect, it, vi } from "vitest";
import { runSynthesis } from "./synthesis";
import { MULTI_AI_RUNTIME_MODEL, type MultiAiCompletionRequest } from "./client";
import { SYNTHESIS_SYSTEM_PROMPT } from "./prompt";
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

function synthesisJson(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({
    refinedAnswer:
      "Start with a well-structured monolith and split out services once a concrete scaling or team need appears.",
    ...overrides,
  });
}

describe("runSynthesis — the happy path", () => {
  it("returns a parsed SynthesisResult from a well-formed reply", async () => {
    const client = vi.fn(async () => synthesisJson());
    const outcome = await runSynthesis(transcript(), { client });

    expect(outcome.status).toBe("ok");
    if (outcome.status !== "ok") return;
    expect(outcome.result.refinedAnswer).toContain("monolith");
  });

  it("calls the runtime model (claude-opus-4-8) with the Synthesis prompt and the combined transcript", async () => {
    const client = vi.fn<ClientFn>(async () => synthesisJson());
    await runSynthesis(transcript(), { client });

    expect(client).toHaveBeenCalledTimes(1);
    const req = client.mock.calls[0][0];
    expect(req.model).toBe(MULTI_AI_RUNTIME_MODEL);
    expect(req.model).toBe("claude-opus-4-8");
    expect(req.system).toBe(SYNTHESIS_SYSTEM_PROMPT);
    expect(req.input).toContain("QUESTION:");
  });
});

describe("runSynthesis — an incomplete transcript", () => {
  it("returns 'incomplete-transcript' without calling the model", async () => {
    const client = vi.fn(async () => synthesisJson());
    const outcome = await runSynthesis(transcript({
      participants: [participant("Claude", "   "), participant("GPT-5.5", "Real answer", "openai", "gpt-5.5")],
    }), { client });

    expect(outcome.status).toBe("incomplete-transcript");
    expect(client).not.toHaveBeenCalled();
  });
});

describe("runSynthesis — R23: every participant in a 3-/4-way debate", () => {
  it("includes every participant's argument in the model input for a 4-way debate", async () => {
    const client = vi.fn<ClientFn>(async () => synthesisJson());
    await runSynthesis(transcript({
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

describe("runSynthesis — failure paths", () => {
  it("returns 'error' on a transport failure", async () => {
    const client = vi.fn(async () => {
      throw new Error("timeout");
    });
    const outcome = await runSynthesis(transcript(), { client });
    expect(outcome.status).toBe("error");
  });

  it("returns 'error' on a reply missing refinedAnswer", async () => {
    const client = vi.fn(async () => synthesisJson({ refinedAnswer: "" }));
    const outcome = await runSynthesis(transcript(), { client });
    expect(outcome.status).toBe("error");
  });
});
