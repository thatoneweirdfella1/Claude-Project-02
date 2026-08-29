import { TRANSLATOR_ENGINES, destinationLabel } from "../../services/providerNeutral";
import { DEFAULT_VISIBILITY, useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import type { TranslatorEngine, VisibilitySettings } from "../../stores/types";
import { ProviderConnectionsPanel } from "./ProviderConnectionsPanel";

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
  const reviewBeforeSend = useSessionStore((s) => s.reviewBeforeSend);
  const setReviewBeforeSend = useSessionStore((s) => s.setReviewBeforeSend);
  const paidFallbackEnabled = useSessionStore((s) => s.paidFallbackEnabled);
  const setPaidFallbackEnabled = useSessionStore((s) => s.setPaidFallbackEnabled);
  const maxRequestCost = useSessionStore((s) => s.maxRequestCost);
  const setMaxRequestCost = useSessionStore((s) => s.setMaxRequestCost);
  const visibility = useAccountStore((s) => s.visibility);
  const setVisibility = useAccountStore((s) => s.setVisibility);
  const selectedEngine = translatorEngine === "legacy-claude" ? "managed-translator" : translatorEngine;

  return <>
    <ProviderConnectionsPanel />
    <div className="settings-section">
      <div className="settings-item"><div className="settings-item__label">Current destination</div><div className="settings-item__value">{destinationLabel(destination)}</div></div>
    </div>
    <div className="settings-section">
      <h3>AI Behavior</h3>
      <label className="settings-item"><span className="settings-item__label">Translator Engine</span><select value={selectedEngine} onChange={(event) => setTranslatorEngine(event.target.value as TranslatorEngine)}>{TRANSLATOR_ENGINES.map((engine) => <option key={engine.id} value={engine.id}>{engine.label}</option>)}</select></label>
      <label className="settings-item"><span className="settings-item__label">Review before sending</span><input type="checkbox" checked={reviewBeforeSend} onChange={(event) => setReviewBeforeSend(event.target.checked)} /></label>
      <label className="settings-item"><span className="settings-item__label">Paid fallback</span><input type="checkbox" checked={paidFallbackEnabled} onChange={(event) => setPaidFallbackEnabled(event.target.checked)} /></label>
      <label className="settings-item"><span className="settings-item__label">Maximum per request</span><input type="number" min="0" step="0.01" value={maxRequestCost} onChange={(event) => setMaxRequestCost(Number(event.target.value))} /></label>
      <p className="settings-section__note">Changes affect the current session. Save them as defaults from Advanced Controls when you want them reused.</p>
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

