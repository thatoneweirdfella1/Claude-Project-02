/* Serverless proxy handler (Step 1.10 deliverable #1) — the ONLY backend
   component. The browser never holds any API key; it calls this proxy, which
   forwards to the appropriate model provider with the key injected server-side.

   Supports: Anthropic, OpenAI, Google Gemini, xAI Grok, DeepSeek.

   Written as a platform-agnostic Web Fetch handler (Request -> Response) so the
   same logic runs on Vercel Edge, Cloudflare Workers, or Netlify Edge; the thin
   platform entry lives in api/proxy.ts. fetchImpl is injectable so this is
   unit-testable without a network (the sandbox has none — see BUILD-LOG.md). */

import { isModelId, getProvider, type ModelId, type Provider } from "./modelRegistry.js";
import { createProviderPool } from "./providerPool.js";
import { buildOpenAiPayload, callOpenAi } from "./providers/openai.js";
import { buildGooglePayload, callGoogle } from "./providers/google.js";
import { buildXaiPayload, callXai } from "./providers/xai.js";
import { buildDeepseekPayload, callDeepseek } from "./providers/deepseek.js";
import { callGroq } from "./providers/groq.js";
import { callOpenrouter } from "./providers/openrouter.js";
import { callHuggingface } from "./providers/huggingface.js";
import { callCloudflare } from "./providers/cloudflare.js";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULT_MAX_TOKENS = 4096;
const THINKING_BUDGET_TOKENS = 8000;
export const PROXY_TIMEOUT_MS = 60_000;
const MAX_MESSAGES = 100;
const MAX_INPUT_CHARS = 200_000;
const MAX_SYSTEM_CHARS = 32_000;
const MAX_OUTPUT_TOKENS = 8_192;
const freeProviderPool = createProviderPool();

export interface ProxyMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ProxyRequestBody {
  model: string;
  /** Free requests ignore manual model/provider/paid-fallback overrides. */
  freePool?: boolean;
  freePoolBudgets?: unknown[];
  excludedProviders?: unknown[];
  poolModels?: unknown[];
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

/** Get the API key from environment for a given provider. */
function getApiKeyForProvider(
  provider: Provider,
  anthropicKey: string | undefined,
  env: Record<string, string | undefined>,
): string | undefined {
  // The existing platform entry supplies the original slots explicitly.
  // Read new slots at call time here so no new route or wrapper edit is needed.
  const runtimeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  switch (provider) {
    case "anthropic":
      return anthropicKey;
    case "openai":
      return env.OPENAI_API_KEY;
    case "google":
      return env.GOOGLE_API_KEY;
    case "xai":
      return env.XAI_API_KEY;
    case "deepseek":
      return env.DEEPSEEK_API_KEY;
    case "groq":
      return env.GROQ_API_KEY ?? runtimeEnv?.GROQ_API_KEY;
    case "openrouter":
      return env.OPENROUTER_API_KEY ?? runtimeEnv?.OPENROUTER_API_KEY;
    case "huggingface":
      return env.HF_TOKEN ?? runtimeEnv?.HF_TOKEN;
    case "cloudflare":
      return env.CLOUDFLARE_API_TOKEN ?? runtimeEnv?.CLOUDFLARE_API_TOKEN;
  }
}

function cloudflareAccountId(env: Record<string, string | undefined>): string | undefined {
  const runtimeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return env.CLOUDFLARE_ACCOUNT_ID ?? runtimeEnv?.CLOUDFLARE_ACCOUNT_ID;
}

/** Build error response when a required server variable is missing. */
function missingKeyResponse(provider: Provider, requiredName?: string): Response {
  const keyName = {
    anthropic: "ANTHROPIC_API_KEY",
    openai: "OPENAI_API_KEY",
    google: "GOOGLE_API_KEY",
    xai: "XAI_API_KEY",
    deepseek: "DEEPSEEK_API_KEY",
    groq: "GROQ_API_KEY",
    openrouter: "OPENROUTER_API_KEY",
    huggingface: "HF_TOKEN",
    cloudflare: "CLOUDFLARE_API_TOKEN",
  }[provider];
  return jsonResponse({ error: `Proxy is missing ${requiredName ?? keyName}` }, 500);
}

/** Call the upstream provider and return the response. */
async function callProvider(
  provider: Provider,
  body: ProxyRequestBody,
  apiKey: string,
  fetchImpl: typeof fetch,
  accountId?: string,
): Promise<Response> {
  switch (provider) {
    case "anthropic": {
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
      return fetchImpl(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": ANTHROPIC_VERSION,
        },
        body: JSON.stringify(payload),
      });
    }
    case "openai": {
      const payload = buildOpenAiPayload(body);
      return callOpenAi(payload, apiKey, fetchImpl);
    }
    case "google": {
      const { payload, url } = buildGooglePayload(body, apiKey);
      return callGoogle(payload, url, fetchImpl);
    }
    case "xai": {
      const payload = buildXaiPayload(body);
      return callXai(payload, apiKey, fetchImpl);
    }
    case "deepseek": {
      const payload = buildDeepseekPayload(body);
      return callDeepseek(payload, apiKey, fetchImpl);
    }
    case "groq":
      return callGroq(body, apiKey, fetchImpl);
    case "openrouter":
      return callOpenrouter(body, apiKey, fetchImpl);
    case "huggingface":
      return callHuggingface(body, apiKey, fetchImpl);
    case "cloudflare":
      return accountId ? callCloudflare(body, apiKey, accountId, fetchImpl)
        : missingKeyResponse(provider, "CLOUDFLARE_ACCOUNT_ID");
  }
}

