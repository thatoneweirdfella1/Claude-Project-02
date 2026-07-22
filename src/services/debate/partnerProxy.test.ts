/* Step 8.3 verification — the partner proxies. Same offline posture as
   proxyHandler.test.ts and urlFetchHandler.test.ts: fetchImpl is stubbed, so
   no network is needed (the sandbox has none). What's under test is the
   security and resilience contract ROUTING.md states, not the vendors. */

import { describe, expect, it, vi } from "vitest";
import { handleOpenAiRequest, OPENAI_ADAPTER } from "./openaiHandler";
import { handleGoogleRequest, GOOGLE_ADAPTER } from "./googleHandler";
import { handleXaiRequest } from "./xaiHandler";
import { handleDeepseekRequest } from "./deepseekHandler";

const KEY = "test-provider-key";

function post(body: unknown, url = "https://app.test/api/proxy-openai"): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function okFetch(payload: unknown): typeof fetch {
  return vi.fn(async () => new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "content-type": "application/json" },
  })) as unknown as typeof fetch;
}

const CHAT_OK = { choices: [{ message: { content: "The partner's argument." } }] };
const GEMINI_OK = { candidates: [{ content: { parts: [{ text: "Gemini's argument." }] } }] };

describe("partner proxy — guards", () => {
  it("rejects a non-POST request", async () => {
    const response = await handleOpenAiRequest(
      new Request("https://app.test/api/proxy-openai"),
      KEY,
      okFetch(CHAT_OK),
    );
    expect(response.status).toBe(405);
  });

  it("reports a missing key as a 500 misconfiguration, naming the env var", async () => {
    const response = await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "i" }), undefined, okFetch(CHAT_OK));
    expect(response.status).toBe(500);
    expect((await response.json()).error).toContain("OPENAI_API_KEY");
  });

  it("rejects invalid JSON", async () => {
    const bad = new Request("https://app.test/api/proxy-openai", { method: "POST", body: "{oops" });
    expect((await handleOpenAiRequest(bad, KEY, okFetch(CHAT_OK))).status).toBe(400);
  });

  it("rejects an empty input", async () => {
    const response = await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "  " }), KEY, okFetch(CHAT_OK));
    expect(response.status).toBe(400);
  });

  it("refuses a body naming a DIFFERENT provider's model — endpoints are not interchangeable", async () => {
    const response = await handleOpenAiRequest(post({ model: "grok-4.3", system: "s", input: "i" }), KEY, okFetch(CHAT_OK));
    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain("gpt-5.5");
  });

  it("refuses a Claude model id — a partner endpoint must never proxy Claude", async () => {
    const response = await handleOpenAiRequest(post({ model: "claude-sonnet-5", system: "s", input: "i" }), KEY, okFetch(CHAT_OK));
    expect(response.status).toBe(400);
  });
});

describe("partner proxy — the API key stays server-side", () => {
  it("sends the key upstream as a bearer token and never returns it to the caller", async () => {
    const fetchImpl = okFetch(CHAT_OK);
    const response = await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "i" }), KEY, fetchImpl);

    const [, init] = vi.mocked(fetchImpl).mock.calls[0];
    expect((init!.headers as Record<string, string>).authorization).toBe(`Bearer ${KEY}`);
    expect(JSON.stringify(await response.json())).not.toContain(KEY);
  });

  it("sends Gemini's key as a header, never in the URL query string", async () => {
    const fetchImpl = okFetch(GEMINI_OK);
    await handleGoogleRequest(
      post({ model: "gemini-3.1-pro", system: "s", input: "i" }, "https://app.test/api/proxy-google"),
      KEY,
      fetchImpl,
    );

    const [url, init] = vi.mocked(fetchImpl).mock.calls[0];
    expect(String(url)).not.toContain(KEY);
    expect((init!.headers as Record<string, string>)["x-goog-api-key"]).toBe(KEY);
  });
});

describe("partner proxy — normalized success shape", () => {
  it("returns { text } from an OpenAI-compatible reply", async () => {
    const response = await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "i" }), KEY, okFetch(CHAT_OK));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ text: "The partner's argument." });
  });

  it("returns the same { text } shape from Gemini's different response shape", async () => {
    const response = await handleGoogleRequest(
      post({ model: "gemini-3.1-pro", system: "s", input: "i" }, "https://app.test/api/proxy-google"),
      KEY,
      okFetch(GEMINI_OK),
    );
    expect(await response.json()).toEqual({ text: "Gemini's argument." });
  });

  it("joins Gemini's multi-part replies rather than truncating to the first part", () => {
    const text = GOOGLE_ADAPTER.extractText({
      candidates: [{ content: { parts: [{ text: "First half. " }, { text: "Second half." }] } }],
    });
    expect(text).toBe("First half. Second half.");
  });

  it("xAI and DeepSeek share the OpenAI-compatible shape and each answer for their own model", async () => {
    const xai = await handleXaiRequest(
      post({ model: "grok-4.3", system: "s", input: "i" }, "https://app.test/api/proxy-xai"),
      KEY,
      okFetch(CHAT_OK),
    );
    const deepseek = await handleDeepseekRequest(
      post({ model: "deepseek-v4-pro", system: "s", input: "i" }, "https://app.test/api/proxy-deepseek"),
      KEY,
      okFetch(CHAT_OK),
    );
    expect(xai.status).toBe(200);
    expect(deepseek.status).toBe(200);
  });
});

describe("partner proxy — failures fail this side only, without leaking detail", () => {
  it("maps an upstream network throw to a 502", async () => {
    const fetchImpl = vi.fn(async () => { throw new Error("ECONNREFUSED"); }) as unknown as typeof fetch;
    const response = await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "i" }), KEY, fetchImpl);
    expect(response.status).toBe(502);
  });

  it("passes an upstream error STATUS through but not its body", async () => {
    const fetchImpl = vi.fn(async () => new Response(
      JSON.stringify({ error: { message: "your prompt was: secret user text" } }),
      { status: 429 },
    )) as unknown as typeof fetch;

    const response = await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "i" }), KEY, fetchImpl);
    expect(response.status).toBe(429); // client retry logic needs the real status
    expect(JSON.stringify(await response.json())).not.toContain("secret user text");
  });

  it("treats an unparseable or empty-text reply as a 502, never an empty column", async () => {
    const nonJson = vi.fn(async () => new Response("<html>gateway</html>", { status: 200 })) as unknown as typeof fetch;
    expect((await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "i" }), KEY, nonJson)).status).toBe(502);

    const emptyText = okFetch({ choices: [{ message: { content: "   " } }] });
    expect((await handleOpenAiRequest(post({ model: "gpt-5.5", system: "s", input: "i" }), KEY, emptyText)).status).toBe(502);
  });

  it("returns null from the adapter when the response shape is unrecognized", () => {
    expect(OPENAI_ADAPTER.extractText({ unexpected: true })).toBeNull();
    expect(GOOGLE_ADAPTER.extractText({ unexpected: true })).toBeNull();
  });
});
