/* Multi-AI Actions — shared public surface. */
export { MULTI_AI_RUNTIME_MODEL, type MultiAiCompletionRequest, type MultiAiModelClient } from "./client";
export {
  buildTranscriptInput,
  isCompleteTranscript,
  transcriptParticipants,
  type DebateTranscript,
  type DebateTranscriptParticipant,
} from "./transcript";
export {
  MultiAiSchemaError,
  parseConsensusOutput,
  parseSynthesisOutput,
  type ConsensusResult,
  type SynthesisResult,
} from "./schema";
export { CONSENSUS_SYSTEM_PROMPT, SYNTHESIS_SYSTEM_PROMPT } from "./prompt";
export { runConsensus, type ConsensusOutcome, type RunConsensusOptions } from "./consensus";
export { runSynthesis, type SynthesisOutcome, type RunSynthesisOptions } from "./synthesis";
