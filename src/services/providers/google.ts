/* Google Gemini API adapter (Step 1.10 multi-provider support).
   Translates proxy format to Google's Generative AI API.
   https://ai.google.dev/tutorials/rest_quickstart */

import type { ProxyMessage, ProxyRequestBody } from "../proxyHandler.js";

interface GoogleContent {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

export interface GoogleRequestPayload {
  contents: GoogleContent[];
  generationConfig?: {
    maxOutputTokens?: number;
    temperature?: number;
  };
  systemInstruction?: { parts: Array<{ text: string }> };
}

interface GoogleUsageMetadata {
  prompt_token_count?: number;
  candidates_token_count?: number;
  total_token_count?: number;
}

export interface GoogleResponse {
  candidates?: Array<{
    content: { parts: Array<{ text: string }> };
    finishReason?: string;
  }>;
  usageMetadata?: GoogleUsageMetadata;
}

interface GoogleStreamEvent {
  candidates?: Array<{
    content?: { parts?: Array<{ text: string }> };
    finishReason?: string;
  }>;
  usageMetadata?: GoogleUsageMetadata;
}

const DEFAULT_TEMPERATURE = 0.7;

/** Build a Google Gemini request payload from proxy format. */
export function buildGooglePayload(
  body: ProxyRequestBody,
  apiKey: string,
): { payload: GoogleRequestPayload; url: string } {
  const contents: GoogleContent[] = body.messages.map((msg: ProxyMessage) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  const payload: GoogleRequestPayload = {
    contents,
    generationConfig: {
      maxOutputTokens: body.maxTokens ?? 4096,
      temperature: DEFAULT_TEMPERATURE,
    },
  };

  if (body.system) {
    payload.systemInstruction = {
      parts: [{ text: body.system }],
    };
  }

  // Google API key is passed as query param, not header
  const model = body.model === "gemini-pro" ? "gemini-1.5-pro" : "gemini-1.5-flash";
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent` +
    `?key=${encodeURIComponent(apiKey)}`;

  return { payload, url };
}

/** Call Google Gemini API. `apiKey` comes from server environment. */
export async function callGoogle(
  payload: GoogleRequestPayload,
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  return fetchImpl(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** Parse Google streaming response (Server-Sent Events) and yield text deltas. */
export async function* streamGoogleResponse(
  response: Response,
  onUsage?: (tokens: { input_tokens: number; output_tokens: number }) => void,
): AsyncGenerator<string> {
  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let totalInputTokens: number | undefined;
  let totalOutputTokens: number | undefined;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        try {
          const event = JSON.parse(trimmed) as GoogleStreamEvent;
          const text =
            event.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
          if (text) yield text;

          if (event.usageMetadata) {
            totalInputTokens = event.usageMetadata.prompt_token_count;
            totalOutputTokens = event.usageMetadata.candidates_token_count;
          }
        } catch {
          // Non-JSON line; skip
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (
    (totalInputTokens !== undefined || totalOutputTokens !== undefined) &&
    onUsage
  ) {
    onUsage({
      input_tokens: totalInputTokens ?? 0,
      output_tokens: totalOutputTokens ?? 0,
    });
  }
}

/** Parse Google non-streaming response. */
export function parseGoogleResponse(
  data: unknown,
  onUsage?: (tokens: { input_tokens: number; output_tokens: number }) => void,
): string {
  const response = data as GoogleResponse;
  const text =
    response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (response.usageMetadata && onUsage) {
    onUsage({
      input_tokens: response.usageMetadata.prompt_token_count ?? 0,
      output_tokens: response.usageMetadata.candidates_token_count ?? 0,
    });
  }

  return text;
}
