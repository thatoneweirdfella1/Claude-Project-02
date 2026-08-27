/* Shared core for the four debate-partner proxies. Provider-specific adapters
   normalize text and, when the provider reports it, token usage. */

export const PARTNER_TIMEOUT_MS = 45_000;
const DEFAULT_MAX_TOKENS = 2048;
const MAX_PARTNER_INPUT_CHARS = 100_000;
const MAX_PARTNER_SYSTEM_CHARS = 32_000;
const MAX_PARTNER_OUTPUT_TOKENS = 4_096;

export interface PartnerProxyRequestBody {
  model: string;
  system: string;
  input: string;
  maxTokens?: number;
}

export interface PartnerReportedUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface PartnerAdapter {
  modelId: string;
  url: (body: PartnerProxyRequestBody) => string;
  headers: (apiKey: string) => Record<string, string>;
  body: (body: PartnerProxyRequestBody, maxTokens: number) => unknown;
  extractText: (payload: unknown) => string | null;
  /** Return null when the provider did not report usage. Never estimate here. */
  extractUsage?: (payload: unknown) => PartnerReportedUsage | null;
  keyEnvVar: string;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function safeFailure(status: number): string {
  if (status === 401 || status === 403) return "Partner authentication failed";
  if (status === 429) return "Partner rate limit reached";
  if (status >= 500) return "Partner service is temporarily unavailable";
  return "Partner request was rejected";
}

export async function handlePartnerRequest(
  request: Request,
  apiKey: string | undefined,
  adapter: PartnerAdapter,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed", category: "request" }, 405);
  if (!apiKey) return jsonResponse({ error: "Partner connection is not configured", category: "configuration" }, 503);

  let body: PartnerProxyRequestBody;
  try { body = (await request.json()) as PartnerProxyRequestBody; }
  catch { return jsonResponse({ error: "Invalid request body", category: "request" }, 400); }

  if (body.model !== adapter.modelId) return jsonResponse({ error: "Wrong model for this partner route", category: "request" }, 400);
  if (typeof body.input !== "string" || body.input.trim().length === 0) return jsonResponse({ error: "Input is required", category: "request" }, 400);
  if (body.input.length > MAX_PARTNER_INPUT_CHARS || typeof body.system !== "string" || body.system.length > MAX_PARTNER_SYSTEM_CHARS) {
    return jsonResponse({ error: "Request content exceeds the partner proxy limit", category: "request" }, 413);
  }
  const maxTokens = body.maxTokens ?? DEFAULT_MAX_TOKENS;
  if (!Number.isSafeInteger(maxTokens) || maxTokens < 1 || maxTokens > MAX_PARTNER_OUTPUT_TOKENS) {
    return jsonResponse({ error: "Output limit is outside the allowed range", category: "request" }, 400);
  }

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
    const aborted = timeout.signal.aborted;
    return jsonResponse({ error: aborted ? "Partner request timed out" : "Partner service could not be reached", category: aborted ? "timeout" : "network" }, 502);
  } finally { clearTimeout(timer); }

  if (!upstream.ok) {
    return jsonResponse({ error: safeFailure(upstream.status), category: upstream.status === 429 ? "rate-limit" : upstream.status === 401 || upstream.status === 403 ? "authentication" : upstream.status >= 500 ? "provider" : "request" }, upstream.status);
  }

  let payload: unknown;
  try { payload = await upstream.json(); }
  catch { return jsonResponse({ error: "Partner returned an unreadable response", category: "provider" }, 502); }

  const text = adapter.extractText(payload);
  if (text === null || text.trim().length === 0) return jsonResponse({ error: "Partner returned no usable text", category: "provider" }, 502);

  const usage = adapter.extractUsage?.(payload) ?? null;
  return jsonResponse(usage ? { text, usage } : { text }, 200);
}
