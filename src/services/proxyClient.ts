/* Browser-side proxy client (Step 1.10). The app's single door to models: it
   POSTs to the serverless proxy (proxyHandler / api/proxy.ts) — never to
   Anthropic directly, never holding a key. `complete()` is structurally a
   TranslationModelClient (the Step 2.2 seam), so the Translation Engine calls
   models through this with no adapter; `stream()` yields text deltas for answer
   display (Step 5.1).

   fetchImpl is injectable for tests; the sandbox has no network, so live calls
   are exercised only once the proxy is deployed (parked, BUILD-LOG.md). */

import { appAccessHeaders } from "./appAccessClient";

export interface ProxyMessage {
  role: "user" | "assistant";
  content: string;
}

/** A model call. `input` is a convenience for a single user message; pass
    `messages` for a full turn history. Shape is a superset of the translation
    seam's ModelCompletionRequest, so `complete` satisfies it structurally. */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface ProxyCompletionRequest {
  model: string;
  system?: string;
  input?: string;
  messages?: ProxyMessage[];
  signal?: AbortSignal;
  extendedThinking?: boolean;
  /** Optional (Step 5.4 telemetry seam) — called once with the call's real
      input/output token counts, straight from the Anthropic response, if the
      caller wants them. Absent for callers that don't (e.g. translate()'s
      Step 2.2 ModelCompletionRequest has no such field, so a bare
      `client.complete(req)` never sets this) — never required, never changes
      what complete()/stream() resolve/yield. */
  onUsage?: (usage: TokenUsage) => void;
}

export interface ProxyClientConfig {
  /** Proxy endpoint path. Defaults to the conventional serverless route. */
  endpoint?: string;
  fetchImpl?: typeof fetch;
}

const DEFAULT_ENDPOINT = "/api/proxy";

function buildMessages(req: ProxyCompletionRequest): ProxyMessage[] {
  if (req.messages && req.messages.length > 0) return req.messages;
  return [{ role: "user", content: req.input ?? "" }];
}

interface AnthropicMessageResponse {
  content?: Array<{ type: string; text?: string }>;
  usage?: { input_tokens?: number; output_tokens?: number };
}

function reportUsage(
  onUsage: ((usage: TokenUsage) => void) | undefined,
  raw: { input_tokens?: number; output_tokens?: number } | undefined,
): void {
  if (!onUsage || !raw) return;
  const inputTokens = raw.input_tokens ?? 0;
  const outputTokens = raw.output_tokens ?? 0;
  onUsage({ inputTokens, outputTokens });
}

export interface ProxyClient {
  complete(req: ProxyCompletionRequest): Promise<string>;
  stream(req: ProxyCompletionRequest): AsyncGenerator<string>;
  readonly endpoint: string;
}

export function createProxyClient(config: ProxyClientConfig = {}): ProxyClient {
  const endpoint = config.endpoint ?? DEFAULT_ENDPOINT;
  const doFetch = config.fetchImpl ?? fetch;

  async function post(
    req: ProxyCompletionRequest,
    stream: boolean,
  ): Promise<Response> {
    const res = await doFetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", ...appAccessHeaders() },
      body: JSON.stringify({
        model: req.model,
        system: req.system,
        messages: buildMessages(req),
        stream,
        extendedThinking: req.extendedThinking,
      }),
      signal: req.signal,
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(
        `Proxy call failed (${res.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`,
      );
    }
    return res;
  }

  async function complete(req: ProxyCompletionRequest): Promise<string> {
    const res = await post(req, false);
    const data = (await res.json()) as AnthropicMessageResponse;
    reportUsage(req.onUsage, data.usage);
    return (data.content ?? [])
      .filter((block) => block.type === "text")
      .map((block) => block.text ?? "")
      .join("");
  }

  async function* stream(
    req: ProxyCompletionRequest,
  ): AsyncGenerator<string> {
    const res = await post(req, true);
    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    // Anthropic's SSE stream carries usage on message_start (input_tokens,
    // usually output_tokens:0) and message_delta (cumulative output_tokens,
    // sent once near the end) — neither is a text delta, so tracked
    // separately from the yielded token stream and reported once at the end.
    let inputTokens: number | undefined;
    let outputTokens: number | undefined;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? ""; // keep the last, possibly-partial line
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "" || data === "[DONE]") continue;
        try {
          const event = JSON.parse(data) as {
            type?: string;
            delta?: { type?: string; text?: string };
            message?: { usage?: { input_tokens?: number; output_tokens?: number } };
            usage?: { input_tokens?: number; output_tokens?: number };
          };
          if (
            event.type === "content_block_delta" &&
            event.delta?.type === "text_delta" &&
            event.delta.text
          ) {
            yield event.delta.text;
          } else if (event.type === "message_start" && event.message?.usage) {
            inputTokens = event.message.usage.input_tokens ?? inputTokens;
            outputTokens = event.message.usage.output_tokens ?? outputTokens;
          } else if (event.type === "message_delta" && event.usage) {
            outputTokens = event.usage.output_tokens ?? outputTokens;
          }
        } catch {
          // Ignore keep-alive pings and any non-JSON lines.
        }
      }
    }
    if (inputTokens !== undefined || outputTokens !== undefined) {
      reportUsage(req.onUsage, { input_tokens: inputTokens, output_tokens: outputTokens });
    }
  }

  return { complete, stream, endpoint };
}
