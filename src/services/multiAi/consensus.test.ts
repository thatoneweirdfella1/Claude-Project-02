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

function transcript(overrides: Partial<DebateTranscript> = {}): DebateTranscript {
  return {
    question: "Should we use microservices?",
    claudeText: "Only once you have a real scaling or team-boundary problem.",
    partnerLabel: "GPT-5.5",
    partnerText: "Start with microservices so you never have to migrate later.",
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
    expect(req.input).toContain("GPT-5.5'S ANSWER:");
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
    const outcome = await runConsensus(transcript({ partnerText: "" }), { client });

    expect(outcome.status).toBe("incomplete-transcript");
    expect(client).not.toHaveBeenCalled();
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
