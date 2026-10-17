import { afterEach, describe, expect, it, vi } from "vitest";
import { MODEL_REGISTRY } from "../modelRegistry";
import { getModelPrice } from "../costTracking";
import { handleProxyRequest } from "../proxyHandler";
import { getProviderAvailability } from "../providerStatus";
import * as pool from "../providerPool";
import providerStatus from "../../../api/provider-status";

const slots = [
  { provider: "huggingface", model: "meta-llama/Llama-3.3-70B-Instruct", variable: "HF_TOKEN",
    url: "https://router.huggingface.co/v1/chat/completions" },
  { provider: "cloudflare", model: "@cf/meta/llama-3.1-8b-instruct", variable: "CLOUDFLARE_API_TOKEN",
    url: "https://api.cloudflare.com/client/v4/accounts/test-account/ai/v1/chat/completions" },
] as const;

function request(model: string, extra: Record<string, unknown> = {}) {
  return new Request("https://app.example/api/proxy", { method: "POST", body: JSON.stringify({
    model, system: "Be useful.", messages: [{ role: "user", content: "Hello" }], ...extra,
  }) });
}
function answer(text = "Mock answer") {
  return Response.json({ choices: [{ message: { content: text } }], usage: { prompt_tokens: 5, completion_tokens: 2 } });
}
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

