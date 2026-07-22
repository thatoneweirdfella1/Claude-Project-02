/* Step 1.10 verification — the browser proxy client. Uses a stub fetch (no
   network) to confirm: complete() POSTs to the proxy and returns the joined
   text, a non-OK response throws, stream() yields text deltas from SSE, and —
   the key wiring — complete() satisfies the Step 2.2 TranslationModelClient seam
   so translate() runs end-to-end through the proxy client. */

import { describe, expect, it, vi } from "vitest";
import { createProxyClient } from "./proxyClient";
import { translate } from "./translation";

function jsonFetch(payload: unknown, status = 200) {
  return vi.fn<(url: string, init: RequestInit) => Promise<Response>>(async () =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { "content-type": "application/json" },
    }),
  );
}

describe("createProxyClient.complete", () => {
  it("POSTs to the endpoint (stream:false) and returns joined text blocks", async () => {
    const fetchImpl = jsonFetch({
      content: [
        { type: "text", text: "Hello " },
        { type: "text", text: "world" },
      ],
    });
    const client = createProxyClient({ endpoint: "/api/proxy", fetchImpl: fetchImpl as unknown as typeof fetch });
    const text = await client.complete({ model: "claude-sonnet-5", input: "hi" });

    expect(text).toBe("Hello world");
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("/api/proxy");
    const sent = JSON.parse(init.body as string);
    expect(sent.model).toBe("claude-sonnet-5");
    expect(sent.stream).toBe(false);
    expect(sent.messages).toEqual([{ role: "user", content: "hi" }]);
  });

  it("throws on a non-OK proxy response", async () => {
    const fetchImpl = vi.fn(async () => new Response("nope", { status: 500 }));
    const client = createProxyClient({ fetchImpl: fetchImpl as unknown as typeof fetch });
    await expect(client.complete({ model: "claude-sonnet-5", input: "x" })).rejects.toThrow(
      /Proxy call failed \(500\)/,
    );
  });

  it("reports token usage via onUsage (Step 5.4 telemetry seam) when the response carries it", async () => {
    const fetchImpl = jsonFetch({
      content: [{ type: "text", text: "hi" }],
      usage: { input_tokens: 42, output_tokens: 7 },
    });
    const client = createProxyClient({ fetchImpl: fetchImpl as unknown as typeof fetch });
    const onUsage = vi.fn();
    await client.complete({ model: "claude-sonnet-5", input: "hi", onUsage });
    expect(onUsage).toHaveBeenCalledWith({ inputTokens: 42, outputTokens: 7 });
  });

  it("never calls onUsage when the response carries no usage field", async () => {
    const fetchImpl = jsonFetch({ content: [{ type: "text", text: "hi" }] });
    const client = createProxyClient({ fetchImpl: fetchImpl as unknown as typeof fetch });
    const onUsage = vi.fn();
    await client.complete({ model: "claude-sonnet-5", input: "hi", onUsage });
    expect(onUsage).not.toHaveBeenCalled();
  });
});

describe("createProxyClient.stream", () => {
  it("yields text deltas parsed from the SSE body", async () => {
    const sse =
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hel"}}\n\n' +
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"lo"}}\n\n' +
      'data: {"type":"message_stop"}\n\n' +
      "data: [DONE]\n\n";
    const fetchImpl = vi.fn(async () =>
      new Response(sse, { status: 200, headers: { "content-type": "text/event-stream" } }),
    );
    const client = createProxyClient({ fetchImpl: fetchImpl as unknown as typeof fetch });

    const chunks: string[] = [];
    for await (const delta of client.stream({ model: "claude-sonnet-5", input: "hi" })) {
      chunks.push(delta);
    }
    expect(chunks.join("")).toBe("Hello");
  });

  it("reports token usage from message_start/message_delta once the stream ends", async () => {
    const sse =
      'data: {"type":"message_start","message":{"usage":{"input_tokens":15,"output_tokens":0}}}\n\n' +
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hi"}}\n\n' +
      'data: {"type":"message_delta","usage":{"output_tokens":3}}\n\n' +
      'data: {"type":"message_stop"}\n\n' +
      "data: [DONE]\n\n";
    const fetchImpl = vi.fn(async () =>
      new Response(sse, { status: 200, headers: { "content-type": "text/event-stream" } }),
    );
    const client = createProxyClient({ fetchImpl: fetchImpl as unknown as typeof fetch });
    const onUsage = vi.fn();

    const chunks: string[] = [];
    for await (const delta of client.stream({ model: "claude-sonnet-5", input: "hi", onUsage })) {
      chunks.push(delta);
    }
    expect(chunks.join("")).toBe("Hi");
    expect(onUsage).toHaveBeenCalledTimes(1);
    expect(onUsage).toHaveBeenCalledWith({ inputTokens: 15, outputTokens: 3 });
  });

  it("never calls onUsage when the SSE stream carries no usage events", async () => {
    const sse =
      'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hi"}}\n\n' +
      "data: [DONE]\n\n";
    const fetchImpl = vi.fn(async () =>
      new Response(sse, { status: 200, headers: { "content-type": "text/event-stream" } }),
    );
    const client = createProxyClient({ fetchImpl: fetchImpl as unknown as typeof fetch });
    const onUsage = vi.fn();
    for await (const _ of client.stream({ model: "claude-sonnet-5", input: "hi", onUsage })) {
      // drain
    }
    expect(onUsage).not.toHaveBeenCalled();
  });
});

describe("proxy client satisfies the translation seam", () => {
  it("translate() runs end-to-end through client.complete", async () => {
    const reply = JSON.stringify({
      translatedPrompt: "How do I add a Postgres index?",
      confidence: 88,
      detectedGaps: ["tangential-preamble"],
      reasoning: "Pulled the indexing question out of the preamble.",
    });
    const fetchImpl = jsonFetch({ content: [{ type: "text", text: reply }] });
    const client = createProxyClient({ fetchImpl: fetchImpl as unknown as typeof fetch });

    const outcome = await translate("ramble... postgres index??", { client: client.complete });
    expect(outcome.status).toBe("ok");
    if (outcome.status === "ok") {
      expect(outcome.result.translatedPrompt).toContain("Postgres index");
      expect(outcome.result.confidence).toBe(88);
    }
  });
});
