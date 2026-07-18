import type { DebateSide } from "../../services/debate";

/* The multi-column debate view (Step 8.3) — PIPELINE.md MULTI-AI ACTIONS:
   "2 to 4 AIs argue different sides in a multi-column view." This component
   IS this step's named OUTPUT.

   Each column is independent: one participant can be showing its argument
   while another shows an error with its own retry, because ROUTING.md requires
   a partner outage to fail only that side ("fail that side gracefully with a
   visible retry, not a crash"). Purely presentational — runDebate() and its
   loading/error state belong to whoever mounts this (MultiAiActions), same
   split as ConsensusView/SynthesisView (Step 8.4).

   Supports 2-4 columns (Claude + 1-3 partners). Columns stack to one column
   on narrow viewports (multi-ai.css) — CANON's ADHD rule against dense walls
   applies harder at small widths, where narrow columns would be unreadable. */

export interface DebateViewProps {
  sides: DebateSide[];
  /** Fires with the index in sides[] that failed, so only that column is re-run. */
  onRetrySide?: (sideIndex: number) => void;
  /** True while a re-run of that specific side index is in flight. */
  retrying?: number | null;
}

const STANCE_LABEL: Record<DebateSide["stance"], string> = {
  for: "Arguing for",
  against: "Arguing against",
};

function DebateColumn({
  side,
  sideIndex,
  onRetry,
  retrying,
}: {
  side: DebateSide;
  sideIndex: number;
  onRetry?: (index: number) => void;
  retrying: boolean;
}) {
  return (
    <section className="debate-view__column" aria-label={`${side.label}, ${STANCE_LABEL[side.stance]}`}>
      <header className="debate-view__column-header">
        <p className="debate-view__column-name">{side.label}</p>
        <p className="debate-view__column-stance">{STANCE_LABEL[side.stance]}</p>
      </header>

      {side.status === "ok" ? (
        <p className="debate-view__text">{side.text}</p>
      ) : (
        <div className="debate-view__error" role="status">
          <p className="debate-view__error-text">{side.message}</p>
          <button
            type="button"
            className="debate-view__retry"
            onClick={() => onRetry?.(sideIndex)}
            disabled={retrying}
          >
            {retrying ? "Retrying…" : "Try this side again"}
          </button>
        </div>
      )}
    </section>
  );
}

export function DebateView({ sides, onRetrySide, retrying = null }: DebateViewProps) {
  return (
    <div className="debate-view" data-testid="debate-view">
      {sides.map((side, index) => (
        <DebateColumn
          key={index}
          side={side}
          sideIndex={index}
          onRetry={onRetrySide}
          retrying={retrying === index}
        />
      ))}
    </div>
  );
}
