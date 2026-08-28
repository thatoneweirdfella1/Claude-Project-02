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
import { getProviderStatus, type ConnectedProviderId } from "./providerStatus";

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
      label: "Local preparation — no provider connection required",
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
      label: `${destination.providerId} isn't set up for automatic verification yet — use manual handoff`,
    };
  }

  const available = await getProviderStatus(destination.providerId);
  if (!available) {
    return {
      state: "unavailable",
      providerId: destination.providerId,
      modelId: destination.modelId,
      verified: false,
      label: `${destination.providerId} is not connected — use manual handoff instead`,
    };
  }

  return {
    state: "ready",
    providerId: destination.providerId,
    modelId: destination.modelId,
    verified: true,
    label: `${destination.providerId} verified and ready`,
  };
}
