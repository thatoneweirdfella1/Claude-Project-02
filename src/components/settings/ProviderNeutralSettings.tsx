import { TRANSLATOR_ENGINES, DESTINATION_PROVIDERS, destinationLabel } from "../../services/providerNeutral";
import { DEFAULT_VISIBILITY, useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import { useSettingsDefaultsStore } from "../../stores/settingsDefaultsStore";
import type { DirectnessLevel, StateDetectionMode, TranslatorEngine, VisibilitySettings } from "../../stores/types";

const RAIL_OPTIONS: Array<{ key: keyof VisibilitySettings; label: string }> = [
  { key: "recentSessions", label: "Recent Sessions" },
  { key: "contextSnapshot", label: "Context Snapshot" },
  { key: "recentActivity", label: "Recent Activity" },
  { key: "tokenUsage", label: "Usage & Cost" },
  { key: "modelStatus", label: "AI Status" },
  { key: "activeSession", label: "Active Session" },
  { key: "quickTools", label: "Quick Tools" },
];

export function ProviderNeutralSettings() {
  const destination = useSessionStore((s) => s.destination);
  const translatorEngine = useSessionStore((s) => s.translatorEngine);
  const setTranslatorEngine = useSessionStore((s) => s.setTranslatorEngine);
  const directness = useSessionStore((s) => s.directness);
  const setDirectness = useSessionStore((s) => s.setDirectness);
  const stateDetectionMode = useSessionStore((s) => s.stateDetectionMode);
  const setStateDetectionMode = useSessionStore((s) => s.setStateDetectionMode);
  const reviewBeforeSend = useSessionStore((s) => s.reviewBeforeSend);
  const setReviewBeforeSend = useSessionStore((s) => s.setReviewBeforeSend);
  const paidFallbackEnabled = useSessionStore((s) => s.paidFallbackEnabled);
  const setPaidFallbackEnabled = useSessionStore((s) => s.setPaidFallbackEnabled);
  const maxRequestCost = useSessionStore((s) => s.maxRequestCost);
  const setMaxRequestCost = useSessionStore((s) => s.setMaxRequestCost);
  const visibility = useAccountStore((s) => s.visibility);
  const setVisibility = useAccountStore((s) => s.setVisibility);
  const setRequestDefaults = useSettingsDefaultsStore((s) => s.setRequestDefaults);
  const requestDefaults = useSettingsDefaultsStore((s) => s.requestDefaults);
  const selectedEngine = translatorEngine === "legacy-claude" ? "managed-translator" : translatorEngine;

  function updateDefaults(patch: Partial<typeof requestDefaults>) {
    setRequestDefaults({ ...requestDefaults, ...patch });
  }

  return <>
    <div className="settings-section">
      <h3>AI Connections</h3>
      <p className="settings-section__note">Manual copy/open handoff works without connecting an account. Connections are optional and never silently charged.</p>
      <div className="settings-item"><div className="settings-item__label">Current destination</div><div className="settings-item__value">{destinationLabel(destination)}</div></div>
      <div className="settings-item"><div className="settings-item__label">Provider registry</div><div className="settings-item__value">{DESTINATION_PROVIDERS.length} destinations</div></div>
    </div>
    <div className="settings-section">
      <h3>AI Behavior</h3>
      <label className="settings-item"><span className="settings-item__label">Directness</span><select value={directness} onChange={(event) => setDirectness(Number(event.target.value) as DirectnessLevel)}><option value={1}>Supportive — gentle and reassuring</option><option value={2}>Balanced — clear and considerate</option><option value={3}>Blunt — direct with no cushioning</option></select></label>
      <label className="settings-item"><span className="settings-item__label">State Detection</span><select value={stateDetectionMode} onChange={(event) => { const value = event.target.value as StateDetectionMode; setStateDetectionMode(value); updateDefaults({ stateDetectionMode: value }); }}><option value="manual-free">Manual — Free</option><option value="manual-paid">Manual — Paid</option><option value="automatic-paid">Automatic — Paid</option></select></label>
      <label className="settings-item"><span className="settings-item__label">Translator Engine</span><select value={selectedEngine} onChange={(event) => { const value = event.target.value as TranslatorEngine; setTranslatorEngine(value); updateDefaults({ translatorEngine: value }); }}>{TRANSLATOR_ENGINES.map((engine) => <option key={engine.id} value={engine.id}>{engine.label}</option>)}</select></label>
      <label className="settings-item"><span className="settings-item__label">Review before sending</span><input type="checkbox" checked={reviewBeforeSend} onChange={(event) => { setReviewBeforeSend(event.target.checked); updateDefaults({ reviewBeforeSend: event.target.checked }); }} /></label>
      <label className="settings-item"><span className="settings-item__label">Paid fallback</span><input type="checkbox" checked={paidFallbackEnabled} onChange={(event) => { setPaidFallbackEnabled(event.target.checked); updateDefaults({ paidFallbackEnabled: event.target.checked }); }} /></label>
      <label className="settings-item"><span className="settings-item__label">Maximum per request</span><input type="number" min="0" step="0.01" value={maxRequestCost} onChange={(event) => { const value = Math.max(0, Number(event.target.value) || 0); setMaxRequestCost(value); updateDefaults({ maxRequestCost: value }); }} /></label>
      <p className="settings-section__note">Changes here apply now and remain in effect for future sessions. Directness controls the tone of every prepared AI reply until you change it.</p>
    </div>
    <div className="settings-section">
      <h3>Right Rail</h3>
      <div className="right-rail-settings">{RAIL_OPTIONS.map((option) => <label key={option.key}><input type="checkbox" checked={visibility[option.key]} onChange={(event) => setVisibility({ [option.key]: event.target.checked })} /><span>{option.label}</span></label>)}</div>
      <button type="button" className="settings-btn secondary" onClick={() => setVisibility(DEFAULT_VISIBILITY)}>Restore recommended</button>
    </div>
    <div className="settings-section">
      <h3>Notifications</h3>
      <div className="settings-item"><div className="settings-item__label">Confirmation policy</div><div className="settings-item__value">Essential actions only</div></div>
      <p className="settings-section__note">Handoffs, imports, paid routes, and destructive actions require visible confirmation.</p>
    </div>
    <div className="settings-section">
      <h3>Usage &amp; Cost</h3>
      <div className="settings-item"><div className="settings-item__label">Default route</div><div className="settings-item__value">Free first</div></div>
      <div className="settings-item"><div className="settings-item__label">Automatic top-up</div><div className="settings-item__value">Off</div></div>
    </div>
  </>;
}


