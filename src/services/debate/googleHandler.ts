/* Google Gemini debate-partner proxy handler. */

import { handlePartnerRequest, type PartnerAdapter, type PartnerProxyRequestBody } from "./partnerProxy.js";

const MODEL_ID = "gemini-3.1-pro";
interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: unknown }[] } }[];
  usageMetadata?: { promptTokenCount?: unknown; candidatesTokenCount?: unknown };
}
function nonNegativeInteger(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

export const GOOGLE_ADAPTER: PartnerAdapter = {
  modelId: MODEL_ID,
  keyEnvVar: "GOOGLE_API_KEY",
  url: () => `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent`,
  headers: (apiKey) => ({ "x-goog-api-key": apiKey }),
  body: (body: PartnerProxyRequestBody, maxTokens: number) => ({
    systemInstruction: { parts: [{ text: body.system }] },
    contents: [{ role: "user", parts: [{ text: body.input }] }],
    generationConfig: { maxOutputTokens: maxTokens },
  }),
  extractText: (payload: unknown) => {
    const parts = (payload as GeminiResponse)?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) return null;
    const text = parts.map((part) => (typeof part?.text === "string" ? part.text : "")).join("");
    return text.length > 0 ? text : null;
  },
  extractUsage: (payload: unknown) => {
    const usage = (payload as GeminiResponse)?.usageMetadata;
    const inputTokens = nonNegativeInteger(usage?.promptTokenCount);
    const outputTokens = nonNegativeInteger(usage?.candidatesTokenCount);
    return inputTokens === null || outputTokens === null ? null : { inputTokens, outputTokens };
  },
};

export function handleGoogleRequest(request: Request, apiKey: string | undefined, fetchImpl: typeof fetch = fetch): Promise<Response> {
  return handlePartnerRequest(request, apiKey, GOOGLE_ADAPTER, fetchImpl);
}
