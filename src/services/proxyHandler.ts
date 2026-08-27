/* Serverless Anthropic proxy. Success payloads/streams pass through; failures
   are normalized so provider bodies, prompts, keys, and internal details never
   become browser-visible error strings. */

import { isModelId } from "./modelRegistry.js";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MAX_TOKENS = 4096;
const THINKING_BUDGET_TOKENS = 8000;
export const PROXY_TIMEOUT_MS = 60_000;
const MAX_MESSAGES = 100;
const MAX_INPUT_CHARS = 200_000;
const MAX_SYSTEM_CHARS = 32_000;
const MAX_OUTPUT_TOKENS = 8_192;

export interface ProxyMessage { role: "user" | "assistant"; content: string; }
export interface ProxyRequestBody {
  model: string; system?: string; messages: ProxyMessage[]; stream?: boolean; maxTokens?: number; extendedThinking?: boolean;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}
function categoryForStatus(status: number): string {
  if (status === 401 || status === 403) return "authentication";
  if (status === 429) return "rate-limit";
  if (status >= 500) return "provider";
  return "request";
}
function safeProviderMessage(status: number): string {
  if (status === 401 || status === 403) return "Anthropic authentication failed";
  if (status === 429) return "Anthropic rate limit reached";
  if (status >= 500) return "Anthropic is temporarily unavailable";
  return "Anthropic rejected the request";
}

export async function handleProxyRequest(request: Request, apiKey: string | undefined, fetchImpl: typeof fetch = fetch): Promise<Response> {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed", category: "request" }, 405);
  if (!apiKey) return jsonResponse({ error: "Anthropic connection is not configured", category: "configuration" }, 503);

  let body: ProxyRequestBody;
  try { body = (await request.json()) as ProxyRequestBody; }
  catch { return jsonResponse({ error: "Invalid request body", category: "request" }, 400); }
  if (!isModelId(body.model)) return jsonResponse({ error: "Unknown model", category: "request" }, 400);
  if (!Array.isArray(body.messages) || body.messages.length === 0) return jsonResponse({ error: "Messages are required", category: "request" }, 400);
  if (body.messages.length > MAX_MESSAGES || body.messages.some((message) => !message || (message.role !== "user" && message.role !== "assistant") || typeof message.content !== "string" || message.content.length === 0)) {
    return jsonResponse({ error: "Messages are invalid or exceed the message limit", category: "request" }, 400);
  }
  const inputChars = body.messages.reduce((total, message) => total + message.content.length, 0);
  if (inputChars > MAX_INPUT_CHARS || (body.system !== undefined && (typeof body.system !== "string" || body.system.length > MAX_SYSTEM_CHARS))) {
    return jsonResponse({ error: "Request content exceeds the provider proxy limit", category: "request" }, 413);
  }
  const maxTokens = body.maxTokens ?? DEFAULT_MAX_TOKENS;
  if (!Number.isSafeInteger(maxTokens) || maxTokens < 1 || maxTokens > MAX_OUTPUT_TOKENS) return jsonResponse({ error: "Output limit is outside the allowed range", category: "request" }, 400);

  const payload: Record<string, unknown> = { model: body.model, messages: body.messages, max_tokens: maxTokens, stream: body.stream === true };
  if (body.system) payload.system = body.system;
  if (body.extendedThinking) payload.thinking = { type: "enabled", budget_tokens: THINKING_BUDGET_TOKENS };

  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), PROXY_TIMEOUT_MS);
  request.signal.addEventListener("abort", () => timeout.abort(), { once: true });
  let upstream: Response;
  try {
    upstream = await fetchImpl(ANTHROPIC_URL, {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": ANTHROPIC_VERSION },
      body: JSON.stringify(payload), signal: timeout.signal,
    });
  } catch {
    const timedOut = timeout.signal.aborted;
    return jsonResponse({ error: timedOut ? "Anthropic request timed out" : "Anthropic could not be reached", category: timedOut ? "timeout" : "network" }, 502);
  } finally { clearTimeout(timer); }

  if (!upstream.ok) return jsonResponse({ error: safeProviderMessage(upstream.status), category: categoryForStatus(upstream.status) }, upstream.status);
  return new Response(upstream.body, { status: upstream.status, headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" } });
}
