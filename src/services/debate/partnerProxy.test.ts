import { describe, expect, it, vi } from "vitest";
import { handleOpenAiRequest, OPENAI_ADAPTER } from "./openaiHandler";
import { handleGoogleRequest, GOOGLE_ADAPTER } from "./googleHandler";
import { handleXaiRequest } from "./xaiHandler";
import { handleDeepseekRequest } from "./deepseekHandler";

const KEY = "test-provider-key";
function post(body: unknown, url = "https://app.test/api/proxy-openai"): Request {
  return new Request(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}
function okFetch(payload: unknown): typeof fetch {
  return vi.fn(async () => new Response(JSON.stringify(payload), { status: 200, headers: { "content-type": "application/json" } })) as unknown as typeof fetch;
}
const CHAT_OK = { choices: [{ message: { content: "The partner's argument." } }] };
const CHAT_WITH_USAGE = { ...CHAT_OK, usage: { prompt_tokens: 123, completion_tokens: 45 } };
const GEMINI_OK = { candidates: [{ content: { parts: [{ text: "Gemini's argument." }] } }] };
const GEMINI_WITH_USAGE = { ...GEMINI_OK, usageMetadata: { promptTokenCount: 321, candidatesTokenCount: 54 } };

describe("partner proxy — guards", () => {
  it("rejects a non-POST request", async () => {
    expect((await handleOpenAiRequest(new Request("https://app.test/api/proxy-openai"), KEY, okFetch(CHAT_OK))).status).toBe(405);
  });
  it("fails closed when the partner connection is not configured without naming secrets", async () => {
    const response = await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "i" }), undefined, okFetch(CHAT_OK));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.category).toBe("configuration");
    expect(JSON.stringify(body)).not.toContain("OPENAI_API_KEY");
  });
  it("rejects invalid JSON", async () => {
    const bad = new Request("https://app.test/api/proxy-openai", { method: "POST", body: "{oops" });
    expect((await handleOpenAiRequest(bad, KEY, okFetch(CHAT_OK))).status).toBe(400);
  });
  it("rejects an empty input", async () => {
    expect((await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "  " }), KEY, okFetch(CHAT_OK))).status).toBe(400);
  });
  it("rejects oversized content and unsafe output limits before upstream", async () => {
    const fetchImpl = okFetch(CHAT_OK);
    expect((await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "x".repeat(100_001) }), KEY, fetchImpl)).status).toBe(413);
    expect((await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "i", maxTokens: 50_000 }), KEY, fetchImpl)).status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
  it("refuses a different provider or Claude model", async () => {
    expect((await handleOpenAiRequest(post({ model: "grok-4.3", system: "s", input: "i" }), KEY, okFetch(CHAT_OK))).status).toBe(400);
    expect((await handleOpenAiRequest(post({ model: "claude-sonnet-5", system: "s", input: "i" }), KEY, okFetch(CHAT_OK))).status).toBe(400);
  });
});

describe("partner proxy — API key isolation", () => {
  it("sends OpenAI-compatible key upstream and never returns it", async () => {
    const fetchImpl = okFetch(CHAT_OK);
    const response = await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "i" }), KEY, fetchImpl);
    const [, init] = vi.mocked(fetchImpl).mock.calls[0];
    expect((init!.headers as Record<string, string>).authorization).toBe(`Bearer ${KEY}`);
    expect(JSON.stringify(await response.json())).not.toContain(KEY);
  });
  it("sends Gemini key in a header, never URL", async () => {
    const fetchImpl = okFetch(GEMINI_OK);
    await handleGoogleRequest(post({ model: "gemini-3.1-pro", system: "s", input: "i" }, "https://app.test/api/proxy-google"), KEY, fetchImpl);
    const [url, init] = vi.mocked(fetchImpl).mock.calls[0];
    expect(String(url)).not.toContain(KEY);
    expect((init!.headers as Record<string, string>)["x-goog-api-key"]).toBe(KEY);
  });
});

describe("partner proxy — normalized success and real usage", () => {
  it("returns text alone when OpenAI-compatible provider reports no usage", async () => {
    const response = await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "i" }), KEY, okFetch(CHAT_OK));
    expect(await response.json()).toEqual({ text: "The partner's argument." });
  });
  it("preserves OpenAI-compatible reported token counts without estimating", async () => {
    const response = await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "i" }), KEY, okFetch(CHAT_WITH_USAGE));
    expect(await response.json()).toEqual({ text: "The partner's argument.", usage: { inputTokens: 123, outputTokens: 45 } });
  });
  it("preserves Gemini reported token counts", async () => {
    const response = await handleGoogleRequest(post({ model: "gemini-3.1-pro", system: "s", input: "i" }, "https://app.test/api/proxy-google"), KEY, okFetch(GEMINI_WITH_USAGE));
    expect(await response.json()).toEqual({ text: "Gemini's argument.", usage: { inputTokens: 321, outputTokens: 54 } });
  });
  it("joins Gemini multipart replies", () => {
    expect(GOOGLE_ADAPTER.extractText({ candidates: [{ content: { parts: [{ text: "First half. " }, { text: "Second half." }] } }] })).toBe("First half. Second half.");
  });
  it("xAI and DeepSeek each answer for their own model", async () => {
    expect((await handleXaiRequest(post({ model: "grok-4.3", system: "s", input: "i" }, "https://app.test/api/proxy-xai"), KEY, okFetch(CHAT_OK))).status).toBe(200);
    expect((await handleDeepseekRequest(post({ model: "deepseek-v4-pro", system: "s", input: "i" }, "https://app.test/api/proxy-deepseek"), KEY, okFetch(CHAT_OK))).status).toBe(200);
  });
});

describe("partner proxy — safe failures", () => {
  it("maps an upstream network throw without leaking the raw exception", async () => {
    const fetchImpl = vi.fn(async () => { throw new Error("ECONNREFUSED secret-internal-host"); }) as unknown as typeof fetch;
    const response = await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "i" }), KEY, fetchImpl);
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.category).toBe("network");
    expect(JSON.stringify(body)).not.toContain("ECONNREFUSED");
    expect(JSON.stringify(body)).not.toContain("secret-internal-host");
  });
  it("passes status but never upstream body", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ error: { message: "your prompt was: secret user text" } }), { status: 429 })) as unknown as typeof fetch;
    const response = await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "i" }), KEY, fetchImpl);
    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.category).toBe("rate-limit");
    expect(JSON.stringify(body)).not.toContain("secret user text");
  });
  it("treats unreadable or empty text as provider failure", async () => {
    const nonJson = vi.fn(async () => new Response("<html>gateway</html>", { status: 200 })) as unknown as typeof fetch;
    expect((await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "i" }), KEY, nonJson)).status).toBe(502);
    expect((await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "i" }), KEY, okFetch({ choices: [{ message: { content: "   " } }] }))).status).toBe(502);
  });
  it("returns null for unrecognized adapter shapes", () => {
    expect(OPENAI_ADAPTER.extractText({ unexpected: true })).toBeNull();
    expect(GOOGLE_ADAPTER.extractText({ unexpected: true })).toBeNull();
    expect(OPENAI_ADAPTER.extractUsage?.({ unexpected: true })).toBeNull();
    expect(GOOGLE_ADAPTER.extractUsage?.({ unexpected: true })).toBeNull();
  });
});
