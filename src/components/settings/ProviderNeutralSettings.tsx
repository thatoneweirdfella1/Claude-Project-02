import { DESTINATION_PROVIDERS, destinationLabel } from "../../services/providerNeutral";
import { useSessionStore } from "../../stores/sessionStore";

export function ProviderNeutralSettings() {
  const destination = useSessionStore((s) => s.destination);
  const translatorEngine = useSessionStore((s) => s.translatorEngine);
  const setTranslatorEngine = useSessionStore((s) => s.setTranslatorEngine);
  const reviewBeforeSend = useSessionStore((s) => s.reviewBeforeSend);
  const setReviewBeforeSend = useSessionStore((s) => s.setReviewBeforeSend);

  return <>
    <div className="settings-section">
      <h3>AI Connections</h3>
      <p className="settings-section__note">Manual copy/open handoff is available without connecting an account. API connections remain optional.</p>
      <div className="settings-item"><div className="settings-item__label">Current destination</div><div className="settings-item__value">{destinationLabel(destination)}</div></div>
      <div className="settings-item"><div className="settings-item__label">Available destinations</div><div className="settings-item__value">{DESTINATION_PROVIDERS.length}</div></div>
    </div>
    <div className="settings-section">
      <h3>AI Defaults</h3>
      <label className="settings-item">
        <span className="settings-item__label">Translator Engine</span>
        <select value={translatorEngine} onChange={(event) => setTranslatorEngine(event.target.value === "legacy-claude" ? "legacy-claude" : "local-rules")}>
          <option value="local-rules">Local Rules — No Divergence credits</option>
          <option value="legacy-claude">Connected Claude — confirmation required</option>
        </select>
      </label>
      <label className="settings-item">
        <span className="settings-item__label">Review first</span>
        <input type="checkbox" checked={reviewBeforeSend} onChange={(event) => setReviewBeforeSend(event.target.checked)} />
      </label>
    </div>
    <div className="settings-section">
      <h3>Usage &amp; Cost</h3>
      <div className="settings-item"><div className="settings-item__label">Default route</div><div className="settings-item__value">No Divergence credits</div></div>
      <div className="settings-item"><div className="settings-item__label">Paid fallback</div><div className="settings-item__value">Off</div></div>
      <div className="settings-item"><div className="settings-item__label">Automatic top-up</div><div className="settings-item__value">Off</div></div>
    </div>
    <div className="settings-section">
      <h3>AI Status</h3>
      <div className="settings-item"><div className="settings-item__label">Local compiler</div><div className="settings-item__value">Ready</div></div>
      <div className="settings-item"><div className="settings-item__label">Provider registry</div><div className="settings-item__value">Bundled snapshot</div></div>
    </div>
  </>;
}
