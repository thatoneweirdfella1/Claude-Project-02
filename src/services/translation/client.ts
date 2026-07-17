/* Model-client seam for the Translation Engine (Step 2.2).

   Translation must call claude-sonnet-5 "through the proxy (step 1.10)"
   (PIPELINE.md / TRANSLATION-SPEC.md). The proxy + model registry ARE Step 1.10,
   which is not built in this environment (routing.js absent, no-network sandbox
   — see BUILD-LOG.md). So the service depends on this narrow injected seam
   rather than a concrete client: Step 1.10's real proxy client implements
   TranslationModelClient later, while unit tests and the harness pass a stub.
   This keeps the whole service testable now and lets the proxy drop in with no
   change to translate().

   Translation uses a single NON-streamed completion — it returns one JSON
   object, not a user-visible token stream (streaming is for answer display,
   PIPELINE.md Stage 5). */

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
    line 32). Provisional home: when Step 1.10's model registry exists, this
    should reference the registry's entry instead of a local literal. */
export const TRANSLATION_MODEL = "claude-sonnet-5";
