import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MultiAiActions } from "./MultiAiActions";
import { createInitialSessionState, useSessionStore } from "../../stores/sessionStore";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";
import { ConversationArea } from "../translation/ConversationArea";

/* R15 second-pass correction: MultiAiRunHistory renders "Estimated ... ·
   Actual ..." per participant and a run-level "Total — estimated ... ·
   actual ..." line, both driven by MultiAiParticipantResult.estimatedCost/
   actualCost and MultiAiRunRecord.totalActualCost. Before this fix, every
   one of those was permanently null (client.ts hardcoded actualCost: null;
   nothing threaded the pre-call per-participant estimate back onto the
   persisted record) — so this whole line always rendered "cost unavailable"
   no matter how a debate actually went. This proves the fix through a real
   mounted component, a genuine .click(), and the real persisted store
   record + its real rendered text — not a direct store read/write. */

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

describe("R15: MultiAiActions persists and renders real per-participant and total actual cost", () => {
  it("shows real dollar amounts, never 'cost unavailable', once every participant's usage is known", async () => {
    useAccountStore.setState({ appMode: "developer" });
    useSessionStore.setState({
      conversation: [
        { id: "u1", role: "user", content: "what temperature does water boil at", timestamp: Date.now() },
      ],
    });

    // Shaped exactly like the real (fixed) client.ts output: actualCost is a
    // real, non-null number computed from the reported tokens.
    runDebate.mockResolvedValue({
      status: "complete",
      sides: [
        {
          stance: "for", label: "Claude", status: "ok", text: "Claude's argument.",
          usage: { provider: "anthropic", model: "claude-sonnet-5", inputTokens: 500, outputTokens: 300, estimatedCost: null, actualCost: 0.0069 },
        },
        {
          stance: "against", label: "GPT-5.5", partnerId: "gpt-5.5", status: "ok", text: "The partner's argument.",
          usage: { provider: "openai", model: "gpt-5.5", inputTokens: 420, outputTokens: 310, estimatedCost: null, actualCost: 0.005 },
        },
      ],
      transcript: {
        question: "what temperature does water boil at",
        participants: [
          { label: "Claude", text: "Claude's argument." },
          { label: "GPT-5.5", text: "The partner's argument." },
        ],
      },
    });

    const container = mount(<ConversationArea><MultiAiActions /></ConversationArea>);
    act(() => container.querySelector<HTMLButtonElement>(".multi-ai-actions__toggle")?.click());
    await flush();

    const startButton = [...container.querySelectorAll("button")].find((b) => b.textContent === "Start debate");
    act(() => startButton?.click());
    await flush();
    await flush();

    const run = useSessionStore.getState().multiAiRuns[0];
    expect(run).toBeDefined();
    expect(run.totalActualCost).toBeCloseTo(0.0069 + 0.005, 6);
    expect(run.participants.every((p) => p.estimatedCost !== null)).toBe(true);
    expect(run.participants.map((p) => p.actualCost)).toEqual([0.0069, 0.005]);

    // Real rendered text — MultiAiRunHistory reading straight from the store.
    const historyText = container.querySelector("[data-testid='multi-ai-run-history']")?.textContent ?? "";
    expect(historyText).not.toContain("cost unavailable");
    expect(historyText).toContain("Actual $0.0069");
    expect(historyText).toContain("Actual $0.0050");
    expect(historyText).toMatch(/Total — estimated \$0\.\d+ · actual \$0\.0119/);
  });

  it("keeps the total honestly unavailable when even one participant's actual cost is unknown (a failed side)", async () => {
    useAccountStore.setState({ appMode: "developer" });
    useSessionStore.setState({
      conversation: [
        { id: "u1", role: "user", content: "what temperature does water boil at", timestamp: Date.now() },
      ],
    });

    runDebate.mockResolvedValue({
      status: "partial",
      sides: [
        {
          stance: "for", label: "Claude", status: "ok", text: "Claude's argument.",
          usage: { provider: "anthropic", model: "claude-sonnet-5", inputTokens: 500, outputTokens: 300, estimatedCost: null, actualCost: 0.0069 },
        },
        { stance: "against", label: "GPT-5.5", partnerId: "gpt-5.5", status: "error", message: "Request failed" },
      ],
    });

    const container = mount(<ConversationArea><MultiAiActions /></ConversationArea>);
    act(() => container.querySelector<HTMLButtonElement>(".multi-ai-actions__toggle")?.click());
    await flush();

    const startButton = [...container.querySelectorAll("button")].find((b) => b.textContent === "Start debate");
    act(() => startButton?.click());
    await flush();
    await flush();

    const run = useSessionStore.getState().multiAiRuns[0];
    expect(run.totalActualCost).toBeNull();
    expect(run.participants[1]).toMatchObject({ provider: "openai", model: "gpt-5.5" });

    const historyText = container.querySelector("[data-testid='multi-ai-run-history']")?.textContent ?? "";
    expect(historyText).toMatch(/Total — estimated \$0\.\d+ · actual cost unavailable/);
  });
});
