import type { ProxyRequestBody } from "../proxyHandler.js";
import { callChatCompletions } from "../debate/chatCompletions.js";

export const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export function callGroq(body: ProxyRequestBody, apiKey: string, fetchImpl: typeof fetch = fetch): Promise<Response> {
  return callChatCompletions(body, GROQ_URL, apiKey, fetchImpl);
}
