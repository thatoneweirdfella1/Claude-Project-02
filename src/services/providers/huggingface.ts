import type { ProxyRequestBody } from "../proxyHandler.js";
import { callChatCompletions } from "../debate/chatCompletions.js";

export const HUGGINGFACE_URL = "https://router.huggingface.co/v1/chat/completions";

// This account has no payment method: included credit exhaustion must fail closed.
export function callHuggingface(body: ProxyRequestBody, apiKey: string, fetchImpl: typeof fetch = fetch): Promise<Response> {
  return callChatCompletions(body, HUGGINGFACE_URL, apiKey, fetchImpl);
}
