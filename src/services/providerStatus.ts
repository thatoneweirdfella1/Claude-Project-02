import { appAccessHeaders } from "./appAccessClient";

export type ConnectedProviderId = "anthropic" | "openai" | "google" | "xai" | "deepseek";
export type ProviderAvailability = Record<ConnectedProviderId, boolean>;

interface CachedStatus {
  availability: ProviderAvailability;
  timestamp: number;
}

const NONE: ProviderAvailability = {
  anthropic: false,
  openai: false,
  google: false,
  xai: false,
  deepseek: false,
};

const CACHE_TTL_MS = 60_000; // 1 minute — refresh after that time elapses

let cached: CachedStatus | null = null;
let pendingFetch: Promise<ProviderAvailability> | null = null;

/** Check if cached status is still fresh (within TTL). */
function isCacheFresh(): boolean {
  if (!cached) return false;
  const ageMs = Date.now() - cached.timestamp;
  return ageMs < CACHE_TTL_MS;
}

/** Invalidate cache immediately (e.g., on connect/disconnect/error). */
export function invalidateProviderCache(): void {
  cached = null;
  pendingFetch = null;
}

/** Fetch fresh provider status from server. Never returns stale cached data. */
export async function getProviderAvailability(fetchImpl: typeof fetch = fetch): Promise<ProviderAvailability> {
  // If we have a pending fetch for the default fetch, return it to dedupe
  if (fetchImpl === fetch && pendingFetch) return pendingFetch;

  const request = (async () => {
    try {
      const response = await fetchImpl("/api/provider-status", {
        method: "GET",
        headers: appAccessHeaders(),
      });
      if (!response.ok) return { ...NONE };
      const body = await response.json() as Partial<ProviderAvailability>;
      const availability = {
        anthropic: body.anthropic === true,
        openai: body.openai === true,
        google: body.google === true,
        xai: body.xai === true,
        deepseek: body.deepseek === true,
      };

      // Cache the new status with timestamp
      if (fetchImpl === fetch) {
        cached = { availability, timestamp: Date.now() };
      }

      return availability;
    } catch {
      return { ...NONE };
    }
  })();

  if (fetchImpl === fetch) pendingFetch = request;
  const result = await request;
  if (fetchImpl === fetch) pendingFetch = null;
  return result;
}

/** Get provider status, returning fresh data if cache is stale. */
export async function getProviderStatus(provider: ConnectedProviderId): Promise<boolean> {
  // Always refresh if cache is stale
  if (!isCacheFresh()) {
    return (await getProviderAvailability())[provider];
  }
  // Use cached value if fresh
  if (cached) {
    return cached.availability[provider];
  }
  // Fallback: fetch if no cache at all
  return (await getProviderAvailability())[provider];
}

/** Force immediate refresh of provider status (manual refresh). */
export async function refreshProviderStatus(): Promise<ProviderAvailability> {
  invalidateProviderCache();
  return getProviderAvailability();
}

/** Report a provider connection event (connect, verify, disconnect, error).
    Invalidates cache immediately so next check fetches fresh status. */
export async function reportProviderEvent(_event: "connected" | "verified" | "disconnected" | "error"): Promise<void> {
  // Immediately invalidate to prevent stale state from authorizing calls
  invalidateProviderCache();
  // Optionally: could queue a refresh here, but client should call getProviderStatus() when needed
}

export async function providerAvailable(provider: ConnectedProviderId): Promise<boolean> {
  return getProviderStatus(provider);
}

export function _resetProviderAvailabilityForTests(): void {
  invalidateProviderCache();
}
