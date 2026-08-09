import { useMemo, useState } from "react";
import { BrainCircuit, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { runPersonalOptimizationWithAi } from "../../services/optimization";
import { saveNow } from "../../services/persistence";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import type { OptimizationGoalId, SessionRecord } from "../../stores/types";

const GOALS: Array<{ id: OptimizationGoalId; label: string; description: string }> = [
  { id: "reduce-overwhelm", label: "Reduce Overwhelm", description: "Use less cognitive load when overload signals appear." },
  { id: "recover-frustration", label: "Recover From Frustration", description: "Respond better when the conversation goes off track." },
  { id: "increase-clarity", label: "Improve Clarity", description: "Favor explanations that are easier to understand." },
  { id: "right-size-detail", label: "Match My Detail Level", description: "Learn when responses feel too long, short, or dense." },
  { id: "support-completion", label: "Support Follow-Through", description: "Shape responses around resuming and completing tasks." },
];

export function PersonalOptimization() {
  const profile = useAccountStore((state) => state.optimizationProfile);
  const sessions = useAccountStore((state) => state.sessions);
  const learnedPreferences = useAccountStore((state) => state.learnedPreferences);
  const runs = useAccountStore((state) => state.optimizationRuns);
  const appMode = useAccountStore((state) => state.appMode);
  const setEnabled = useAccountStore((state) => state.setOptimizationEnabled);
  const setGoals = useAccountStore((state) => state.setOptimizationGoals);
  const recordRun = useAccountStore((state) => state.recordOptimizationRun);
  const markBad = useAccountStore((state) => state.markOptimizationRunBad);
  const rollback = useAccountStore((state) => state.rollbackOptimizationRun);
  const currentConversation = useSessionStore((state) => state.conversation);
  const [status, setStatus] = useState("");

  const eligibleSessions = useMemo(() => {
    if (currentConversation.length === 0) return sessions;
    const current: SessionRecord = {
      id: "current-session",
      createdAt: currentConversation[0]?.timestamp ?? Date.now(),
      archived: false,
      model: useSessionStore.getState().model,
      directness: useSessionStore.getState().directness,
      techniques: useSessionStore.getState().techniques,
      context: useSessionStore.getState().context,
      variables: useSessionStore.getState().variables,
      conversation: currentConversation,
    };
    return [...sessions, current];
  }, [currentConversation, sessions]);

  const toggleGoal = (goal: OptimizationGoalId) => {
    setGoals(
      profile.selectedGoals.includes(goal)
        ? profile.selectedGoals.filter((item) => item !== goal)
        : [...profile.selectedGoals, goal],
    );
  };

  const analyze = async (apply: boolean) => {
    if (profile.selectedGoals.length === 0) {
      setStatus("Choose at least one area to personalize.");
      return;
    }
    const run = await runPersonalOptimizationWithAi({
      sessions: eligibleSessions,
      goals: profile.selectedGoals,
      currentPreferences: learnedPreferences,
      minimumEvidence: profile.minimumEvidence,
      apply,
    });
    if (!run) {
      setStatus("Optimization cancelled. No conversations were processed and no profile changes were made.");
      return;
    }
    recordRun(run);
    await saveNow();
    setStatus(`${run.summary} Scanned ${run.scannedSessions} conversation${run.scannedSessions === 1 ? "" : "s"} and found ${run.evidence.length} matching examples.`);
  };

  return (
    <section className="settings-section optimization-panel" aria-labelledby="optimization-title">
      <div className="optimization-panel__heading">
        <div className="optimization-panel__title">
          <BrainCircuit size={21} />
          <div>
            <h3 id="optimization-title">Personal Optimization</h3>
            <p className="settings-section__note">Choose what should improve. Divergence reviews eligible conversations automatically.</p>
          </div>
        </div>
        <label className="optimization-switch">
          <input type="checkbox" checked={profile.enabled} onChange={(event) => setEnabled(event.target.checked)} />
          <span>{profile.enabled ? "On" : "Off"}</span>
        </label>
      </div>

      <div className="optimization-goals">
        {GOALS.map((goal) => (
          <label key={goal.id} className={`optimization-goal ${profile.selectedGoals.includes(goal.id) ? "is-selected" : ""}`}>
            <input type="checkbox" checked={profile.selectedGoals.includes(goal.id)} onChange={() => toggleGoal(goal.id)} />
            <span><strong>{goal.label}</strong><small>{goal.description}</small></span>
          </label>
        ))}
      </div>

      <div className="optimization-panel__actions">
        <button type="button" disabled={!profile.enabled} onClick={() => void analyze(true)}>
          <Sparkles size={16} /> Analyze &amp; Apply
        </button>
        {appMode === "developer" && (
          <button type="button" className="secondary" onClick={() => void analyze(false)}>
            <ShieldCheck size={16} /> Preview Only
          </button>
        )}
      </div>
      {status && <p className="optimization-panel__status" role="status">{status}</p>}

      {appMode === "developer" && runs.length > 0 && (
        <details className="optimization-diagnostics">
          <summary>Developer diagnostics ({runs.length} runs)</summary>
          {[...runs].reverse().slice(0, 5).map((run) => (
            <article key={run.id}>
              <div>
                <strong>{new Date(run.timestamp).toLocaleString()}</strong>
                <span>{run.status} · {run.evidence.length} evidence · {run.changes.length} changes</span>
              </div>
              <p>{run.summary}</p>
              <div className="optimization-diagnostics__actions">
                {run.status === "applied" && <button type="button" onClick={() => { rollback(run.id); void saveNow(); }}><RotateCcw size={13} /> Roll back</button>}
                {run.status !== "bad" && <button type="button" onClick={() => { markBad(run.id); void saveNow(); }}>Mark bad</button>}
              </div>
            </article>
          ))}
        </details>
      )}
    </section>
  );
}
