/* Background learning loop job (Step 10.1 analysis + Step 10.2 apply).
   Triggers after 15+ questions, analyzes patterns, proposes refinements,
   then applies accepted refinements to the account store with an audit
   log (PIPELINE.md LEARNING LOOP). Runs async, never blocks. */

import { subscribeTelemetry } from "../telemetry/log";
import { useAccountStore } from "../../stores/accountStore";
import { analyzePatterns } from "./analyzer";
import { applyRefinements } from "./applier";
import type { TelemetryEntry } from "../telemetry/types";
import type { Rating, StateCorrection } from "../../stores/types";

let lastAnalysisId: string | null = null;

export interface LearningJobConfig {
  threshold?: number; // questions before analysis triggers (default 15)
  debounceMs?: number; // delay before running after threshold hit (default 2000ms)
}

export function startLearningLoop(config?: LearningJobConfig): () => void {
  const threshold = config?.threshold ?? 15;
  const debounceMs = config?.debounceMs ?? 2000;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  /* Subscribe to telemetry changes via the log's built-in subscriber */
  const unsubscribe = subscribeTelemetry((telemetry) => {
    if (stopped) return;

    if (telemetry.length >= threshold) {
      /* Clear any pending debounce and reschedule */
      if (debounceTimer) clearTimeout(debounceTimer);

      /* Schedule the actual analysis run after a short delay */
      debounceTimer = setTimeout(async () => {
        if (stopped) return;

        try {
          const accountStore = useAccountStore.getState();
          await runAnalysisJob(
            Array.from(telemetry),
            accountStore.ratings || [],
            accountStore.stateCorrections || []
          );
        } catch (err) {
          // Silently fail; learning loop errors never block the user
          console.error("Learning loop analysis failed:", err);
        }

        debounceTimer = null;
      }, debounceMs);
    }
  });

  return () => {
    stopped = true;
    if (debounceTimer) clearTimeout(debounceTimer);
    unsubscribe();
  };
}

async function runAnalysisJob(
  telemetry: TelemetryEntry[],
  ratings: Rating[],
  stateCorrections: StateCorrection[]
): Promise<void> {
  const result = analyzePatterns(telemetry, ratings, stateCorrections);

  // Skip if no proposals found
  if (result.proposals.length === 0) return;

  // Prevent duplicate runs on the same telemetry snapshot
  const jobId = `${result.totalQuestionsAnalyzed}:${result.analysisTimestamp}`;
  if (lastAnalysisId === jobId) return;
  lastAnalysisId = jobId;

  // Step 10.2 — apply the accepted proposals to learnedPreferences, with
  // an audit entry per applied proposal (PIPELINE.md: "An applier writes
  // accepted refinements to the account store with an audit log"). The
  // pure applier is called here (not inside the store — stores stay
  // dumb/pure-data, no store imports from services/, same convention as
  // every other store action) and its already-computed result is written
  // back via one atomic store action.
  const accountStore = useAccountStore.getState();
  const { updated, auditEntries } = applyRefinements(
    accountStore.learnedPreferences,
    result.proposals,
  );
  if (auditEntries.length > 0) {
    accountStore.applyLearningRefinements(updated, auditEntries);
  }
}
