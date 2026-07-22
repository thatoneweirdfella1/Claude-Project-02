/* Serverless proxy handler (Step 1.10 deliverable #1) — the ONLY backend
   component. The browser never holds the Anthropic API key; it calls this
   proxy, which forwards to the Anthropic Messages API with the key injected
   server-side and passes the response (streamed or not) straight back.

   Written as a platform-agnostic Web Fetch handler (Request -> Response) so the
   same logic runs on Vercel Edge, Cloudflare Workers, or Netlify Edge; the thin
   platform entry lives in api/proxy.ts. fetchImpl is injectable so this is
   unit-testable without a network (the sandbox has none — see BUILD-LOG.md). */

import { isModelId } from "./modelRegistry.js";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MAX_TOKENS = 4096;
const THINKING_BUDGET_TOKENS = 8000;

export interface ProxyMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ProxyRequestBody {
  model: string;
  system?: string;
  messages: ProxyMessage[];
  stream?: boolean;
  maxTokens?: number;
  /** Per-call extended-thinking flag (not a model). */
  extendedThinking?: boolean;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** Handle one proxied model call. `apiKey` comes from the server environment
    (never the client). `fetchImpl` defaults to the platform fetch; tests pass a
    stub. */
export async function handleProxyRequest(
  request: Request,
  apiKey: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }
  if (!apiKey) {
    // Misconfiguration, not a client error — the key must live in server env.
    return jsonResponse({ error: "Proxy is missing ANTHROPIC_API_KEY" }, 500);
  }

  let body: ProxyRequestBody;
  try {
    body = (await request.json()) as ProxyRequestBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!isModelId(body.model)) {
    return jsonResponse({ error: `Unknown model: ${String(body.model)}` }, 400);
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return jsonResponse({ error: "messages must be a non-empty array" }, 400);
  }

  const payload: Record<string, unknown> = {
    model: body.model,
    messages: body.messages,
    max_tokens: body.maxTokens ?? DEFAULT_MAX_TOKENS,
    stream: body.stream === true,
  };
  if (body.system) payload.system = body.system;
  if (body.extendedThinking) {
    payload.thinking = { type: "enabled", budget_tokens: THINKING_BUDGET_TOKENS };
  }

  let upstream: Response;
  try {
    upstream = await fetchImpl(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify(payload),
      signal: request.signal,
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
  }

  // Pass the upstream body through unchanged — streamed responses stay streamed.
  // The key never leaves this function; the browser only ever sees the proxy.
  return new Response(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
