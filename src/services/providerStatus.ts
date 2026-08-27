import { appAccessHeaders } from "./appAccessClient";

export type ConnectedProviderId = "anthropic" | "openai" | "google" | "xai" | "deepseek";
export type ProviderAvailability = Record<ConnectedProviderId, boolean>;

const NONE: ProviderAvailability = { anthropic: false, openai: false, google: false, xai: false, deepseek: false };
let lastKnown: ProviderAvailability = { ...NONE };
let lastCheckedAt = 0;

/** Fetch exact current server readiness every time. A stale browser cache must
    never authorize a paid provider call after credentials are revoked or a
    route becomes unavailable. */
export async function getProviderAvailability(fetchImpl: typeof fetch = fetch): Promise<ProviderAvailability> {
  try {
    const response = await fetchImpl("/api/provider-status", { method: "GET", headers: appAccessHeaders(), cache: "no-store" });
    if (!response.ok) {
      lastKnown = { ...NONE };
      lastCheckedAt = Date.now();
      return { ...lastKnown };
    }
    const body = await response.json() as Partial<ProviderAvailability>;
    lastKnown = {
      anthropic: body.anthropic === true,
      openai: body.openai === true,
      google: body.google === true,
      xai: body.xai === true,
      deepseek: body.deepseek === true,
    };
    lastCheckedAt = Date.now();
    return { ...lastKnown };
  } catch {
    lastKnown = { ...NONE };
    lastCheckedAt = Date.now();
    return { ...lastKnown };
  }
}

export async function refreshProviderAvailability(fetchImpl: typeof fetch = fetch): Promise<ProviderAvailability> {
  return getProviderAvailability(fetchImpl);
}

export async function providerAvailable(provider: ConnectedProviderId): Promise<boolean> {
  return (await getProviderAvailability())[provider];
}

export function getLastKnownProviderAvailability(): { availability: ProviderAvailability; checkedAt: number } {
  return { availability: { ...lastKnown }, checkedAt: lastCheckedAt };
}

export function _resetProviderAvailabilityForTests(): void {
  lastKnown = { ...NONE };
  lastCheckedAt = 0;
}
