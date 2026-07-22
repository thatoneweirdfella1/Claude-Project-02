/* Multi-AI Actions — Consensus and Synthesis (Step 8.4). Debate mode (Step
   8.3) is the still-unbuilt third action; the DebateTranscript type here is
   the contract it is expected to produce. */
export { MULTI_AI_RUNTIME_MODEL, type MultiAiCompletionRequest, type MultiAiModelClient } from "./client";
export { buildTranscriptInput, isCompleteTranscript, type DebateTranscript } from "./transcript";
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
