import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAccountStore } from "../stores/accountStore";
import { _resetLayer4DatabaseForTests } from "./durableLayer4";
import * as runtime from "./moneyRuntime";
import { authorizeEstimatedCost, createAuthorizedClient, markDeferredAuthorizationUnknown, reconcileCreditAuthorizations, settleDeferredAuthorization } from "./creditAuthorization";
import { MODEL_PRICE_VERSION } from "./costTracking";
import { createProxyClient } from "./proxyClient";
import { useSessionStore } from "../stores/sessionStore";
import { runPersonalOptimizationWithAi } from "./optimization/personalOptimizationRunner";

vi.mock("./persistence", () => ({ saveNow: vi.fn(async () => {}) }));
const policy = { maximum: 0.25, paidFallbackEnabled: true, requiresPaidFallback: false,
  routeLabel: "Anthropic", payerLabel: "Your credits", reasonLabel: "Answer", freeAlternativeLabel: "Free route" };
const options = { deferSettlement: false, models: [{ provider: "anthropic", model: "claude-sonnet-5" }] };

beforeEach(async () => {
  vi.restoreAllMocks();
  await _resetLayer4DatabaseForTests();
  runtime._resetMoneyAuthorityForTests();
  await runtime.loadMoneyAuthority(10_000);
  useAccountStore.setState({ ...useAccountStore.getInitialState(), plan: "plus", creditBalance: 100 });
  window.confirm = vi.fn(() => true);
});

