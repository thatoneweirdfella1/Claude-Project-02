import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProviderConnectionsPanel } from "./ProviderConnectionsPanel";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";
import * as providerStatus from "../../services/providerStatus";
import * as persistence from "../../services/persistence";

let root: Root | null = null;
let host: HTMLDivElement | null = null;

function mount() {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(<ProviderConnectionsPanel />));
}

async function flush() {
  await act(async () => { await Promise.resolve(); await Promise.resolve(); });
}

function row(id: string): HTMLLIElement {
  const status = host?.querySelector(`[data-testid='provider-status-${id}']`);
  const result = status?.closest("li");
  if (!(result instanceof HTMLLIElement)) throw new Error(`Missing ${id} row`);
  return result;
}

function click(li: Element, label: string) {
  const target = [...li.querySelectorAll("button")].find((item) => item.textContent === label);
  if (!(target instanceof HTMLButtonElement)) throw new Error(`Missing ${label}`);
  act(() => target.click());
}

afterEach(() => {
  act(() => root?.unmount());
  host?.remove(); root = null; host = null;
  useAccountStore.setState(createInitialAccountState());
  vi.restoreAllMocks();
});

describe("R26 provider connection lifecycle", () => {
  it("distinguishes configured from verified and carries the exact model route", async () => {
    vi.spyOn(providerStatus, "refreshProviderStatus").mockResolvedValue({ anthropic: false, openai: true, google: false, xai: false, deepseek: false });
    vi.spyOn(providerStatus, "verifyProviderRoute").mockResolvedValue({ providerId: "openai", modelId: "gpt-5.5", route: "/api/proxy-openai", configured: true, authenticated: true, healthy: true, verifiedAt: "now" });
    vi.spyOn(providerStatus, "reportProviderEvent").mockResolvedValue();
    mount(); await flush();
    expect(row("openai").textContent).toContain("Configured — not yet verified");
    expect(row("openai").textContent).toContain("gpt-5.5 · /api/proxy-openai");
    click(row("openai"), "Verify exact route"); await flush();
    expect(providerStatus.verifyProviderRoute).toHaveBeenCalledWith("openai", "gpt-5.5", "/api/proxy-openai");
    expect(row("openai").textContent).toContain("Verified healthy · now");
  });

  it("renders invalid and revoked verification failures exactly", async () => {
    vi.spyOn(providerStatus, "refreshProviderStatus").mockResolvedValue({ anthropic: false, openai: true, google: false, xai: false, deepseek: false });
    const verify = vi.spyOn(providerStatus, "verifyProviderRoute")
      .mockResolvedValueOnce({ providerId: "openai", modelId: "gpt-5.5", route: "/api/proxy-openai", configured: true, authenticated: false, healthy: false, verifiedAt: null, failureReason: "invalid" })
      .mockResolvedValueOnce({ providerId: "openai", modelId: "gpt-5.5", route: "/api/proxy-openai", configured: true, authenticated: false, healthy: false, verifiedAt: null, failureReason: "revoked" });
    vi.spyOn(providerStatus, "reportProviderEvent").mockResolvedValue();
    mount(); await flush(); click(row("openai"), "Verify exact route"); await flush();
    expect(row("openai").textContent).toContain("Invalid authentication");
    click(row("openai"), "Verify again"); await flush();
    expect(row("openai").textContent).toContain("Revoked — verification failed");
    expect(verify).toHaveBeenCalledTimes(2);
  });

  it("offers credential-safe connect instructions only when not configured", async () => {
    vi.spyOn(providerStatus, "refreshProviderStatus").mockResolvedValue({ anthropic: false, openai: false, google: false, xai: false, deepseek: false });
    mount(); await flush(); click(row("anthropic"), "Connect instructions");
    expect(row("anthropic").textContent).toContain("Configure ANTHROPIC_API_KEY in the server deployment");
    expect(row("anthropic").textContent).toContain("does not request, create, display, or store provider credentials");
  });

  it("disconnects, then reconnects and verifies rather than merely flipping a label", async () => {
    vi.spyOn(providerStatus, "refreshProviderStatus").mockResolvedValue({ anthropic: false, openai: true, google: false, xai: false, deepseek: false });
    vi.spyOn(providerStatus, "verifyProviderRoute").mockResolvedValue({ providerId: "openai", modelId: "gpt-5.5", route: "/api/proxy-openai", configured: true, authenticated: true, healthy: true, verifiedAt: "now" });
    const report = vi.spyOn(providerStatus, "reportProviderEvent").mockResolvedValue();
    vi.spyOn(persistence, "saveNow").mockResolvedValue();
    mount(); await flush(); click(row("openai"), "Disconnect"); await flush();
    expect(useAccountStore.getState().disconnectedProviders).toContain("openai");
    expect(row("openai").textContent).toContain("Disconnected locally");
    click(row("openai"), "Reconnect & verify"); await flush();
    expect(useAccountStore.getState().disconnectedProviders).not.toContain("openai");
    expect(providerStatus.verifyProviderRoute).toHaveBeenCalled();
    expect(report).toHaveBeenCalledWith("connected");
    expect(row("openai").textContent).toContain("Verified healthy");
  });

  it("refreshes configuration and clears prior verification evidence", async () => {
    const refresh = vi.spyOn(providerStatus, "refreshProviderStatus").mockResolvedValue({ anthropic: false, openai: true, google: false, xai: false, deepseek: false });
    vi.spyOn(providerStatus, "verifyProviderRoute").mockResolvedValue({ providerId: "openai", modelId: "gpt-5.5", route: "/api/proxy-openai", configured: true, authenticated: true, healthy: true, verifiedAt: "now" });
    vi.spyOn(providerStatus, "reportProviderEvent").mockResolvedValue();
    mount(); await flush(); click(row("openai"), "Verify exact route"); await flush();
    const refreshButton = host?.querySelector("[data-testid='provider-connections-refresh']");
    if (!(refreshButton instanceof HTMLButtonElement)) throw new Error("Missing refresh");
    act(() => refreshButton.click()); await flush();
    expect(refresh).toHaveBeenCalledTimes(2);
    expect(row("openai").textContent).toContain("Configured — not yet verified");
  });
});
