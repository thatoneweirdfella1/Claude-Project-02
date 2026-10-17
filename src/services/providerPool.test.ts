import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let handle: typeof import("./proxyHandler").handleProxyRequest;
const keyNames = ["GROQ_API_KEY", "GOOGLE_API_KEY", "OPENROUTER_API_KEY", "OPENAI_API_KEY", "XAI_API_KEY", "DEEPSEEK_API_KEY"];

beforeEach(async () => {
  vi.resetModules();
  handle = (await import("./proxyHandler")).handleProxyRequest;
});
afterEach(() => vi.useRealTimers());

function provider(url: RequestInfo | URL): string {
  const host = new URL(String(url)).hostname;
  return host.includes("groq") ? "groq" : host.includes("googleapis") ? "google" : host.includes("openrouter") ? "openrouter" : "paid";
}
function environment() { return Object.fromEntries(keyNames.map((name) => [name, crypto.randomUUID()])); }
function request() {
  return new Request("https://app.example/api/proxy", { method: "POST", body: JSON.stringify({
    freePool: true, model: "claude-sonnet-5", messages: [{ role: "user", content: "A free request" }],
  }) });
}
function answer(id: string) {
  return Response.json(id === "google"
    ? { candidates: [{ content: { parts: [{ text: "Free answer" }] } }], usageMetadata: { promptTokenCount: 20, candidatesTokenCount: 4 } }
    : { choices: [{ message: { content: "Free answer" } }], usage: { prompt_tokens: 20, completion_tokens: 4 } });
}
async function run(upstream: typeof fetch) {
  const response = await handle(request(), crypto.randomUUID(), upstream, environment());
  return response.json();
}

