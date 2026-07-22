/* State Detection Engine — public surface (Feature 5).
   Step 6.1: the on-demand detection service + schema + model-client seam.
   Step 6.2 finalizes the classifier prompt and the output schema detail. */

export {
  EMOTION_STATES,
  RSD_LEVELS,
  INTEREST_LEVELS,
  COGNITIVE_MODES,
  type DimensionReading,
  type StateDetectionResult,
  DetectionSchemaError,
  parseDetectionOutput,
  toStatePills,
} from "./schema";
export { DETECTION_SYSTEM_PROMPT } from "./prompt";
export {
  DETECTION_MODEL,
  type DetectionCompletionRequest,
  type DetectionModelClient,
} from "./client";
export {
  detectState,
  extractJsonObject,
  MAX_DETECTION_INPUT_CHARS,
  type DetectionOutcome,
  type DetectOptions,
} from "./detect";
export {
  STATE_IMPACTS,
  impactsFor,
  recommendedDirectness,
  suggestedTechniques,
  type StateImpact,
  type AppliedImpact,
} from "./impacts";
export {
  CORRECTION_THRESHOLD,
  countCorrectionsTo,
  adaptedValueFor,
  adaptedValues,
  buildAdaptationNote,
  type CorrectionDimension,
} from "./correctionLearning";
export { deriveStateFeeds, type StateFeeds, type TransparencyEntry } from "./stateBus";
