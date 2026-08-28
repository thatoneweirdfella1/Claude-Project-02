/* R25: Connected Execution Truth — a single place that derives a route's
   real readiness from provider, model, and verified health, instead of
   letting each screen guess its own "ready" label from static config.

   FAIL CLOSED: any provider this service cannot verify (not in
   ConnectedProviderId, or a failed/uncached health check) reports
   "unavailable", never "ready" — a route never claims readiness it hasn't
   actually confirmed. The universal/local/custom routes are the one
   deliberate exception: they do local preparation only and never claim an
   external provider connection, so they're always "ready" without a health
   check (there is nothing external to verify) — retained as the manual
   alternative every unavailable/not-configured state can fall back to. */

import type { DestinationSelection, DestinationProviderId } from "../stores/types";
import { useAccountStore } from "../stores/accountStore";
import { getProviderStatus, type ConnectedProviderId } from "./providerStatus";
import { WORKFLOW_STAGE_LABEL } from "./workflowVocabulary";

/* R29: every label below is built from WORKFLOW_STAGE_LABEL's "verified" and
   "manual-handoff" terms rather than writing those words out ad hoc — the
   same wording other screens (Settings' Provider Connections, Multi-AI run
   history) also pull from, so "verified" and "manual handoff" never drift
   into slightly different phrases across the app. */
const VERIFIED_TERM = WORKFLOW_STAGE_LABEL.verified.toLowerCase();
const MANUAL_HANDOFF_TERM = WORKFLOW_STAGE_LABEL["manual-handoff"].toLowerCase();

export type ReadinessState = "ready" | "checking" | "not-configured" | "unavailable";

export interface RouteReadiness {
  state: ReadinessState;
  providerId: DestinationProviderId;
  modelId: string;
  /** True only once a real health check confirmed this provider is reachable
      right now — never inferred from configuration alone. */
  verified: boolean;
  /** Human-readable, honest status line. Never claims "ready" without
      `verified` being true (except the local/universal/custom routes, which
      have no external provider to verify in the first place). */
  label: string;
}

const CONNECTED_PROVIDER_IDS: ReadonlySet<string> = new Set<ConnectedProviderId>([
  "anthropic", "openai", "google", "xai", "deepseek",
]);

function isConnectedProviderId(id: DestinationProviderId): id is ConnectedProviderId {
  return CONNECTED_PROVIDER_IDS.has(id);
}

/** Local-preparation routes: no external provider is contacted, so there is
    nothing to verify — this is the manual alternative R25 requires be kept
    available even when every connected provider is unavailable. */
const LOCAL_ROUTE_IDS: ReadonlySet<DestinationProviderId> = new Set(["universal", "local", "custom"]);

export async function computeRouteReadiness(
  destination: DestinationSelection,
): Promise<RouteReadiness> {
  if (LOCAL_ROUTE_IDS.has(destination.providerId)) {
    return {
      state: "ready",
      providerId: destination.providerId,
      modelId: destination.modelId,
      verified: false,
      label: `${WORKFLOW_STAGE_LABEL["local-preparation"]} — no provider connection required`,
    };
  }

  if (!isConnectedProviderId(destination.providerId)) {
    // A provider this build has no health-check route for at all. Fail
    // closed rather than guessing it's fine.
    return {
      state: "not-configured",
      providerId: destination.providerId,
      modelId: destination.modelId,
      verified: false,
      label: `${destination.providerId} isn't set up for automatic verification yet — use ${MANUAL_HANDOFF_TERM}`,
    };
  }

  // R26: a provider the user explicitly disconnected client-side is never
  // "ready", even if the server still reports it configured — disconnect
  // is a real, honored lifecycle action, not a cosmetic label.
  if (useAccountStore.getState().disconnectedProviders.includes(destination.providerId)) {
    return {
      state: "not-configured",
      providerId: destination.providerId,
      modelId: destination.modelId,
      verified: false,
      label: `${destination.providerId} is disconnected — reconnect it in Settings, or use ${MANUAL_HANDOFF_TERM}`,
    };
  }

  const available = await getProviderStatus(destination.providerId);
  if (!available) {
    return {
      state: "unavailable",
      providerId: destination.providerId,
      modelId: destination.modelId,
      verified: false,
      label: `${destination.providerId} is not connected — use ${MANUAL_HANDOFF_TERM} instead`,
    };
  }

  return {
    state: "ready",
    providerId: destination.providerId,
    modelId: destination.modelId,
    verified: true,
    label: `${destination.providerId} ${VERIFIED_TERM} and ready`,
  };
}

/** R26: a provider is usable only when the server reports it configured AND
    the user hasn't explicitly disconnected it client-side. Used everywhere
    a route needs a plain yes/no on one specific connected provider (e.g.
    the Multi-AI debate partner gate) rather than the full readiness label
    above. */
export async function isProviderConnected(providerId: ConnectedProviderId): Promise<boolean> {
  if (useAccountStore.getState().disconnectedProviders.includes(providerId)) return false;
  return getProviderStatus(providerId);
}
