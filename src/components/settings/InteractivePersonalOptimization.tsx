import { useState } from "react";
import { BrainCircuit, ShieldCheck } from "lucide-react";
import { useAccountStore } from "../../stores/accountStore";
import { runPersonalOptimization } from "../../services/optimization/personalOptimizer";
import { saveNow } from "../../services/persistence";
import type { OptimizationGoalId, OptimizationRun } from "../../stores/types";

const GOALS: Array<{ id: OptimizationGoalId; label: string }> = [
  { id: "reduce-overwhelm", label: "Reduce Overwhelm" },
  { id: "recover-frustration", label: "Recover From Frustration" },
  { id: "increase-clarity", label: "Improve Clarity" },
  { id: "right-size-detail", label: "Match My Detail Level" },
  { id: "support-completion", label: "Support Follow-Through" },
];

export function InteractivePersonalOptimization() {
  const profile = useAccountStore((state) => state.optimizationProfile);
  const sessions = useAccountStore((state) => state.sessions);
  const learnedPreferences = useAccountStore((state) => state.learnedPreferences);
  const runs = useAccountStore((state) => state.optimizationRuns);
  const setEnabled = useAccountStore((state) => state.setOptimizationEnabled);
  const setGoals = useAccountStore((state) => state.setOptimizationGoals);
  const [preview, setPreview] = useState<OptimizationRun | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const clearPreview = () => { setPreview(null); setStatus(""); };
  const toggleGoal = (goal: OptimizationGoalId) => setGoals(profile.selectedGoals.includes(goal)
    ? profile.selectedGoals.filter((item) => item !== goal)
    : [...profile.selectedGoals, goal]);

  function analyze() {
    if (!profile.enabled || profile.selectedGoals.length === 0) return;
    setPreview(runPersonalOptimization({ sessions, goals: profile.selectedGoals,
      currentPreferences: learnedPreferences, minimumEvidence: profile.minimumEvidence, apply: false }));
    setStatus("");
  }

  async function applyPreview() {
    const current = useAccountStore.getState();
    if (!preview || preview.status !== "preview" || saving || !current.optimizationProfile.enabled
      || current.optimizationProfile.selectedGoals.length === 0) return;
    const refreshed = runPersonalOptimization({ sessions: current.sessions,
      goals: current.optimizationProfile.selectedGoals, currentPreferences: current.learnedPreferences,
      minimumEvidence: current.optimizationProfile.minimumEvidence, apply: false });
    const signature = (run: OptimizationRun) => JSON.stringify({ goals: run.goals,
      scannedSessions: run.scannedSessions, evidence: run.evidence, changes: run.changes,
      beforePreferences: run.beforePreferences });
    if (signature(preview) !== signature(refreshed)) {
      setPreview(refreshed);
      setStatus("Your saved sessions or preferences changed. Review the refreshed preview before applying.");
      return;
    }
    if (refreshed.changes.length === 0) return;
    const applied: OptimizationRun = { ...refreshed, status: "applied" };
    current.recordOptimizationRun(applied);
    setPreview(null);
    setSaving(true);
    try {
      await saveNow();
      setStatus("Applied the previewed changes and saved them on this device.");
    } catch {
      setStatus("Changes are applied on screen, but saving failed. Keep this page open and retry saving.");
    } finally { setSaving(false); }
  }

  async function retrySave() {
    setSaving(true);
    try { await saveNow(); setStatus("Preference changes saved on this device."); }
    catch { setStatus("Changes are applied on screen, but saving failed. Keep this page open and retry saving."); }
    finally { setSaving(false); }
  }

  async function undoChange(runId: string, changeIndex: number, target: string) {
    if (saving) return;
    if (!useAccountStore.getState().rollbackOptimizationRun(runId, changeIndex)) {
      setStatus("This change is already undone or unavailable.");
      return;
    }
    setPreview(null);
    setSaving(true);
    try { await saveNow(); setStatus(`Undid ${target} and saved the restored preference on this device.`); }
    catch { setStatus("Undo is on screen, but saving failed. Keep this page open and retry saving."); }
    finally { setSaving(false); }
  }

  const history = [...runs].reverse()
    .filter((run) => run.status === "applied" || run.status === "rolled-back" || run.appliedAt !== undefined)
    .sort((a, b) => b.timestamp - a.timestamp)
    .flatMap((run) => run.changes.map((change, index) => ({ run, change, index })).reverse());

  return <section className="settings-section optimization-panel" aria-labelledby="interactive-optimization-title">
    <div className="optimization-panel__heading"><div className="optimization-panel__title"><BrainCircuit size={21} /><div><h3 id="interactive-optimization-title">Personal Optimization</h3><p className="settings-section__note">Preview patterns in your saved sessions on this device. Review the proposed changes, then apply them with a separate click.</p></div></div><label className="optimization-switch"><input type="checkbox" checked={profile.enabled} onChange={(event) => { setEnabled(event.target.checked); clearPreview(); }} /><span>{profile.enabled ? "On" : "Off"}</span></label></div>
    <div className="optimization-goals">{GOALS.map((goal) => <label key={goal.id} className={`optimization-goal ${profile.selectedGoals.includes(goal.id) ? "is-selected" : ""}`}><input type="checkbox" checked={profile.selectedGoals.includes(goal.id)} onChange={() => { toggleGoal(goal.id); clearPreview(); }} /><span><strong>{goal.label}</strong></span></label>)}</div>
    {!profile.enabled && <p>Turn Personal Optimization on to preview your saved sessions.</p>}
    {profile.enabled && profile.selectedGoals.length === 0 && <p>Choose at least one goal before previewing your sessions.</p>}
    <div className="optimization-panel__actions"><button type="button" disabled={!profile.enabled || profile.selectedGoals.length === 0 || saving} onClick={analyze}><ShieldCheck size={16} /> Preview analysis state</button></div>
    {preview && <div className="optimization-panel__status" role="status">
      <p>Scanned {preview.scannedSessions} saved session{preview.scannedSessions === 1 ? "" : "s"} locally.</p>
      {preview.scannedSessions === 0
        ? <p>No saved sessions are available. No conversation was processed. Save sessions before trying again.</p>
        : preview.changes.length === 0
          ? <p>No changes proposed: each pattern needs at least {Math.max(3, profile.minimumEvidence)} matching examples across more than one saved session. A setting already at its weight limit also stays unchanged.</p>
          : <>
            <h4>{preview.status === "applied" ? "Applied changes" : "Proposed changes"}</h4>
            <ul className="optimization-changes">{preview.changes.map((change, index) => <li key={`${change.target}-${index}`}>
              <strong>{change.target}</strong>: {change.before} → {change.after}
              <p>{change.reason} {change.evidenceCount} examples.</p>
            </li>)}</ul>
            {preview.status === "preview" && <><p>Preview only. Your preferences have not changed.</p><button type="button" disabled={saving} onClick={() => void applyPreview()}>Apply previewed changes</button></>}
          </>}
    </div>}
    {status && <p role="status">{status}</p>}
    {status.includes("saving failed") && <button type="button" disabled={saving} onClick={() => void retrySave()}>Retry saving changes</button>}
    <section className="optimization-history" aria-label="Applied optimization changes">
      <h4>Applied changes</h4>
      <p>Newest first. Undo restores only that setting to its value before the selected change.</p>
      {history.length === 0 ? <p>No preference changes have been applied yet.</p> : <ol>
        {history.map(({ run, change, index }) => {
          const undone = change.undoneAt !== undefined || run.status === "rolled-back";
          return <li key={`${run.id}-${index}`} data-optimization-target={change.target}>
            <header><strong>{change.target}</strong><time dateTime={new Date(run.appliedAt ?? run.timestamp).toISOString()}>{new Date(run.appliedAt ?? run.timestamp).toLocaleString()}</time></header>
            <p className="optimization-history__value">{change.before} → {change.after}</p>
            <p>{change.reason}</p>
            <p>{change.evidenceCount} examples. Current weight: {learnedPreferences.technique[change.target]?.weight ?? 0}</p>
            {undone ? <p className="optimization-history__undone">Undone{change.undoneAt !== undefined ? ` · ${new Date(change.undoneAt).toLocaleString()}` : " (whole-run rollback)"}</p>
              : <button type="button" disabled={saving} onClick={() => void undoChange(run.id, index, change.target)}>Undo {change.target}</button>}
          </li>;
        })}
      </ol>}
    </section>
  </section>;
}
