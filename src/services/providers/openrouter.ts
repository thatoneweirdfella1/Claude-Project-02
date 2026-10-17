import type { ProxyRequestBody } from "../proxyHandler.js";
import { callChatCompletions } from "../debate/chatCompletions.js";

export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export function callOpenrouter(body: ProxyRequestBody, apiKey: string, fetchImpl: typeof fetch = fetch): Promise<Response> {
  return callChatCompletions(body, OPENROUTER_URL, apiKey, fetchImpl);
}