/** Handle one proxied model call. `anthropicKey` comes from the server environment
    (never the client). Environment is passed for provider-specific keys.
    `fetchImpl` defaults to the platform fetch; tests pass a stub. */
export async function handleProxyRequest(
  request: Request,
  anthropicKey: string | undefined,
  fetchImpl: typeof fetch = fetch,
  env: Record<string, string | undefined> = {},
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body: ProxyRequestBody;
  try {
    body = (await request.json()) as ProxyRequestBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!body || typeof body !== "object") {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }
  if (body.freePool !== true && !isModelId(body.model)) {
    return jsonResponse({ error: `Unknown model: ${String(body.model)}` }, 400);
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return jsonResponse({ error: "messages must be a non-empty array" }, 400);
  }
  if (body.messages.length > MAX_MESSAGES || body.messages.some((message) =>
    !message || (message.role !== "user" && message.role !== "assistant") ||
    typeof message.content !== "string" || message.content.length === 0
  )) {
    return jsonResponse({ error: "messages contain an invalid role/content or exceed the message limit" }, 400);
  }
  const inputChars = body.messages.reduce((total, message) => total + message.content.length, 0);
  if (inputChars > MAX_INPUT_CHARS || (body.system !== undefined &&
      (typeof body.system !== "string" || body.system.length > MAX_SYSTEM_CHARS))) {
    return jsonResponse({ error: "request content exceeds the provider proxy limit" }, 413);
  }
  const maxTokens = body.maxTokens ?? DEFAULT_MAX_TOKENS;
  if (!Number.isSafeInteger(maxTokens) || maxTokens < 1 || maxTokens > MAX_OUTPUT_TOKENS) {
    return jsonResponse({ error: "maxTokens is outside the allowed range" }, 400);
  }

  // Determine which provider this model uses
  const provider = body.freePool === true ? null : getProvider(body.model as ModelId);
  const apiKey = provider ? getApiKeyForProvider(provider, anthropicKey, env) : undefined;
  if (provider && !apiKey) return missingKeyResponse(provider);
  const accountId = cloudflareAccountId(env);
  if (provider === "cloudflare" && !accountId) return missingKeyResponse(provider, "CLOUDFLARE_ACCOUNT_ID");

  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), PROXY_TIMEOUT_MS);
  const abort = () => timeout.abort();
  request.signal.addEventListener("abort", abort, { once: true });
  if (request.signal.aborted) timeout.abort();
  const cleanup = () => {
    clearTimeout(timer);
    request.signal.removeEventListener("abort", abort);
  };
  // Inject the same bound into every adapter without changing its route or payload.
  const boundedFetch: typeof fetch = (input, init) =>
    fetchImpl(input, { ...init, signal: timeout.signal });
  let upstream: Response;
  try {
    if (timeout.signal.aborted) throw new Error("Request aborted");
    if (body.freePool === true) {
      const result = await freeProviderPool.run({
        configured: (id) => Boolean(getApiKeyForProvider(id, anthropicKey, env)) && (id !== "cloudflare" || Boolean(accountId)),
        execute: (model) => {
          const key = getApiKeyForProvider(model.provider, anthropicKey, env);
          return key ? callProvider(model.provider, { ...body, model: model.id, stream: false, extendedThinking: false }, key, boundedFetch, accountId)
            : Promise.resolve(missingKeyResponse(model.provider));
        },
        models: Array.isArray(body.poolModels) ? body.poolModels : undefined,
        excludedProviders: Array.isArray(body.excludedProviders) ? body.excludedProviders : undefined,
        budgets: Array.isArray(body.freePoolBudgets) ? body.freePoolBudgets : undefined,
        signal: timeout.signal,
      });
      // Only normalized text and measured counts leave the server. Even an
      // upstream that echoes authentication material cannot expose a key.
      if (result.text) {
        const keys = [anthropicKey, ...Object.values(env),
          ...(["groq", "openrouter", "huggingface", "cloudflare"] as const).map((id) => getApiKeyForProvider(id, anthropicKey, env))];
        for (const key of keys) if (key) result.text = result.text.split(key).join("[REDACTED]");
      }
      cleanup();
      return jsonResponse({ freePool: result }, 200);
    }
    if (!provider || !apiKey) throw new Error("Missing provider");
    upstream = await callProvider(provider, body, apiKey, boundedFetch, accountId);
  } catch {
    cleanup();
    return jsonResponse(
      {
        error: "Upstream request failed",
      },
      502,
    );
  }

  // Pass the upstream body through unchanged — streamed responses stay streamed.
  // Keys never leave this function; the browser only ever sees the proxy.
  // Keep the deadline through body consumption, including streamed responses.
  const reader = upstream.body?.getReader();
  if (!reader) cleanup();
  const responseBody = reader ? new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          cleanup();
          reader.releaseLock();
          controller.close();
        } else {
          controller.enqueue(value);
        }
      } catch (error) {
        cleanup();
        reader.releaseLock();
        controller.error(error);
      }
    },
    async cancel(reason) {
      abort();
      cleanup();
      await reader.cancel(reason);
    },
  }) : null;
  return new Response(responseBody, {
    status: upstream.status,
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
  });
}
