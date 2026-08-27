/* Debate mode — 2 to 4 AIs argue different sides in one parallel round.
   Every participant fails independently. A complete result preserves every
   successful side in stable order for Consensus and Synthesis. */

import type { DebateTranscript, DebateTranscriptParticipant } from "../multiAi";
import {
  DEBATE_CLAUDE_MODEL,
  type DebateClaudeClient,
  type DebatePartnerClient,
} from "./client";
import { debateInput, debateSystemPrompt, type DebateStance } from "./prompt";
import { getDebatePartner, type DebatePartnerId } from "./roster";

export interface DebateSide {
  stance: DebateStance;
  label: string;
  partnerId?: DebatePartnerId;
  status: "ok" | "error";
  text?: string;
  message?: string;
}

export type DebateOutcome =
  | { status: "complete"; sides: DebateSide[]; transcript: DebateTranscript }
  | { status: "partial"; sides: DebateSide[] }
  | { status: "failed"; sides: DebateSide[] }
  | { status: "empty-question" };

export interface RunDebateOptions {
  claudeClient: DebateClaudeClient;
  partnerClient: DebatePartnerClient;
  partnerIds: DebatePartnerId[];
  claudeStance?: DebateStance;
  signal?: AbortSignal;
}

export interface RunDebateParticipantOptions {
  claudeClient: DebateClaudeClient;
  partnerClient: DebatePartnerClient;
  side: Pick<DebateSide, "stance" | "partnerId">;
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
  partnerId?: DebatePartnerId,
): Promise<DebateSide> {
  try {
    const text = (await call()).trim();
    if (text.length === 0) return { stance, label, status: "error", message: NEUTRAL_FAILURE, partnerId };
    return { stance, label, status: "ok", text, partnerId };
  } catch {
    return { stance, label, status: "error", message: NEUTRAL_FAILURE, partnerId };
  }
}

/** Re-run exactly one existing debate participant. This is intentionally
    separate from runDebate so retry cannot silently call every provider. */
export async function runDebateParticipant(
  question: string,
  options: RunDebateParticipantOptions,
): Promise<DebateSide> {
  const trimmed = question.trim();
  if (!trimmed) {
    return { ...options.side, label: options.side.partnerId ? getDebatePartner(options.side.partnerId).label : "Claude", status: "error", message: NEUTRAL_FAILURE };
  }
  const input = debateInput(trimmed);
  if (!options.side.partnerId) {
    return runSide(
      () => options.claudeClient({
        model: DEBATE_CLAUDE_MODEL,
        system: debateSystemPrompt(options.side.stance),
        input,
        signal: options.signal,
      }),
      options.side.stance,
      "Claude",
    );
  }
  const partner = getDebatePartner(options.side.partnerId);
  return runSide(
    () => options.partnerClient({
      partner,
      system: debateSystemPrompt(options.side.stance),
      input,
      signal: options.signal,
    }),
    options.side.stance,
    partner.label,
    partner.id,
  );
}

function transcriptParticipant(side: DebateSide): DebateTranscriptParticipant {
  if (!side.text) throw new Error("Cannot create a transcript participant without text.");
  if (!side.partnerId) {
    return { label: side.label, providerId: "anthropic", modelId: DEBATE_CLAUDE_MODEL, text: side.text };
  }
  const partner = getDebatePartner(side.partnerId);
  return { label: side.label, providerId: partner.provider, modelId: partner.id, text: side.text };
}

export async function runDebate(
  question: string,
  options: RunDebateOptions,
): Promise<DebateOutcome> {
  const trimmed = question.trim();
  if (trimmed.length === 0) return { status: "empty-question" };
  if (options.partnerIds.length === 0 || options.partnerIds.length > 3) return { status: "failed", sides: [] };

  const claudeStance = options.claudeStance ?? "for";
  const partnerStance = opposite(claudeStance);
  const input = debateInput(trimmed);
  const partnerCalls = options.partnerIds.map((partnerId) => {
    const partner = getDebatePartner(partnerId);
    return runSide(
      () => options.partnerClient({ partner, system: debateSystemPrompt(partnerStance), input, signal: options.signal }),
      partnerStance,
      partner.label,
      partnerId,
    );
  });

  const results = await Promise.all([
    runSide(
      () => options.claudeClient({ model: DEBATE_CLAUDE_MODEL, system: debateSystemPrompt(claudeStance), input, signal: options.signal }),
      claudeStance,
      "Claude",
    ),
    ...partnerCalls,
  ]);
  const claude = results[0];
  const partners = results.slice(1);
  const sides = [claude, ...partners];
  const allSucceeded = sides.every((s) => s.status === "ok");
  const anySucceeded = sides.some((s) => s.status === "ok");

  if (allSucceeded && claude.status === "ok" && partners[0]?.status === "ok") {
    const firstPartner = partners[0];
    return {
      status: "complete",
      sides,
      transcript: {
        question: trimmed,
        participants: sides.map(transcriptParticipant),
        claudeText: claude.text!,
        partnerLabel: firstPartner.label,
        partnerText: firstPartner.text!,
      },
    };
  }
  if (anySucceeded) return { status: "partial", sides };
  return { status: "failed", sides };
}
