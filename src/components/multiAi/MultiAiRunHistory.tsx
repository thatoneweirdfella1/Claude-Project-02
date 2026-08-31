import { useSessionStore } from "../../stores/sessionStore";
import type { MultiAiRunRecord } from "../../stores/types";
import { WORKFLOW_STAGE_LABEL } from "../../services/workflowVocabulary";

/* R21: Persist Multi-AI Results — every finished/partial/failed/cancelled
   Multi-AI run is kept in session.multiAiRuns (persisted through autosave,
   survives reload/navigation) and rendered here as a branch linked back to
   the exact source message(s) it was created from (R20's sourceMessageIds).
   This is deliberately a read of the real persisted store, not live
   component state — reloading the page and re-mounting this component
   shows the same runs because they came from disk, not memory. */

export interface MultiAiRunHistoryProps {
  /** Only render runs that came from this exact set of source messages —
      lets a run appear directly under the message(s) it branched from. */
  sourceMessageIds?: string[];
}

/* R29: "Failed" and "Cancelled" are pulled straight from WORKFLOW_STAGE_LABEL
   — the same exact words Settings' Provider Connections panel and
   routeReadiness use for those states, not a locally-invented variant.
   "Complete"/"Partial" describe a multi-participant OUTCOME (how many of
   several sides landed), a different concept from the single-message
   "Answered" state (R19) — forcing them to share a word would blur that
   distinction rather than clarify it, so they keep their own precise terms. */
const STATUS_LABEL: Record<MultiAiRunRecord["status"], string> = {
  complete: "Complete",
  partial: "Partial — not every participant landed",
  failed: `${WORKFLOW_STAGE_LABEL.failed} — no participant landed`,
  cancelled: WORKFLOW_STAGE_LABEL.cancelled,
};

function formatCost(value: number | null): string {
  if (value === null) return "cost unavailable";
  return `$${value.toFixed(4)}`;
}

export function MultiAiRunHistory({ sourceMessageIds }: MultiAiRunHistoryProps) {
  const runs = useSessionStore((s) => s.multiAiRuns);

  const visible = sourceMessageIds
    ? runs.filter((r) => r.sourceMessageIds.some((id) => sourceMessageIds.includes(id)))
    : runs;

  if (visible.length === 0) return null;

  return (
    <div className="multi-ai-run-history" data-testid="multi-ai-run-history">
      {visible.map((run) => (
        <details key={run.id} className={`multi-ai-run-history__run multi-ai-run-history__run--${run.status}`} data-testid="multi-ai-run">
          <summary>
            <span className="multi-ai-run-history__status" role="status">{run.workflowStage === "local-preparation" ? "Local preparation" : STATUS_LABEL[run.status]}</span>
            <span className="multi-ai-run-history__question">{run.question.slice(0, 80)}{run.question.length > 80 ? "…" : ""}</span>
          </summary>

          {run.workflowStage === "local-preparation" && (
            <div className="multi-ai-run-history__source-handoff">
              <p>Persisted source handoff · no provider request sent</p>
              <pre>{run.question}</pre>
            </div>
          )}

          <ul className="multi-ai-run-history__participants">
            {run.participants.map((p) => (
              <li key={`${run.id}-${p.label}`} className={`multi-ai-run-history__participant multi-ai-run-history__participant--${p.status}`}>
                <strong>{p.label}</strong>
                {p.provider && p.model && <span className="multi-ai-run-history__attribution"> ({p.provider} · {p.model})</span>}
                {p.status === "ok"
                  ? <p>{p.text}</p>
                  : <p className="multi-ai-run-history__error">{p.message ?? "This side didn't land."}</p>}
                <span className="multi-ai-run-history__cost">
                  Estimated {formatCost(p.estimatedCost ?? null)} · Actual {formatCost(p.actualCost ?? null)}
                </span>
              </li>
            ))}
          </ul>

          {run.consensus && (
            <div className="multi-ai-run-history__consensus">
              <h4>Consensus</h4>
              <p><strong>Disagreement:</strong> {run.consensus.disagreement}</p>
              <p><strong>Common ground:</strong> {run.consensus.commonGround}</p>
              <p><strong>Unified view:</strong> {run.consensus.unifiedView}</p>
            </div>
          )}

          {run.synthesis && (
            <div className="multi-ai-run-history__synthesis">
              <h4>Synthesis</h4>
              <p>{run.synthesis.refinedAnswer}</p>
            </div>
          )}

          <p className="multi-ai-run-history__total">
            {run.workflowStage === "local-preparation"
              ? "No Divergence credits"
              : <>Total — estimated {formatCost(run.totalEstimatedCost)} · actual {formatCost(run.totalActualCost)}</>}
          </p>
        </details>
      ))}
    </div>
  );
}
