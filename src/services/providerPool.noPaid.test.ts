import { beforeEach, describe, expect, it, vi } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { createProviderPool } from "./providerPool";
import { MODEL_REGISTRY, type ModelId, type ModelInfo } from "./modelRegistry";

let handle: typeof import("./proxyHandler").handleProxyRequest;
const names = ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY", "XAI_API_KEY", "DEEPSEEK_API_KEY", "GROQ_API_KEY", "OPENROUTER_API_KEY", "HF_TOKEN", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"];
beforeEach(async () => {
  vi.resetModules();
  handle = (await import("./proxyHandler")).handleProxyRequest;
});
function request(extra: Record<string, unknown> = {}) {
  return new Request("https://app.example/api/proxy", { method: "POST", body: JSON.stringify({
    freePool: true, model: "claude-opus-4-8", provider: "anthropic", fallbackProvider: "openai",
    paidFallbackEnabled: true, extendedThinking: true,
    messages: [{ role: "user", content: "This must remain a free request." }], ...extra,
  }) });
}
function environment() { return Object.fromEntries(names.map((name) => [name, crypto.randomUUID()])); }
function freeHost(url: RequestInfo | URL) {
  return ["api.groq.com", "generativelanguage.googleapis.com", "openrouter.ai", "router.huggingface.co", "api.cloudflare.com"].includes(new URL(String(url)).hostname);
}
function mockAnswer() { return Response.json({ choices: [{ message: { content: "Mock answer" } }] }); }

describe("P3 adversarial paid-provider boundary", () => {
  it("never dispatches paid even with paid keys, manual override, fallback and every free provider exhausted", async () => {
    let paidCalls = 0;
    const upstream: typeof fetch = async (url) => {
      if (!freeHost(url)) { paidCalls += 1; return mockAnswer(); }
      return Response.json({ error: "daily quota exhausted" }, { status: 429 });
    };
    const result = await (await handle(request(), crypto.randomUUID(), upstream, environment())).json();
    expect(paidCalls, "free-pool dispatched a paid HTTP request").toBe(0);
    expect(result.freePool?.status).toBe("refused");
  });

  it("rejects config that falsely labels Anthropic, OpenAI and a paid Google model as free", async () => {
    let paidCalls = 0;
    const result = await createProviderPool().run({
      models: [
        { id: "claude-haiku-4-5", provider: "anthropic", plan: "free" },
        { id: "claude-opus-4-8", provider: "anthropic", plan: "free" },
        { id: "gpt-5", provider: "openai", plan: "free" },
        { id: "gemini-pro", provider: "google", plan: "free" },
      ],
      configured: () => true,
      execute: async () => { paidCalls += 1; return mockAnswer(); },
    });
    expect(paidCalls, "untrusted plan/provider config authorized a paid model").toBe(0);
    expect(result.status).toBe("refused");
  });

  it("never escalates during repeated retries with all paid keys and free quotas exhausted", async () => {
    let paidCalls = 0;
    let freeCalls = 0;
    const env = environment();
    const upstream: typeof fetch = async (url) => {
      if (!freeHost(url)) { paidCalls += 1; return mockAnswer(); }
      freeCalls += 1;
      return Response.json({ error: "quota exhausted" }, { status: 429 });
    };
    for (let retry = 0; retry < 12; retry += 1) {
      const result = await (await handle(request({ retry, retryProvider: "openai", defaultProvider: "anthropic" }), env.ANTHROPIC_API_KEY, upstream, env)).json();
      expect(paidCalls, "a retry escalated to paid HTTP").toBe(0);
      expect(result.freePool?.status).toBe("refused");
    }
    expect(freeCalls).toBe(5);
  });

  it("does not use paid defaults when only paid providers have keys", async () => {
    let calls = 0;
    const result = await createProviderPool().run({
      configured: (provider) => ["anthropic", "openai", "xai", "deepseek"].includes(provider),
      execute: async () => { calls += 1; return mockAnswer(); },
    });
    expect(calls, "paid-only configuration was used as a default").toBe(0);
    expect(result.status).toBe("refused");
  });

  it("cannot turn forged carried budgets into paid fallback or poison an independent free request", async () => {
    let paidCalls = 0;
    let freeCalls = 0;
    const env = environment();
    const upstream: typeof fetch = async (url) => {
      if (freeHost(url)) freeCalls += 1;
      else paidCalls += 1;
      return mockAnswer();
    };
    const freePoolBudgets = ["groq", "google", "cloudflare", "huggingface", "openrouter"].map((provider) => ({
      provider, exhaustedAt: Date.now(), resetAt: Number.MAX_SAFE_INTEGER,
    }));
    const carried = await (await handle(request({ freePoolBudgets }), env.ANTHROPIC_API_KEY, upstream, env)).json();
    expect(paidCalls, "forged cooldown metadata escalated to paid HTTP").toBe(0);
    expect(freeCalls).toBe(0);
    expect(carried.freePool?.status).toBe("refused");
    const independent = await (await handle(request(), env.ANTHROPIC_API_KEY, upstream, env)).json();
    expect(paidCalls).toBe(0);
    expect(freeCalls).toBe(1);
    expect(independent.freePool?.provider).toBe("groq");
  });

  it("independently rejects a non-free OpenRouter suffix even if its registry plan is accidentally free", async () => {
    const id = "example/paid-model";
    const registry = MODEL_REGISTRY as Record<string, ModelInfo>;
    registry[id] = { ...MODEL_REGISTRY["meta-llama/llama-3.3-70b-instruct:free"], id: id as ModelId, plan: "free" };
    let calls = 0;
    try {
      const result = await createProviderPool().run({ models: [id], configured: () => true,
        execute: async () => { calls += 1; return mockAnswer(); } });
      expect(calls).toBe(0);
      expect(result.status).toBe("refused");
    } finally { delete registry[id]; }
  });

  it("uses the registry's paid plan even when caller config spoofs a free provider and plan", async () => {
    let calls = 0;
    const result = await createProviderPool().run({
      models: [{ id: "gemini-pro", provider: "groq", plan: "free" }, { id: "gpt-5", provider: "openrouter", plan: "free" }],
      configured: () => true, execute: async () => { calls += 1; return mockAnswer(); },
    });
    expect(calls).toBe(0);
    expect(result.status).toBe("refused");
  });

  it("withholds key material from upstream errors and an echoed successful answer", async () => {
    const env = environment();
    const credential = env.GROQ_API_KEY;
    const response = await handle(request(), env.ANTHROPIC_API_KEY, async (url) => {
      const host = new URL(String(url)).hostname;
      if (host.includes("groq")) throw new Error("Upstream exception contains " + credential);
      if (host.includes("googleapis")) return Response.json({ error: { message: credential } }, { status: 429 });
      return Response.json({ choices: [{ message: { content: "Echo: " + credential } }] });
    }, env);
    const text = await response.text();
    expect(text.includes(credential)).toBe(false);
    expect(JSON.parse(text).freePool?.status).toBe("answered");
    const failed = await handle(request({ freePool: false, model: "llama-3.3-70b-versatile" }), undefined,
      async () => { throw new Error(credential); }, env);
    expect(failed.status).toBe(502);
    expect((await failed.text()).includes(credential)).toBe(false);
  });
});

