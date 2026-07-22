import type { AnswerDisplayState } from "../../services/answerDisplay";
import { AnswerMeta } from "./AnswerMeta";
import { RatingRow } from "./RatingRow";
import { StageIndicator } from "./StageIndicator";

/* The streaming answer display (Step 5.1 OUTPUT) — renders whichever
   AnswerDisplayState the pipeline (real or demo) is currently in: a stage
   indicator, growing partial text, the finished answer with confidence/
   router-honesty/rating/download, or an error. Every state change is a plain
   re-render (no animation, no transition to wait on) — CANON's "every visual
   interaction responds under 300ms" is satisfied by not adding anything that
   could make it slower than React's own render. */

export interface StreamingAnswerProps {
  state: AnswerDisplayState | null;
  onRate?: (rating: number) => void;
  onDownload?: () => void;
}

export function StreamingAnswer({ state, onRate, onDownload }: StreamingAnswerProps) {
  if (!state) return null;

  if (state.kind === "stage") {
    return <StageIndicator stage={state.stage} />;
  }

  if (state.kind === "error") {
    return (
      <p className="streaming-answer__error" data-testid="streaming-answer-error">
        Something went wrong reading that — it wasn&rsquo;t you. Give it another try in a moment.
      </p>
    );
  }

  if (state.kind === "streaming") {
    return (
      <p className="streaming-answer__text" data-testid="streaming-answer-text">
        {state.text}
      </p>
    );
  }

  // done
  return (
    <div className="streaming-answer streaming-answer--done" data-testid="streaming-answer-done">
      <AnswerMeta confidence={state.confidence} downgraded={state.downgraded} notes={state.notes} />
      <p className="streaming-answer__text">{state.text}</p>
      <RatingRow onRate={onRate} onDownload={onDownload} />
    </div>
  );
}
