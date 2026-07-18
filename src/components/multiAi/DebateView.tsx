import type { DebateSide } from "../../services/debate";

/* The dual-stream debate view (Step 8.3) — PIPELINE.md MULTI-AI ACTIONS:
   "two AI streams argue opposite sides in a two-column view." This component
   IS this step's named OUTPUT.

   Each column is independent: one side can be showing its argument while the
   other shows an error with its own retry, because ROUTING.md requires a
   partner outage to fail only that side ("fail that side gracefully with a
   visible retry, not a crash"). Purely presentational — runDebate() and its
   loading/error state belong to whoever mounts this (MultiAiActions), same
   split as ConsensusView/SynthesisView (Step 8.4).

   Columns stack to one column on narrow viewports (multi-ai.css) — CANON's
   ADHD rule against dense walls applies harder at small widths, where two
   ~40-character columns would be unreadable. */

export interface DebateViewProps {
  claude: DebateSide;
  partner: DebateSide;
  /** Fires with the side that failed, so only that column is re-run. */
  onRetrySide?: (side: "claude" | "partner") => void;
  /** True while a re-run of that specific side is in flight. */
  retrying?: "claude" | "partner" | null;
}

const STANCE_LABEL: Record<DebateSide["stance"], string> = {
  for: "Arguing for",
  against: "Arguing against",
};

function DebateColumn({
  side,
  which,
  onRetry,
  retrying,
}: {
  side: DebateSide;
  which: "claude" | "partner";
  onRetry?: (side: "claude" | "partner") => void;
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
            onClick={() => onRetry?.(which)}
            disabled={retrying}
          >
            {retrying ? "Retrying…" : "Try this side again"}
          </button>
        </div>
      )}
    </section>
  );
}

export function DebateView({ claude, partner, onRetrySide, retrying = null }: DebateViewProps) {
  return (
    <div className="debate-view" data-testid="debate-view">
      <DebateColumn
        side={claude}
        which="claude"
        onRetry={onRetrySide}
        retrying={retrying === "claude"}
      />
      <DebateColumn
        side={partner}
        which="partner"
        onRetry={onRetrySide}
        retrying={retrying === "partner"}
      />
    </div>
  );
}
