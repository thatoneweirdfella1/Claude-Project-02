/* Debate mode — public surface. Server-only provider handlers are not exported. */

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
  type DebateClaudeClient,
  type DebateCompletionRequest,
  type DebatePartnerClient,
} from "./client";
export { debateInput, debateSystemPrompt, type DebateStance } from "./prompt";
export {
  runDebate,
  runDebateParticipant,
  type DebateOutcome,
  type DebateSide,
  type RunDebateOptions,
  type RunDebateParticipantOptions,
} from "./runDebate";
