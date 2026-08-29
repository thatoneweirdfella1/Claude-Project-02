import { GlassButton } from "../primitives";
import type { SynthesisResult } from "../../services/multiAi";

/* Synthesis view (Step 8.4) — PIPELINE.md MULTI-AI ACTIONS: "Synthesis:
   combine perspectives into one refined answer the user can use to replace
   the original or merge below." Purely presentational (same posture as
   ConsensusView): given an already-resolved SynthesisResult, render the
   refined answer plus the two actions CANON names. onReplace/onMergeBelow
   are events-only, same pattern as Composer's onAttach/onContext — actually
   replacing the original message or merging this text below it means
   touching sessionStore.messages, which belongs to whoever mounts this
   under a real message (Step 8.3's Multi-AI Actions entry point, not built
   this session), not to a presentational view. */

export interface SynthesisViewProps {
  result: SynthesisResult;
  onReplace?: () => void;
  onMergeBelow?: () => void;
}

export function SynthesisView({ result, onReplace, onMergeBelow }: SynthesisViewProps) {
  return (
    <div className="synthesis-view" data-testid="synthesis-view">
      <p className="synthesis-view__text">{result.refinedAnswer}</p>
      <div className="synthesis-view__actions">
        <GlassButton onClick={onReplace} disabled={!onReplace}>
          Replace answer
        </GlassButton>
        <GlassButton onClick={onMergeBelow} disabled={!onMergeBelow}>
          Merge below
        </GlassButton>
      </div>
    </div>
  );
}
