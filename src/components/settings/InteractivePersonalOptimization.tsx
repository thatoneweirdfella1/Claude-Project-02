import { useState } from "react";
import { BrainCircuit, ShieldCheck } from "lucide-react";
import { useAccountStore } from "../../stores/accountStore";
import type { OptimizationGoalId } from "../../stores/types";

const GOALS: Array<{ id: OptimizationGoalId; label: string }> = [
  { id: "reduce-overwhelm", label: "Reduce Overwhelm" },
  { id: "recover-frustration", label: "Recover From Frustration" },
  { id: "increase-clarity", label: "Improve Clarity" },
  { id: "right-size-detail", label: "Match My Detail Level" },
  { id: "support-completion", label: "Support Follow-Through" },
];

export function InteractivePersonalOptimization() {
  const profile = useAccountStore((state) => state.optimizationProfile);
  const setEnabled = useAccountStore((state) => state.setOptimizationEnabled);
  const setGoals = useAccountStore((state) => state.setOptimizationGoals);
  const [previewOpen, setPreviewOpen] = useState(false);
  const toggleGoal = (goal: OptimizationGoalId) => setGoals(profile.selectedGoals.includes(goal)
    ? profile.selectedGoals.filter((item) => item !== goal)
    : [...profile.selectedGoals, goal]);

  return <section className="settings-section optimization-panel" aria-labelledby="interactive-optimization-title">
    <div className="optimization-panel__heading"><div className="optimization-panel__title"><BrainCircuit size={21} /><div><h3 id="interactive-optimization-title">Personal Optimization</h3><p className="settings-section__note">Choose preferences and preview the analysis state. Conversation analysis is not run at this layer.</p></div></div><label className="optimization-switch"><input type="checkbox" checked={profile.enabled} onChange={(event) => { setEnabled(event.target.checked); setPreviewOpen(false); }} /><span>{profile.enabled ? "On" : "Off"}</span></label></div>
    <div className="optimization-goals">{GOALS.map((goal) => <label key={goal.id} className={`optimization-goal ${profile.selectedGoals.includes(goal.id) ? "is-selected" : ""}`}><input type="checkbox" checked={profile.selectedGoals.includes(goal.id)} onChange={() => { toggleGoal(goal.id); setPreviewOpen(false); }} /><span><strong>{goal.label}</strong></span></label>)}</div>
    <div className="optimization-panel__actions"><button type="button" disabled={!profile.enabled || profile.selectedGoals.length === 0} onClick={() => setPreviewOpen(true)}><ShieldCheck size={16} /> Preview analysis state</button></div>
    {previewOpen && <div className="optimization-panel__status" role="status">Preview ready for {profile.selectedGoals.length} selected area{profile.selectedGoals.length === 1 ? "" : "s"}. No conversation was processed and no preference was applied.</div>}
  </section>;
}
