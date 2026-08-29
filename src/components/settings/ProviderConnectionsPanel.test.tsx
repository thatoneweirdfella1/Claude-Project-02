import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProviderConnectionsPanel } from "./ProviderConnectionsPanel";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";
import * as providerStatus from "../../services/providerStatus";

/* R26: Provider Connection Lifecycle — verify, disconnect, reconnect must
   all be real, discoverable controls with exact per-provider status, not
   static text. */

let root: Root | null = null;
let host: HTMLDivElement | null = null;

function mount(node: React.ReactNode) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(node));
  return host;
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  useAccountStore.setState(createInitialAccountState());
  vi.restoreAllMocks();
});

function row(providerId: string) {
  const status = host?.querySelector(`[data-testid='provider-status-${providerId}']`);
  if (!status) throw new Error(`Missing status for ${providerId}`);
  return status.closest("li");
}

function button(li: Element | null, label: string) {
  const match = [...(li?.querySelectorAll("button") ?? [])].find((b) => b.textContent === label);
  if (!(match instanceof HTMLButtonElement)) throw new Error(`Missing "${label}" button`);
  return match;
}

describe("R26: ProviderConnectionsPanel", () => {
  it("checks real status for every provider on mount", async () => {
    const spy = vi.spyOn(providerStatus, "refreshProviderStatus").mockResolvedValue({
      anthropic: true, openai: false, google: true, xai: false, deepseek: false,
    });

    mount(<ProviderConnectionsPanel />);
    await flush();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(row("anthropic")?.textContent).toContain("Connected — verified");
    expect(row("openai")?.textContent).toContain("Not connected");
  });

  it("Refresh status re-runs the real health check", async () => {
    const spy = vi.spyOn(providerStatus, "refreshProviderStatus").mockResolvedValue({
      anthropic: true, openai: true, google: true, xai: true, deepseek: true,
    });

    mount(<ProviderConnectionsPanel />);
    await flush();
    expect(spy).toHaveBeenCalledTimes(1);

    const refreshButton = host?.querySelector("[data-testid='provider-connections-refresh']");
    act(() => refreshButton?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    await flush();

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it("Disconnect on a connected provider adds it to accountStore.disconnectedProviders", async () => {
    vi.spyOn(providerStatus, "refreshProviderStatus").mockResolvedValue({
      anthropic: true, openai: true, google: true, xai: true, deepseek: true,
    });
    mount(<ProviderConnectionsPanel />);
    await flush();

    const openaiRow = row("openai");
    act(() => button(openaiRow, "Disconnect").dispatchEvent(new MouseEvent("click", { bubbles: true })));

    expect(useAccountStore.getState().disconnectedProviders).toContain("openai");
  });

  it("a disconnected provider shows 'Disconnected' even though the server reports it available", async () => {
    vi.spyOn(providerStatus, "refreshProviderStatus").mockResolvedValue({
      anthropic: true, openai: true, google: true, xai: true, deepseek: true,
    });
    act(() => useAccountStore.getState().disconnectProvider("openai"));

    mount(<ProviderConnectionsPanel />);
    await flush();

    expect(row("openai")?.textContent).toContain("Disconnected");
  });

  it("Reconnect removes the provider from disconnectedProviders", async () => {
    vi.spyOn(providerStatus, "refreshProviderStatus").mockResolvedValue({
      anthropic: true, openai: true, google: true, xai: true, deepseek: true,
    });
    act(() => useAccountStore.getState().disconnectProvider("openai"));

    mount(<ProviderConnectionsPanel />);
    await flush();

    const openaiRow = row("openai");
    act(() => button(openaiRow, "Reconnect").dispatchEvent(new MouseEvent("click", { bubbles: true })));

    expect(useAccountStore.getState().disconnectedProviders).not.toContain("openai");
  });

  /* R11 second-pass correction: the first pass built providerStatus.ts's
     cache-invalidation function (reportProviderEvent) and unit-tested it
     in isolation, but never actually wired it to fire from any real user
     action — "after connect, verify, disconnect, failed execution, and
     manual refresh" (the requirement's own wording) was only true for
     manual refresh. Disconnect/reconnect here now call it too (see
     ProviderConnectionsPanel.tsx), verified below with a real click. */
  it("R11: Disconnect invalidates the cached provider status, not just the disconnectedProviders list", async () => {
    vi.spyOn(providerStatus, "refreshProviderStatus").mockResolvedValue({
      anthropic: true, openai: true, google: true, xai: true, deepseek: true,
    });
    const reportSpy = vi.spyOn(providerStatus, "reportProviderEvent").mockResolvedValue(undefined);

    mount(<ProviderConnectionsPanel />);
    await flush();

    const openaiRow = row("openai");
    button(openaiRow, "Disconnect").click();

    expect(reportSpy).toHaveBeenCalledWith("disconnected");
  });

  it("R11: Reconnect invalidates the cached provider status and re-verifies immediately", async () => {
    vi.spyOn(providerStatus, "refreshProviderStatus").mockResolvedValue({
      anthropic: true, openai: true, google: true, xai: true, deepseek: true,
    });
    const reportSpy = vi.spyOn(providerStatus, "reportProviderEvent").mockResolvedValue(undefined);
    act(() => useAccountStore.getState().disconnectProvider("openai"));

    mount(<ProviderConnectionsPanel />);
    await flush();
    const refreshCallsBeforeReconnect = vi.mocked(providerStatus.refreshProviderStatus).mock.calls.length;

    const openaiRow = row("openai");
    button(openaiRow, "Reconnect").click();
    await flush();

    expect(reportSpy).toHaveBeenCalledWith("connected");
    // Reconnect doesn't just flip a flag — it re-runs the real health check
    // immediately, the same "verify" action the Refresh button performs.
    expect(vi.mocked(providerStatus.refreshProviderStatus).mock.calls.length).toBeGreaterThan(refreshCallsBeforeReconnect);
  });

  it("shows 'Checking…' while the health check is in flight", () => {
    vi.spyOn(providerStatus, "refreshProviderStatus").mockReturnValue(new Promise(() => {}));
    mount(<ProviderConnectionsPanel />);

    expect(row("anthropic")?.textContent).toContain("Checking…");
  });
});
