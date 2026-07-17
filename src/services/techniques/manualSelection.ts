/* Manual technique selection (Step 4.5). CANON Feature 4 lets the user pick
   techniques directly instead of Auto-detect. This module is the RULE layer
   the Technique dropdown's popover checklist calls on every toggle — it does
   not touch the registry (4.1), the auto-detect scorer (4.2), or the
   composition engine (4.3); it only consumes their already-exported, unchanged
   public data (getTechnique, dependencyClosure, anyConflict, MAX_TECHNIQUE_STACK).

   The resulting TechniqueId[] is stored directly in SessionState.techniques and
   fed straight to composeFinalPrompt's `techniques` input — no separate
   "manual mode" flag; `["auto-detect"]` IS the auto-mode representation. */

import type { TechniqueId } from "../../stores/types";
import { anyConflict, dependencyClosure } from "./autoDetect";
import { MAX_TECHNIQUE_STACK, getTechnique } from "./registry";

/** The array value that means "hand off to the auto-detect scorer" (Step 4.2). */
export const AUTO_MODE: TechniqueId[] = ["auto-detect"];

export function isAutoMode(techniques: TechniqueId[]): boolean {
  return techniques.includes("auto-detect");
}

export interface ManualSelectVerdict {
  allowed: boolean;
  reason?: string;
}

/** Would adding `candidate` to `current` (a manual selection) be allowed? Checks
    the FULL effect of adding it — its dependency closure — against conflicts
    and the stack cap, so the verdict matches what selectManualTechnique() would
    actually do. Used by the popover to grey out / explain disabled options
    before the user even clicks (CANON "never a black box"). */
export function canSelectManually(
  current: TechniqueId[],
  candidate: TechniqueId,
): ManualSelectVerdict {
  if (getTechnique(candidate).isMeta) {
    return { allowed: false, reason: "Auto-detect is a mode, not a stackable technique." };
  }
  if (current.includes(candidate)) {
    return { allowed: true }; // already selected; toggling it off is always allowed
  }

  // Explicit annotation: without it, TS 5.5's inferred type predicates narrow
  // this to Exclude<TechniqueId,"auto-detect">[], which then rejects the full
  // TechniqueId results dependencyClosure() returns below.
  const withoutAuto: TechniqueId[] = current.filter((id) => id !== "auto-detect");
  const closure = dependencyClosure(candidate).filter((id) => !withoutAuto.includes(id));
  const combined = [...withoutAuto, ...closure];

  if (anyConflict(combined)) {
    const conflictsWith = withoutAuto.find((id) =>
      getTechnique(id).conflicts.includes(candidate) || getTechnique(candidate).conflicts.includes(id),
    );
    return {
      allowed: false,
      reason: conflictsWith
        ? `Conflicts with ${getTechnique(conflictsWith).label}.`
        : "Conflicts with a technique this selection depends on.",
    };
  }
  if (combined.length > MAX_TECHNIQUE_STACK) {
    return { allowed: false, reason: `Up to ${MAX_TECHNIQUE_STACK} techniques at once.` };
  }
  return { allowed: true };
}

/** Add `candidate` to a manual selection. Auto-includes its dependency closure
    (visible to the caller via the returned array — never hidden). Returns
    `current` UNCHANGED (never throws, never silently drops anything) if
    `canSelectManually` disallows it — the step's own VERIFY requirement: a
    conflicting or 5th technique is refused, not silently substituted. Starting
    from auto mode, this switches straight into manual mode with just the
    closure for `candidate`. */
export function selectManualTechnique(
  current: TechniqueId[],
  candidate: TechniqueId,
): TechniqueId[] {
  const verdict = canSelectManually(current, candidate);
  if (!verdict.allowed) return current;

  // Explicit annotation: without it, TS 5.5's inferred type predicates narrow
  // this to Exclude<TechniqueId,"auto-detect">[], which then rejects the full
  // TechniqueId results dependencyClosure() returns below.
  const withoutAuto: TechniqueId[] = current.filter((id) => id !== "auto-detect");
  if (withoutAuto.includes(candidate)) return withoutAuto; // no-op re-select

  const closure = dependencyClosure(candidate).filter((id) => !withoutAuto.includes(id));
  return [...withoutAuto, ...closure];
}

/** Remove `candidate` from a manual selection. Cascades: anything left in the
    selection that depended on `candidate` is removed too (removing a
    dependency out from under a dependent would violate the "dependencies
    satisfied" invariant, so it can't be left half-selected). If this empties
    the selection, falls back to AUTO_MODE rather than leaving zero techniques
    selected (CANON: Auto-detect is always a safe default to land on). */
export function deselectManualTechnique(
  current: TechniqueId[],
  candidate: TechniqueId,
): TechniqueId[] {
  // Explicit annotation: without it, TS 5.5's inferred type predicates narrow
  // this to Exclude<TechniqueId,"auto-detect">[], which then rejects the full
  // TechniqueId results dependencyClosure() returns below.
  const withoutAuto: TechniqueId[] = current.filter((id) => id !== "auto-detect");
  const withoutCandidate = withoutAuto.filter((id) => id !== candidate);

  // Cascade-remove anything whose dependency closure required `candidate`.
  const next = withoutCandidate.filter(
    (id) => !dependencyClosure(id).includes(candidate),
  );

  return next.length > 0 ? next : [...AUTO_MODE];
}
