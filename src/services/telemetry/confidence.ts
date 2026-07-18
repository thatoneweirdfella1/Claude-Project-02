/* Confidence breakdown for the Transparency card's Confidence sub-card (Step
   8.2). CANON Feature 8 names four values — translation, routing, technique,
   overall — but only translation confidence is ever actually measured
   anywhere in this build (Stage 1's 0-100 score, PIPELINE.md). Routing and
   technique selection are deterministic rule engines (routing.js,
   autoDetect.ts) with no analogous "how sure am I" number of their own, so
   this module derives one for each, pure and auditable, from facts telemetry
   already recorded — never a second opinion invented independently of what
   the pipeline actually decided.

   Routing confidence reuses CONFIDENCE_COUPLING.md's own three translation-
   confidence bands verbatim (80+ trusted, 60-79 escalated-with-note, <60 a
   contract-violation floor) — the doc already states routing's trust in its
   own decision is a direct function of how well it understood the question,
   so this is a restatement of an existing rule as a number, not a new one.

   Technique confidence: an explicit manual stack is the user's own literal
   choice (100 — nothing to be uncertain about). Auto-detect is high when a
   real signal matched a technique (90) and lower when nothing beat the bare
   Socratic default (65) — the scorer itself treats "only the default fired"
   as its own low-signal case (autoDetect.ts's SOCRATIC_BASELINE fallback).

   Overall is the minimum of whichever of the three are present — the
   weakest-link reading of "never overstate confidence," matching
   CONFIDENCE_COUPLING.md's cost-asymmetry stance that a shaky layer anywhere
   in the chain should show up, not get averaged away. */

import type { TelemetryEntry } from "./types";

export interface ConfidenceBreakdown {
  translation: number | null;
  routing: number | null;
  technique: number | null;
  overall: number | null;
}

export function deriveConfidenceBreakdown(entry: TelemetryEntry): ConfidenceBreakdown {
  const translation = entry.confidence;

  const routing =
    translation === null ? null : translation >= 80 ? 95 : translation >= 60 ? 75 : 50;

  const technique =
    entry.techniqueMode === null
      ? null
      : entry.techniqueMode === "manual"
        ? 100
        : entry.techniqueSignalMatched
          ? 90
          : 65;

  const present = [translation, routing, technique].filter((v): v is number => v !== null);
  const overall = present.length > 0 ? Math.min(...present) : null;

  return { translation, routing, technique, overall };
}
