/* Telemetry record shape (Step 5.4). PIPELINE.md Stage 5: "log telemetry ...
   Out: the answer plus logged data" — one TelemetryEntry per pipeline request,
   covering exactly the fields the step names: complexity score, model chosen,
   techniques applied, confidence values, timings, token counts in/out per
   call, and any downgrade/escalation notes. Feeds two future consumers named
   by CANON/PIPELINE.md: the Transparency card (Feature 8 — routing/technique/
   confidence sub-cards) and the Learning Loop (Feature 7 — pattern analysis
   after 15+ questions); this step only builds the log, not those readers. */

import type { PipelineStageName } from "../answerDisplay";
import type { TechniqueId } from "../../stores/types";
import type { TokenUsage } from "../proxyClient";
import type { Dimensions } from "../routing.js";

export type TelemetryOutcome =
  | "done"
  | "clarify"
  | "empty"
  | "too-large"
  | "error"
  | "cancelled";

export interface TelemetryEntry {
  /** Correlates to one composer submission (one runPipeline call). */
  id: string;
  startedAt: number;
  finishedAt: number | null;
  /** null only if the entry is somehow read before it finalizes; every
      recorded entry (recordTelemetryEntry only receives finalized ones) has
      this set. */
  totalDurationMs: number | null;
  /** Wall-clock time spent in each display stage, keyed by the same four
      names Step 5.1 fixed (translating/routing/composing/answering). A stage
      the run never reached (e.g. "answering" on a <60 clarify) is absent. */
  stageDurationsMs: Partial<Record<PipelineStageName, number>>;

  /** routing.js output (Stage 2) — null if the run never reached routing
      (translation didn't proceed/moderate). */
  complexity: number | null;
  effectiveComplexity: number | null;
  domain: string | null;
  model: string | null; // RouteResult.apiString, e.g. "claude-sonnet-5"
  modelTier: string | null;
  downgraded: boolean | null;
  /** routing.js's own notes (escalation/downgrade/override/floor), verbatim. */
  notes: string[];
  /** RouteResult.dimensions.scope — feeds the Transparency card's Routing
      sub-card (Step 8.2, CANON Feature 8 names scope explicitly). */
  scope: Dimensions["scope"] | null;
  /** RouteResult.thinkingApplied — whether extended thinking actually ran on
      this request (Step 8.2's Routing sub-card names this explicitly). */
  thinkingApplied: boolean | null;

  /** Stage 3 output — null if the run never reached technique selection. */
  techniques: TechniqueId[] | null;
  /** TechniqueSelection.reasoning verbatim — the Transparency card's
      Techniques sub-card "why" (Step 8.2). */
  techniqueReasoning: string | null;
  /** How the techniques above were arrived at — the user's explicit stack
      ("manual") or the auto-detect scorer ("auto-detect"). */
  techniqueMode: "manual" | "auto-detect" | null;
  /** Auto-detect mode only: true if at least one SELECTED technique scored
      from a real matched signal rather than only the Socratic default
      baseline. null in manual mode (irrelevant — a manual pick is never a
      "default fallback") and when Stage 3 was never reached. */
  techniqueSignalMatched: boolean | null;

  /** Stage 1 output — translation confidence (0-100), present once the
      translation event arrives, regardless of how the run ends after that. */
  confidence: number | null;

  /** Token usage per network call, kept separate rather than summed — the
      step's own wording is "token counts in and out per call". Either may be
      null if that call never happened (e.g. no execution call on a clarify)
      or the proxy response carried no usage field (see proxyClient.ts). */
  translationTokens: TokenUsage | null;
  executionTokens: TokenUsage | null;

  outcome: TelemetryOutcome;
  /** Set only when outcome is "error" — the real underlying message (never
      shown to the user verbatim; see PIPELINE-CONTRACT.md's Resilience
      section on why the UI stays neutral regardless of this text). */
  errorMessage: string | null;
}
