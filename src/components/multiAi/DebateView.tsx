import type { DebateSide } from "../../services/debate";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useDismissableLayer, useFocusTrap } from "../../keyboard";
import { renderConversationMarkdown } from "../../services/export";
import { transcriptFromRun } from "../../services/multiAi/transcript";
import { saveNow } from "../../services/persistence";
import { useSessionStore } from "../../stores/sessionStore";
import type { MultiAiRunRecord } from "../../stores/types";
import { GlassCard, GlassButton, BlueMarbleButton } from "../primitives";

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
  run?: MultiAiRunRecord;
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

/** Shared by the live result and saved history: opening/carrying a debate
 * is entirely local and uses the app's normal file-context persistence. */
export function DebateTranscriptControl({ run }: { run: MultiAiRunRecord }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);
  const trap = useFocusTrap<HTMLDivElement>(open);
  useDismissableLayer(open, () => setOpen(false));
  if (!transcriptFromRun(run)) return null;
  const markdown = renderConversationMarkdown([], [run], "debate");

  async function attach() {
    setAttaching(true);
    const store = useSessionStore.getState();
    const id = `debate-attachment-${run.id}`;
    store.removeContextItem(id);
    store.addContextItem({
      id, kind: "file", label: `debate-${run.id}.md`, content: markdown,
      bytes: new TextEncoder().encode(markdown).byteLength,
      fileType: "text/markdown", included: true, provenance: "Debate",
    });
    try {
      await saveNow();
      setStatus("Debate attached as Markdown.");
    } catch {
      setStatus("Debate attached locally, but saving failed. Try again before leaving.");
    } finally {
      setAttaching(false);
    }
  }

  return <>
    <GlassButton onClick={() => { setStatus(null); setOpen(true); }}>Open debate</GlassButton>
    {open && createPortal(
      <div className="download-modal-overlay" onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}>
        <div ref={trap}>
          <GlassCard className="download-modal" role="dialog" aria-modal="true" aria-label="Debate transcript">
            <div className="download-modal__header">
              <h2 className="download-modal__title">Debate</h2>
              <GlassButton onClick={() => setOpen(false)}>Close debate</GlassButton>
            </div>
            <pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{markdown}</pre>
            {status && <p role="status">{status}</p>}
            <BlueMarbleButton onClick={() => void attach()} disabled={attaching}>
              Carry debate into conversation
            </BlueMarbleButton>
          </GlassCard>
        </div>
      </div>, document.body,
    )}
  </>;
}

export function DebateView({ sides, run, onRetrySide, retrying = null }: DebateViewProps) {
  return (
    <>
    {run && <DebateTranscriptControl run={run} />}
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
    </>
  );
}
