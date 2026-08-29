/* Synthesis service (Step 8.4) — PIPELINE.md MULTI-AI ACTIONS: "Synthesis:
   combine perspectives into one refined answer the user can use to replace
   the original or merge below." Runtime model is claude-opus-4-8
   (MULTI_AI_RUNTIME_MODEL), regardless of which two providers argued
   (ROUTING.md DEBATE PARTNERS). Structurally identical to consensus.ts —
   same never-throws outcome union, same transcript input, same JSON
   extraction — because the two Multi-AI actions are siblings that read the
   exact same finished debate turn, just asking the runtime model a
   different question about it. */

import { MULTI_AI_RUNTIME_MODEL, type MultiAiModelClient } from "./client";
import { extractJsonObject } from "./json";
import { SYNTHESIS_SYSTEM_PROMPT } from "./prompt";
import { parseSynthesisOutput, type SynthesisResult } from "./schema";
import { buildTranscriptInput, isCompleteTranscript, type DebateTranscript } from "./transcript";

export type SynthesisOutcome =
  | { status: "ok"; result: SynthesisResult }
  | { status: "incomplete-transcript" }
  | { status: "error"; message: string };

export interface RunSynthesisOptions {
  client: MultiAiModelClient;
  signal?: AbortSignal;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function runSynthesis(
  transcript: DebateTranscript,
  options: RunSynthesisOptions,
): Promise<SynthesisOutcome> {
  if (!isCompleteTranscript(transcript)) {
    return { status: "incomplete-transcript" };
  }

  let reply: string;
  try {
    reply = await options.client({
      model: MULTI_AI_RUNTIME_MODEL,
      system: SYNTHESIS_SYSTEM_PROMPT,
      input: buildTranscriptInput(transcript),
      signal: options.signal,
    });
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }

  try {
    return { status: "ok", result: parseSynthesisOutput(extractJsonObject(reply)) };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}
