/* Pipeline orchestrator (Step 5.2) — the one place the five PIPELINE.md stages
   run as a single flow:

     composer request → translation → routing → technique selection →
     composition → execution (streamed answer)

   Every stage here is the ALREADY-BUILT service, called through its existing
   public surface — nothing is rebuilt, adapted, or "improved" (the value of
   this step is the contract, not new code; see PIPELINE-CONTRACT.md for the
   exact shape of every handoff). runPipeline is an AsyncGenerator so each
   stage's output is YIELDED as a typed event the moment it exists: the UI
   renders from the events, and every event doubles as the stage log
   PIPELINE.md Stage 5 asks for.

   The gates (PIPELINE.md / CONFIDENCE_COUPLING.md), enforced in order:
     - 80+ proceeds; 60-79 proceeds (routing.js escalates one step and says
       so in notes); below 60 the generator RETURNS after the translation
       event — routing is never called, the clarifying question ends the run.
     - routing.js's downgraded/notes outputs are carried verbatim into the
       final done event (the free tier's honesty guarantee — Step 5.1's
       AnswerMeta renders them).

   No store imports and no concrete network client: dependencies are injected
   (same seam pattern as translate()), so the whole flow is provable offline
   with stubs — the live proxy run stays parked on the Step 1.10/12.3 deploy.

   Step 5.3 (error, retry, timeout): every stage below is wrapped in a try/
   catch that turns any thrown exception into a terminal `error` event rather
   than letting it escape the generator — runPipeline never throws, the same
   guarantee Step 2.2 gave translate(). deps.client is wrapped internally with
   makeResilientClient (resilience.ts) so both network-touching calls
   (translation's completion, execution's stream) get retry-on-transient-
   failure + a graceful per-attempt timeout for free; routing/technique-
   selection/composition are pure and synchronous (no retry makes sense there,
   see resilience.ts), they just get the same catch-and-report boundary. */

import type { TranslateAskRequest } from "../composer";
import type { PlanFlag, TechniqueId } from "../../stores/types";
import type { ProxyCompletionRequest } from "../proxyClient";
import {
  translate,
  gateTranslation,
  type GatedTranslation,
} from "../translation";
import { overrideFromSelection, route, type RouteResult } from "../routingService";
import {
  MAX_TECHNIQUE_STACK,
  autoDetectTechniques,
  getTechnique,
  isTechniqueId,
  type TechniqueSelection,
} from "../techniques";
import { composeFinalPrompt, type ComposedPrompt } from "../composition";
import { streamAnswer, type PipelineStageName } from "../answerDisplay";
import { makeResilientClient, type ResilienceOptions } from "./resilience";

/** The narrow slice of the Step 1.10 proxy client the pipeline needs.
    createProxyClient() satisfies it as-is; tests pass stubs. Callers should
    NOT pre-wrap this with retry/timeout — runPipeline applies
    makeResilientClient internally so every caller gets it by construction. */
export interface PipelineModelClient {
  complete(req: ProxyCompletionRequest): Promise<string>;
  stream(req: ProxyCompletionRequest): AsyncIterable<string>;
}

