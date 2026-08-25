import { useState } from "react";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";

export function LocalDryRunPanel() {
  const appMode = useAccountStore((state) => state.appMode);
  const draftInput = useSessionStore((state) => state.draftInput);
  const [scenario, setScenario] = useState("normal");
  const [status, setStatus] = useState("");
  if (appMode !== "developer") return null;

  return <section className="settings-section" aria-label="Developer local request dry run">
    <h3>Local request dry run</h3>
    <p className="settings-section__note">Preview and mark a scenario locally. This panel cannot call a provider, spend credits, or write remote data.</p>
    <label>Scenario<select value={scenario} onChange={(event) => setScenario(event.target.value)}><option value="normal">Normal</option><option value="provider-unavailable">Provider unavailable</option><option value="interrupted">Interrupted</option></select></label>
    <div className="screen__actions">
      <button type="button" onClick={() => setStatus(draftInput.trim() ? `Preview ready (${scenario}): ${draftInput.trim().slice(0, 120)}` : "Add a draft before previewing.")}>Preview request</button>
      <button type="button" disabled={!status.startsWith("Preview ready")} onClick={() => setStatus(`Marked sent locally (${scenario}); no provider was called.`)}>Mark sent (simulated)</button>
    </div>
    {status && <p role="status">{status}</p>}
  </section>;
}
