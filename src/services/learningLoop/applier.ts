/* Rule refinement applier (Step 10.2). PIPELINE.md LEARNING LOOP: "An
   applier writes accepted refinements to the account store with an audit
   log." Takes Step 10.1's analyzer proposals (already dampened/confidence-
   gated at generation time — see analyzer.ts's MIN_SAMPLE_SIZE/
   CONFIDENCE_THRESHOLD) and turns them into an updated LearnedPreferences
   plus one audit entry per proposal actually applied.

   Pure — no store import (services/ stays store-agnostic, same convention
   as correctionLearning.ts/stateBus.ts/sessionLifecycle.ts). The caller
   (backgroundJob.ts) reads accountStore.getState().learnedPreferences,
   calls this, and writes the result back via accountStore's own action. */

import type { LearnedPreferences, LearningAuditEntry, TechniquePreference } from "../../stores/types";
import type { RefinementProposal } from "./types";

/** Bound on a single technique's cumulative learned weight, in either
    direction. Step 10.1's analyzer already dampens WITHIN one analysis
    run (a single low rating can't swing behavior — MIN_SAMPLE_SIZE/
    CONFIDENCE_THRESHOLD); this bounds drift ACROSS many analysis runs
    over an account's lifetime, so a technique that keeps generating
    borderline-confidence proposals over months can't be pushed to an
    unbounded extreme. A technique at the floor is still eligible for
    auto-detect scoring, never suppressed outright — see TechniquePreference's
    own doc comment in stores/types.ts. */
export const MAX_TECHNIQUE_WEIGHT = 5;
export const MIN_TECHNIQUE_WEIGHT = -5;

function newAuditEntryId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `audit-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export interface ApplyRefinementsResult {
  updated: LearnedPreferences;
  auditEntries: LearningAuditEntry[];
}

/** Applies every "technique-weight" proposal to `current.technique`,
    clamping each result to [MIN_TECHNIQUE_WEIGHT, MAX_TECHNIQUE_WEIGHT].
    `current.routing` passes through untouched — see the LearnedPreferences
    doc comment on why routing has no applier target yet: the analyzer
    never emits a routing-targeted proposal.

    "detection-threshold" proposals are a defined type Step 10.1's analyzer
    doesn't yet produce (only "technique-weight" is ever emitted today).
    Skipped here rather than thrown on, so this applier doesn't need to
    change the day a future analyzer version starts emitting one — matches
    this codebase's "never throw on an unrecognized-but-typed case" posture
    (e.g. detect.ts's tolerant parsing). Skipped proposals get no audit
    entry — an audit log records what changed, not what didn't. */
export function applyRefinements(
  current: LearnedPreferences,
  proposals: RefinementProposal[],
): ApplyRefinementsResult {
  const now = Date.now();
  const technique: Record<string, TechniquePreference> = { ...current.technique };
  const auditEntries: LearningAuditEntry[] = [];

  for (const proposal of proposals) {
    if (proposal.type !== "technique-weight") continue;

    const key = proposal.target;
    const existing = technique[key];
    const previousWeight = existing?.weight ?? 0;
    const delta = proposal.adjustment === "increase" ? 1 : -1;
    const newWeight = clamp(previousWeight + delta, MIN_TECHNIQUE_WEIGHT, MAX_TECHNIQUE_WEIGHT);

    technique[key] = {
      weight: newWeight,
      lastAdjustedAt: now,
      totalAdjustments: (existing?.totalAdjustments ?? 0) + 1,
    };

    auditEntries.push({
      id: newAuditEntryId(),
      timestamp: now,
      proposalType: proposal.type,
      target: proposal.target,
      adjustment: proposal.adjustment,
      previousWeight,
      newWeight,
      confidence: proposal.confidence,
      reasoning: proposal.reasoning,
      affectedRunCount: proposal.affectedRunCount,
    });
  }

  return {
    updated: { routing: current.routing, technique },
    auditEntries,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
