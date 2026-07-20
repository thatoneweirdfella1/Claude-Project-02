/* Model-client seams for Debate mode (Step 8.3).

   TWO seams, deliberately, because Debate is the one feature in this build
   that calls two DIFFERENT vendors in one turn (CANON Feature 9: "two
   DIFFERENT AI providers, never two Claude calls arguing with itself"):

   - DebateClaudeClient — Claude's side. Structurally identical to the
     translation/detection/multiAi seams, so createProxyClient().complete
     satisfies it unchanged.
   - DebatePartnerClient — the partner's side. Routes to that provider's own
     endpoint (api/proxy-<provider>.ts), never to api/proxy.ts.

   Keeping them as separate types is what makes "never two Claude calls" a
   compile-time property rather than a convention someone has to remember:
   runDebate takes one of each and cannot be handed the same client twice. */

import type { ModelId } from "../modelRegistry";
import { appAccessHeaders } from "../appAccessClient";
import type { DebatePartner, DebatePartnerId } from "./roster";

export interface DebateCompletionRequest {
  system: string;
  input: string;
  signal?: AbortSignal;
}

/** Claude's side of the debate. `model` is a real Claude ModelId. */
export type DebateClaudeClient = (
  request: DebateCompletionRequest & { model: ModelId },
) => Promise<string>;

/** The partner's side. `partner` carries the roster entry so the client knows
    which endpoint to hit; the caller never builds a URL itself. */
export type DebatePartnerClient = (
  request: DebateCompletionRequest & { partner: DebatePartner },
) => Promise<string>;

/** Claude's debate model. Sonnet, not Opus: Opus is reserved as the RUNTIME
    model for Consensus/Synthesis (MULTI_AI_RUNTIME_MODEL, Step 8.4) which
    read both transcripts afterward — a debate side is one argued position,
    not the adjudication, and Sonnet is the Balanced default this app already
    routes most real questions to. Not run through routing.js: ROUTING.md is
    explicit that debate "is a distinct code path... it does not go through
    the MODELS table or the complexity scorer." */
export const DEBATE_CLAUDE_MODEL: ModelId = "claude-sonnet-5";

/** Endpoint per provider — mirrors api/proxy-<provider>.ts one-to-one. */
export function partnerEndpoint(id: DebatePartnerId): string {
  const provider = id === "gpt-5.5" ? "openai" : id === "gemini-3.1-pro" ? "google" : id === "grok-4.3" ? "xai" : "deepseek";
  return `/api/proxy-${provider}`;
}

interface PartnerProxyReply {
  text?: unknown;
  error?: unknown;
}

/** Real partner client: POSTs to that provider's proxy and returns its text.
    Throws on any failure — runDebate catches per side, so one dead provider
    fails only its own column (ROUTING.md: "a partner API being down must not
    break the whole debate turn"). */
export function createPartnerClient(fetchImpl: typeof fetch = fetch): DebatePartnerClient {
  return async ({ partner, system, input, signal }) => {
    const response = await fetchImpl(partnerEndpoint(partner.id), {
      method: "POST",
      headers: { "content-type": "application/json", ...appAccessHeaders() },
      body: JSON.stringify({ model: partner.id, system, input }),
      signal,
    });

    let payload: PartnerProxyReply;
    try {
      payload = (await response.json()) as PartnerProxyReply;
    } catch {
      throw new Error(`${partner.label} returned an unreadable response.`);
    }

    if (!response.ok) {
      const detail = typeof payload.error === "string" ? payload.error : `HTTP ${response.status}`;
      throw new Error(`${partner.label} call failed: ${detail}`);
    }
    if (typeof payload.text !== "string" || payload.text.trim().length === 0) {
      throw new Error(`${partner.label} returned no text.`);
    }
    return payload.text;
  };
}