describe("P2 free pool through the deployed proxy handler", () => {
  it("hands a 429 to the next free provider and returns its answer", async () => {
    const calls: string[] = [];
    const result = await run(async (url) => {
      const id = provider(url); calls.push(id);
      return id === "groq" ? Response.json({ error: "rate limit" }, { status: 429 }) : answer(id);
    });
    expect(result.freePool?.status).toBe("answered");
    expect(result.freePool).toMatchObject({ provider: "google", handedOff: true, text: "Free answer" });
    expect(calls).toEqual(["groq", "google"]);
  });

  it("honestly refuses when every free provider is out, without any paid call", async () => {
    let paidCalls = 0;
    const result = await run(async (url) => {
      if (provider(url) === "paid") { paidCalls += 1; return answer("paid"); }
      return Response.json({ error: "daily quota exhausted" }, { status: 429 });
    });
    expect(result.freePool?.status).toBe("refused");
    expect(result.freePool?.reason).toBe("free-pool-unavailable");
    expect(result.freePool?.message).toMatch(/no free provider.*local/i);
    expect(paidCalls).toBe(0);
  });

  it("does not choose an exhausted provider again until its stated reset", async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-17T18:00:00Z"));
    const calls: string[] = [];
    let limited = true;
    const upstream: typeof fetch = async (url) => {
      const id = provider(url); calls.push(id);
      return id === "groq" && limited ? Response.json({ error: "rate limit" }, { status: 429, headers: { "retry-after": "2" } }) : answer(id);
    };
    expect((await run(upstream)).freePool?.provider).toBe("google");
    limited = false;
    expect((await run(upstream)).freePool?.provider).toBe("google");
    expect(calls).toEqual(["groq", "google", "google"]);
    vi.advanceTimersByTime(2000);
    expect((await run(upstream)).freePool?.provider).toBe("groq");
    expect(calls).toEqual(["groq", "google", "google", "groq"]);
  });

  it("reports the answering work once, without inventing usage for a failed attempt", async () => {
    const result = await run(async (url) => provider(url) === "groq"
      ? Response.json({ error: "rate limit" }, { status: 429 }) : answer(provider(url)));
    expect(result.freePool?.usage).toEqual([{ provider: "google", model: "gemini-flash", inputTokens: 20, outputTokens: 4 }]);
  });

  it("recognizes a spent daily allowance without a 429 and uses the conservative reset", async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-17T18:00:00Z"));
    const result = await run(async (url) => provider(url) === "groq"
      ? Response.json({ error: { message: "daily allowance is spent" } }, { status: 403 }) : answer(provider(url)));
    expect(result.freePool?.provider).toBe("google");
    expect(result.freePool?.budgets).toContainEqual({ provider: "groq", exhaustedAt: Date.now(), resetAt: Date.now() + 86_400_000 });
  });

  it("keeps measured usage from a failed provider separate from the answering provider", async () => {
    const result = await run(async (url) => provider(url) === "groq"
      ? Response.json({ error: "rate limit", usage: { prompt_tokens: 3, completion_tokens: 1 } }, { status: 429 }) : answer(provider(url)));
    expect(result.freePool?.usage).toEqual([
      { provider: "groq", model: "llama-3.3-70b-versatile", inputTokens: 3, outputTokens: 1 },
      { provider: "google", model: "gemini-flash", inputTokens: 20, outputTokens: 4 },
    ]);
  });

  it("records measured browser usage once per answer, charges no credits, and carries cooldown through a cold server", async () => {
    localStorage.removeItem("divergence-free-pool-budgets");
    const { requestFreePool } = await import("./providerPool");
    const { addTokenUsage, getSessionCost } = await import("./costTracking");
    const { useAccountStore } = await import("../stores/accountStore");
    const ledger = JSON.stringify(useAccountStore.getState().creditLedger);
    const balance = useAccountStore.getState().creditBalance;
    const before = getSessionCost();
    const samples: string[] = [];
    const calls: string[] = [];
    const upstream: typeof fetch = async (url) => {
      const id = provider(url); calls.push(id);
      return id === "groq" ? Response.json({ error: "rate limit" }, { status: 429 }) : answer(id);
    };
    const fetchImpl: typeof fetch = async (_url, init) => handle(new Request("https://app.example/api/proxy", init), crypto.randomUUID(), upstream, environment());
    const onUsage = (usage: { model: string; inputTokens: number; outputTokens: number }) => {
      samples.push(usage.model);
      addTokenUsage(usage.inputTokens, usage.outputTokens, usage.model);
    };
    expect((await requestFreePool("Free request", { fetchImpl, onUsage })).status).toBe("answered");
    vi.resetModules();
    handle = (await import("./proxyHandler")).handleProxyRequest;
    expect((await requestFreePool("Another free request", { fetchImpl, onUsage })).status).toBe("answered");
    expect(calls).toEqual(["groq", "google", "google"]);
    expect(samples).toEqual(["gemini-flash", "gemini-flash"]);
    expect(getSessionCost().totalTokens - before.totalTokens).toBe(48);
    expect(getSessionCost().estimatedCost - before.estimatedCost).toBe(0);
    expect(useAccountStore.getState().creditBalance).toBe(balance);
    expect(JSON.stringify(useAccountStore.getState().creditLedger) === ledger).toBe(true);
    localStorage.removeItem("divergence-free-pool-budgets");
  });

  it.each([
    { headers: { "retry-after": "Sat, 17 Oct 2026 18:01:00 GMT" }, body: { error: "quota" } },
    { headers: { "x-ratelimit-reset-requests": "1m" }, body: { error: "quota" } },
    { headers: {}, body: { error: { message: "quota", details: [{ retryDelay: "60s" }] } } },
  ])("uses provider-supplied reset information: %j", async ({ headers, body }) => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-10-17T18:00:00Z"));
    const result = await run(async (url) => provider(url) === "groq"
      ? Response.json(body, { status: 429, headers }) : answer(provider(url)));
    expect(result.freePool?.budgets).toContainEqual({ provider: "groq", exhaustedAt: Date.now(), resetAt: Date.now() + 60_000 });
  });
});
