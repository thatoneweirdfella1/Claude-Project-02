/* R26: Provider Connection Lifecycle — disconnect/reconnect state, the one
   lifecycle action a client without credential storage can genuinely
   perform, must persist and be honored elsewhere (routeReadiness). */

import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { createInitialAccountState, useAccountStore } from "./accountStore";
import { computeRouteReadiness, isProviderConnected } from "../services/routeReadiness";
import * as providerStatus from "../services/providerStatus";

function resetStore() {
  useAccountStore.setState(createInitialAccountState());
}

beforeEach(resetStore);
afterEach(() => {
  vi.restoreAllMocks();
});

describe("R26: accountStore disconnect/reconnect", () => {
  it("disconnectProvider adds the provider id, idempotently", () => {
    useAccountStore.getState().disconnectProvider("openai");
    useAccountStore.getState().disconnectProvider("openai");
    expect(useAccountStore.getState().disconnectedProviders).toEqual(["openai"]);
  });

  it("reconnectProvider removes the provider id", () => {
    useAccountStore.getState().disconnectProvider("openai");
    useAccountStore.getState().reconnectProvider("openai");
    expect(useAccountStore.getState().disconnectedProviders).toEqual([]);
  });

  it("reconnectProvider on a never-disconnected provider is a harmless no-op", () => {
    useAccountStore.getState().reconnectProvider("anthropic");
    expect(useAccountStore.getState().disconnectedProviders).toEqual([]);
  });

  it("tracks multiple disconnected providers independently", () => {
    useAccountStore.getState().disconnectProvider("openai");
    useAccountStore.getState().disconnectProvider("google");
    expect(useAccountStore.getState().disconnectedProviders.sort()).toEqual(["google", "openai"]);

    useAccountStore.getState().reconnectProvider("openai");
    expect(useAccountStore.getState().disconnectedProviders).toEqual(["google"]);
  });

  it("hydrate restores disconnectedProviders from a saved snapshot", () => {
    useAccountStore.getState().disconnectProvider("xai");
    const saved = useAccountStore.getState().disconnectedProviders;

    resetStore();
    expect(useAccountStore.getState().disconnectedProviders).toEqual([]);

    useAccountStore.getState().hydrate({ disconnectedProviders: saved });
    expect(useAccountStore.getState().disconnectedProviders).toEqual(["xai"]);
  });
});

describe("R26: disconnect is honored by routeReadiness — not cosmetic", () => {
  it("isProviderConnected returns false for a disconnected provider even when the server reports it available", async () => {
    vi.spyOn(providerStatus, "getProviderStatus").mockResolvedValue(true);
    useAccountStore.getState().disconnectProvider("anthropic");

    expect(await isProviderConnected("anthropic")).toBe(false);
  });

  it("isProviderConnected returns true again after reconnecting", async () => {
    vi.spyOn(providerStatus, "getProviderStatus").mockResolvedValue(true);
    useAccountStore.getState().disconnectProvider("anthropic");
    useAccountStore.getState().reconnectProvider("anthropic");

    expect(await isProviderConnected("anthropic")).toBe(true);
  });

  it("computeRouteReadiness reports 'not-configured' (never 'ready') for a disconnected destination", async () => {
    vi.spyOn(providerStatus, "getProviderStatus").mockResolvedValue(true);
    useAccountStore.getState().disconnectProvider("openai");

    const readiness = await computeRouteReadiness({ providerId: "openai", modelId: "gpt-5.5" });
    expect(readiness.state).toBe("not-configured");
    expect(readiness.verified).toBe(false);
    expect(readiness.label).toContain("disconnected");
  });
});
