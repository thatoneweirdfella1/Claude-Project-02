/* Browser-side Anthropic proxy client. The server normalizes failures; this
   client never appends raw provider bodies to user-visible error strings. */

import { appAccessHeaders } from "./appAccessClient";
import { desktopBridge } from "./desktopBridge";

export interface ProxyMessage { role: "user" | "assistant"; content: string; }
export interface TokenUsage { inputTokens: number; outputTokens: number; }
export interface ProxyCompletionRequest {
  model: string; system?: string; input?: string; messages?: ProxyMessage[]; signal?: AbortSignal; extendedThinking?: boolean; onUsage?: (usage: TokenUsage) => void;
}
export interface ProxyClientConfig { endpoint?: string; fetchImpl?: typeof fetch; }
const DEFAULT_ENDPOINT = "/api/proxy";

function buildMessages(req: ProxyCompletionRequest): ProxyMessage[] {
  if (req.messages && req.messages.length > 0) return req.messages;
  return [{ role: "user", content: req.input ?? "" }];
}
interface AnthropicMessageResponse { content?: Array<{ type: string; text?: string }>; usage?: { input_tokens?: number; output_tokens?: number }; }
interface SafeProxyError { error?: unknown; category?: unknown; }
function reportUsage(onUsage: ((usage: TokenUsage) => void) | undefined, raw: { input_tokens?: number; output_tokens?: number } | undefined): void {
  if (!onUsage || !raw) return;
  onUsage({ inputTokens: raw.input_tokens ?? 0, outputTokens: raw.output_tokens ?? 0 });
}
function safeErrorMessage(status: number, body: SafeProxyError): string {
  const category = typeof body.category === "string" ? body.category : "provider";
  const message = typeof body.error === "string" ? body.error : status >= 500 ? "AI provider is temporarily unavailable" : "AI provider rejected the request";
  return `${message} [${category}]`;
}

export interface ProxyClient { complete(req: ProxyCompletionRequest): Promise<string>; stream(req: ProxyCompletionRequest): AsyncGenerator<string>; readonly endpoint: string; }

export function createProxyClient(config: ProxyClientConfig = {}): ProxyClient {
  const endpoint = config.endpoint ?? DEFAULT_ENDPOINT;
  const doFetch = config.fetchImpl ?? fetch;

  async function post(req: ProxyCompletionRequest, stream: boolean): Promise<Response> {
    const res = await doFetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", ...appAccessHeaders() },
      body: JSON.stringify({ model: req.model, system: req.system, messages: buildMessages(req), stream, extendedThinking: req.extendedThinking }),
      signal: req.signal,
    });
    if (!res.ok) {
      let body: SafeProxyError = {};
      try { body = await res.json() as SafeProxyError; } catch { /* normalized fallback below */ }
      throw new Error(safeErrorMessage(res.status, body));
    }
    return res;
  }

  async function complete(req: ProxyCompletionRequest): Promise<string> {
    const desktop = desktopBridge();
    if (desktop) {
      const result = await desktop.ai.complete({ model: req.model, system: req.system, messages: buildMessages(req) });
      req.onUsage?.(result.usage);
      return result.text;
    }
    const res = await post(req, false);
    const data = (await res.json()) as AnthropicMessageResponse;
    reportUsage(req.onUsage, data.usage);
    return (data.content ?? []).filter((block) => block.type === "text").map((block) => block.text ?? "").join("");
  }

  async function* stream(req: ProxyCompletionRequest): AsyncGenerator<string> {
    const desktop = desktopBridge();
    if (desktop) {
      const result = await desktop.ai.complete({ model: req.model, system: req.system, messages: buildMessages(req) });
      req.onUsage?.(result.usage);
      for (const chunk of result.text.match(/\S+\s*/g) ?? []) yield chunk;
      return;
    }
    const res = await post(req, true);
    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let inputTokens: number | undefined;
    let outputTokens: number | undefined;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const raw = trimmed.slice(5).trim();
        if (raw === "" || raw === "[DONE]") continue;
        try {
          const event = JSON.parse(raw) as { type?: string; delta?: { type?: string; text?: string }; message?: { usage?: { input_tokens?: number; output_tokens?: number } }; usage?: { input_tokens?: number; output_tokens?: number } };
          if (event.type === "content_block_delta" && event.delta?.type === "text_delta" && event.delta.text) yield event.delta.text;
          else if (event.type === "message_start" && event.message?.usage) { inputTokens = event.message.usage.input_tokens ?? inputTokens; outputTokens = event.message.usage.output_tokens ?? outputTokens; }
          else if (event.type === "message_delta" && event.usage) outputTokens = event.usage.output_tokens ?? outputTokens;
        } catch { /* ignore keep-alive/non-JSON */ }
      }
    }
    if (inputTokens !== undefined || outputTokens !== undefined) reportUsage(req.onUsage, { input_tokens: inputTokens, output_tokens: outputTokens });
  }
  return { complete, stream, endpoint };
}
