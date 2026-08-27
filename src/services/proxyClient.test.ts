import { describe, expect, it, vi } from "vitest";
import { createProxyClient } from "./proxyClient";
import { translate } from "./translation";

function jsonFetch(payload: unknown, status = 200) {
  return vi.fn<(url: string, init: RequestInit) => Promise<Response>>(async () => new Response(JSON.stringify(payload), { status, headers: { "content-type": "application/json" } }));
}

describe("createProxyClient.complete", () => {
  it("POSTs to the endpoint and returns joined text blocks", async () => {
    const fetchImpl = jsonFetch({ content: [{ type: "text", text: "Hello " }, { type: "text", text: "world" }] });
    const client = createProxyClient({ endpoint: "/api/proxy", fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(await client.complete({ model: "claude-sonnet-5", input: "hi" })).toBe("Hello world");
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("/api/proxy");
    const sent = JSON.parse(init.body as string);
    expect(sent.model).toBe("claude-sonnet-5");
    expect(sent.stream).toBe(false);
    expect(sent.messages).toEqual([{ role: "user", content: "hi" }]);
  });

  it("surfaces only a sanitized category on a non-OK proxy response", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ error: "Anthropic rate limit reached", category: "rate-limit", detail: "secret prompt" }), { status: 429, headers: { "content-type": "application/json" } }));
    const client = createProxyClient({ fetchImpl: fetchImpl as unknown as typeof fetch });
    await expect(client.complete({ model: "claude-sonnet-5", input: "x" })).rejects.toThrow("Anthropic rate limit reached [rate-limit]");
    try { await client.complete({ model: "claude-sonnet-5", input: "x" }); } catch (error) { expect(String(error)).not.toContain("secret prompt"); }
  });

  it("uses a safe fallback when an error body is unreadable", async () => {
    const fetchImpl = vi.fn(async () => new Response("raw upstream secret", { status: 500 }));
    const client = createProxyClient({ fetchImpl: fetchImpl as unknown as typeof fetch });
    await expect(client.complete({ model: "claude-sonnet-5", input: "x" })).rejects.toThrow("AI provider is temporarily unavailable [provider]");
  });

  it("reports token usage when the response carries it", async () => {
    const client = createProxyClient({ fetchImpl: jsonFetch({ content: [{ type: "text", text: "hi" }], usage: { input_tokens: 42, output_tokens: 7 } }) as unknown as typeof fetch });
    const onUsage = vi.fn();
    await client.complete({ model: "claude-sonnet-5", input: "hi", onUsage });
    expect(onUsage).toHaveBeenCalledWith({ inputTokens: 42, outputTokens: 7 });
  });

  it("never reports usage when none is returned", async () => {
    const client = createProxyClient({ fetchImpl: jsonFetch({ content: [{ type: "text", text: "hi" }] }) as unknown as typeof fetch });
    const onUsage = vi.fn();
    await client.complete({ model: "claude-sonnet-5", input: "hi", onUsage });
    expect(onUsage).not.toHaveBeenCalled();
  });
});

describe("createProxyClient.stream", () => {
  it("yields text deltas parsed from SSE", async () => {
    const sse = 'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hel"}}\n\n' + 'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"lo"}}\n\n' + 'data: {"type":"message_stop"}\n\n' + "data: [DONE]\n\n";
    const client = createProxyClient({ fetchImpl: vi.fn(async () => new Response(sse, { status: 200, headers: { "content-type": "text/event-stream" } })) as unknown as typeof fetch });
    const chunks: string[] = [];
    for await (const delta of client.stream({ model: "claude-sonnet-5", input: "hi" })) chunks.push(delta);
    expect(chunks.join("")).toBe("Hello");
  });

  it("reports token usage from message_start/message_delta once", async () => {
    const sse = 'data: {"type":"message_start","message":{"usage":{"input_tokens":15,"output_tokens":0}}}\n\n' + 'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hi"}}\n\n' + 'data: {"type":"message_delta","usage":{"output_tokens":3}}\n\n' + 'data: {"type":"message_stop"}\n\n' + "data: [DONE]\n\n";
    const client = createProxyClient({ fetchImpl: vi.fn(async () => new Response(sse, { status: 200, headers: { "content-type": "text/event-stream" } })) as unknown as typeof fetch });
    const onUsage = vi.fn(); const chunks: string[] = [];
    for await (const delta of client.stream({ model: "claude-sonnet-5", input: "hi", onUsage })) chunks.push(delta);
    expect(chunks.join("")).toBe("Hi");
    expect(onUsage).toHaveBeenCalledTimes(1);
    expect(onUsage).toHaveBeenCalledWith({ inputTokens: 15, outputTokens: 3 });
  });

  it("never reports usage when the stream carries no usage events", async () => {
    const sse = 'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hi"}}\n\n' + "data: [DONE]\n\n";
    const client = createProxyClient({ fetchImpl: vi.fn(async () => new Response(sse, { status: 200, headers: { "content-type": "text/event-stream" } })) as unknown as typeof fetch });
    const onUsage = vi.fn();
    for await (const _ of client.stream({ model: "claude-sonnet-5", input: "hi", onUsage })) { /* drain */ }
    expect(onUsage).not.toHaveBeenCalled();
  });
});

describe("proxy client satisfies the translation seam", () => {
  it("translate runs end-to-end through complete", async () => {
    const reply = JSON.stringify({ translatedPrompt: "How do I add a Postgres index?", confidence: 88, detectedGaps: ["tangential-preamble"], reasoning: "Pulled the indexing question out of the preamble." });
    const client = createProxyClient({ fetchImpl: jsonFetch({ content: [{ type: "text", text: reply }] }) as unknown as typeof fetch });
    const outcome = await translate("ramble... postgres index??", { client: client.complete });
    expect(outcome.status).toBe("ok");
    if (outcome.status === "ok") { expect(outcome.result.translatedPrompt).toContain("Postgres index"); expect(outcome.result.confidence).toBe(88); }
  });
});