describe("M5: measured billing", () => {
  it("keeps partial completion usage unknown instead of inventing a zero token count", async () => {
    for (const usage of [{ input_tokens: 42 }, { output_tokens: 7 }, { input_tokens: -1, output_tokens: 7 }]) {
      const auth = await authorizeEstimatedCost(0.04, "Answer", policy, options);
      const raw = createProxyClient({ fetchImpl: vi.fn(async () => new Response(JSON.stringify({ content: [{ type: "text", text: "answer" }], usage }))) });
      const measured = createAuthorizedClient(auth, raw);
      await measured.client.complete({ model: "claude-sonnet-5" });
      await measured.finish();
      expect(runtime.getMoneyAuthority().snapshot().reservations.find((item) => item.id === auth.reservationId)?.status).toBe("pending-unknown");
    }
    expect(useAccountStore.getState().creditBalance).toBe(100);
  });

  it("does not treat message_start's initial output zero as final stream usage", async () => {
    const auth = await authorizeEstimatedCost(0.04, "Answer", policy, options);
    const sse = 'data: {"type":"message_start","message":{"usage":{"input_tokens":42,"output_tokens":0}}}\n\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"answer"}}\n\ndata: [DONE]\n\n';
    const raw = createProxyClient({ fetchImpl: vi.fn(async () => new Response(sse)) });
    const measured = createAuthorizedClient(auth, raw);
    for await (const text of measured.client.stream({ model: "claude-sonnet-5" })) expect(text).toBe("answer");
    await measured.finish();
    expect(runtime.getMoneyAuthority().snapshot().reservations[0].status).toBe("pending-unknown");
    expect(useAccountStore.getState().creditBalance).toBe(100);
  });

  it("retains final measured stream usage when transport fails afterwards", async () => {
    const auth = await authorizeEstimatedCost(0.04, "Answer", policy, options);
    let sent = false;
    const body = new ReadableStream<Uint8Array>({ pull(controller) {
      if (sent) { controller.error(new Error("stream ended after final usage")); return; }
      sent = true;
      controller.enqueue(new TextEncoder().encode('data: {"type":"message_start","message":{"usage":{"input_tokens":42,"output_tokens":0}}}\n\ndata: {"type":"message_delta","usage":{"output_tokens":7}}\n\n'));
    } });
    const raw = createProxyClient({ fetchImpl: vi.fn(async () => new Response(body)) });
    const measured = createAuthorizedClient(auth, raw);
    await expect(async () => { for await (const text of measured.client.stream({ model: "claude-sonnet-5" })) void text; }).rejects.toThrow("after final usage");
    await measured.finish();
    expect(useAccountStore.getState().creditAuthorizations[0]).toMatchObject({ status: "settled", actualCost: 0.000231, billedCost: 0.01 });
  });

  it("uses the same reservation and measured settlement for personal optimization", async () => {
    useSessionStore.setState({ paidFallbackEnabled: true, maxRequestCost: 0.25 });
    const result = await runPersonalOptimizationWithAi({ sessions: Array.from({ length: 3 }, (_, index) => ({ id: `synthetic-session-${index}`, createdAt: index, archived: true, model: "auto" as const, directness: 2 as const, techniques: ["auto-detect" as const], context: [], variables: {},
      conversation: [{ id: `synthetic-message-${index}`, role: "user" as const, content: "overwhelm", timestamp: index }],
    })), goals: ["reduce-overwhelm"], currentPreferences: { routing: {}, technique: {} }, minimumEvidence: 3, apply: true, now: 100 }, {
      complete: async (request) => {
        expect(useAccountStore.getState().creditBalance).toBe(100);
        expect(runtime.getMoneyAuthority().snapshot().reservations[0]).toMatchObject({ status: "reserved", model: "claude-haiku-4-5" });
        request.onUsage?.({ inputTokens: 400, outputTokens: 100 });
        return JSON.stringify({ decisions: [{ target: "simplify", accept: true, confidence: 0.9, reason: "Three distinct overload signals." }] });
      },
    });
    expect(result?.status).toBe("applied");
    expect(useAccountStore.getState().creditAuthorizations[0]).toMatchObject({ status: "settled", actualCost: 0.0009, billedCost: 0.01 });
    expect(useAccountStore.getState().creditBalance).toBe(99.99);
  });

  it("settles known zero usage as zero and releases the unused hold", async () => {
    const auth = await authorizeEstimatedCost(0.04, "Answer", policy, options);
    expect(await settleDeferredAuthorization(auth, 0, "Measured zero")).toBe(true);
    expect(runtime.getMoneyAuthority().snapshot().receipts[0]).toMatchObject({ status: "settled", actualCents: 0, releasedCents: 8 });
    expect(useAccountStore.getState().creditBalance).toBe(100);
  });

  it("uses both caps and refuses a ceiling without headroom", async () => {
    const auth = await authorizeEstimatedCost(0.1, "Answer", { ...policy, maximum: 0.15 }, options);
    expect(auth).toMatchObject({ authorized: true, hardMaximum: 0.15 });
    expect(await authorizeEstimatedCost(0.25, "Answer", policy, options)).toMatchObject({ authorized: false, reason: "invalid-hard-maximum" });
  });

  it("recovers a durable measurement before source settlement without repeating provider work", async () => {
    const auth = await authorizeEstimatedCost(0.04, "Answer", policy, options);
    useAccountStore.setState((state) => ({ creditAuthorizations: state.creditAuthorizations.map((record) => ({ ...record, actualCost: 0.03, status: "measured" })) }));
    await runtime.loadMoneyAuthority();
    await reconcileCreditAuthorizations(true);
    await reconcileCreditAuthorizations(true);
    expect(runtime.getMoneyAuthority().snapshot().receipts[0]).toMatchObject({ reservationId: auth.reservationId, status: "settled", actualCents: 3 });
    expect(useAccountStore.getState().creditBalance).toBe(99.97);
    expect(useAccountStore.getState().creditLedger).toHaveLength(1);
  });

  it("keeps interrupted work pending when reload has no durable usage", async () => {
    await authorizeEstimatedCost(0.04, "Answer", policy, options);
    await runtime.loadMoneyAuthority();
    await reconcileCreditAuthorizations(true);
    expect(runtime.getMoneyAuthority().snapshot().reservations[0].status).toBe("pending-unknown");
    expect(useAccountStore.getState().creditBalance).toBe(100);
    expect(runtime.getMoneyAuthority().snapshot().balanceCents).toBe(9992);
  });

  it("measures each main-pipeline attempt and keeps retries with missing usage pending", async () => {
    const auth = await authorizeEstimatedCost(0.04, "Answer", policy, options);
    let attempt = 0;
    const client = createAuthorizedClient(auth, { endpoint: "/api/proxy",
      complete: async (request) => { if (++attempt === 1) request.onUsage?.({ inputTokens: 500, outputTokens: 1000 }); return "answer"; },
      async *stream() { yield "answer"; },
    });
    await client.client.complete({ model: "claude-sonnet-5" });
    await client.client.complete({ model: "claude-sonnet-5" });
    expect(await client.finish()).toBe(true);
    expect(runtime.getMoneyAuthority().snapshot().reservations[0].status).toBe("pending-unknown");
    expect(useAccountStore.getState().creditBalance).toBe(100);
    expect(useAccountStore.getState().creditAuthorizations[0].actualModels).toEqual(["claude-sonnet-5"]);
  });

  it("settles the main client's measured stream once and rejects unapproved models before dispatch", async () => {
    const auth = await authorizeEstimatedCost(0.04, "Answer", policy, options);
    const dispatch = vi.fn();
    const measured = createAuthorizedClient(auth, { endpoint: "/api/proxy", complete: dispatch,
      async *stream(request) { dispatch(); request.onUsage?.({ inputTokens: 500, outputTokens: 1000 }); yield "answer"; },
    });
    expect(() => measured.client.complete({ model: "gpt-5.5" })).toThrow("not authorized");
    for await (const text of measured.client.stream({ model: "claude-sonnet-5" })) expect(text).toBe("answer");
    await measured.finish(); await measured.finish();
    expect(dispatch).toHaveBeenCalledOnce();
    expect(useAccountStore.getState().creditAuthorizations[0]).toMatchObject({ estimatedCost: 0.04, actualCost: 0.0165, billedCost: 0.02, actualModels: ["claude-sonnet-5"] });
    expect(useAccountStore.getState().creditBalance).toBe(99.98);
  });

  it("reserves with headroom and leaves both estimate and account uncharged before work", async () => {
    const auth = await authorizeEstimatedCost(0.04, "Answer", policy, options);
    expect(auth.authorized).toBe(true);
    expect(runtime.getMoneyAuthority().snapshot().reservations[0]).toMatchObject({ status: "reserved", estimatedCents: 4, hardMaximumCents: 8, actualCents: null });
    expect(runtime.getMoneyAuthority().snapshot().receipts).toEqual([]);
    expect(useAccountStore.getState().creditBalance).toBe(100);
  });

  it("bills the lower measured amount instead of the estimate", async () => {
    const auth = await authorizeEstimatedCost(0.1, "Answer", policy, options);
    expect(await settleDeferredAuthorization(auth, 0.04, "Measured")).toBe(true);
    expect(useAccountStore.getState().creditBalance).toBe(99.96);
    expect(runtime.getMoneyAuthority().snapshot().receipts[0]).toMatchObject({ estimatedCents: 10, actualCents: 4, status: "settled" });
  });

  it("allows measured use above estimate within the approved ceiling", async () => {
    const auth = await authorizeEstimatedCost(0.04, "Answer", policy, options);
    expect(await settleDeferredAuthorization(auth, 0.06, "Measured")).toBe(true);
    expect(useAccountStore.getState().creditBalance).toBe(99.94);
    expect(runtime.getMoneyAuthority().snapshot().receipts[0]).toMatchObject({ hardMaximumCents: 8, actualCents: 6 });
  });

  it("caps the bill while recording the full measured cost separately", async () => {
    const auth = await authorizeEstimatedCost(0.04, "Answer", policy, options);
    expect(await settleDeferredAuthorization(auth, 0.2, "Measured")).toBe(true);
    expect(useAccountStore.getState().creditBalance).toBe(99.92);
    expect(runtime.getMoneyAuthority().snapshot().receipts[0]).toMatchObject({ actualCents: 8 });
    expect(useAccountStore.getState()).toMatchObject({ creditAuthorizations: [expect.objectContaining({ estimatedCost: 0.04, actualCost: 0.2, billedCost: 0.08, overageCost: 0.12 })] });
  });

  it("keeps dispatched work without usage pending and never bills the estimate", async () => {
    const auth = await authorizeEstimatedCost(0.04, "Answer", policy, options);
    expect(await markDeferredAuthorizationUnknown(auth, "Dispatched without usage")).toBe(true);
    expect(runtime.getMoneyAuthority().snapshot().reservations[0]).toMatchObject({ status: "pending-unknown", actualCents: null });
    expect(useAccountStore.getState().creditBalance).toBe(100);
  });

  it("records the real upstream model and price version", async () => {
    await authorizeEstimatedCost(0.04, "Answer", policy, options);
    expect(runtime.getMoneyAuthority().snapshot().reservations[0]).toMatchObject({ provider: "anthropic", model: "claude-sonnet-5", priceVersion: MODEL_PRICE_VERSION });
  });

  it("blocks missing or unknown pricing before confirmation", async () => {
    const unknown = { ...options, models: [{ provider: "unknown", model: "future-model" }] };
    expect(await authorizeEstimatedCost(0.04, "Answer", policy, unknown)).toMatchObject({ authorized: false, reason: "unknown-price" });
    expect(await authorizeEstimatedCost(0.04, "Answer", policy)).toMatchObject({ authorized: false, reason: "unknown-price" });
    expect(window.confirm).not.toHaveBeenCalled();
    expect(runtime.getMoneyAuthority().snapshot().reservations).toEqual([]);
  });

  it("persists authority settlement before debiting the mirror, and replays once after reload", async () => {
    const auth = await authorizeEstimatedCost(0.1, "Answer", policy, { ...options, deferSettlement: true });
    const persist = runtime.persistMoneyAuthority;
    const crash = vi.spyOn(runtime, "persistMoneyAuthority").mockImplementationOnce(async () => {
      await persist();
      throw new Error("crash after authority save");
    });
    await expect(settleDeferredAuthorization(auth, 0.04, "Measured")).rejects.toThrow("crash after authority save");
    expect(useAccountStore.getState().creditBalance).toBe(100);
    crash.mockRestore();
    await runtime.loadMoneyAuthority();
    expect(await settleDeferredAuthorization(auth, 0.04, "Recovered")).toBe(true);
    expect(await settleDeferredAuthorization(auth, 0.04, "Repeated")).toBe(true);
    expect(useAccountStore.getState().creditBalance).toBe(99.96);
    expect(useAccountStore.getState().creditLedger.filter((entry) => entry.referenceId === auth.referenceId)).toHaveLength(1);
    expect(runtime.getMoneyAuthority().snapshot().ledger.filter((entry) => entry.kind === "charge")).toHaveLength(1);
  });
});
