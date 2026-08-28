/* Debate mode (Step 8.3) — PIPELINE.md MULTI-AI ACTIONS: "2 to 4 AIs argue
   different sides in a multi-column view."

   SINGLE ROUND: each participant states its case once, simultaneously. No
   rebuttal turns. Nothing in CANON, PIPELINE.md, or ROUTING.md asks for a
   multi-turn exchange, and single-round is what Step 8.4's already-built,
   already-tested DebateTranscript {question, claudeText, partnerLabel,
   partnerText} can hold — extending that to carry rounds would mean reworking
   Consensus and Synthesis for a depth no spec requires. See BUILD-LOG.md
   DECISIONS.

   ALL PARTICIPANTS RUN IN PARALLEL and fail INDEPENDENTLY. ROUTING.md is
   explicit: "a partner API being down must not break the whole debate turn —
   fail that side gracefully with a visible retry, not a crash." So this never
   throws; it reports each participant's own fate.

   2-to-4-way debates (Claude + 1 to 3 partners). Never two Claude calls: the
   two client seams are distinct types (DebateClaudeClient / DebatePartnerClient),
   so a caller cannot pass the same client for multiple partners — see client.ts.

   Multiple partners are called in parallel via Promise.all and each fails
   independently if their API is down. */

import type { DebateTranscript } from "../multiAi";
import {
  DEBATE_CLAUDE_MODEL,
  type DebateClaudeClient,
  type DebatePartnerClient,
} from "./client";
import { debateInput, debateSystemPrompt, type DebateStance } from "./prompt";
import { getDebatePartner, type DebatePartnerId } from "./roster";
import type { ConnectedProviderId } from "../providerStatus";

export interface ParticipantUsage {
  /** Provider for this participant (anthropic, openai, google, xai, deepseek). */
  provider: ConnectedProviderId | null;
  /** Model ID used. */
  model: string | null;
  /** Actual input tokens used. */
  inputTokens: number | null;
  /** Actual output tokens used. */
  outputTokens: number | null;
  /** Estimated cost before execution. */
  estimatedCost: number | null;
  /** Actual cost after execution. */
  actualCost: number | null;
}

export interface DebateSide {
  /** Which position this side argued. */
  stance: DebateStance;
  /** Display name for the column header — "Claude" or the roster label. */
  label: string;
  /** Partner ID, present for non-Claude sides. */
  partnerId?: DebatePartnerId;
  status: "ok" | "error";
  /** Present when status is "ok". */
  text?: string;
  /** Present when status is "error" — neutral, non-blaming copy for display
      (CANON's ADHD Feedback rule applies to failures too). */
  message?: string;
  /** Usage data: provider, model, tokens, and costs. Fields are null when unavailable. */
  usage?: ParticipantUsage;
}

export type DebateOutcome =
  /** All participants landed. Includes transcript for Consensus/Synthesis.
      For 2-way, transcript is the standard DebateTranscript. For 3-4-way,
      the primary transcript uses the first partner; all participants available
      in the `sides` array for rendering all columns. */
  | {
      status: "complete";
      sides: DebateSide[];
      transcript: DebateTranscript;
    }
  /** Partial success — at least one but not all participants landed. */
  | { status: "partial"; sides: DebateSide[] }
  /** Complete failure — no participants landed. */
  | { status: "failed"; sides: DebateSide[] }
  /** Nothing to debate — short-circuits without spending any calls. */
  | { status: "empty-question" };

export interface RunDebateOptions {
  claudeClient: DebateClaudeClient;
  partnerClient: DebatePartnerClient;
  /** 1-3 roster picks (multi-way debate). Required and non-empty. */
  partnerIds: DebatePartnerId[];
  /** Which side Claude argues. Defaults to "for" — the assignment is
      arbitrary but must be FIXED per run so the prompts are genuine
      opposites; exposed so a caller (or a future rematch control) can swap
      sides without this module guessing. */
  claudeStance?: DebateStance;
  signal?: AbortSignal;
}

const NEUTRAL_FAILURE =
  "This side couldn't be reached. Nothing is wrong with your question — try this side again.";

function opposite(stance: DebateStance): DebateStance {
  return stance === "for" ? "against" : "for";
}

async function runSide(
  call: () => Promise<{ text: string; usage?: ParticipantUsage }>,
  stance: DebateStance,
  label: string,
  partnerId?: DebatePartnerId,
): Promise<DebateSide> {
  try {
    const result = await call();
    const text = result.text.trim();
    if (text.length === 0) {
      return { stance, label, status: "error", message: NEUTRAL_FAILURE, partnerId, usage: result.usage };
    }
    return { stance, label, status: "ok", text, partnerId, usage: result.usage };
  } catch {
    // The real error is deliberately not surfaced to the user — a provider
    // error string can echo request content or vendor internals. The retry
    // affordance is the useful part, not the stack.
    return { stance, label, status: "error", message: NEUTRAL_FAILURE, partnerId };
  }
}

export async function runDebate(
  question: string,
  options: RunDebateOptions,
): Promise<DebateOutcome> {
  const trimmed = question.trim();
  if (trimmed.length === 0) return { status: "empty-question" };

  if (options.partnerIds.length === 0 || options.partnerIds.length > 3) {
    return { status: "failed", sides: [] };
  }

  const claudeStance = options.claudeStance ?? "for";
  const partnerStance = opposite(claudeStance);
  const input = debateInput(trimmed);

  // Build all participant calls in parallel
  const partnerCalls = options.partnerIds.map((partnerId) => {
    const partner = getDebatePartner(partnerId);
    return runSide(
      () =>
        options.partnerClient({
          partner,
          system: debateSystemPrompt(partnerStance),
          input,
          signal: options.signal,
        }),
      partnerStance,
      partner.label,
      partnerId,
    );
  });

  // Run all in parallel: Claude + all partners
  const results = await Promise.all([
    runSide(
      () =>
        options.claudeClient({
          model: DEBATE_CLAUDE_MODEL,
          system: debateSystemPrompt(claudeStance),
          input,
          signal: options.signal,
        }),
      claudeStance,
      "Claude",
    ),
    ...partnerCalls,
  ]);

  const claude = results[0];
  const partners = results.slice(1);
  const sides = [claude, ...partners];

  // Determine completion status
  const allSucceeded = sides.every((s) => s.status === "ok");
  const anySucceeded = sides.some((s) => s.status === "ok");

  if (allSucceeded && claude.status === "ok" && partners[0]?.status === "ok") {
    // Use the first partner for the canonical transcript
    const firstPartner = partners[0];
    return {
      status: "complete",
      sides,
      transcript: {
        question: trimmed,
        claudeText: claude.text!,
        partnerLabel: firstPartner.label,
        partnerText: firstPartner.text!,
      },
    };
  }

  if (anySucceeded) {
    return { status: "partial", sides };
  }

  return { status: "failed", sides };
}
