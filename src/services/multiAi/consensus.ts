/* Consensus service (Step 8.4) — PIPELINE.md MULTI-AI ACTIONS: "Consensus:
   common ground after a debate (disagreement, common ground, unified
   view)." Runtime model is claude-opus-4-8 (MULTI_AI_RUNTIME_MODEL),
   regardless of which two providers argued (ROUTING.md DEBATE PARTNERS).

   Mirrors detectState()'s shape (services/detection/detect.ts): a single
   non-streamed completion, never throws, a typed outcome union the caller
   switches on. Built standalone and stub-tested — Debate mode (Step 8.3,
   OPUS, not this session) is the future producer of a real DebateTranscript;
   this service only needs one to exist, not how it was produced. */

import { MULTI_AI_RUNTIME_MODEL, type MultiAiModelClient } from "./client";
import { extractJsonObject } from "./json";
import { CONSENSUS_SYSTEM_PROMPT } from "./prompt";
import { parseConsensusOutput, type ConsensusResult } from "./schema";
import { buildTranscriptInput, isCompleteTranscript, type DebateTranscript } from "./transcript";

export type ConsensusOutcome =
  | { status: "ok"; result: ConsensusResult }
  | { status: "incomplete-transcript" }
  | { status: "error"; message: string };

export interface RunConsensusOptions {
  client: MultiAiModelClient;
  signal?: AbortSignal;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function runConsensus(
  transcript: DebateTranscript,
  options: RunConsensusOptions,
): Promise<ConsensusOutcome> {
  if (!isCompleteTranscript(transcript)) {
    return { status: "incomplete-transcript" };
  }

  let reply: string;
  try {
    reply = await options.client({
      model: MULTI_AI_RUNTIME_MODEL,
      system: CONSENSUS_SYSTEM_PROMPT,
      input: buildTranscriptInput(transcript),
      signal: options.signal,
    });
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }

  try {
    return { status: "ok", result: parseConsensusOutput(extractJsonObject(reply)) };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}
