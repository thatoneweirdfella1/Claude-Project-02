/* Shared core for the four debate-partner proxies (Step 8.3).

   ROUTING.md DEBATE PARTNERS requires each provider to have "its own
   serverless proxy (api/proxy-<provider>.ts + a
   src/services/debate/<provider>Handler.ts), mirroring the existing
   api/proxy.ts pattern: server-side only call, own API key as its own env
   var, never exposed to the client, own timeout/error handling."

   Those four handlers DO each exist as their own named file (openaiHandler,
   googleHandler, xaiHandler, deepseekHandler) because the four providers have
   genuinely different request/response shapes — that per-provider adaptation
   is the part that can't be shared. What IS shared is everything around it:
   method/JSON/key guards, timeout, and error mapping. Duplicating those four
   times would mean four places to fix one security or timeout bug, so they
   live here once and each handler supplies only its own adapter.

   Platform-agnostic Web Fetch (Request -> Response), fetchImpl injectable, same
   as services/proxyHandler.ts — the sandbox has no network (see BUILD-LOG.md),
   so this is unit-tested against stubs. */

/** Per-call ceiling. A debate side that hangs must not hang the whole turn —
    ROUTING.md: "a partner API being down must not break the whole debate
    turn." The client surfaces a timeout as a normal failed side with retry. */
export const PARTNER_TIMEOUT_MS = 45_000;

const DEFAULT_MAX_TOKENS = 2048;
const MAX_PARTNER_INPUT_CHARS = 100_000;
const MAX_PARTNER_SYSTEM_CHARS = 32_000;
const MAX_PARTNER_OUTPUT_TOKENS = 4_096;

export interface PartnerProxyRequestBody {
  /** The partner's api string (roster id) — validated by the handler against
      the one id that handler serves, so a request can't be redirected to a
      different provider's endpoint. */
  model: string;
  system: string;
  input: string;
  maxTokens?: number;
}

/** What a provider adapter must supply: how to build the upstream call, and
    how to pull plain text back out of that provider's response shape. */
export interface PartnerAdapter {
  /** Which roster id this endpoint serves. A body naming anything else is a
      400 — endpoints are not interchangeable. */
  modelId: string;
  url: (body: PartnerProxyRequestBody) => string;
  headers: (apiKey: string) => Record<string, string>;
  body: (body: PartnerProxyRequestBody, maxTokens: number) => unknown;
  /** Extract the assistant's text from the provider's parsed JSON response.
      Returns null when the shape isn't what we expect — surfaced as a 502
      rather than silently returning empty text that would read to the user as
      "the partner had nothing to say". */
  extractText: (payload: unknown) => string | null;
  /** Name of the env var this provider's key comes from — used only in the
      misconfiguration message, never to read the value (the platform entry
      passes the value in). */
  keyEnvVar: string;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function handlePartnerRequest(
  request: Request,
  apiKey: string | undefined,
  adapter: PartnerAdapter,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }
  if (!apiKey) {
    return jsonResponse({ error: `Proxy is missing ${adapter.keyEnvVar}` }, 500);
  }

  let body: PartnerProxyRequestBody;
  try {
    body = (await request.json()) as PartnerProxyRequestBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (body.model !== adapter.modelId) {
    return jsonResponse(
      { error: `This endpoint serves ${adapter.modelId}, not ${String(body.model)}` },
      400,
    );
  }
  if (typeof body.input !== "string" || body.input.trim().length === 0) {
    return jsonResponse({ error: "input must be a non-empty string" }, 400);
  }
  if (body.input.length > MAX_PARTNER_INPUT_CHARS || typeof body.system !== "string" ||
      body.system.length > MAX_PARTNER_SYSTEM_CHARS) {
    return jsonResponse({ error: "request content exceeds the partner proxy limit" }, 413);
  }
  const maxTokens = body.maxTokens ?? DEFAULT_MAX_TOKENS;
  if (!Number.isSafeInteger(maxTokens) || maxTokens < 1 || maxTokens > MAX_PARTNER_OUTPUT_TOKENS) {
    return jsonResponse({ error: "maxTokens is outside the allowed range" }, 400);
  }

  // Own timeout, per ROUTING.md — merged with the caller's own abort so a
  // client-side cancel still propagates.
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), PARTNER_TIMEOUT_MS);
  request.signal?.addEventListener("abort", () => timeout.abort());

  let upstream: Response;
  try {
    upstream = await fetchImpl(adapter.url(body), {
      method: "POST",
      headers: { "content-type": "application/json", ...adapter.headers(apiKey) },
      body: JSON.stringify(adapter.body(body, maxTokens)),
      signal: timeout.signal,
    });
  } catch (error) {
    return jsonResponse(
      {
        error: `Upstream request failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      },
      502,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!upstream.ok) {
    // Pass the status through (the client's retry logic distinguishes
    // transient 429/5xx from a permanent 4xx) but not the body — a provider
    // error body can echo request content, and this response goes to the
    // browser.
    return jsonResponse({ error: `Partner API returned ${upstream.status}` }, upstream.status);
  }

  let payload: unknown;
  try {
    payload = await upstream.json();
  } catch {
    return jsonResponse({ error: "Partner API returned a non-JSON response" }, 502);
  }

  const text = adapter.extractText(payload);
  if (text === null || text.trim().length === 0) {
    return jsonResponse({ error: "Partner API returned no usable text" }, 502);
  }

  // Normalized shape — every partner endpoint answers the same way, so the
  // client never needs to know which provider it just called.
  return jsonResponse({ text }, 200);
}
