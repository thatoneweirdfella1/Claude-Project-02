/* xAI (Grok 4.3) debate-partner proxy handler (Step 8.3).
   ROUTING.md DEBATE PARTNERS: "grok-4.3 : xAI : real-time grounded, blunt
   counterpoint", key env var XAI_API_KEY. Deploy entry: api/proxy-xai.ts.
   xAI ships an OpenAI-compatible /chat/completions endpoint — see
   chatCompletions.ts for why that builder is shared rather than copied. */

import { chatCompletionsAdapter } from "./chatCompletions.js";
import { handlePartnerRequest, type PartnerAdapter } from "./partnerProxy.js";

export const XAI_ADAPTER: PartnerAdapter = chatCompletionsAdapter({
  modelId: "grok-4.3",
  url: "https://api.x.ai/v1/chat/completions",
  keyEnvVar: "XAI_API_KEY",
});

export function handleXaiRequest(
  request: Request,
  apiKey: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  return handlePartnerRequest(request, apiKey, XAI_ADAPTER, fetchImpl);
}
