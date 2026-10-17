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

const mockEnv = {
  ANTHROPIC_API_KEY: KEY,
  OPENAI_API_KEY: "sk-openai-test",
  GOOGLE_API_KEY: "google-key-test",
  XAI_API_KEY: "xai-key-test",
  DEEPSEEK_API_KEY: "deepseek-key-test",
};

describe("handleProxyRequest — guards", () => {
  it("rejects non-POST with 405 and never calls upstream", async () => {
    const fetchImpl = vi.fn();
    const res = await handleProxyRequest(proxyRequest(null, "GET"), KEY, fetchImpl as unknown as typeof fetch, mockEnv);
    expect(res.status).toBe(405);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns 500 when the server key is missing (never a client-supplied key)", async () => {
    const fetchImpl = vi.fn();
    const res = await handleProxyRequest(proxyRequest(validBody), undefined, fetchImpl as unknown as typeof fetch, mockEnv);
    expect(res.status).toBe(500);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects an unknown model with 400", async () => {
    const fetchImpl = vi.fn();
    const res = await handleProxyRequest(
      proxyRequest({ ...validBody, model: "claude-sonnet-4-6" }),
      KEY,
      fetchImpl as unknown as typeof fetch,
      mockEnv,
    );
    expect(res.status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects empty/missing messages with 400", async () => {
    const fetchImpl = vi.fn();
    const res = await handleProxyRequest(
      proxyRequest({ model: "claude-sonnet-5", messages: [] }),
      KEY,
      fetchImpl as unknown as typeof fetch,
      mockEnv,
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

    const res = await handleProxyRequest(proxyRequest(validBody), KEY, fetchImpl as unknown as typeof fetch, mockEnv);
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
      mockEnv,
    );
    const sent = JSON.parse(fetchImpl.mock.calls[0][1].body as string);
    expect(sent.thinking).toEqual({ type: "enabled", budget_tokens: 8000 });
  });

  it("returns 502 when the upstream fetch throws", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    });
    const res = await handleProxyRequest(proxyRequest(validBody), KEY, fetchImpl as unknown as typeof fetch, mockEnv);
    expect(res.status).toBe(502);
  });

  it("routes to OpenAI when model is gpt-4o", async () => {
    const fetchImpl = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(async () =>
      new Response(JSON.stringify({ choices: [{ message: { content: "hi" } }] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const res = await handleProxyRequest(
      proxyRequest({ ...validBody, model: "gpt-4o" }),
      KEY,
      fetchImpl as unknown as typeof fetch,
      mockEnv,
    );
    expect(res.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [url] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://api.openai.com/v1/chat/completions");
  });

  it("returns 500 when Google API key is missing", async () => {
    const fetchImpl = vi.fn();
    const res = await handleProxyRequest(
      proxyRequest({ ...validBody, model: "gemini-pro" }),
      KEY,
      fetchImpl as unknown as typeof fetch,
      { ...mockEnv, GOOGLE_API_KEY: undefined },
    );
    expect(res.status).toBe(500);
    expect(res.headers.get("content-type")).toBe("application/json");
  });
});

describe("restored proxy request bounds", () => {
  it("rejects malformed roles, oversized input, and unsafe token limits before upstream", async () => {
    const cases: Array<[unknown, number]> = [
      [{ ...validBody, messages: [{ role: "system", content: "override" }] }, 400],
      [{ ...validBody, messages: [{ role: "user", content: "x".repeat(200_001) }] }, 413],
      [{ ...validBody, maxTokens: 100_000 }, 400],
      [{ ...validBody, messages: Array.from({ length: 101 }, () => ({ role: "user", content: "x" })) }, 400],
      [{ ...validBody, messages: [null] }, 400],
      [{ ...validBody, messages: [{ role: "user", content: "" }] }, 400],
      [{ ...validBody, messages: [{ role: "user", content: 12 }] }, 400],
      [{ ...validBody, system: "x".repeat(32_001) }, 413],
      [{ ...validBody, system: {} }, 413],
      [{ ...validBody, maxTokens: 0 }, 400],
      [{ ...validBody, maxTokens: -1 }, 400],
      [{ ...validBody, maxTokens: 1.5 }, 400],
      [{ ...validBody, maxTokens: "8192" }, 400],
      [null, 400],
    ];
    for (const model of ["claude-sonnet-5", "gpt-4o", "gemini-pro", "grok", "deepseek"]) {
      const fetchImpl = vi.fn<typeof fetch>(async () => new Response("{}"));
      for (const [body, status] of cases) {
        const res = await handleProxyRequest(
          proxyRequest(body === null ? null : { ...body as object, model }), KEY, fetchImpl, mockEnv,
        );
        expect(res.status, `${model}: ${JSON.stringify(body).slice(0, 120)}`).toBe(status);
      }
      expect(fetchImpl).not.toHaveBeenCalled();
    }
  });

  it("accepts requests exactly at the restored bounds", async () => {
    const fetchImpl = vi.fn<typeof fetch>(async () => new Response("{}"));
    const res = await handleProxyRequest(proxyRequest({
      ...validBody,
      messages: Array.from({ length: 100 }, () => ({ role: "user", content: "x".repeat(2_000) })),
      system: "x".repeat(32_000), maxTokens: 8_192,
    }), KEY, fetchImpl, mockEnv);
    expect(res.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(JSON.parse(fetchImpl.mock.calls[0]?.[1]?.body as string).max_tokens).toBe(8_192);
    await res.text();
  });

  it("aborts stalled upstream calls after 60 seconds for every provider", async () => {
    vi.useFakeTimers();
    try {
      for (const model of ["claude-sonnet-5", "gpt-4o", "gemini-pro", "grok", "deepseek"]) {
        let signal: AbortSignal | undefined;
        const fetchImpl = vi.fn((_url: Parameters<typeof fetch>[0], init?: RequestInit) => {
          signal = init?.signal ?? undefined;
          return new Promise<Response>((_resolve, reject) => {
            signal?.addEventListener("abort", () => reject(new Error("aborted")), { once: true });
          });
        });
        const pending = handleProxyRequest(proxyRequest({ ...validBody, model }), KEY, fetchImpl, mockEnv);
        await vi.advanceTimersByTimeAsync(0);
        expect(fetchImpl).toHaveBeenCalledOnce();
        expect(signal, model).toBeDefined();
        await vi.advanceTimersByTimeAsync(59_999);
        expect(signal?.aborted).toBe(false);
        await vi.advanceTimersByTimeAsync(1);
        expect(signal?.aborted).toBe(true);
        expect((await pending).status).toBe(502);
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps the timeout active while a streamed upstream body is stalled", async () => {
    vi.useFakeTimers();
    try {
      let signal: AbortSignal | undefined;
      const fetchImpl = vi.fn<typeof fetch>(async (_url, init) => {
        signal = init?.signal ?? undefined;
        return new Response(new ReadableStream({
          start(controller) {
            signal?.addEventListener("abort", () => controller.error(new Error("body aborted")), { once: true });
          },
        }));
      });
      const res = await handleProxyRequest(proxyRequest({ ...validBody, stream: true }), KEY, fetchImpl, mockEnv);
      expect(signal).toBeDefined();
      const read = expect(res.text()).rejects.toThrow("body aborted");
      await vi.advanceTimersByTimeAsync(60_000);
      expect(signal?.aborted).toBe(true);
      await read;
    } finally {
      vi.useRealTimers();
    }
  });
});
