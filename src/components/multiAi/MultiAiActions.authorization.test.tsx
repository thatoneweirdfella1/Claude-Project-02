import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MultiAiActions } from "./MultiAiActions";
import { createInitialSessionState, useSessionStore } from "../../stores/sessionStore";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";
import type { DebateOutcome } from "../../services/debate";

const mocks = vi.hoisted(() => ({
  complete: vi.fn(), debate: vi.fn(), consensus: vi.fn(), synthesis: vi.fn(),
  pending: vi.fn(async () => true), release: vi.fn(async () => true), settle: vi.fn(async () => true),
}));
vi.mock("../../services/creditAuthorization", () => ({
  authorizeEstimatedCost: vi.fn(async () => ({
    authorized: true, amount: 0.1, referenceId: "authorization-test", reservationId: "hold-test", deferredSettlement: true,
  })),
  markDeferredAuthorizationUnknown: mocks.pending,
  releaseDeferredAuthorization: mocks.release,
  settleDeferredAuthorization: mocks.settle,
}));
vi.mock("../../services/routeReadiness", () => ({ isProviderConnected: vi.fn(async () => true) }));
vi.mock("../../services/providerStatus", () => ({ reportProviderEvent: vi.fn(async () => undefined) }));
vi.mock("../../services/persistence", async () => ({
  ...await vi.importActual<typeof import("../../services/persistence")>("../../services/persistence"),
  saveNow: vi.fn(async () => undefined),
}));
vi.mock("../../services/proxyClient", () => ({ createProxyClient: () => ({ complete: mocks.complete }) }));
vi.mock("../../services/debate", async () => ({
  ...await vi.importActual<typeof import("../../services/debate")>("../../services/debate"),
  runDebate: mocks.debate,
  createPartnerClient: () => vi.fn(async () => ({ text: "partner" })),
}));
vi.mock("../../services/multiAi", async () => ({
  ...await vi.importActual<typeof import("../../services/multiAi")>("../../services/multiAi"),
  runConsensus: mocks.consensus, runSynthesis: mocks.synthesis,
}));

let root: Root;
let host: HTMLDivElement;
const completed: DebateOutcome = {
  status: "complete",
  sides: [
    { stance: "for", label: "Claude", status: "ok", text: "Claude argument", usage: { provider: "anthropic", model: "claude-sonnet-5", inputTokens: 400, outputTokens: 100, estimatedCost: null, actualCost: 0.0027 } },
    { stance: "against", label: "GPT-5.5", partnerId: "gpt-5.5", status: "ok", text: "Partner argument", usage: { provider: "openai", model: "gpt-5.5", inputTokens: 400, outputTokens: 100, estimatedCost: null, actualCost: 0.0024 } },
  ],
  transcript: { question: "Compare these choices", participants: [{ label: "Claude", provider: "anthropic", model: "claude-sonnet-5", text: "Claude argument" }, { label: "GPT-5.5", provider: "openai", model: "gpt-5.5", text: "Partner argument" }] },
};
async function flush() {
  await act(async () => { await Promise.resolve(); await Promise.resolve(); });
}
async function click(text: string) {
  const button = [...host.querySelectorAll("button")].find((b) => b.textContent?.trim() === text);
  expect(button, text).toBeDefined();
  expect(button?.disabled, text).toBe(false);
  act(() => button!.click());
  await flush();
  await flush();
}
beforeEach(async () => {
  vi.clearAllMocks();
  mocks.complete.mockImplementation(async () => "");
  useAccountStore.setState({ ...createInitialAccountState(), appMode: "developer" });
  useSessionStore.setState({ ...createInitialSessionState(), conversation: [{ id: "question", role: "user", content: "Compare these choices", timestamp: Date.now() }] });
  host = document.createElement("div"); document.body.append(host);
  root = createRoot(host);
  act(() => root.render(<MultiAiActions />));
  act(() => host.querySelector<HTMLButtonElement>(".multi-ai-actions__toggle")!.click());
  await flush();
});
afterEach(() => {
  act(() => root.unmount()); host.remove();
  useSessionStore.setState(createInitialSessionState());
  useAccountStore.setState(createInitialAccountState());
});

describe("M2 cancellation money finalizers through the mounted component", () => {
  it("finalizeParticipantAuthorization leaves dispatched work pending when cancellation returns no participant usage", async () => {
    let finish!: (result: DebateOutcome) => void;
    mocks.debate.mockImplementation(async (question, options) => {
      await options.claudeClient({ model: "claude-sonnet-5", system: "s", input: question, signal: options.signal });
      return new Promise<DebateOutcome>((resolve) => { finish = resolve; });
    });
    await click("Start debate");
    expect(mocks.complete).toHaveBeenCalledOnce();
    await click("Cancel");
    await act(async () => { finish({ status: "failed", sides: [] }); });
    await flush();
    expect(mocks.pending).toHaveBeenCalledOnce();
    expect(mocks.release).not.toHaveBeenCalled();
    expect(mocks.settle).not.toHaveBeenCalled();
  });

  it.each(["consensus", "synthesis"] as const)("finalizeStageAuthorization settles measured %s usage even after cancellation", async (stage) => {
    mocks.debate.mockResolvedValue(completed);
    await click("Start debate");
    await vi.waitFor(async () => {
      await flush();
      const button = [...host.querySelectorAll("button")].find((b) => b.textContent === (stage === "consensus" ? "Consensus" : "Synthesis"));
      expect(button?.disabled).toBe(false);
    });
    mocks.settle.mockClear(); mocks.release.mockClear(); mocks.pending.mockClear();
    let finish!: (result: unknown) => void;
    mocks.complete.mockImplementation(async (request) => {
      request.onUsage?.({ inputTokens: 400, outputTokens: 100 });
      return "{}";
    });
    mocks[stage].mockImplementation(async (_transcript, options) => {
      await options.client({ model: "claude-opus-4-8", system: "s", input: "transcript", signal: options.signal });
      return new Promise((resolve) => { finish = resolve; });
    });
    await click(stage === "consensus" ? "Consensus" : "Synthesis");
    await click("Cancel");
    await act(async () => { finish({ status: "error", message: "cancelled after measured work" }); });
    await flush();
    expect(mocks.settle).toHaveBeenCalledWith(expect.objectContaining({ reservationId: "hold-test" }), 0.0045, expect.any(String));
    expect(mocks.release).not.toHaveBeenCalled();
    expect(mocks.pending).not.toHaveBeenCalled();
  });

  it("releases a cancelled reservation when no client was handed a request", async () => {
    let finish!: (result: DebateOutcome) => void;
    mocks.debate.mockImplementation(() => new Promise<DebateOutcome>((resolve) => { finish = resolve; }));
    await click("Start debate");
    await click("Cancel");
    await act(async () => { finish({ status: "failed", sides: [] }); });
    await flush();
    expect(mocks.complete).not.toHaveBeenCalled();
    expect(mocks.release).toHaveBeenCalledOnce();
    expect(mocks.pending).not.toHaveBeenCalled();
  });

  it("does not settle a partial measured sum while another participant has unknown usage", async () => {
    mocks.debate.mockResolvedValue({
      status: "partial", sides: [completed.sides[0], { stance: "against", label: "GPT-5.5", partnerId: "gpt-5.5", status: "error" }],
    });
    await click("Start debate");
    expect(mocks.pending).toHaveBeenCalledOnce();
    expect(mocks.settle).not.toHaveBeenCalled();
    expect(mocks.release).not.toHaveBeenCalled();
  });
});
