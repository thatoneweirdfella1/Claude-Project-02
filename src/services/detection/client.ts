/* Model-client seam for the Detection Engine (Step 6.1).

   State detection calls claude-haiku-4-5 "through the proxy" (PIPELINE.md
   STATE DETECTION RESOLVED note — a single on-demand classification, NOT a
   local heuristic, NOT sub-300ms-budgeted, NOT live-while-typing). The service
   depends on this narrow injected seam rather than a concrete client, so it
   stays testable with stubs — exactly the pattern translation uses
   (translation/client.ts). createProxyClient().complete (proxyClient.ts,
   Step 1.10) satisfies DetectionModelClient structurally, so wiring detection
   to the deployed proxy needs no adapter.

   Detection uses a single NON-streamed completion — it returns one JSON object
   of pill values, not a user-visible token stream. */

import type { ModelId } from "../modelRegistry";

export interface DetectionCompletionRequest {
  /** Model id string. */
  model: string;
  /** System prompt (the Step 6.2 classifier prompt). */
  system: string;
  /** The user's raw message — the SAME text translation classifies, since
      detection runs alongside the translation call on the button press. */
  input: string;
  /** Cooperative cancellation, e.g. if the user resubmits. */
  signal?: AbortSignal;
}

/** Sends one completion and resolves with the model's full text reply. Rejects
    on transport/API failure — detectState() catches that and returns a typed
    error outcome so callers never crash. Structurally identical to
    translation's TranslationModelClient, so the same proxy client satisfies
    both. */
export type DetectionModelClient = (
  request: DetectionCompletionRequest,
) => Promise<string>;

/** Locked model string for state detection (PIPELINE.md STATE DETECTION: "a
    single on-demand classification calling claude-haiku-4-5 through the
    proxy"; CANON LOCKED DECISION 3 — Haiku is the Fast tier). Typed as ModelId
    so it is checked against the Step 1.10 model registry rather than being a
    free literal. */
export const DETECTION_MODEL: ModelId = "claude-haiku-4-5";
