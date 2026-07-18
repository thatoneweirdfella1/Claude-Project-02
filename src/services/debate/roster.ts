/* The debate partner roster (Step 8.3) — ROUTING.md DEBATE PARTNERS, verbatim:
   the four non-Anthropic providers Claude can be made to argue against, their
   api strings, and their roles. CANON Feature 9 is explicit that Debate mode
   "uses two DIFFERENT AI providers, never two Claude calls arguing with
   itself," so Claude is always one side and the partner is always drawn from
   this list — there is deliberately no Anthropic entry here.

   This is a separate code path from primary routing (ROUTING.md: "it does not
   go through the MODELS table or the complexity scorer"), which is why these
   ids live here rather than in services/modelRegistry.ts — that registry is
   the three Claude models and is consumed by routing.js and the proxy's own
   model validation, neither of which should ever see a partner id. */

export type DebatePartnerId = "gpt-5.5" | "gemini-3.1-pro" | "grok-4.3" | "deepseek-v4-pro";

/** The provider key, used to pick the serverless endpoint (api/proxy-<provider>.ts)
    and, server-side, that provider's own API-key env var. */
export type DebateProvider = "openai" | "google" | "xai" | "deepseek";

export interface DebatePartner {
  id: DebatePartnerId;
  provider: DebateProvider;
  /** Display name shown in the picker and carried into DebateTranscript's
      partnerLabel — never the raw api string (see transcript.ts). */
  label: string;
  /** ROUTING.md's own one-line role description, shown under the label so the
      choice is informed rather than four opaque names (CANON's "no black box"
      and the ADHD rule against unexplained choices). */
  role: string;
}

export const DEBATE_PARTNERS: Record<DebatePartnerId, DebatePartner> = {
  "gpt-5.5": {
    id: "gpt-5.5",
    provider: "openai",
    label: "GPT-5.5",
    role: "Agentic generalist, strong practical reasoning",
  },
  "gemini-3.1-pro": {
    id: "gemini-3.1-pro",
    provider: "google",
    label: "Gemini 3.1 Pro",
    role: "Abstract and reframing reasoning, best multimodal",
  },
  "grok-4.3": {
    id: "grok-4.3",
    provider: "xai",
    label: "Grok 4.3",
    role: "Real-time grounded, blunt counterpoint",
  },
  "deepseek-v4-pro": {
    id: "deepseek-v4-pro",
    provider: "deepseek",
    label: "DeepSeek V4 Pro",
    role: "Near-frontier reasoning at low cost",
  },
};

/** Roster order for the picker — matches ROUTING.md's own listing order. */
export const DEBATE_PARTNER_IDS: DebatePartnerId[] = [
  "gpt-5.5",
  "gemini-3.1-pro",
  "grok-4.3",
  "deepseek-v4-pro",
];

/** ROUTING.md / CANON Feature 9: "Default partner if the user doesn't pick
    one: gpt-5.5." */
export const DEFAULT_DEBATE_PARTNER: DebatePartnerId = "gpt-5.5";

export function isDebatePartnerId(value: unknown): value is DebatePartnerId {
  return typeof value === "string" && value in DEBATE_PARTNERS;
}

export function getDebatePartner(id: DebatePartnerId): DebatePartner {
  return DEBATE_PARTNERS[id];
}