describe("Q1 new provider slots; all HTTP is mocked", () => {
  for (const slot of slots) {
    it(`registers and zero-prices ${slot.provider} inside the ordered free pool`, async () => {
      expect((MODEL_REGISTRY as Record<string, unknown>)[slot.model]).toMatchObject({
        id: slot.model, provider: slot.provider, plan: "free",
      });
      expect(getModelPrice(slot.model)).toEqual({ inputPerMillion: 0, outputPerMillion: 0 });
      expect(pool.isFreePoolModel(slot.model)).toBe(true);
      const order = (pool as unknown as { FREE_PROVIDER_ORDER: Record<string, number> }).FREE_PROVIDER_ORDER;
      expect(Object.hasOwn(order ?? {}, slot.provider)).toBe(true);
      const result = await pool.createProviderPool().run({ models: [slot.model], configured: () => true,
        execute: async () => answer() });
      expect(result).toMatchObject({ status: "answered", provider: slot.provider, model: slot.model });
    });

    it(`routes ${slot.provider} to the exact URL with bearer authentication`, async () => {
      const credential = crypto.randomUUID();
      let correctUrl = false;
      let authenticated = false;
      let correctBody = false;
      let calls = 0;
      const response = await handleProxyRequest(request(slot.model), undefined, async (url, init) => {
        calls += 1;
        correctUrl = String(url) === slot.url;
        authenticated = new Headers(init?.headers).get("authorization") === "Bearer " + credential;
        const body = JSON.parse(String(init?.body));
        correctBody = body.model === slot.model && body.messages[0].role === "system" &&
          body.messages[0].content === "Be useful." && body.messages[1].content === "Hello";
        return answer();
      }, { [slot.variable]: credential, CLOUDFLARE_ACCOUNT_ID: "test-account" });
      expect(response.status).toBe(200);
      expect(calls).toBe(1);
      expect(correctUrl).toBe(true);
      expect(authenticated).toBe(true);
      expect(correctBody).toBe(true);
      expect((await response.text()).includes(credential)).toBe(false);
    });

    it(`names missing ${slot.variable} without dispatching`, async () => {
      vi.stubEnv(slot.variable, "");
      const upstream = vi.fn<typeof fetch>();
      const response = await handleProxyRequest(request(slot.model), undefined, upstream,
        { CLOUDFLARE_ACCOUNT_ID: "test-account" });
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: `Proxy is missing ${slot.variable}` });
      expect(upstream).not.toHaveBeenCalled();
    });

    it(`reads ${slot.provider} variables at call time and redacts runtime-only credentials`, async () => {
      const { handleProxyRequest: freshHandle } = await import("../proxyHandler");
      const credential = crypto.randomUUID();
      vi.stubEnv(slot.variable, credential);
      vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "test-account");
      let authenticated = false;
      const response = await freshHandle(request(slot.model, { freePool: true, poolModels: [slot.model] }),
        undefined, async (_url, init) => {
          authenticated = new Headers(init?.headers).get("authorization") === "Bearer " + credential;
          return answer("Echo: " + credential);
        });
      const text = await response.text();
      expect(authenticated).toBe(true);
      expect(JSON.parse(text).freePool?.status).toBe("answered");
      expect(text.includes(credential)).toBe(false);
      expect(text).toContain("[REDACTED]");
    });
  }

  it("requires the Cloudflare account id separately and omits an incomplete slot from the pool", async () => {
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "");
    const upstream = vi.fn<typeof fetch>();
    const env = { CLOUDFLARE_API_TOKEN: crypto.randomUUID() };
    const direct = await handleProxyRequest(request(slots[1].model), undefined, upstream, env);
    expect(direct.status).toBe(500);
    expect(await direct.json()).toEqual({ error: "Proxy is missing CLOUDFLARE_ACCOUNT_ID" });
    const pooled = await handleProxyRequest(request("auto", { freePool: true, poolModels: [slots[1].model] }),
      undefined, upstream, env);
    expect((await pooled.json()).freePool?.status).toBe("refused");
    expect(upstream).not.toHaveBeenCalled();
  });

  it.each([402, 403])("treats Hugging Face exhausted credit (%s) as a budget refusal and hands off", async (status) => {
    const calls: string[] = [];
    const result = await pool.createProviderPool(() => 1000).run({
      models: [slots[0].model, "meta-llama/llama-3.3-70b-instruct:free"], configured: () => true,
      execute: async (model) => {
        calls.push(model.provider);
        return model.provider === "huggingface"
          ? Response.json({ error: "You have exceeded your monthly included credits. Purchase credits to continue." }, { status })
          : answer();
      },
    });
    expect(calls).toEqual(["huggingface", "openrouter"]);
    expect(result.handedOff).toBe(true);
    expect(result.budgets).toContainEqual({ provider: "huggingface", exhaustedAt: 1000, resetAt: 86_401_000 });
    const exhausted = await pool.createProviderPool(() => 1000).run({ models: [slots[0].model],
      configured: () => true, execute: async () => Response.json({ error: "Payment required: insufficient credits" }, { status: 402 }) });
    expect(exhausted.status).toBe("refused");
    expect(exhausted.budgets).toContainEqual({ provider: "huggingface", exhaustedAt: 1000, resetAt: 86_401_000 });
    expect(result.status).toBe("answered");
  });

  it("advances from an exhausted Hugging Face credit account to another free provider", async () => {
    const localPool = pool.createProviderPool(() => 1000);
    const limited = await localPool.run({ models: [slots[0].model], configured: () => true,
      execute: async () => Response.json({ error: "Monthly credits exhausted" }, { status: 402 }) });
    const result = await localPool.run({ models: [slots[0].model, slots[1].model], configured: () => true,
      execute: async () => answer() });
    expect(limited.budgets).toHaveLength(1);
    expect(result).toMatchObject({ status: "answered", provider: "cloudflare" });
    expect(result.attempts).toEqual(["cloudflare"]);
  });

  it("reports new provider presence and requires both Cloudflare variables without exposing values", async () => {
    const access = crypto.randomUUID();
    const credential = crypto.randomUUID();
    vi.stubEnv("APP_ACCESS_PASSWORD", access);
    vi.stubEnv("HF_TOKEN", credential);
    vi.stubEnv("CLOUDFLARE_API_TOKEN", credential);
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "");
    const statusRequest = () => new Request("https://app.example/api/provider-status", { headers: { "x-app-password": access } });
    const partial = await providerStatus(statusRequest()).text();
    expect(JSON.parse(partial)).toMatchObject({ huggingface: true, cloudflare: false, freePoolAvailable: true });
    expect(partial.includes(credential)).toBe(false);
    vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "test-account");
    const complete = await providerStatus(statusRequest()).json();
    expect(complete).toMatchObject({ cloudflare: true });
    const client = await getProviderAvailability(async () => Response.json(complete));
    expect(client).toMatchObject({ huggingface: true, cloudflare: true });
  });
});
