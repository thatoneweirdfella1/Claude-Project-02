import { useState } from "react";
import { BrainCircuit, RotateCcw, Sparkles } from "lucide-react";
import { runPersonalOptimizationWithAi } from "../../services/optimization/personalOptimizationRunner";
import { CUSTOMER_OPTIMIZER_CATEGORIES } from "../../services/optimization/customerOptimizerRegistry";
import { saveNow } from "../../services/persistence";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import type { OptimizationGoalId, SessionRecord } from "../../stores/types";

type OptimizerRunner = typeof runPersonalOptimizationWithAi;

export interface PersonalOptimizationProps {
  /** Test seam; production always uses the evidence validator above. */
  runOptimizer?: OptimizerRunner;
}

export function PersonalOptimization({
  runOptimizer = runPersonalOptimizationWithAi,
}: PersonalOptimizationProps) {
  const profile = useAccountStore((state) => state.optimizationProfile);
  const sessions = useAccountStore((state) => state.sessions);
  const ratings = useAccountStore((state) => state.ratings);
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
  const [busy, setBusy] = useState(false);
  const currentPreferencesSnapshot = appMode === "developer" ? JSON.stringify(learnedPreferences) : "";

  const toggleGoal = (goal: OptimizationGoalId) => {
    setGoals(
      profile.selectedGoals.includes(goal)
        ? profile.selectedGoals.filter((item) => item !== goal)
        : [...profile.selectedGoals, goal],
    );
  };

  const personalize = async () => {
    if (busy) return;
    if (profile.selectedGoals.length === 0) {
      setStatus("Choose at least one area to personalize.");
      return;
    }
    if (sessions.length === 0 && currentConversation.length === 0) {
      setStatus("There are no eligible conversations yet. Your profile was not changed.");
      return;
    }

    const sessionState = useSessionStore.getState();
    const eligibleSessions: SessionRecord[] = currentConversation.length === 0
      ? sessions
      : [...sessions, {
          id: "current-session",
          createdAt: currentConversation[0]?.timestamp ?? Date.now(),
          archived: false,
          model: sessionState.model,
          destination: sessionState.destination,
          translatorEngine: sessionState.translatorEngine,
          reviewBeforeSend: sessionState.reviewBeforeSend,
          paidFallbackEnabled: sessionState.paidFallbackEnabled,
          maxRequestCost: sessionState.maxRequestCost,
          directness: sessionState.directness,
          techniques: sessionState.techniques,
          context: sessionState.context,
          variables: sessionState.variables,
          conversation: currentConversation,
        }];

    setBusy(true);
    setStatus("Reviewing new and changed conversations…");
    try {
      const run = await runOptimizer({
        sessions: eligibleSessions,
        ratings,
        goals: profile.selectedGoals,
        currentPreferences: learnedPreferences,
        minimumEvidence: profile.minimumEvidence,
        apply: true,
      });
      if (!run) {
        setStatus("Personalization was cancelled. No conversations were processed and your profile was not changed.");
        return;
      }
      const accountBeforeRecord = useAccountStore.getState();
      recordRun(run);
      if (run.status === "applied" || run.status === "no-change") setEnabled(true);
      try {
        await saveNow();
      } catch {
        useAccountStore.setState({
          learnedPreferences: accountBeforeRecord.learnedPreferences,
          optimizationProfile: accountBeforeRecord.optimizationProfile,
          optimizationRuns: accountBeforeRecord.optimizationRuns,
        });
        setStatus("Personalization could not be saved, so your profile remains unchanged.");
        return;
      }
      const skipped = run.skippedUnchangedSessions
        ? ` Skipped ${run.skippedUnchangedSessions} unchanged category-conversation scan${run.skippedUnchangedSessions === 1 ? "" : "s"}.`
        : "";
      setStatus(`${run.summary} Reviewed ${run.scannedSessions} new or changed conversation${run.scannedSessions === 1 ? "" : "s"}.${skipped}`);
    } catch (error) {
      setStatus(`Personalization stopped without changing your profile: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="settings-section optimization-panel" aria-labelledby="optimization-title">
      <div className="optimization-panel__heading">
        <div className="optimization-panel__title">
          <BrainCircuit size={21} aria-hidden="true" />
          <div>
            <h3 id="optimization-title">Personalize My Divergence</h3>
            <p className="settings-section__note">
              Choose the parts of your experience Divergence may learn from your conversations. Unchecked areas stay unchanged.
            </p>
          </div>
        </div>
      </div>

      <fieldset className="optimization-goals">
        <legend className="sr-only">Areas Divergence may personalize</legend>
        {CUSTOMER_OPTIMIZER_CATEGORIES.map((category) => (
          <label
            key={category.id}
            className={`optimization-goal ${profile.selectedGoals.includes(category.id) ? "is-selected" : ""}`}
          >
            <input
              type="checkbox"
              checked={profile.selectedGoals.includes(category.id)}
              onChange={() => toggleGoal(category.id)}
            />
            <span>
              <strong>{category.label}</strong>
              <small>{category.description}</small>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="optimization-panel__actions">
        <button type="button" disabled={busy} onClick={() => void personalize()}>
          <Sparkles size={16} aria-hidden="true" /> {busy ? "Personalizing…" : "Personalize My Divergence"}
        </button>
      </div>
      {status ? <p className="optimization-panel__status" role="status">{status}</p> : null}

      {appMode === "developer" && runs.length > 0 ? (
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
                {run.status === "applied"
                  && currentPreferencesSnapshot === JSON.stringify(run.afterPreferences) ? (
                  <button type="button" onClick={() => { rollback(run.id); void saveNow(); }}>
                    <RotateCcw size={13} aria-hidden="true" /> Roll back
                  </button>
                ) : null}
                {run.status !== "bad" ? (
                  <button type="button" onClick={() => { markBad(run.id); void saveNow(); }}>Mark bad</button>
                ) : null}
              </div>
            </article>
          ))}
        </details>
      ) : null}
    </section>
  );
}
