import { useEffect, useState } from "react";
import { useAccountStore } from "../../stores/accountStore";
import {
  refreshProviderStatus,
  type ConnectedProviderId,
  type ProviderAvailability,
} from "../../services/providerStatus";

/* R26: Provider Connection Lifecycle — the "AI Connections" section used to
   be two lines of static text (current destination, a provider count) with
   no way to see or act on any single provider's actual connection state.

   This exposes exactly the lifecycle the work order approves:
   - Verify/refresh: a real health check (services/providerStatus.ts, R11's
     cached/TTL'd check) against /api/provider-status, re-run on demand.
   - Revoked/invalid: shown as-is from that check — never smoothed over.
   - Disconnect/reconnect: the one lifecycle action a client without
     credential storage can genuinely perform. Disconnecting adds the
     provider to accountStore.disconnectedProviders (R26), which
     routeReadiness.isProviderConnected and every Multi-AI provider gate
     honors — it is not a cosmetic toggle.

   Deliberately absent: any "Connect" button that would create or collect
   credentials. Real API keys are server-managed env vars per
   services/debate/client.ts's own architecture comment — this panel can
   verify and disconnect, never mint a connection from nothing. */

const PROVIDER_LABELS: Record<ConnectedProviderId, string> = {
  anthropic: "Anthropic (Claude)",
  openai: "OpenAI",
  google: "Google (Gemini)",
  xai: "xAI (Grok)",
  deepseek: "DeepSeek",
};

const PROVIDER_ORDER: ConnectedProviderId[] = ["anthropic", "openai", "google", "xai", "deepseek"];

type CheckState = "checking" | "checked";

export function ProviderConnectionsPanel() {
  const disconnectedProviders = useAccountStore((s) => s.disconnectedProviders);
  const disconnectProvider = useAccountStore((s) => s.disconnectProvider);
  const reconnectProvider = useAccountStore((s) => s.reconnectProvider);

  const [availability, setAvailability] = useState<ProviderAvailability | null>(null);
  const [checkState, setCheckState] = useState<CheckState>("checking");

  async function verify() {
    setCheckState("checking");
    const result = await refreshProviderStatus();
    setAvailability(result);
    setCheckState("checked");
  }

  useEffect(() => {
    void verify();
  }, []);

  return (
    <div className="settings-section" data-testid="provider-connections-panel">
      <h3>AI Connections</h3>
      <p className="settings-section__note">
        Manual copy/open handoff works without connecting a provider. Verifying checks real
        configuration status only — it never sends a request to the AI model itself, and
        disconnecting never deletes or exposes any credential.
      </p>
      <button
        type="button"
        className="settings-btn secondary"
        onClick={() => void verify()}
        disabled={checkState === "checking"}
        data-testid="provider-connections-refresh"
      >
        {checkState === "checking" ? "Checking…" : "Refresh status"}
      </button>

      <ul className="provider-connections-list">
        {PROVIDER_ORDER.map((id) => {
          const disconnected = disconnectedProviders.includes(id);
          const serverAvailable = availability?.[id] ?? false;
          const state: "checking" | "disconnected" | "unavailable" | "connected" =
            checkState === "checking" ? "checking"
              : disconnected ? "disconnected"
                : serverAvailable ? "connected"
                  : "unavailable";
          const label =
            state === "checking" ? "Checking…"
              : state === "disconnected" ? "Disconnected"
                : state === "connected" ? "Connected — verified"
                  : "Not connected";

          return (
            <li key={id} className={`provider-connections-list__row provider-connections-list__row--${state}`}>
              <span className="provider-connections-list__name">{PROVIDER_LABELS[id]}</span>
              <span className="provider-connections-list__status" data-testid={`provider-status-${id}`}>{label}</span>
              {disconnected ? (
                <button type="button" className="settings-btn secondary" onClick={() => reconnectProvider(id)}>
                  Reconnect
                </button>
              ) : (
                <button type="button" className="settings-btn secondary" onClick={() => disconnectProvider(id)}>
                  Disconnect
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
