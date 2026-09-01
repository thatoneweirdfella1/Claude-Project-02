import { useEffect, useState } from "react";
import { useAccountStore } from "../../stores/accountStore";
import {
  refreshProviderStatus,
  reportProviderEvent,
  verifyProviderRoute,
  type ConnectedProviderId,
  type ProviderAvailability,
  type ProviderRouteVerification,
} from "../../services/providerStatus";
import { saveNow } from "../../services/persistence";

const PROVIDERS: Array<{ id: ConnectedProviderId; label: string; modelId: string; route: string; keyName: string }> = [
  { id: "anthropic", label: "Anthropic (Claude)", modelId: "claude-sonnet-5", route: "/api/proxy", keyName: "ANTHROPIC_API_KEY" },
  { id: "openai", label: "OpenAI", modelId: "gpt-5.5", route: "/api/proxy-openai", keyName: "OPENAI_API_KEY" },
  { id: "google", label: "Google (Gemini)", modelId: "gemini-3.1-pro", route: "/api/proxy-google", keyName: "GOOGLE_API_KEY" },
  { id: "xai", label: "xAI (Grok)", modelId: "grok-4.3", route: "/api/proxy-xai", keyName: "XAI_API_KEY" },
  { id: "deepseek", label: "DeepSeek", modelId: "deepseek-v4-pro", route: "/api/proxy-deepseek", keyName: "DEEPSEEK_API_KEY" },
];

type CheckState = "checking" | "checked";

export function ProviderConnectionsPanel() {
  const disconnectedProviders = useAccountStore((s) => s.disconnectedProviders);
  const disconnectProvider = useAccountStore((s) => s.disconnectProvider);
  const reconnectProvider = useAccountStore((s) => s.reconnectProvider);
  const [availability, setAvailability] = useState<ProviderAvailability | null>(null);
  const [verifications, setVerifications] = useState<Partial<Record<ConnectedProviderId, ProviderRouteVerification>>>({});
  const [checkState, setCheckState] = useState<CheckState>("checking");
  const [checkingProvider, setCheckingProvider] = useState<ConnectedProviderId | null>(null);
  const [setupProvider, setSetupProvider] = useState<ConnectedProviderId | null>(null);
  const [operationStatus, setOperationStatus] = useState("");

  async function refresh() {
    setCheckState("checking");
    const result = await refreshProviderStatus();
    setAvailability(result);
    setVerifications({});
    setCheckState("checked");
  }

  async function verify(provider: typeof PROVIDERS[number]) {
    setCheckingProvider(provider.id);
    const result = await verifyProviderRoute(provider.id, provider.modelId, provider.route);
    setVerifications((current) => ({ ...current, [provider.id]: result }));
    await reportProviderEvent(result.authenticated && result.healthy ? "verified" : "error");
    setCheckingProvider(null);
  }

  async function disconnect(provider: typeof PROVIDERS[number]) {
    setCheckingProvider(provider.id);
    disconnectProvider(provider.id);
    try {
      await saveNow({ snapshotActiveSession: false });
      await reportProviderEvent("disconnected");
      setOperationStatus(`${provider.label} disconnect saved.`);
    } catch {
      reconnectProvider(provider.id);
      setOperationStatus(`${provider.label} disconnect was not saved; the route remains enabled.`);
    } finally {
      setCheckingProvider(null);
    }
  }

  async function reconnect(provider: typeof PROVIDERS[number]) {
    setCheckingProvider(provider.id);
    reconnectProvider(provider.id);
    try {
      await saveNow({ snapshotActiveSession: false });
      await reportProviderEvent("connected");
      setOperationStatus(`${provider.label} reconnect saved; verifying exact route.`);
      await verify(provider);
    } catch {
      disconnectProvider(provider.id);
      setOperationStatus(`${provider.label} reconnect was not saved; it remains disconnected.`);
      setCheckingProvider(null);
    }
  }

  useEffect(() => { void refresh(); }, []);

  return <div className="settings-section" data-testid="provider-connections-panel">
    <h3>AI Connections</h3>
    <p className="settings-section__note">
      Configuration, authentication, and live route health are separate states. Verification checks the exact model route; it never substitutes a provider or sends a billable prompt. Manual handoff always remains available.
    </p>
    <button type="button" className="settings-btn secondary" onClick={() => void refresh()} disabled={checkState === "checking"} data-testid="provider-connections-refresh">
      {checkState === "checking" ? "Checking configuration…" : "Refresh configuration"}
    </button>
    <div role="status" aria-live="polite">{operationStatus}</div>
    <ul className="provider-connections-list">
      {PROVIDERS.map((provider) => {
        const disconnected = disconnectedProviders.includes(provider.id);
        const verification = verifications[provider.id];
        const checking = checkState === "checking" || checkingProvider === provider.id;
        const configured = availability?.[provider.id] === true;
        const verified = Boolean(verification?.configured && verification.authenticated && verification.healthy && verification.verifiedAt);
        const state = checking ? "checking" : disconnected ? "disconnected" : verified ? "verified"
          : verification?.failureReason === "revoked" ? "revoked"
            : verification?.failureReason === "invalid" ? "invalid"
              : configured ? verification ? "failed" : "configured" : "not-configured";
        const label = state === "checking" ? "Checking…" : state === "disconnected" ? "Disconnected locally"
          : state === "verified" ? `Verified healthy · ${verification?.verifiedAt}`
            : state === "revoked" ? "Revoked — verification failed"
              : state === "invalid" ? "Invalid authentication"
                : state === "failed" ? "Configured — authentication or health not verified"
                  : state === "configured" ? "Configured — not yet verified" : "Not configured";
        return <li key={provider.id} className={`provider-connections-list__row provider-connections-list__row--${state}`}>
          <span className="provider-connections-list__name">{provider.label}<small>{provider.modelId} · {provider.route}</small></span>
          <span className="provider-connections-list__status" data-testid={`provider-status-${provider.id}`}>{label}</span>
          {disconnected ? <button type="button" className="settings-btn secondary" onClick={() => void reconnect(provider)}>Reconnect & verify</button> : configured ? <>
            <button type="button" className="settings-btn secondary" onClick={() => void verify(provider)} disabled={checkingProvider === provider.id}>{verification ? "Verify again" : "Verify exact route"}</button>
            <button type="button" className="settings-btn secondary" onClick={() => void disconnect(provider)}>Disconnect</button>
          </> : <button type="button" className="settings-btn secondary" onClick={() => setSetupProvider(provider.id)}>Connect instructions</button>}
          {setupProvider === provider.id && <p role="status" className="settings-section__note">
            Configure {provider.keyName} in the server deployment, then use Refresh configuration and Verify exact route. This app does not request, create, display, or store provider credentials or OAuth applications.
          </p>}
        </li>;
      })}
    </ul>
  </div>;
}
