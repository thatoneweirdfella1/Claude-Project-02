/* Model-client seam for Consensus and Synthesis (Step 8.4, Multi-AI Actions).

   PIPELINE.md MULTI-AI ACTIONS / ROUTING.md DEBATE PARTNERS: "Consensus and
   Synthesis run on claude-opus-4-8 at runtime, reading both sides'
   transcripts regardless of which two providers argued." Both actions are a
   single non-streamed completion (a short structured JSON verdict, not a
   user-visible token stream) — same shape as detection/translation's
   client seams, so createProxyClient().complete satisfies this too. */

import type { ModelId } from "../modelRegistry";

export interface MultiAiCompletionRequest {
  model: string;
  system: string;
  input: string;
  signal?: AbortSignal;
}

export type MultiAiModelClient = (request: MultiAiCompletionRequest) => Promise<string>;

/** Locked runtime model for Consensus and Synthesis — never the debate
    partner's model, and never re-derived from whichever provider argued
    which side (that is the whole point of "regardless of which two
    providers argued"). */
export const MULTI_AI_RUNTIME_MODEL: ModelId = "claude-opus-4-8";
