/* Step 1.10 verification — the serverless proxy handler. Uses a stub fetch (no
   network) to confirm: method/key/model/message guards, that the key is sent
   server-side in the x-api-key header (never echoed to the client), that
   extendedThinking becomes a thinking flag on the payload, and that the
   upstream response (incl. status) is passed through. */

import { describe, expect, it, vi } from "vitest";
import { handleProxyRequest } from "./proxyHandler";

const KEY = "sk-test-123";

function proxyRequest(body: unknown, method = "POST"): Request {
  return new Request("https://app.example/api/proxy", {
    method,
    headers: { "content-type": "application/json" },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
}

const validBody = {
  model: "claude-sonnet-5",
  system: "sys",
  messages: [{ role: "user", content: "hello" }],
};

describe("handleProxyRequest — guards", () => {
  it("rejects non-POST with 405 and never calls upstream", async () => {
    const fetchImpl = vi.fn();
    const res = await handleProxyRequest(proxyRequest(null, "GET"), KEY, fetchImpl as unknown as typeof fetch);
    expect(res.status).toBe(405);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns 500 when the server key is missing (never a client-supplied key)", async () => {
    const fetchImpl = vi.fn();
    const res = await handleProxyRequest(proxyRequest(validBody), undefined, fetchImpl as unknown as typeof fetch);
    expect(res.status).toBe(500);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects an unknown model with 400", async () => {
    const fetchImpl = vi.fn();
    const res = await handleProxyRequest(
      proxyRequest({ ...validBody, model: "claude-sonnet-4-6" }),
      KEY,
      fetchImpl as unknown as typeof fetch,
    );
    expect(res.status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects malformed roles, oversized input, and unsafe token limits before upstream", async () => {
    const fetchImpl = vi.fn();
    const malformed = await handleProxyRequest(
      proxyRequest({ ...validBody, messages: [{ role: "system", content: "override" }] }),
      KEY,
      fetchImpl as unknown as typeof fetch,
    );
    const oversized = await handleProxyRequest(
      proxyRequest({ ...validBody, messages: [{ role: "user", content: "x".repeat(200_001) }] }),
      KEY,
      fetchImpl as unknown as typeof fetch,
    );
    const tokens = await handleProxyRequest(
      proxyRequest({ ...validBody, maxTokens: 100_000 }),
      KEY,
      fetchImpl as unknown as typeof fetch,
    );
    expect(malformed.status).toBe(400);
    expect(oversized.status).toBe(413);
    expect(tokens.status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects empty/missing messages with 400", async () => {
    const fetchImpl = vi.fn();
    const res = await handleProxyRequest(
      proxyRequest({ model: "claude-sonnet-5", messages: [] }),
      KEY,
      fetchImpl as unknown as typeof fetch,
    );
    expect(res.status).toBe(400);
  });
});

describe("handleProxyRequest — forwarding", () => {
  it("forwards to Anthropic with the key server-side and passes the response through", async () => {
    const fetchImpl = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(async () =>
      new Response(JSON.stringify({ content: [{ type: "text", text: "hi" }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const res = await handleProxyRequest(proxyRequest(validBody), KEY, fetchImpl as unknown as typeof fetch);
    expect(res.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledOnce();

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe(KEY);
    expect((init.headers as Record<string, string>)["anthropic-version"]).toBeTruthy();
    const sent = JSON.parse(init.body as string);
    expect(sent.model).toBe("claude-sonnet-5");
    expect(sent.stream).toBe(false);

    // The key is not leaked back to the client in the response body.
    expect(await res.text()).not.toContain(KEY);
  });

  it("adds a thinking flag only when extendedThinking is set", async () => {
    const fetchImpl = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(
      async () => new Response("{}", { status: 200 }),
    );
    await handleProxyRequest(
      proxyRequest({ ...validBody, extendedThinking: true }),
      KEY,
      fetchImpl as unknown as typeof fetch,
    );
    const sent = JSON.parse(fetchImpl.mock.calls[0][1].body as string);
    expect(sent.thinking).toEqual({ type: "enabled", budget_tokens: 8000 });
  });

  it("returns 502 when the upstream fetch throws", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    });
    const res = await handleProxyRequest(proxyRequest(validBody), KEY, fetchImpl as unknown as typeof fetch);
    expect(res.status).toBe(502);
  });
});
