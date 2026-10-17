import { afterEach, describe, expect, it, vi } from "vitest";
import { MODEL_REGISTRY } from "../modelRegistry";
import { handleProxyRequest } from "../proxyHandler";
import providerStatus from "../../../api/provider-status";

const slots = [
  { provider: "groq", model: "llama-3.3-70b-versatile", variable: "GROQ_API_KEY", url: "https://api.groq.com/openai/v1/chat/completions" },
  { provider: "openrouter", model: "meta-llama/llama-3.3-70b-instruct:free", variable: "OPENROUTER_API_KEY", url: "https://openrouter.ai/api/v1/chat/completions" },
] as const;

function request(model: string) {
  return new Request("https://app.example/api/proxy", { method: "POST", body: JSON.stringify({
    model, system: "Be useful.", messages: [{ role: "user", content: "Hello" }],
  }) });
}

afterEach(() => vi.unstubAllEnvs());

describe("P1 real free provider slots (HTTP is always mocked)", () => {
  for (const slot of slots) {
    it(`registers ${slot.provider} with a free model`, () => {
      expect((MODEL_REGISTRY as Record<string, unknown>)[slot.model]).toMatchObject({
        id: slot.model, provider: slot.provider, plan: "free",
      });
      if (slot.provider === "openrouter") expect(slot.model.endsWith(":free")).toBe(true);
    });

    it(`routes ${slot.provider} to its own URL with bearer authentication`, async () => {
      // Runtime-only dummy material; assertion failures never serialize it.
      const credential = crypto.randomUUID();
      const upstream = vi.fn<typeof fetch>(async (url, init) => {
        expect(url).toBe(slot.url);
        expect(new Headers(init?.headers).get("authorization") === `Bearer ${credential}`).toBe(true);
        expect(JSON.parse(String(init?.body))).toMatchObject({
          model: slot.model, messages: [{ role: "system", content: "Be useful." }, { role: "user", content: "Hello" }],
        });
        return Response.json({ choices: [{ message: { content: "Mock answer" } }] });
      });
      const response = await handleProxyRequest(request(slot.model), undefined, upstream, { [slot.variable]: credential });
      expect(response.status).toBe(200);
      expect(upstream).toHaveBeenCalledOnce();
      expect((await response.text()).includes(credential)).toBe(false);
    });

    it(`names ${slot.variable} when missing without making any HTTP call`, async () => {
      vi.stubEnv(slot.variable, "");
      const upstream = vi.fn<typeof fetch>();
      const response = await handleProxyRequest(request(slot.model), undefined, upstream, {});
      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({ error: `Proxy is missing ${slot.variable}` });
      expect(upstream).not.toHaveBeenCalled();
    });
  }

  it("reports both slots by presence only from the existing status route", async () => {
    const accessPassword = crypto.randomUUID();
    vi.stubEnv("APP_ACCESS_PASSWORD", accessPassword);
    const credential = crypto.randomUUID();
    vi.stubEnv("GROQ_API_KEY", credential);
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const response = providerStatus(new Request("https://app.example/api/provider-status", { headers: { "x-app-password": accessPassword } }));
    const text = await response.text();
    expect(JSON.parse(text)).toMatchObject({ groq: true, openrouter: false });
    expect(text.includes(credential)).toBe(false);
  });

  it("reads the new server variables at call time through the existing proxy entry", async () => {
    for (const slot of slots) {
      const credential = crypto.randomUUID();
      vi.stubEnv(slot.variable, credential);
      let authenticated = false;
      const upstream = vi.fn<typeof fetch>(async (_url, init) => {
        authenticated = new Headers(init?.headers).get("authorization") === `Bearer ${credential}`;
        return Response.json({ choices: [{ message: { content: "Mock" } }] });
      });
      const response = await handleProxyRequest(request(slot.model), undefined, upstream, {});
      expect(response.status).toBe(200);
      expect(authenticated).toBe(true);
      await response.text();
    }
  });
});
