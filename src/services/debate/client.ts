/* Browser-side partner client for Debate mode. Partner proxies normalize both
   text and provider-reported usage; unknown dollar prices remain unknown. */

import type { ModelId } from "../modelRegistry";
import { appAccessHeaders } from "../appAccessClient";
import { addTokenUsage } from "../costTracking";
import type { DebatePartner, DebatePartnerId } from "./roster";

export interface DebateCompletionRequest { system: string; input: string; signal?: AbortSignal; }
export type DebateClaudeClient = (request: DebateCompletionRequest & { model: ModelId }) => Promise<string>;
export type DebatePartnerClient = (request: DebateCompletionRequest & { partner: DebatePartner }) => Promise<string>;
export const DEBATE_CLAUDE_MODEL: ModelId = "claude-sonnet-5";

export function partnerEndpoint(id: DebatePartnerId): string {
  const provider = id === "gpt-5.5" ? "openai" : id === "gemini-3.1-pro" ? "google" : id === "grok-4.3" ? "xai" : "deepseek";
  return `/api/proxy-${provider}`;
}

interface PartnerProxyReply {
  text?: unknown;
  error?: unknown;
  category?: unknown;
  usage?: { inputTokens?: unknown; outputTokens?: unknown };
}

function safeClientFailure(partner: DebatePartner, status: number, category: unknown): Error {
  const reason = category === "authentication" ? "authentication failed"
    : category === "rate-limit" ? "rate limit reached"
      : category === "timeout" ? "request timed out"
        : category === "configuration" ? "connection is not configured"
          : category === "network" ? "service could not be reached"
            : status >= 500 ? "service is temporarily unavailable"
              : "request was rejected";
  return new Error(`${partner.label}: ${reason}.`);
}

export function createPartnerClient(fetchImpl: typeof fetch = fetch): DebatePartnerClient {
  return async ({ partner, system, input, signal }) => {
    const response = await fetchImpl(partnerEndpoint(partner.id), {
      method: "POST",
      headers: { "content-type": "application/json", ...appAccessHeaders() },
      body: JSON.stringify({ model: partner.id, system, input }),
      signal,
    });

    let payload: PartnerProxyReply;
    try { payload = (await response.json()) as PartnerProxyReply; }
    catch { throw new Error(`${partner.label}: unreadable response.`); }

    if (!response.ok) throw safeClientFailure(partner, response.status, payload.category);
    if (typeof payload.text !== "string" || payload.text.trim().length === 0) throw new Error(`${partner.label}: no usable text.`);

    const inputTokens = payload.usage?.inputTokens;
    const outputTokens = payload.usage?.outputTokens;
    if (typeof inputTokens === "number" && Number.isSafeInteger(inputTokens) && inputTokens >= 0 && typeof outputTokens === "number" && Number.isSafeInteger(outputTokens) && outputTokens >= 0) {
      addTokenUsage(inputTokens, outputTokens, partner.id);
    }
    return payload.text;
  };
}
