import { useEffect, useState } from "react";
import { Database, KeyRound } from "lucide-react";
import { desktopBridge } from "../../services/desktopBridge";

export function DesktopProviderSettings() {
  const desktop = desktopBridge();
  const [configured, setConfigured] = useState(false);
  const [source, setSource] = useState("none");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");

  const refresh = async () => {
    if (!desktop) return;
    const status = await desktop.provider.apiKeyStatus();
    setConfigured(status.configured);
    setSource(status.source);
  };
  useEffect(() => { void refresh(); }, []);
  if (!desktop) return null;

  const save = async () => {
    try {
      await desktop.provider.saveApiKey(apiKey);
      setApiKey("");
      setMessage("API key saved with operating-system secure storage.");
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The key could not be saved.");
    }
  };
  const clear = async () => {
    await desktop.provider.clearApiKey();
    setMessage("Saved API key removed.");
    await refresh();
  };

  return (
    <section className="settings-section desktop-provider-settings">
      <h3><KeyRound size={18} /> Desktop AI Provider</h3>
      <p className="settings-section__note">The key never enters the web page or SQLite. Electron stores only an operating-system-encrypted value.</p>
      <div className="settings-item">
        <div className="settings-item__label">Anthropic API key</div>
        <div className="settings-item__value">{configured ? `Configured (${source})` : "Not configured"}</div>
      </div>
      <div className="desktop-provider-settings__key-row">
        <input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="sk-ant-…" autoComplete="off" />
        <button type="button" disabled={!apiKey.trim()} onClick={() => void save()}>Save Key</button>
        {configured && <button type="button" className="secondary" onClick={() => void clear()}>Remove</button>}
      </div>
      <button type="button" className="settings-btn" onClick={() => void desktop.app.openDataFolder()}><Database size={15} /> Open Local Data Folder</button>
      {message && <p className="desktop-provider-settings__message" role="status">{message}</p>}
    </section>
  );
}
