/* DeepSeek (V4 Pro) debate-partner proxy handler (Step 8.3).
   ROUTING.md DEBATE PARTNERS: "deepseek-v4-pro : DeepSeek : low-cost
   near-frontier", key env var DEEPSEEK_API_KEY. Deploy entry:
   api/proxy-deepseek.ts. DeepSeek ships an OpenAI-compatible
   /chat/completions endpoint — see chatCompletions.ts. */

import { chatCompletionsAdapter } from "./chatCompletions.js";
import { handlePartnerRequest, type PartnerAdapter } from "./partnerProxy.js";

export const DEEPSEEK_ADAPTER: PartnerAdapter = chatCompletionsAdapter({
  modelId: "deepseek-v4-pro",
  url: "https://api.deepseek.com/v1/chat/completions",
  keyEnvVar: "DEEPSEEK_API_KEY",
});

export function handleDeepseekRequest(
  request: Request,
  apiKey: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  return handlePartnerRequest(request, apiKey, DEEPSEEK_ADAPTER, fetchImpl);
}
