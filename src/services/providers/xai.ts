/* xAI Grok API adapter (Step 1.10 multi-provider support).
   Translates proxy format to xAI's API (uses OpenAI-compatible format).
   https://docs.x.ai/api/introduction */

import type { ProxyMessage, ProxyRequestBody } from "../proxyHandler.js";

export interface XaiMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface XaiRequestPayload {
  model: string;
  messages: XaiMessage[];
  max_tokens?: number;
  stream?: boolean;
  temperature?: number;
}

interface XaiUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface XaiResponse {
  choices: Array<{
    message: { role: "assistant"; content: string };
    finish_reason: string;
  }>;
  usage?: XaiUsage;
}

interface XaiStreamEvent {
  object: string;
  choices: Array<{
    delta: { content?: string; role?: string };
    finish_reason: string | null;
  }>;
  usage?: XaiUsage;
}

const XAI_URL = "https://api.x.ai/v1/chat/completions";
const DEFAULT_TEMPERATURE = 0.7;

/** Build an xAI request payload from proxy format. */
export function buildXaiPayload(
  body: ProxyRequestBody,
): XaiRequestPayload {
  const messages: XaiMessage[] = [];

  // Add system message if provided
  if (body.system) {
    messages.push({ role: "system", content: body.system });
  }

  // Add conversation messages
  messages.push(
    ...body.messages.map((msg: ProxyMessage) => ({
      role: msg.role,
      content: msg.content,
    })),
  );

  return {
    model: body.model,
    messages,
    max_tokens: body.maxTokens ?? 4096,
    temperature: DEFAULT_TEMPERATURE,
    stream: body.stream === true,
  };
}

/** Call xAI API. `apiKey` comes from server environment. */
export async function callXai(
  payload: XaiRequestPayload,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  return fetchImpl(XAI_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
}

/** Parse xAI streaming response and yield text deltas. */
export async function* streamXaiResponse(
  response: Response,
  onUsage?: (tokens: { input_tokens: number; output_tokens: number }) => void,
): AsyncGenerator<string> {
  if (!response.body) return;

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let inputTokens: number | undefined;
  let outputTokens: number | undefined;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        if (trimmed === "data: [DONE]") break;

        const data = trimmed.slice(5).trim();
        if (!data) continue;

        try {
          const event = JSON.parse(data) as XaiStreamEvent;
          if (event.choices?.[0]?.delta?.content) {
            yield event.choices[0].delta.content;
          }
          if (event.usage) {
            inputTokens = event.usage.prompt_tokens;
            outputTokens = event.usage.completion_tokens;
          }
        } catch {
          // Keep-alive pings or non-JSON; skip
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (
    (inputTokens !== undefined || outputTokens !== undefined) &&
    onUsage
  ) {
    onUsage({
      input_tokens: inputTokens ?? 0,
      output_tokens: outputTokens ?? 0,
    });
  }
}

/** Parse xAI non-streaming response. */
export function parseXaiResponse(
  data: unknown,
  onUsage?: (tokens: { input_tokens: number; output_tokens: number }) => void,
): string {
  const response = data as XaiResponse;
  const text =
    response.choices?.[0]?.message?.content ?? "";

  if (response.usage && onUsage) {
    onUsage({
      input_tokens: response.usage.prompt_tokens,
      output_tokens: response.usage.completion_tokens,
    });
  }

  return text;
}
