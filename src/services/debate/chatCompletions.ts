/* The OpenAI-compatible /chat/completions adapter, shared by the three
   partners that speak it (OpenAI, xAI, DeepSeek) — Step 8.3.

   ROUTING.md requires a separate handler FILE and a separate KEY per
   provider, which openaiHandler/xaiHandler/deepseekHandler each satisfy.
   What it does not require is three byte-identical copies of the same
   request-body and response-parsing code: that is the part these providers
   genuinely share (xAI and DeepSeek both ship OpenAI-compatible endpoints
   deliberately), so it lives here once. Google's Gemini does NOT share this
   shape and has its own adapter in googleHandler.ts. */

import type { PartnerAdapter, PartnerProxyRequestBody } from "./partnerProxy";

interface ChatCompletionsConfig {
  modelId: string;
  url: string;
  keyEnvVar: string;
}

interface ChatCompletionsResponse {
  choices?: { message?: { content?: unknown } }[];
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
      messages: [
        { role: "system", content: body.system },
        { role: "user", content: body.input },
      ],
    }),
    extractText: (payload: unknown) => {
      const content = (payload as ChatCompletionsResponse)?.choices?.[0]?.message?.content;
      return typeof content === "string" ? content : null;
    },
  };
}