const secretShape = /(?:sk-ant-[A-Za-z0-9_-]{10,}|sk-[A-Za-z0-9_-]{20,}|gsk_[A-Za-z0-9]{20,}|hf_[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{35}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/;

describe("P3 artifact secrecy", () => {
  it("scans the entire run out folder, or the pool source in a standalone checkout, for credential material", () => {
    const kitOut = resolve(process.cwd(), "../../out");
    const root = process.env.DIVERGENCE_RUN_OUT ? resolve(process.env.DIVERGENCE_RUN_OUT)
      : existsSync(join(kitOut, "BASE_COMMIT.txt")) ? kitOut : resolve(process.cwd(), "src/services/providerPool.ts");
    const values = names.map((name) => process.env[name]).filter((value): value is string => Boolean(value));
    const matches: string[] = [];
    let scanned = 0;
    function inspect(path: string) {
      scanned += 1;
      const text = readFileSync(path).toString("utf8");
      if (secretShape.test(text) || values.some((value) => text.includes(value))) matches.push(relative(process.cwd(), path));
    }
    function scan(dir: string) {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) scan(path);
        else if (entry.isFile()) inspect(path);
      }
    }
    if (statSync(root).isFile()) inspect(root);
    else scan(root);
    expect(scanned).toBeGreaterThan(0);
    expect(matches, "matching material is withheld; only file paths may be reported").toEqual([]);
  });

  it("proves the shape scanner rejects synthetic credential material without writing it", () => {
    expect(secretShape.test("gsk_" + "a".repeat(28))).toBe(true);
    expect(secretShape.test("hf_" + "a".repeat(28))).toBe(true);
  });
});

