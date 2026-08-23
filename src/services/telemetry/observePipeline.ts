/* Wires telemetry to the orchestrator (Step 5.4's own OUTPUT requirement) as
   a transparent tee around runPipeline, rather than editing orchestrator.ts
   again: observePipeline(request, deps) yields EXACTLY the same PipelineEvent
   sequence runPipeline does (nothing added, nothing withheld, nothing
   reordered) while timing each stage as it actually happens and pulling the
   fields the step names (complexity, model, techniques, confidence, notes,
   token counts) out of the very same events the UI already renders — so
   telemetry can never see something the UI doesn't, or vice versa.

   CenterColumn (Step 5.2) calls this INSTEAD of runPipeline; nothing else
   about its wiring changes. Token counts are captured by attaching onUsage
   (proxyClient.ts's Step 5.4 seam) to the two model calls the orchestrator's
   own client makes — no change to translate.ts's Step 2.2 seam or to
   orchestrator.ts, since PipelineModelClient's complete()/stream() already
   accept the wider ProxyCompletionRequest shape that onUsage lives on. */

import { runPipeline, type PipelineDeps, type PipelineEvent, type PipelineModelClient } from "../pipeline";
import type { TranslateAskRequest } from "../composer";
import type { PipelineStageName } from "../answerDisplay";
import type { TokenUsage } from "../proxyClient";
import { recordTelemetryEntry } from "./log";
import type { TelemetryEntry, TelemetryOutcome } from "./types";

function newTelemetryId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `tel-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function createEntry(): TelemetryEntry {
  const startedAt = Date.now();
  return {
    id: newTelemetryId(),
    startedAt,
    finishedAt: null,
    totalDurationMs: null,
    stageDurationsMs: {},
    complexity: null,
    effectiveComplexity: null,
    domain: null,
    model: null,
    modelTier: null,
    downgraded: null,
    notes: [],
    scope: null,
    thinkingApplied: null,
    techniques: null,
    techniqueReasoning: null,
    techniqueMode: null,
    techniqueSignalMatched: null,
    confidence: null,
    translationTokens: null,
    executionTokens: null,
    outcome: "cancelled", // overwritten by finalize(); the only path that can
    // leave this as-is is the generator being abandoned before ANY event
    // arrived, which genuinely is a cancellation.
    errorMessage: null,
  };
}

/** Wraps deps.client so every complete()/stream() call it makes reports its
    real token usage into the entry — translation's call and execution's call
    are attributed separately (translationTokens vs executionTokens) since
    each request object gets its own onUsage closure. */
function withUsageTracking(client: PipelineModelClient, entry: TelemetryEntry): PipelineModelClient {
  const record = (usage: TokenUsage, key: "translationTokens" | "executionTokens") => {
    entry[key] = usage;
  };
  return {
    complete(req) {
      return client.complete({ ...req, onUsage: (usage) => record(usage, "translationTokens") });
    },
    stream(req) {
      return client.stream({ ...req, onUsage: (usage) => record(usage, "executionTokens") });
    },
  };
}

export async function* observePipeline(
  request: TranslateAskRequest,
  deps: PipelineDeps,
): AsyncGenerator<PipelineEvent> {
  const entry = createEntry();
  entry.translationTokens = deps.pretranslationUsage ?? null;
  const client = withUsageTracking(deps.client, entry);

  let currentStage: PipelineStageName | null = null;
  let stageStartedAt = entry.startedAt;
  let finalized = false;

  function closeCurrentStage(now: number): void {
    if (currentStage) entry.stageDurationsMs[currentStage] = now - stageStartedAt;
  }

  function finalize(outcome: TelemetryOutcome, errorMessage?: string): void {
    if (finalized) return;
    finalized = true;
    const now = Date.now();
    closeCurrentStage(now);
    entry.outcome = outcome;
    entry.errorMessage = errorMessage ?? null;
    entry.finishedAt = now;
    entry.totalDurationMs = now - entry.startedAt;
    recordTelemetryEntry(entry);
  }

  try {
    for await (const event of runPipeline(request, { ...deps, client })) {
      const now = Date.now();

      switch (event.kind) {
        case "stage":
          closeCurrentStage(now);
          currentStage = event.stage;
          stageStartedAt = now;
          break;
        case "translation": {
          const gated = event.gated;
          if (gated.kind === "proceed" || gated.kind === "moderate" || gated.kind === "clarify") {
            // All three carry a TranslationResult (the clarify gate still
            // knows the confidence that triggered it) — informative even
            // though clarify doesn't proceed to routing.
            entry.confidence = gated.result.confidence;
          }
          if (gated.kind !== "proceed" && gated.kind !== "moderate") {
            // clarify/empty/too-large/error: the run ends here (PIPELINE-
            // CONTRACT.md's gate table — routing is never reached).
            const outcome: TelemetryOutcome = gated.kind === "error" ? "error" : gated.kind;
            finalize(outcome, gated.kind === "error" ? gated.message : undefined);
          }
          break;
        }
        case "route":
          entry.complexity = event.result.complexity;
          entry.effectiveComplexity = event.result.effectiveComplexity;
          entry.domain = event.result.dimensions.domain;
          entry.model = event.result.apiString;
          entry.modelTier = event.result.tier;
          entry.downgraded = event.result.downgraded;
          entry.notes = event.result.notes;
          entry.scope = event.result.dimensions.scope;
          entry.thinkingApplied = event.result.thinkingApplied;
          break;
        case "techniques": {
          const { selection } = event;
          entry.techniques = selection.selected;
          entry.techniqueReasoning = selection.reasoning;
          entry.techniqueMode = selection.mode;
          entry.techniqueSignalMatched =
            selection.mode === "auto-detect"
              ? selection.selected.some((id) => {
                  const s = selection.scores.find((sc) => sc.id === id);
                  return s ? s.reasons.some((r) => r !== "default") : false;
                })
              : null;
          break;
        }
        case "done":
          finalize("done");
          break;
        case "error":
          finalize("error", event.message);
          break;
        default:
          break; // "composed"/"streaming" carry nothing new for telemetry
      }

      yield event;
    }
  } finally {
    // Covers early cancellation — the consumer breaking out of its `for
    // await` (e.g. CenterColumn's resubmit-aborts-the-previous-run path)
    // triggers this generator's own `finally` via the implicit .return().
    // A no-op if the run already reached a real terminal outcome above.
    finalize("cancelled");
  }
}
