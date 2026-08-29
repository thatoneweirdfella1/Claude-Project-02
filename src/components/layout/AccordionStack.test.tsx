import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AccordionStack } from "./AccordionStack";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";
import { createInitialSessionState, useSessionStore } from "../../stores/sessionStore";
import * as providerStatus from "../../services/providerStatus";

/* R25: Connected Execution Truth — the AI Status panel's "Route status" line
   must reflect a real, verified health check, never a hardcoded "ready". */

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
  useSessionStore.setState(createInitialSessionState());
  useAccountStore.setState(createInitialAccountState());
  vi.restoreAllMocks();
});

function openAiStatusPanel() {
  const header = [...(host?.querySelectorAll("button.accordion-panel__header") ?? [])]
    .find((el) => el.textContent?.includes("AI Status"));
  if (!header) throw new Error("AI Status panel header not found");
  act(() => header.dispatchEvent(new MouseEvent("click", { bubbles: true })));
}

describe("R25: AI Status readiness (AccordionStack)", () => {
  it("shows 'Checking…' before the health check resolves — never a premature ready claim", async () => {
    let resolveStatus!: (value: boolean) => void;
    vi.spyOn(providerStatus, "getProviderStatus").mockReturnValue(
      new Promise((resolve) => { resolveStatus = resolve; }),
    );
    useSessionStore.setState({ destination: { providerId: "anthropic", modelId: "claude-sonnet-5" } });

    mount(<AccordionStack />);
    openAiStatusPanel();

    const readiness = host?.querySelector("[data-testid='ai-status-readiness']");
    expect(readiness?.textContent).toBe("Checking…");

    resolveStatus(true);
    await flush();
  });

  it("shows a verified-ready label only once the health check confirms the provider", async () => {
    vi.spyOn(providerStatus, "getProviderStatus").mockResolvedValue(true);
    useSessionStore.setState({ destination: { providerId: "anthropic", modelId: "claude-sonnet-5" } });

    mount(<AccordionStack />);
    openAiStatusPanel();
    await flush();

    const readiness = host?.querySelector("[data-testid='ai-status-readiness']");
    expect(readiness?.textContent).toContain("verified and ready");
    expect(readiness?.className).toContain("accordion-stats__readiness--ready");
  });

  it("fails closed: an unavailable provider never shows a ready-looking label", async () => {
    vi.spyOn(providerStatus, "getProviderStatus").mockResolvedValue(false);
    useSessionStore.setState({ destination: { providerId: "openai", modelId: "gpt-5.5" } });

    mount(<AccordionStack />);
    openAiStatusPanel();
    await flush();

    const readiness = host?.querySelector("[data-testid='ai-status-readiness']");
    expect(readiness?.textContent).toContain("not connected");
    expect(readiness?.className).toContain("accordion-stats__readiness--unavailable");
  });

  it("local/universal routes are always ready without claiming any external verification", async () => {
    const spy = vi.spyOn(providerStatus, "getProviderStatus");
    useSessionStore.setState({ destination: { providerId: "universal", modelId: "universal" } });

    mount(<AccordionStack />);
    openAiStatusPanel();
    await flush();

    const readiness = host?.querySelector("[data-testid='ai-status-readiness']");
    expect(readiness?.textContent).toContain("Local preparation");
    expect(spy).not.toHaveBeenCalled();
  });

  it("re-checks readiness when the destination provider changes", async () => {
    const spy = vi.spyOn(providerStatus, "getProviderStatus").mockResolvedValue(true);
    useSessionStore.setState({ destination: { providerId: "anthropic", modelId: "claude-sonnet-5" } });

    mount(<AccordionStack />);
    openAiStatusPanel();
    await flush();
    expect(spy).toHaveBeenCalledWith("anthropic");

    act(() => useSessionStore.setState({ destination: { providerId: "google", modelId: "gemini-3.1-pro" } }));
    await flush();
    expect(spy).toHaveBeenCalledWith("google");
  });
});
