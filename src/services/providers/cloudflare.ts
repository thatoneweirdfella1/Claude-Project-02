import type { ProxyRequestBody } from "../proxyHandler.js";
import { callChatCompletions } from "../debate/chatCompletions.js";

export function callCloudflare(
  body: ProxyRequestBody, apiKey: string, accountId: string, fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  const url = "https://api.cloudflare.com/client/v4/accounts/" + encodeURIComponent(accountId) + "/ai/v1/chat/completions";
  return callChatCompletions(body, url, apiKey, fetchImpl);
}
