/* R25: Connected Execution Truth — readiness must be derived from verified
   provider health, never assumed true, and must fail closed while keeping
   the local/manual alternative always available. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { computeRouteReadiness } from "./routeReadiness";
import * as providerStatus from "./providerStatus";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("R25: computeRouteReadiness", () => {
  it("reports 'ready' with verified=true only after a real health check confirms the provider", async () => {
    vi.spyOn(providerStatus, "verifyProviderRoute").mockResolvedValue({
      providerId: "anthropic", modelId: "claude-sonnet-5", route: "/api/proxy",
      configured: true, authenticated: true, healthy: true, verifiedAt: "2026-09-01T00:00:00Z",
    });

    const readiness = await computeRouteReadiness({ providerId: "anthropic", modelId: "claude-sonnet-5" });

    expect(readiness.state).toBe("ready");
    expect(readiness.verified).toBe(true);
    expect(providerStatus.verifyProviderRoute).toHaveBeenCalledWith("anthropic", "claude-sonnet-5", "/api/proxy");
  });

  it("fails closed (never 'ready') when the health check reports the provider unavailable", async () => {
    vi.spyOn(providerStatus, "verifyProviderRoute").mockResolvedValue({
      providerId: "openai", modelId: "gpt-5", route: "/api/proxy-openai",
      configured: false, authenticated: false, healthy: false, verifiedAt: null,
    });

    const readiness = await computeRouteReadiness({ providerId: "openai", modelId: "gpt-5.5" });

    expect(readiness.state).toBe("unavailable");
    expect(readiness.verified).toBe(false);
    expect(readiness.label).toContain("not connected");
  });

  it("fails closed for a provider this build cannot verify at all (no health-check route)", async () => {
    const spy = vi.spyOn(providerStatus, "verifyProviderRoute");
    const readiness = await computeRouteReadiness({ providerId: "mistral", modelId: "some-model" });

    expect(readiness.state).toBe("not-configured");
    expect(readiness.verified).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it("keeps the local/manual alternative always ready, with no external verification claimed", async () => {
    const spy = vi.spyOn(providerStatus, "verifyProviderRoute");
    const readiness = await computeRouteReadiness({ providerId: "universal", modelId: "universal" });

    expect(readiness.state).toBe("ready");
    expect(readiness.verified).toBe(false); // honest: nothing external was verified
    expect(spy).not.toHaveBeenCalled();
  });

  it("keeps the local route ready even when a network/provider-status call would fail", async () => {
    vi.spyOn(providerStatus, "verifyProviderRoute").mockRejectedValue(new Error("network down"));
    const readiness = await computeRouteReadiness({ providerId: "local", modelId: "local" });
    expect(readiness.state).toBe("ready");
  });

  it("preserves the exact provider/model identity in the result — no substitution", async () => {
    vi.spyOn(providerStatus, "verifyProviderRoute").mockResolvedValue({
      providerId: "google", modelId: "gemini-3.1-pro", route: "/api/proxy-google",
      configured: true, authenticated: true, healthy: true, verifiedAt: "2026-09-01T00:00:00Z",
    });
    const readiness = await computeRouteReadiness({ providerId: "google", modelId: "gemini-3.1-pro" });
    expect(readiness.providerId).toBe("google");
    expect(readiness.modelId).toBe("gemini-3.1-pro");
  });

  it("does not call a configured route ready without authenticated, healthy evidence", async () => {
    vi.spyOn(providerStatus, "verifyProviderRoute").mockResolvedValue({
      providerId: "anthropic", modelId: "claude-sonnet-5", route: "/api/proxy",
      configured: true, authenticated: false, healthy: false, verifiedAt: null,
    });
    const readiness = await computeRouteReadiness({ providerId: "anthropic", modelId: "claude-sonnet-5" });
    expect(readiness.state).toBe("unavailable");
    expect(readiness.verified).toBe(false);
    expect(readiness.label).toContain("configured but not verified healthy");
  });
});
