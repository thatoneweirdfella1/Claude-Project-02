/* Shared OpenAI-compatible adapter for OpenAI, xAI, and DeepSeek. */

import type { PartnerAdapter, PartnerProxyRequestBody } from "./partnerProxy.js";

interface ChatCompletionsConfig { modelId: string; url: string; keyEnvVar: string; }
interface ChatCompletionsResponse {
  choices?: { message?: { content?: unknown } }[];
  usage?: { prompt_tokens?: unknown; completion_tokens?: unknown };
}

function nonNegativeInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export function chatCompletionsAdapter(config: ChatCompletionsConfig): PartnerAdapter {
  return {
    modelId: config.modelId,
    keyEnvVar: config.keyEnvVar,
    url: () => config.url,
    headers: (apiKey) => ({ authorization: `Bearer ${apiKey}` }),
    body: (body: PartnerProxyRequestBody, maxTokens: number) => ({
      model: config.modelId,
      max_tokens: maxTokens,
      messages: [{ role: "system", content: body.system }, { role: "user", content: body.input }],
    }),
    extractText: (payload: unknown) => {
      const content = (payload as ChatCompletionsResponse)?.choices?.[0]?.message?.content;
      return typeof content === "string" ? content : null;
    },
    extractUsage: (payload: unknown) => {
      const usage = (payload as ChatCompletionsResponse)?.usage;
      const inputTokens = nonNegativeInteger(usage?.prompt_tokens);
      const outputTokens = nonNegativeInteger(usage?.completion_tokens);
      return inputTokens === null || outputTokens === null ? null : { inputTokens, outputTokens };
    },
  };
}
