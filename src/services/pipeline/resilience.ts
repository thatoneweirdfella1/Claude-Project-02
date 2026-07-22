/* Resilience layer (Step 5.3) — retry transient failures, time out gracefully.
   CANON ADHD "Time" rule: every visual interaction responds under 300ms, show
   an indicator for any wait over 1 second, no countdowns, no forced timeouts.
   That rule governs what the USER sees, not whether a hung network call is
   allowed to wait forever — this module is the internal safeguard: a stalled
   request is aborted and retried/failed gracefully, with no ticking countdown
   ever shown (the existing stage indicator, visible from the moment a stage
   starts, already covers "indicator for any wait over 1 second" without any
   new UI — see PIPELINE-CONTRACT.md).

   Applied to PipelineModelClient only — the two places this app makes a
   network call (translation's completion, execution's stream). Routing,
   technique selection, and composition are pure/synchronous; they get a
   catch-and-report boundary in orchestrator.ts, not retry (retrying a
   deterministic function that just threw would only throw again). */

import type { ProxyCompletionRequest } from "../proxyClient";
import type { PipelineModelClient } from "./orchestrator";

export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`Timed out after ${ms}ms`);
    this.name = "TimeoutError";
  }
}

export interface ResilienceOptions {
  /** Total attempts including the first try. Default 3 (1 try + 2 retries). */
  maxAttempts?: number;
  /** Base delay before the first retry; doubles each subsequent retry. */
  retryDelayMs?: number;
  /** Per-attempt ceiling. For stream(), this only guards time-to-first-token —
      once generation has started, no per-token timeout is imposed (a real
      answer may legitimately take a while; partial text is already visible,
      so there is no silent wait to protect against). */
  timeoutMs?: number;
  isRetryable?: (error: unknown) => boolean;
}

const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_RETRY_DELAY_MS = 300;
const DEFAULT_TIMEOUT_MS = 30_000;

/** Network hiccups, 429 (rate limit), and 5xx are worth retrying — the same
    request will likely succeed a moment later. A timeout is retried too (it
    may have been a slow network, not a hung server). A real user cancellation
    (deps.signal aborting) is handled separately in withResilience — it is
    never retried regardless of what this returns. Anything else (4xx other
    than 429, a malformed reply, a bug) is NOT retried: retrying the same bad
    request just wastes the wait CANON asks us to protect. */
export function isTransientError(error: unknown): boolean {
  if (error instanceof TimeoutError) return true;
  if (error instanceof TypeError) return true; // fetch's own network-failure type
  if (error instanceof Error) {
    const status = /\((\d{3})\)/.exec(error.message)?.[1];
    if (status) return status === "429" || Number(status) >= 500;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Runs fn once, aborting it if it hasn't settled within timeoutMs. fn is
    handed a signal that is aborted on timeout OR when outerSignal aborts
    (real cancellation) — fn must forward that signal to whatever it awaits
    (fetch) for the abort to actually stop the in-flight work. */
export async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  outerSignal?: AbortSignal,
): Promise<T> {
  if (outerSignal?.aborted) {
    throw outerSignal.reason ?? new DOMException("Aborted", "AbortError");
  }
  const controller = new AbortController();
  const onOuterAbort = () => controller.abort(outerSignal?.reason);
  outerSignal?.addEventListener("abort", onOuterAbort, { once: true });
  const timer = setTimeout(() => controller.abort(new TimeoutError(timeoutMs)), timeoutMs);
  try {
    return await fn(controller.signal);
  } catch (error) {
    // Normalize whatever the underlying call throws on a timeout-triggered
    // abort (fetch's rejection shape varies by runtime) to a real TimeoutError
    // so isTransientError/callers can classify it reliably.
    if (controller.signal.aborted && controller.signal.reason instanceof TimeoutError) {
      throw controller.signal.reason;
    }
    throw error;
  } finally {
    clearTimeout(timer);
    outerSignal?.removeEventListener("abort", onOuterAbort);
  }
}

/** Retries fn on transient failures with exponential backoff, each attempt
    bounded by timeoutMs. A real cancellation (outerSignal already aborted, or
    aborting mid-attempt) is never retried — it propagates immediately, same
    as every other AbortSignal-respecting call in this app. */
export async function withResilience<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  options: ResilienceOptions = {},
  outerSignal?: AbortSignal,
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const isRetryable = options.isRetryable ?? isTransientError;

  for (let attempt = 1; ; attempt++) {
    try {
      return await withTimeout(fn, timeoutMs, outerSignal);
    } catch (error) {
      if (outerSignal?.aborted || attempt >= maxAttempts || !isRetryable(error)) {
        throw error;
      }
      await sleep(retryDelayMs * 2 ** (attempt - 1));
    }
  }
}

/** Wraps a PipelineModelClient so every call the orchestrator makes through it
    gets retry + timeout for free — callers (CenterColumn, tests) pass a plain
    client; the orchestrator applies this internally (see runPipeline), so
    resilience is guaranteed by construction rather than left to whichever
    caller remembers to wrap it. */
export function makeResilientClient(
  client: PipelineModelClient,
  options: ResilienceOptions = {},
): PipelineModelClient {
  return {
    complete(req: ProxyCompletionRequest): Promise<string> {
      return withResilience((signal) => client.complete({ ...req, signal }), options, req.signal);
    },

    async *stream(req: ProxyCompletionRequest): AsyncGenerator<string> {
      const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
      const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS;
      const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
      const isRetryable = options.isRetryable ?? isTransientError;
      const outerSignal = req.signal;

      for (let attempt = 1; ; attempt++) {
        if (outerSignal?.aborted) {
          throw outerSignal.reason ?? new DOMException("Aborted", "AbortError");
        }
        const controller = new AbortController();
        const onOuterAbort = () => controller.abort(outerSignal?.reason);
        outerSignal?.addEventListener("abort", onOuterAbort, { once: true });
        // Guards time-to-first-token only — cleared the moment a chunk arrives.
        const timer = setTimeout(() => controller.abort(new TimeoutError(timeoutMs)), timeoutMs);
        let gotFirstChunk = false;

        try {
          for await (const chunk of client.stream({ ...req, signal: controller.signal })) {
            if (!gotFirstChunk) {
              gotFirstChunk = true;
              clearTimeout(timer);
            }
            yield chunk;
          }
          return; // stream completed successfully
        } catch (error) {
          clearTimeout(timer);
          const timedOut = controller.signal.aborted && controller.signal.reason instanceof TimeoutError;
          const effectiveError = timedOut ? controller.signal.reason : error;
          // Once real tokens have streamed, a mid-generation failure is never
          // retried — retrying would replay from the start and duplicate
          // output the user already saw. It surfaces as a terminal error.
          if (
            gotFirstChunk ||
            outerSignal?.aborted ||
            attempt >= maxAttempts ||
            !isRetryable(effectiveError)
          ) {
            throw effectiveError;
          }
          await sleep(retryDelayMs * 2 ** (attempt - 1));
        } finally {
          outerSignal?.removeEventListener("abort", onOuterAbort);
        }
      }
    },
  };
}
