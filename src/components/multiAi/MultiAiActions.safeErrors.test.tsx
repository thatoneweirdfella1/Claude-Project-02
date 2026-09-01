import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MultiAiActions } from "./MultiAiActions";
import { createInitialSessionState, useSessionStore } from "../../stores/sessionStore";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";

/* R13 second-pass correction: categorizeProviderError() existed and was unit
   tested in isolation, but nothing in the real app ever called it — every
   real failure path (this component included) built its "X failed" string
   straight from the caught error's own `.message`, which for a proxy/network
   failure can carry a raw HTTP status and up to 200 characters of raw
   provider response body (services/proxyClient.ts). This proves the fix
   through a real mounted component and a genuine .click() — never
   evaluate()/dispatchEvent()/a direct store read of the error text. */

vi.mock("../../services/creditAuthorization", () => ({
  authorizeEstimatedCost: vi.fn(async () => ({ authorized: true })),
  markDeferredAuthorizationUnknown: vi.fn(async () => true),
  releaseDeferredAuthorization: vi.fn(async () => true),
  settleDeferredAuthorization: vi.fn(async () => true),
}));
vi.mock("../../services/routeReadiness", () => ({
  isProviderConnected: vi.fn(async () => true),
}));
vi.mock("../../services/providerStatus", () => ({
  reportProviderEvent: vi.fn(async () => undefined),
}));
vi.mock("../../services/costTracking", () => ({
  addTokenUsage: vi.fn(),
  getEstimatedCostForCall: vi.fn(() => 0.01),
}));
vi.mock("../../services/proxyClient", () => ({
  createProxyClient: () => ({ complete: vi.fn(async () => "") }),
}));

const runDebate = vi.fn();
vi.mock("../../services/debate", async () => {
  const actual = await vi.importActual<typeof import("../../services/debate")>("../../services/debate");
  return {
    ...actual,
    runDebate: (...args: unknown[]) => runDebate(...args),
    retryDebateSide: vi.fn(),
    createPartnerClient: () => ({}),
    withDebateUsage: (fn: unknown) => fn,
  };
});

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
  runDebate.mockReset();
});

describe("R13: MultiAiActions surfaces only safe, categorized failure text", () => {
  it("a structured proxy failure (status + raw response body) never reaches the rendered actionError text", async () => {
    useAccountStore.setState({ appMode: "developer" });
    useSessionStore.setState({
      conversation: [
        { id: "u1", role: "user", content: "what temperature does water boil at", timestamp: Date.now() },
      ],
    });
    // Shaped exactly like the real proxyClient.ts's ProxyClientError: a
    // numeric .status plus a raw, secret-looking response body on .detail —
    // the detail must never be read by the categorizer or reach the DOM.
    runDebate.mockRejectedValue(
      Object.assign(new Error("Proxy call failed (401)"), {
        status: 401,
        detail: "unauthorized: key sk-live-abcdef1234567890 rejected by upstream",
      }),
    );

    const container = mount(<MultiAiActions />);
    act(() => container.querySelector<HTMLButtonElement>(".multi-ai-actions__toggle")?.click());
    await flush();

    const startButton = [...container.querySelectorAll("button")].find((b) => b.textContent === "Start debate");
    act(() => startButton?.click());
    await flush();
    await flush();

    const text = container.textContent ?? "";
    expect(text).not.toContain("401");
    expect(text).not.toContain("sk-live");
    expect(text).not.toContain("upstream");
    expect(text).not.toContain("unauthorized:");
    expect(text).toContain("Debate failed: Authentication failed.");
    expect(text).toContain("Reconnect this provider in Settings");
  });
});
