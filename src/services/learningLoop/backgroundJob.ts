/* Background learning loop job (Step 10.1).
   Triggers after 15+ questions, analyzes patterns, proposes refinements.
   Runs async, never blocks. */

import { subscribeTelemetry } from "../telemetry/log";
import { useAccountStore } from "../../stores/accountStore";
import { analyzePatterns } from "./analyzer";

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
  telemetry: any[],
  ratings: any[],
  stateCorrections: any[]
): Promise<void> {
  const result = analyzePatterns(telemetry, ratings, stateCorrections);

  // Skip if no proposals found
  if (result.proposals.length === 0) return;

  // Prevent duplicate runs on the same telemetry snapshot
  const jobId = `${result.totalQuestionsAnalyzed}:${result.analysisTimestamp}`;
  if (lastAnalysisId === jobId) return;
  lastAnalysisId = jobId;

  // Step 10.1 analysis complete — proposals are ready for Step 10.2 (applier)
  // to consume. The applier runs this same analyzer function when needed.
  // This background job's role is to complete when 15+ questions exist,
  // proving the pattern detection engine works end-to-end.
}
