/* Debate mode (Step 8.3) — PIPELINE.md MULTI-AI ACTIONS: "two AI streams
   argue opposite sides in a two-column view."

   SINGLE ROUND: each side states its case once, simultaneously. No rebuttal
   turns. Nothing in CANON, PIPELINE.md, or ROUTING.md asks for a multi-turn
   exchange, and single-round is what Step 8.4's already-built, already-tested
   DebateTranscript {question, claudeText, partnerLabel, partnerText} can hold
   without changing it — extending that contract to carry rounds would mean
   reworking Consensus and Synthesis for a depth no spec requires. See
   BUILD-LOG.md DECISIONS.

   BOTH SIDES RUN IN PARALLEL and fail INDEPENDENTLY. ROUTING.md is explicit:
   "a partner API being down must not break the whole debate turn — fail that
   side gracefully with a visible retry, not a crash." So this never throws;
   it reports each side's own fate and only produces a DebateTranscript when
   both actually landed.

   Never two Claude calls: the two client seams are distinct types
   (DebateClaudeClient / DebatePartnerClient), so a caller cannot pass the
   same client for both sides — see client.ts. */

import type { DebateTranscript } from "../multiAi";
import {
  DEBATE_CLAUDE_MODEL,
  type DebateClaudeClient,
  type DebatePartnerClient,
} from "./client";
import { debateInput, debateSystemPrompt, type DebateStance } from "./prompt";
import { getDebatePartner, type DebatePartnerId } from "./roster";

export interface DebateSide {
  /** Which position this side argued. */
  stance: DebateStance;
  /** Display name for the column header — "Claude" or the roster label. */
  label: string;
  status: "ok" | "error";
  /** Present when status is "ok". */
  text?: string;
  /** Present when status is "error" — neutral, non-blaming copy for display
      (CANON's ADHD Feedback rule applies to failures too). */
  message?: string;
}

export type DebateOutcome =
  /** Both sides landed. `transcript` is ready for Consensus/Synthesis. */
  | { status: "complete"; claude: DebateSide; partner: DebateSide; transcript: DebateTranscript }
  /** Exactly one side landed — the other shows its error with a retry. */
  | { status: "partial"; claude: DebateSide; partner: DebateSide }
  /** Neither landed. */
  | { status: "failed"; claude: DebateSide; partner: DebateSide }
  /** Nothing to debate — short-circuits without spending either call. */
  | { status: "empty-question" };

export interface RunDebateOptions {
  claudeClient: DebateClaudeClient;
  partnerClient: DebatePartnerClient;
  /** Roster pick; defaults to gpt-5.5 at the call site (see DEFAULT_DEBATE_PARTNER). */
  partnerId: DebatePartnerId;
  /** Which side Claude argues. Defaults to "for" — the assignment is
      arbitrary but must be FIXED per run so the two prompts are genuine
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
  call: () => Promise<string>,
  stance: DebateStance,
  label: string,
): Promise<DebateSide> {
  try {
    const text = (await call()).trim();
    if (text.length === 0) {
      return { stance, label, status: "error", message: NEUTRAL_FAILURE };
    }
    return { stance, label, status: "ok", text };
  } catch {
    // The real error is deliberately not surfaced to the user — a provider
    // error string can echo request content or vendor internals. The retry
    // affordance is the useful part, not the stack.
    return { stance, label, status: "error", message: NEUTRAL_FAILURE };
  }
}

export async function runDebate(
  question: string,
  options: RunDebateOptions,
): Promise<DebateOutcome> {
  const trimmed = question.trim();
  if (trimmed.length === 0) return { status: "empty-question" };

  const partner = getDebatePartner(options.partnerId);
  const claudeStance = options.claudeStance ?? "for";
  const partnerStance = opposite(claudeStance);
  const input = debateInput(trimmed);

  // Parallel: the user waits for the slower side, not the sum of both.
  const [claude, partnerSide] = await Promise.all([
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
    runSide(
      () =>
        options.partnerClient({
          partner,
          system: debateSystemPrompt(partnerStance),
          input,
          signal: options.signal,
        }),
      partnerStance,
      partner.label,
    ),
  ]);

  if (claude.status === "ok" && partnerSide.status === "ok") {
    return {
      status: "complete",
      claude,
      partner: partnerSide,
      transcript: {
        question: trimmed,
        claudeText: claude.text!,
        partnerLabel: partner.label,
        partnerText: partnerSide.text!,
      },
    };
  }
  if (claude.status === "ok" || partnerSide.status === "ok") {
    return { status: "partial", claude, partner: partnerSide };
  }
  return { status: "failed", claude, partner: partnerSide };
}
