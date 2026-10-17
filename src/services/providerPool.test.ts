import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let handle: typeof import("./proxyHandler").handleProxyRequest;
const keyNames = ["GROQ_API_KEY", "GOOGLE_API_KEY", "OPENROUTER_API_KEY", "OPENAI_API_KEY", "XAI_API_KEY", "DEEPSEEK_API_KEY"];

beforeEach(async () => {
  // Only the explicit environment() fixture configures this scenario's providers.
  // Deployment credentials must not enable additional runtime fallback slots.
  for (const name of [...keyNames, "ANTHROPIC_API_KEY", "HF_TOKEN", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"]) {
    vi.stubEnv(name, "");
  }
  vi.resetModules();
  handle = (await import("./proxyHandler")).handleProxyRequest;
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); });

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
  it("keeps untrusted carried cooldowns local to their request without poisoning another caller's budget", async () => {
    const { createProviderPool } = await import("./providerPool");
    const pool = createProviderPool(() => 1000);
    let calls = 0;
    const options = {
      models: ["llama-3.3-70b-versatile"], configured: () => true,
      execute: async () => { calls += 1; return answer("groq"); },
    };
    const carried = await pool.run({ ...options, budgets: [
      { provider: "groq", exhaustedAt: 1000, resetAt: Number.MAX_SAFE_INTEGER },
    ] });
    expect(carried.status).toBe("refused");
    const independent = await pool.run(options);
    expect(independent.status).toBe("answered");
    expect(independent.provider).toBe("groq");
    expect(calls).toBe(1);
  });

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

