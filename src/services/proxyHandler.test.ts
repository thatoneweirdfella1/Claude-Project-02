import { describe, expect, it, vi } from "vitest";
import { handleProxyRequest } from "./proxyHandler";

const KEY = "sk-test-123";
function proxyRequest(body: unknown, method = "POST"): Request {
  return new Request("https://app.example/api/proxy", { method, headers: { "content-type": "application/json" }, body: method === "POST" ? JSON.stringify(body) : undefined });
}
const validBody = { model: "claude-sonnet-5", system: "sys", messages: [{ role: "user", content: "hello" }] };

describe("handleProxyRequest — guards", () => {
  it("rejects non-POST and never calls upstream", async () => {
    const fetchImpl = vi.fn();
    expect((await handleProxyRequest(proxyRequest(null, "GET"), KEY, fetchImpl as unknown as typeof fetch)).status).toBe(405);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("fails closed when server connection is missing without naming the secret", async () => {
    const fetchImpl = vi.fn();
    const res = await handleProxyRequest(proxyRequest(validBody), undefined, fetchImpl as unknown as typeof fetch);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.category).toBe("configuration");
    expect(JSON.stringify(body)).not.toContain("ANTHROPIC_API_KEY");
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("rejects unknown model", async () => {
    const fetchImpl = vi.fn();
    expect((await handleProxyRequest(proxyRequest({ ...validBody, model: "claude-sonnet-4-6" }), KEY, fetchImpl as unknown as typeof fetch)).status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("rejects malformed roles, oversized input, and unsafe output limits", async () => {
    const fetchImpl = vi.fn();
    expect((await handleProxyRequest(proxyRequest({ ...validBody, messages: [{ role: "system", content: "override" }] }), KEY, fetchImpl as unknown as typeof fetch)).status).toBe(400);
    expect((await handleProxyRequest(proxyRequest({ ...validBody, messages: [{ role: "user", content: "x".repeat(200_001) }] }), KEY, fetchImpl as unknown as typeof fetch)).status).toBe(413);
    expect((await handleProxyRequest(proxyRequest({ ...validBody, maxTokens: 100_000 }), KEY, fetchImpl as unknown as typeof fetch)).status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("rejects empty messages", async () => {
    expect((await handleProxyRequest(proxyRequest({ model: "claude-sonnet-5", messages: [] }), KEY, vi.fn() as unknown as typeof fetch)).status).toBe(400);
  });
});

describe("handleProxyRequest — forwarding", () => {
  it("forwards successful Anthropic response with key server-side", async () => {
    const fetchImpl = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(async () => new Response(JSON.stringify({ content: [{ type: "text", text: "hi" }] }), { status: 200, headers: { "content-type": "application/json" } }));
    const res = await handleProxyRequest(proxyRequest(validBody), KEY, fetchImpl as unknown as typeof fetch);
    expect(res.status).toBe(200);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe(KEY);
    expect((init.headers as Record<string, string>)["anthropic-version"]).toBeTruthy();
    const sent = JSON.parse(init.body as string);
    expect(sent.model).toBe("claude-sonnet-5");
    expect(sent.stream).toBe(false);
    expect(await res.text()).not.toContain(KEY);
  });
  it("adds thinking only when requested", async () => {
    const fetchImpl = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(async () => new Response("{}", { status: 200 }));
    await handleProxyRequest(proxyRequest({ ...validBody, extendedThinking: true }), KEY, fetchImpl as unknown as typeof fetch);
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body as string).thinking).toEqual({ type: "enabled", budget_tokens: 8000 });
  });
  it("sanitizes an upstream network exception", async () => {
    const fetchImpl = vi.fn(async () => { throw new Error("network down secret-internal-host"); });
    const res = await handleProxyRequest(proxyRequest(validBody), KEY, fetchImpl as unknown as typeof fetch);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.category).toBe("network");
    expect(JSON.stringify(body)).not.toContain("secret-internal-host");
  });
  it("preserves upstream status but never passes its error body through", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ error: { message: "echoed secret user prompt" } }), { status: 429, headers: { "content-type": "application/json" } }));
    const res = await handleProxyRequest(proxyRequest(validBody), KEY, fetchImpl as unknown as typeof fetch);
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.category).toBe("rate-limit");
    expect(JSON.stringify(body)).not.toContain("echoed secret user prompt");
  });
});