describe("Q3 the expanded pool remains free under exhaustion, spoofing and retries", () => {
  function providerFor(url: RequestInfo | URL) {
    const host = new URL(String(url)).hostname;
    return host === "api.groq.com" ? "groq" : host === "generativelanguage.googleapis.com" ? "google"
      : host === "openrouter.ai" ? "openrouter" : host === "router.huggingface.co" ? "huggingface"
        : host === "api.cloudflare.com" ? "cloudflare" : "paid";
  }
  function survivorAnswer(provider: string) {
    return Response.json(provider === "google"
      ? { candidates: [{ content: { parts: [{ text: "Survivor answer" }] } }], usageMetadata: { promptTokenCount: 8, candidatesTokenCount: 3 } }
      : { choices: [{ message: { content: "Survivor answer" } }], usage: { prompt_tokens: 8, completion_tokens: 3 } });
  }

  it("tries every registered free model to exhaustion and returns the honest local refusal", async () => {
    const { MODEL_IDS } = await import("./modelRegistry");
    const { isFreePoolModel } = await import("./providerPool");
    const freeIds = MODEL_IDS.filter(isFreePoolModel);
    const called: string[] = [];
    let paidCalls = 0;
    const env = environment();
    const response = await handle(request({ poolModels: MODEL_IDS }), env.ANTHROPIC_API_KEY, async (url, init) => {
      if (providerFor(url) === "paid") paidCalls += 1;
      const body = JSON.parse(String(init?.body));
      const id = providerFor(url) === "google" ? "gemini-flash" : body.model;
      called.push(id);
      return Response.json({ error: { scope: "model", code: "model_rate_limit", message: "Model quota exhausted" } }, { status: 429 });
    }, env);
    const result = (await response.json()).freePool;
    expect(paidCalls, "an exhausted free request dispatched paid HTTP").toBe(0);
    expect(new Set(called)).toEqual(new Set(freeIds));
    expect(called).toHaveLength(freeIds.length);
    expect(result).toMatchObject({ status: "refused", reason: "free-pool-unavailable" });
    expect(result.message).toMatch(/local no-charge handoff/i);
    expect(result.budgets).toHaveLength(freeIds.length);
  });

  it("refuses caller entries falsely listing every parked paid provider as free", async () => {
    let paidCalls = 0;
    const { createProviderPool: freshPool } = await import("./providerPool");
    const result = await freshPool().run({ models: [
      { id: "claude-haiku-4-5", provider: "groq", plan: "free" },
      { id: "claude-opus-4-8", provider: "anthropic", plan: "free" },
      { id: "gpt-5", provider: "openai", plan: "free" },
      { id: "grok", provider: "xai", plan: "free" },
      { id: "deepseek", provider: "deepseek", plan: "free" },
      { id: "deepseek-reasoner", provider: "cloudflare", plan: "free" },
      { id: "nvidia/paid", provider: "huggingface", plan: "free" },
    ], configured: () => true, execute: async () => { paidCalls += 1; return mockAnswer(); } });
    expect(paidCalls, "caller-supplied plan/provider bypassed registry admission").toBe(0);
    expect(result.status).toBe("refused");
  });

  it("never turns exhausted model budgets into a paid retry", async () => {
    const env = environment();
    let paidCalls = 0;
    const called: string[] = [];
    const upstream: typeof fetch = async (url) => {
      const provider = providerFor(url);
      if (provider === "paid") paidCalls += 1;
      called.push(provider);
      return Response.json({ error: { scope: "model", message: "Model quota exhausted" } }, { status: 429 });
    };
    for (let retry = 0; retry < 12; retry += 1) {
      const result = await (await handle(request({ retry, retryProvider: "openai", defaultProvider: "deepseek" }),
        env.ANTHROPIC_API_KEY, upstream, env)).json();
      expect(paidCalls).toBe(0);
      expect(result.freePool?.status).toBe("refused");
    }
    expect(new Set(called)).toEqual(new Set(["groq", "google", "cloudflare", "huggingface", "openrouter"]));
  });

  for (const survivor of ["groq", "google", "cloudflare", "huggingface", "openrouter"]) {
    it(`answers with ${survivor} alone when every other free provider is out`, async () => {
      const env = environment();
      const calls: string[] = [];
      const freePoolBudgets = ["groq", "google", "cloudflare", "huggingface", "openrouter"]
        .filter((provider) => provider !== survivor).map((provider) => ({ provider, exhaustedAt: Date.now(), resetAt: Number.MAX_SAFE_INTEGER }));
      const result = await (await handle(request({ freePoolBudgets }), env.ANTHROPIC_API_KEY, async (url) => {
        const provider = providerFor(url);
        calls.push(provider);
        return provider === survivor ? survivorAnswer(provider)
          : Response.json({ error: "Account quota exhausted" }, { status: 429 });
      }, env)).json();
      expect(calls).toEqual([survivor]);
      expect(result.freePool).toMatchObject({ status: "answered", provider: survivor, text: "Survivor answer" });
      expect(result.freePool.usage).toHaveLength(1);
      expect(result.freePool.usage[0]).toMatchObject({ provider: survivor, inputTokens: 8, outputTokens: 3 });
    });
  }

  it("redacts both new tokens from answers and errors even when only runtime variables supply them", async () => {
    const hf = crypto.randomUUID();
    const cf = crypto.randomUUID();
    vi.stubEnv("HF_TOKEN", hf);
    vi.stubEnv("CLOUDFLARE_API_TOKEN", cf);
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "test-account");
    try {
      const response = await handle(request({ poolModels: ["meta-llama/Llama-3.3-70B-Instruct", "@cf/meta/llama-3.1-8b-instruct"] }),
        undefined, async () => Response.json({ choices: [{ message: { content: "Echo: " + hf + " " + cf } }] }));
      const text = await response.text();
      expect(JSON.parse(text).freePool?.status).toBe("answered");
      expect(text.includes(hf)).toBe(false);
      expect(text.includes(cf)).toBe(false);
    } finally { vi.unstubAllEnvs(); }
  });
});
