import { STAGE_LABELS, type PipelineStageName } from "../../services/answerDisplay";

/* Stage indicator (Step 5.1) — shown while the pipeline runs, before any
   tokens have arrived. CANON ADHD Time rule: "show an indicator for any wait
   over 1 second"; stage CHANGES themselves must render under 300ms — this is
   a plain state-driven re-render with no animation to wait on, so a stage
   change is exactly as fast as React's own render. */

export function StageIndicator({ stage }: { stage: PipelineStageName }) {
  return (
    <p className="stage-indicator" data-testid="stage-indicator" aria-live="polite">
      {STAGE_LABELS[stage]}
    </p>
  );
}
