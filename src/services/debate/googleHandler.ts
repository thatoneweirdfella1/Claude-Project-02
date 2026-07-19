/* Google (Gemini 3.1 Pro) debate-partner proxy handler (Step 8.3).
   ROUTING.md DEBATE PARTNERS: "gemini-3.1-pro : Google : abstract reasoning,
   multimodal", key env var GOOGLE_API_KEY. Deploy entry: api/proxy-google.ts.

   Gemini's generateContent shape genuinely differs from the OpenAI-compatible
   /chat/completions the other three partners speak (contents/parts rather
   than messages, systemInstruction rather than a system message, and the key
   as a header rather than a bearer token), so this adapter is written out
   rather than sharing chatCompletions.ts. */

import { handlePartnerRequest, type PartnerAdapter, type PartnerProxyRequestBody } from "./partnerProxy.js";

const MODEL_ID = "gemini-3.1-pro";

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: unknown }[] } }[];
}

export const GOOGLE_ADAPTER: PartnerAdapter = {
  modelId: MODEL_ID,
  keyEnvVar: "GOOGLE_API_KEY",
  url: () =>
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent`,
  // Key goes in a header, not the query string — a URL-embedded key can land
  // in proxy/CDN access logs, which is exactly what this proxy exists to avoid.
  headers: (apiKey) => ({ "x-goog-api-key": apiKey }),
  body: (body: PartnerProxyRequestBody, maxTokens: number) => ({
    systemInstruction: { parts: [{ text: body.system }] },
    contents: [{ role: "user", parts: [{ text: body.input }] }],
    generationConfig: { maxOutputTokens: maxTokens },
  }),
  extractText: (payload: unknown) => {
    const parts = (payload as GeminiResponse)?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) return null;
    // Gemini can split one reply across several parts — join rather than
    // taking [0], which would silently truncate a long argument.
    const text = parts
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("");
    return text.length > 0 ? text : null;
  },
};

export function handleGoogleRequest(
  request: Request,
  apiKey: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  return handlePartnerRequest(request, apiKey, GOOGLE_ADAPTER, fetchImpl);
}
