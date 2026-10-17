/* The OpenAI-compatible /chat/completions adapter, shared by the three
   partners that speak it (OpenAI, xAI, DeepSeek) — Step 8.3.

   ROUTING.md requires a separate handler FILE and a separate KEY per
   provider, which openaiHandler/xaiHandler/deepseekHandler each satisfy.
   What it does not require is three byte-identical copies of the same
   request-body and response-parsing code: that is the part these providers
   genuinely share (xAI and DeepSeek both ship OpenAI-compatible endpoints
   deliberately), so it lives here once. Google's Gemini does NOT share this
   shape and has its own adapter in googleHandler.ts. */

import type { PartnerAdapter, PartnerProxyRequestBody } from "./partnerProxy.js";
import type { ProxyRequestBody } from "../proxyHandler.js";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function completionBody(model: string, messages: ChatMessage[], maxTokens: number, stream?: boolean) {
  return { model, max_tokens: maxTokens, messages, ...(stream === undefined ? {} : { stream }) };
}

/** Shared HTTP transport for additional OpenAI-compatible provider slots. */
export function callChatCompletions(
  body: ProxyRequestBody,
  url: string,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  const messages: ChatMessage[] = [
    ...(body.system ? [{ role: "system" as const, content: body.system }] : []),
    ...body.messages,
  ];
  return fetchImpl(url, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer " + apiKey },
    body: JSON.stringify(completionBody(body.model, messages, body.maxTokens ?? 4096, body.stream === true)),
  });
}

interface ChatCompletionsConfig {
  modelId: string;
  url: string;
  keyEnvVar: string;
}

interface ChatCompletionsResponse {
  choices?: { message?: { content?: unknown } }[];
  usage?: {
    prompt_tokens?: unknown;
    completion_tokens?: unknown;
    input_tokens?: unknown;
    output_tokens?: unknown;
  };
}

export function chatCompletionsAdapter(config: ChatCompletionsConfig): PartnerAdapter {
  return {
    modelId: config.modelId,
    keyEnvVar: config.keyEnvVar,
    url: () => config.url,
    headers: (apiKey) => ({ authorization: `Bearer ${apiKey}` }),
    body: (body: PartnerProxyRequestBody, maxTokens: number) => completionBody(
      config.modelId, [
        { role: "system", content: body.system },
        { role: "user", content: body.input },
      ], maxTokens,
    ),
    extractText: (payload: unknown) => {
      const content = (payload as ChatCompletionsResponse)?.choices?.[0]?.message?.content;
      return typeof content === "string" ? content : null;
    },
    extractUsage: (payload: unknown) => {
      const usage = (payload as ChatCompletionsResponse)?.usage;
      if (!usage) return null;
      const inputTokens =
        typeof usage.prompt_tokens === "number" ? usage.prompt_tokens :
        typeof usage.input_tokens === "number" ? usage.input_tokens :
        undefined;
      const outputTokens =
        typeof usage.completion_tokens === "number" ? usage.completion_tokens :
        typeof usage.output_tokens === "number" ? usage.output_tokens :
        undefined;
      return inputTokens === undefined && outputTokens === undefined
        ? null
        : { inputTokens, outputTokens };
    },
  };
}
