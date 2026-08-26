import { appAccessHeaders } from "./appAccessClient";

export type ConnectedProviderId = "anthropic" | "openai" | "google" | "xai" | "deepseek";
export type ProviderAvailability = Record<ConnectedProviderId, boolean>;

const NONE: ProviderAvailability = {
  anthropic: false,
  openai: false,
  google: false,
  xai: false,
  deepseek: false,
};

let cached: Promise<ProviderAvailability> | null = null;

export async function getProviderAvailability(fetchImpl: typeof fetch = fetch): Promise<ProviderAvailability> {
  if (fetchImpl === fetch && cached) return cached;
  const request = (async () => {
    try {
      const response = await fetchImpl("/api/provider-status", {
        method: "GET",
        headers: appAccessHeaders(),
      });
      if (!response.ok) return { ...NONE };
      const body = await response.json() as Partial<ProviderAvailability>;
      return {
        anthropic: body.anthropic === true,
        openai: body.openai === true,
        google: body.google === true,
        xai: body.xai === true,
        deepseek: body.deepseek === true,
      };
    } catch {
      return { ...NONE };
    }
  })();
  if (fetchImpl === fetch) cached = request;
  return request;
}

export async function providerAvailable(provider: ConnectedProviderId): Promise<boolean> {
  return (await getProviderAvailability())[provider];
}

export function _resetProviderAvailabilityForTests(): void {
  cached = null;
}