export interface PipelineDeps {
  client: PipelineModelClient;
  /** accountStore.plan — routing.js's free/paid gate (a flag, not billing). */
  plan: PlanFlag;
  /** Cancels the in-flight model call when the user re-submits mid-run. */
  signal?: AbortSignal;
  /** Retry/timeout tuning (Step 5.3) — omit for the production defaults (3
      attempts, 30s per-attempt timeout, exponential backoff). Tests override
      this with tiny values so retry/timeout paths don't take real seconds. */
  resilience?: ResilienceOptions;
  /** Step 6.5 state bus — technique candidates the detected state points at
      (services/detection's deriveStateFeeds().techniqueCandidates), fed into
      auto-detect scoring as hints alongside routing's complexity/domain.
      Deliberately primitive-typed here rather than importing a StateFeeds
      type from services/detection — the orchestrator stays unaware that
      "state detection" is the source, the same way it's unaware routing.js
      is a vendor scorer; it just consumes typed hints. */
  stateTechniques?: TechniqueId[];
  /** Step 6.5 state bus — RSD's tone guidance
      (deriveStateFeeds().toneGuidance), fed into composition's directness
      section. Same reasoning as stateTechniques above. */
  stateTone?: string | null;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** The finished answer plus everything the conversation store persists with
    it (ConversationMessage's assistant fields, Step 5.1). */
export interface PipelineDone {
  text: string;
  confidence: number;
  downgraded: boolean;
  notes: string[];
}

/** One typed event per stage output (plus display-progress events). The
    sequence IS the stage log — a consumer that records these has recorded
    every decision the pipeline made. */
export type PipelineEvent =
  | { kind: "stage"; stage: PipelineStageName }
  | { kind: "translation"; gated: GatedTranslation }
  | { kind: "route"; result: RouteResult }
  | { kind: "techniques"; selection: TechniqueSelection }
  | { kind: "composed"; composed: ComposedPrompt }
  | { kind: "streaming"; text: string }
  | { kind: "done"; done: PipelineDone }
  | { kind: "error"; message: string };

/** Stage 3 dispatch on the session's stored technique mode (STORE-CONTRACT:
    ["auto-detect"] — or any array containing it — means auto mode; any other
    array is the user's exact manual stack, honored literally per Step 4.2/4.5).
    Auto mode feeds routing's own complexity/domain in as hints, making Stage 3
    the consumer of Stage 2's output that ROUTING.md's contract promises. An
    empty/invalid stored array falls back to auto — same defensive posture as
    overrideFromSelection (a persisted value must never crash the pipeline). */
export function resolveTechniqueSelection(
  stored: TechniqueId[],
  question: string,
  routeResult: RouteResult,
  stateTechniques?: TechniqueId[],
): TechniqueSelection {
  const manual = stored
    .filter((id) => isTechniqueId(id) && !getTechnique(id).isMeta)
    // CANON Feature 4: "stacks at most 4" is a hard number. Step 4.5's UI
    // already can't produce more; this re-enforces it against a corrupted
    // persisted array, keeping the ≤4 guarantee unconditional.
    .slice(0, MAX_TECHNIQUE_STACK);
  if (stored.includes("auto-detect") || manual.length === 0) {
    return autoDetectTechniques(question, {
      complexity: routeResult.complexity,
      domain: routeResult.dimensions.domain,
      // Step 6.5: state-derived candidates only ever apply in AUTO mode —
      // same reasoning as Step 4.2's manual-selection decision (the user's
      // explicit literal choice is honored as-is, never augmented).
      stateTechniques,
    });
  }
  return {
    selected: manual,
    scores: manual.map((id) => ({ id, score: 1, reasons: ["manually selected"] })),
    reasoning: `Manually selected: ${manual.map((id) => getTechnique(id).label).join(", ")}.`,
  };
}

export async function* runPipeline(
  request: TranslateAskRequest,
  deps: PipelineDeps,
): AsyncGenerator<PipelineEvent> {
  // Retry + timeout wrap BOTH network-touching calls (translation's
  // completion below, execution's stream further down) — applied once, here,
  // so no caller can forget it (see PipelineDeps.client's doc comment).
  const client = makeResilientClient(deps.client, deps.resilience);

  /* Stage 1 — Translation. translate() itself never throws (Step 2.2); every
     failure mode is a typed outcome the gate maps to a terminal
     GatedTranslation. The try/catch is defensive symmetry with every other
     stage below, not a path translate() is expected to take. */
  yield { kind: "stage", stage: "translating" };
  let gated: GatedTranslation;
  try {
    const outcome = await translate(request.rawInput, {
      client: (req) => client.complete(req),
      signal: deps.signal,
    });
    gated = gateTranslation(outcome);
  } catch (error) {
    yield { kind: "error", message: errorMessage(error) };
    return;
  }
  yield { kind: "translation", gated };

  /* The confidence gate: only proceed/moderate continue. clarify (<60) ends
     the run HERE — routing is never called (PIPELINE.md; routing.js's own <60
     floor is a safety net for a path this orchestrator never takes). empty/
     too-large/error are terminal the same way. */
  if (gated.kind !== "proceed" && gated.kind !== "moderate") return;
  const { result } = gated;

  /* Stage 2 — Routing. The translated prompt and its confidence go to
     routing.js exactly as ROUTING.md's contract states; the user's Model
     dropdown value becomes the override (null = auto). routing.js is pure
     and synchronous (no network, no retry target) — the boundary here only
     guards against an unexpected exception in the vendor scorer, converting
     it into a neutral terminal event instead of crashing the run. */
  yield { kind: "stage", stage: "routing" };
  let routeResult: RouteResult;
  try {
    routeResult = route({
      prompt: result.translatedPrompt,
      confidence: result.confidence,
      gaps: result.detectedGaps,
      plan: deps.plan,
      override: overrideFromSelection(request.model),
    });
  } catch (error) {
    yield { kind: "error", message: errorMessage(error) };
    return;
  }
  yield { kind: "route", result: routeResult };

  /* Stages 3+4 — Technique selection, then composition. One display stage
     ("composing") covers both: PIPELINE_STAGES has four names (Step 5.1,
     verbatim from its spec) for five PIPELINE.md stages. Both are pure and
     synchronous, same reasoning as Stage 2 — one boundary, no retry. */
  yield { kind: "stage", stage: "composing" };
  let selection: TechniqueSelection;
  let composed: ComposedPrompt;
  try {
    selection = resolveTechniqueSelection(
      request.techniques,
      result.translatedPrompt,
      routeResult,
      deps.stateTechniques,
    );
    composed = composeFinalPrompt({
      question: result.translatedPrompt,
      techniques: selection.selected,
      directness: request.directness,
      confidence: result.confidence,
      stateTone: deps.stateTone ?? undefined,
    });
  } catch (error) {
    yield { kind: "error", message: errorMessage(error) };
    return;
  }
  yield { kind: "techniques", selection };
  yield { kind: "composed", composed };

  /* Stage 5 — Execution. The composed prompt goes to the ROUTED model through
     the proxy (via the resilient client — retried on a transient failure
     before any token arrives, timed out gracefully if the model never
     responds); routing's downgraded/notes ride along into done, verbatim.
     Extended thinking is applied exactly when routing.js said it applied. */
  yield { kind: "stage", stage: "answering" };
  const meta = {
    confidence: result.confidence,
    downgraded: routeResult.downgraded,
    notes: routeResult.notes,
  };
  try {
    const tokens = client.stream({
      model: routeResult.apiString,
      input: composed.prompt,
      signal: deps.signal,
      extendedThinking: routeResult.thinkingApplied || undefined,
    });
    for await (const state of streamAnswer(tokens, meta)) {
      if (state.kind === "streaming") {
        yield { kind: "streaming", text: state.text };
      } else if (state.kind === "done") {
        yield {
          kind: "done",
          done: {
            text: state.text,
            confidence: state.confidence,
            downgraded: state.downgraded,
            notes: state.notes,
          },
        };
      }
    }
  } catch (error) {
    /* Transport/stream failure (proxy down, network, timeout after retries
       exhausted, real cancellation). The UI shows the same neutral,
       non-blaming copy regardless of this message (TranslationCard /
       StreamingAnswer, Steps 2.3/5.1) — the real message is kept here for
       whatever logs/telemetry (Step 5.4) read this event. */
    yield { kind: "error", message: errorMessage(error) };
  }
}
