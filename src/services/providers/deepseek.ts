/* DeepSeek API adapter (Step 1.10 multi-provider support).
   Translates proxy format to DeepSeek's API (uses OpenAI-compatible format).
   https://platform.deepseek.com/api-docs */

import type { ProxyMessage, ProxyRequestBody } from "../proxyHandler.js";

export interface DeepseekMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface DeepseekRequestPayload {
  model: string;
  messages: DeepseekMessage[];
  max_tokens?: number;
  stream?: boolean;
  temperature?: number;
}

interface DeepseekUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface DeepseekResponse {
  choices: Array<{
    message: { role: "assistant"; content: string };
    finish_reason: string;
  }>;
  usage?: DeepseekUsage;
}

interface DeepseekStreamEvent {
  object: string;
  choices: Array<{
    delta: { content?: string; role?: string };
    finish_reason: string | null;
  }>;
  usage?: DeepseekUsage;
}

const DEEPSEEK_URL = "https://api.deepseek.com/v1/chat/completions";
const DEFAULT_TEMPERATURE = 0.7;

/** Build a DeepSeek request payload from proxy format. */
export function buildDeepseekPayload(
  body: ProxyRequestBody,
): DeepseekRequestPayload {
  const messages: DeepseekMessage[] = [];

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

  // Map model names: reasoner model uses deepseek-reasoner, standard uses deepseek-chat
  const modelName =
    body.model === "deepseek-reasoner"
      ? "deepseek-reasoner"
      : "deepseek-chat";

  return {
    model: modelName,
    messages,
    max_tokens: body.maxTokens ?? 4096,
    temperature: DEFAULT_TEMPERATURE,
    stream: body.stream === true,
  };
}

/** Call DeepSeek API. `apiKey` comes from server environment. */
export async function callDeepseek(
  payload: DeepseekRequestPayload,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  return fetchImpl(DEEPSEEK_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
}

/** Parse DeepSeek streaming response and yield text deltas. */
export async function* streamDeepseekResponse(
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
          const event = JSON.parse(data) as DeepseekStreamEvent;
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

/** Parse DeepSeek non-streaming response. */
export function parseDeepseekResponse(
  data: unknown,
  onUsage?: (tokens: { input_tokens: number; output_tokens: number }) => void,
): string {
  const response = data as DeepseekResponse;
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
