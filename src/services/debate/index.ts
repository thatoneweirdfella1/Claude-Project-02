/* Debate mode — public surface (Step 8.3). The partner proxy handlers are
   NOT exported here: they are server-side only, reached through
   api/proxy-<provider>.ts, and must never be pulled into the client bundle. */

export {
  DEBATE_PARTNERS,
  DEBATE_PARTNER_IDS,
  DEFAULT_DEBATE_PARTNER,
  getDebatePartner,
  isDebatePartnerId,
  type DebatePartner,
  type DebatePartnerId,
  type DebateProvider,
} from "./roster";
export {
  DEBATE_CLAUDE_MODEL,
  createPartnerClient,
  partnerEndpoint,
  withDebateUsage,
  type DebateClaudeClient,
  type DebateCompletionRequest,
  type DebateCompletionResponse,
  type DebatePartnerClient,
} from "./client";
export { debateInput, debateSystemPrompt, type DebateStance } from "./prompt";
export { runDebate, type DebateOutcome, type DebateSide, type ParticipantUsage, type RunDebateOptions } from "./runDebate";
