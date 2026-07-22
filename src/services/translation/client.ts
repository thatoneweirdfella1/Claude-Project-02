/* Model-client seam for the Translation Engine (Step 2.2).

   Translation must call claude-sonnet-5 "through the proxy (step 1.10)"
   (PIPELINE.md / TRANSLATION-SPEC.md). The service depends on this narrow
   injected seam rather than a concrete client, so it stays testable with stubs.
   As of Step 1.10 the real implementation exists: createProxyClient().complete
   (services/proxyClient.ts) satisfies TranslationModelClient structurally and
   is what wires translation to the deployed proxy — no change to translate().

   Translation uses a single NON-streamed completion — it returns one JSON
   object, not a user-visible token stream (streaming is for answer display,
   PIPELINE.md Stage 5). */

import type { ModelId } from "../modelRegistry";

export interface ModelCompletionRequest {
  /** Model id string (CANON LOCKED DECISION 3). */
  model: string;
  /** System prompt (the Step 2.1 TRANSLATION_SYSTEM_PROMPT). */
  system: string;
  /** The user's message (user turn). */
  input: string;
  /** Cooperative cancellation, e.g. if the user edits and re-submits. */
  signal?: AbortSignal;
}

/** Sends one completion and resolves with the model's full text reply. Rejects
    on transport/API failure — translate() catches that and returns a typed
    error outcome so callers never crash. */
export type TranslationModelClient = (
  request: ModelCompletionRequest,
) => Promise<string>;

/** Locked model string for translation (CANON LOCKED DECISION 3 / PIPELINE.md
    line 32). Typed as ModelId so it is checked against the Step 1.10 model
    registry's valid strings rather than being a free literal. */
export const TRANSLATION_MODEL: ModelId = "claude-sonnet-5";
