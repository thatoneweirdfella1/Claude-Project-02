/* OpenAI (GPT-5.5) debate-partner proxy handler (Step 8.3).
   ROUTING.md DEBATE PARTNERS: "gpt-5.5 : OpenAI : agentic generalist",
   key env var OPENAI_API_KEY. Deploy entry: api/proxy-openai.ts.

   Three of the four partners (OpenAI, xAI, DeepSeek) expose an
   OpenAI-compatible /chat/completions shape, so they share the request/
   response builders in chatCompletions.ts — each still has its own named
   handler file (per ROUTING.md's stated file pattern), its own endpoint, and
   its own key, which is what actually has to be separate. Google's Gemini
   shape genuinely differs and has its own adapter. */

import { chatCompletionsAdapter } from "./chatCompletions";
import { handlePartnerRequest, type PartnerAdapter } from "./partnerProxy";

export const OPENAI_ADAPTER: PartnerAdapter = chatCompletionsAdapter({
  modelId: "gpt-5.5",
  url: "https://api.openai.com/v1/chat/completions",
  keyEnvVar: "OPENAI_API_KEY",
});

export function handleOpenAiRequest(
  request: Request,
  apiKey: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  return handlePartnerRequest(request, apiKey, OPENAI_ADAPTER, fetchImpl);
}
