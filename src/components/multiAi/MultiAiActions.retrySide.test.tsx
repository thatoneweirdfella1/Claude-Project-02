import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MultiAiActions } from "./MultiAiActions";
import { createInitialSessionState, useSessionStore } from "../../stores/sessionStore";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";
import type { DebateSide } from "../../services/debate";

/* R12 second-pass correction: retrySide() previously had no try/finally at
   all, so (a) an unexpected throw left `retrying` stuck non-null forever —
   that side's retry control permanently disabled with no visible recovery —
   and (b) because controllerRef is shared across every in-flight op (not
   per side), starting a retry on a DIFFERENT still-failed side aborts the
   first one via controllerRef.current?.abort(), but the first retry's own
   promise still eventually settles and, with no guard, cleared `retrying`
   out from under the second (still in-flight) retry's own busy indicator.
   Both are exercised here through real rendered DOM state (button text,
   disabled attribute) driven by genuine .click() calls — never
   evaluate()/dispatchEvent()/direct store mutation as the proof. */

vi.mock("../../services/creditAuthorization", () => ({
  authorizeEstimatedCost: vi.fn(async () => ({ authorized: true })),
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

const retryDebateSide = vi.fn();
vi.mock("../../services/debate", async () => {
  const actual = await vi.importActual<typeof import("../../services/debate")>("../../services/debate");
  return {
    ...actual,
    retryDebateSide: (...args: unknown[]) => retryDebateSide(...args),
    runDebate: vi.fn(),
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

function retryButtons(container: HTMLElement): HTMLButtonElement[] {
  return [...container.querySelectorAll(".debate-view__retry")] as HTMLButtonElement[];
}

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  useSessionStore.setState(createInitialSessionState());
  useAccountStore.setState(createInitialAccountState());
  retryDebateSide.mockReset();
});

describe("R12: MultiAiActions retrySide busy-state cleanup", () => {
  it("an unexpected throw during retry clears the busy state instead of leaving the control stuck disabled", async () => {
    useAccountStore.setState({ appMode: "developer" });
    let rejectRetry!: (err: unknown) => void;
    retryDebateSide.mockReturnValue(new Promise((_, reject) => { rejectRetry = reject; }));

    const { runDebate } = await import("../../services/debate");
    vi.mocked(runDebate).mockResolvedValue({
      status: "failed",
      sides: [
        { stance: "for", label: "GPT-5.5", partnerId: "gpt-5.5", status: "error", message: "Request failed" },
        { stance: "against", label: "Gemini 3.1 Pro", partnerId: "gemini-3.1-pro", status: "error", message: "Request failed" },
      ],
    });
    useSessionStore.setState({
      conversation: [
        { id: "u1", role: "user", content: "what temperature does water boil at", timestamp: Date.now() },
      ],
    });

    const container = mount(<MultiAiActions />);
    act(() => container.querySelector<HTMLButtonElement>(".multi-ai-actions__toggle")?.click());
    await flush();

    const startButton = [...container.querySelectorAll("button")].find((b) => b.textContent === "Start debate");
    act(() => startButton?.click());
    await flush();
    await flush();

    const buttons = retryButtons(container);
    expect(buttons.length).toBe(2);

    act(() => buttons[0].click());
    await flush();
    expect(buttons[0].disabled).toBe(true);
    expect(buttons[0].textContent).toBe("Retrying…");

    await act(async () => {
      rejectRetry(new Error("network exploded"));
      await Promise.resolve();
      await Promise.resolve();
    });

    const buttonsAfter = retryButtons(container);
    expect(buttonsAfter[0].disabled).toBe(false);
    expect(buttonsAfter[0].textContent).toBe("Try this side again");
    expect(container.textContent).toContain("Retry failed: network exploded");
  });

  it("a stale, superseded retry settling does not clear the busy state of the retry that replaced it", async () => {
    useAccountStore.setState({ appMode: "developer" });
    let resolveFirst!: (side: DebateSide) => void;
    let resolveSecond!: (side: DebateSide) => void;
    retryDebateSide
      .mockImplementationOnce(() => new Promise((resolve) => { resolveFirst = resolve; }))
      .mockImplementationOnce(() => new Promise((resolve) => { resolveSecond = resolve; }));

    const { runDebate } = await import("../../services/debate");
    vi.mocked(runDebate).mockResolvedValue({
      status: "failed",
      sides: [
        { stance: "for", label: "GPT-5.5", partnerId: "gpt-5.5", status: "error", message: "Request failed" },
        { stance: "against", label: "Gemini 3.1 Pro", partnerId: "gemini-3.1-pro", status: "error", message: "Request failed" },
      ],
    });
    useSessionStore.setState({
      conversation: [
        { id: "u1", role: "user", content: "what temperature does water boil at", timestamp: Date.now() },
      ],
    });

    const container = mount(<MultiAiActions />);
    act(() => container.querySelector<HTMLButtonElement>(".multi-ai-actions__toggle")?.click());
    await flush();
    const startButton = [...container.querySelectorAll("button")].find((b) => b.textContent === "Start debate");
    act(() => startButton?.click());
    await flush();
    await flush();

    const [retryA, retryB] = retryButtons(container);

    // Start retry on side A.
    act(() => retryA.click());
    await flush();
    expect(retryA.disabled).toBe(true);

    // Side B's own control is a genuinely separate, still-enabled button —
    // a real user can click it while A is still in flight.
    expect(retryB.disabled).toBe(false);
    act(() => retryB.click());
    await flush();
    expect(retryB.disabled).toBe(true);

    // A's stale promise now settles (its own controller was aborted when B
    // started, but the promise still resolves, as a real in-flight fetch
    // would). Without the controller-identity guard this used to wipe out
    // B's busy state.
    await act(async () => {
      resolveFirst({ stance: "for", label: "GPT-5.5", partnerId: "gpt-5.5", status: "ok", text: "answer A" });
      await Promise.resolve();
      await Promise.resolve();
    });

    const midButtons = retryButtons(container);
    expect(midButtons[1]?.disabled).toBe(true);
    expect(midButtons[1]?.textContent).toBe("Retrying…");

    await act(async () => {
      resolveSecond({ stance: "against", label: "Gemini 3.1 Pro", partnerId: "gemini-3.1-pro", status: "ok", text: "answer B" });
      await Promise.resolve();
      await Promise.resolve();
    });

    // A's own retry was superseded (its controller was aborted the moment B
    // started) — its stale result is correctly discarded, not applied, so A
    // stays in its original failed state with its retry control re-enabled.
    // Only B's genuinely-current retry result lands.
    const finalButtons = retryButtons(container);
    expect(finalButtons.length).toBe(1);
    expect(finalButtons[0].disabled).toBe(false);
    expect(finalButtons[0].textContent).toBe("Try this side again");
    expect(container.textContent).toContain("answer B");
    expect(container.textContent).not.toContain("answer A");
  });
});