describe("Q2 model and provider exhaustion are separate budgets", () => {
  it("normalizes carried cooldowns without echoing extra caller data", async () => {
    const { createProviderPool } = await import("./providerPool");
    const credential = crypto.randomUUID();
    const result = await createProviderPool(() => 1000).run({ models: ["llama-3.3-70b-versatile"],
      configured: () => true, execute: async () => answer("groq"),
      budgets: [{ provider: "groq", exhaustedAt: 1000, resetAt: 60_000, unexpected: credential }] });
    expect(JSON.stringify(result).includes(credential)).toBe(false);
    expect(Object.keys(result.budgets[0]).sort()).toEqual(["exhaustedAt", "provider", "resetAt"]);
  });

  async function alternatives(provider: "groq" | "google" = "groq") {
    const registry = await import("./modelRegistry");
    const pricing = await import("./costTracking");
    const { createProviderPool, isFreePoolModel } = await import("./providerPool");
    const first = provider === "groq" ? "llama-3.3-70b-versatile" : "gemini-flash";
    const second = "test-only-" + provider + "-alternative";
    const models = registry.MODEL_REGISTRY as Record<string, import("./modelRegistry").ModelInfo>;
    models[second] = { ...models[first], id: second as import("./modelRegistry").ModelId };
    pricing.MODEL_PRICES[second] = { inputPerMillion: 0, outputPerMillion: 0 };
    return { first, second, models, pricing, createProviderPool, isFreePoolModel,
      cleanup() { delete models[second]; delete pricing.MODEL_PRICES[second]; } };
  }

  it("tries the next model on the same provider when only that model is rate-limited", async () => {
    const fixture = await alternatives();
    const calls: string[] = [];
    try {
      const result = await fixture.createProviderPool(() => 1000).run({
        models: [fixture.first, fixture.second], configured: () => true,
        execute: async (model) => {
          calls.push(model.id);
          return model.id === fixture.first
            ? Response.json({ error: { scope: "model", code: "model_rate_limit", message: "Per-model requests exhausted" } },
              { status: 429, headers: { "retry-after": "60" } }) : answer("groq");
        },
      });
      expect(result).toMatchObject({ status: "answered", provider: "groq", model: fixture.second, handedOff: true });
      expect(calls).toEqual([fixture.first, fixture.second]);
      expect(result.budgets).toEqual([{ provider: "groq", model: fixture.first, exhaustedAt: 1000, resetAt: 61_000 }]);
    } finally { fixture.cleanup(); }
  });

  it("skips every remaining model when the whole provider is exhausted", async () => {
    const fixture = await alternatives();
    const calls: string[] = [];
    try {
      const result = await fixture.createProviderPool().run({ models: [fixture.first, fixture.second, "gemini-flash"],
        configured: () => true, execute: async (model) => {
          calls.push(model.id);
          return model.provider === "groq" ? Response.json({ error: { scope: "provider", message: "Account quota exhausted" } }, { status: 429 })
            : answer("google");
        } });
      expect(result).toMatchObject({ status: "answered", provider: "google" });
      expect(calls).toEqual([fixture.first, "gemini-flash"]);
    } finally { fixture.cleanup(); }
  });

  it("persists a model cooldown without disabling its provider, including across a cold pool", async () => {
    const fixture = await alternatives();
    const localPool = fixture.createProviderPool(() => 1000);
    const calls: string[] = [];
    const options = { models: [fixture.first, fixture.second], configured: () => true,
      execute: async (model: import("./modelRegistry").ModelInfo) => {
        calls.push(model.id);
        return model.id === fixture.first ? Response.json({ error: { scope: "model", message: "quota exhausted" } }, { status: 429 })
          : answer("groq");
      } };
    try {
      const initial = await localPool.run(options);
      expect(initial.status).toBe("answered");
      expect((await localPool.run(options)).model).toBe(fixture.second);
      expect((await fixture.createProviderPool(() => 1000).run({ ...options, budgets: initial.budgets })).model).toBe(fixture.second);
      expect(calls).toEqual([fixture.first, fixture.second, fixture.second, fixture.second]);
    } finally { fixture.cleanup(); }
  });

  it("honors structured Google model quota dimensions", async () => {
    const fixture = await alternatives("google");
    try {
      const result = await fixture.createProviderPool().run({ models: [fixture.first, fixture.second], configured: () => true,
        execute: async (model) => model.id === fixture.first ? Response.json({ error: { status: "RESOURCE_EXHAUSTED",
          details: [{ violations: [{ quotaDimensions: { model: "gemini-1.5-flash" } }] }] } }, { status: 429 }) : answer("google") });
      expect(result).toMatchObject({ status: "answered", provider: "google", model: fixture.second });
      expect(result.budgets[0]).toMatchObject({ provider: "google", model: fixture.first });
    } finally { fixture.cleanup(); }
  });

  it("recognizes Groq's model-specific rate-limit message", async () => {
    const fixture = await alternatives();
    try {
      const result = await fixture.createProviderPool().run({ models: [fixture.first, fixture.second], configured: () => true,
        execute: async (model) => model.id === fixture.first ? Response.json({ error: {
          message: "Rate limit reached for model llama-3.3-70b-versatile in organization on tokens per minute" } }, { status: 429 }) : answer("groq") });
      expect(result.model).toBe(fixture.second);
    } finally { fixture.cleanup(); }
  });

  it("treats insufficient account credit as provider-wide even with a misleading model scope", async () => {
    const fixture = await alternatives();
    const calls: string[] = [];
    try {
      const result = await fixture.createProviderPool().run({ models: [fixture.first, fixture.second, "gemini-flash"], configured: () => true,
        execute: async (model) => {
          calls.push(model.id);
          return model.provider === "groq" ? Response.json({ error: { scope: "model", message: "Insufficient account credits" } }, { status: 402 })
            : answer("google");
        } });
      expect(result.provider).toBe("google");
      expect(calls).toEqual([fixture.first, "gemini-flash"]);
      expect(result.budgets[0]).not.toHaveProperty("model");
    } finally { fixture.cleanup(); }
  });

  it("admits only priced zero-cost models from the five free providers", async () => {
    const { MODEL_IDS, MODEL_REGISTRY } = await import("./modelRegistry");
    const { getModelPrice } = await import("./costTracking");
    const { isFreePoolModel } = await import("./providerPool");
    const free = MODEL_IDS.filter(isFreePoolModel);
    expect(new Set(free.map((id) => MODEL_REGISTRY[id].provider))).toEqual(new Set(["groq", "google", "huggingface", "cloudflare", "openrouter"]));
    for (const id of free) {
      expect(MODEL_REGISTRY[id].plan).toBe("free");
      expect(["anthropic", "openai", "xai", "deepseek"]).not.toContain(MODEL_REGISTRY[id].provider);
      expect(getModelPrice(id)).toEqual({ inputPerMillion: 0, outputPerMillion: 0 });
    }
  });

  it("refuses unpriced or billable models even if a free provider registry entry says free", async () => {
    const fixture = await alternatives();
    try {
      delete fixture.pricing.MODEL_PRICES[fixture.second];
      expect(fixture.isFreePoolModel(fixture.second)).toBe(false);
      fixture.pricing.MODEL_PRICES[fixture.second] = { inputPerMillion: 1, outputPerMillion: 0 };
      expect(fixture.isFreePoolModel(fixture.second)).toBe(false);
      let calls = 0;
      const result = await fixture.createProviderPool().run({ models: [fixture.second], configured: () => true,
        execute: async () => { calls += 1; return answer("groq"); } });
      expect(calls).toBe(0);
      expect(result.status).toBe("refused");
    } finally { fixture.cleanup(); }
  });

  it("ignores a forged model budget belonging to the wrong provider", async () => {
    const fixture = await alternatives();
    try {
      const result = await fixture.createProviderPool(() => 1000).run({ models: [fixture.first], configured: () => true,
        budgets: [{ provider: "google", model: fixture.first, exhaustedAt: 1000, resetAt: 60_000 }],
        execute: async () => answer("groq") });
      expect(result.model).toBe(fixture.first);
      expect(result.budgets).toEqual([]);
    } finally { fixture.cleanup(); }
  });

  it("does not dispatch duplicate model ids while trying alternatives", async () => {
    const fixture = await alternatives();
    const calls: string[] = [];
    try {
      const result = await fixture.createProviderPool().run({ models: [fixture.first, fixture.first, fixture.second], configured: () => true,
        execute: async (model) => {
          calls.push(model.id);
          return model.id === fixture.first ? Response.json({ error: { scope: "model", message: "quota exhausted" } }, { status: 429 }) : answer("groq");
        } });
      expect(result.model).toBe(fixture.second);
      expect(calls).toEqual([fixture.first, fixture.second]);
    } finally { fixture.cleanup(); }
  });
});
