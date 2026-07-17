/* Translation Engine — public surface. Import from "@/services/translation".
   Step 2.1: schema + prompt. Step 2.2: the runtime service + model-client seam
   + manual harness. Step 2.3 adds the confidence gates on top of these. */

export {
  GAP_TYPES,
  GAP_TYPE_LABELS,
  type GapType,
  type TranslationResult,
  TranslationSchemaError,
  isGapType,
  parseTranslationOutput,
} from "./schema";
export { TRANSLATION_SYSTEM_PROMPT } from "./prompt";
export {
  type ModelCompletionRequest,
  type TranslationModelClient,
  TRANSLATION_MODEL,
} from "./client";
export {
  translate,
  extractJsonObject,
  MAX_TRANSLATION_INPUT_CHARS,
  type TranslationOutcome,
  type TranslateOptions,
} from "./translate";
export {
  runTranslationHarness,
  stubTranslationClient,
  SAMPLE_INPUTS,
} from "./harness";
export {
  CONFIDENCE_GATES,
  MODERATE_CONFIDENCE_NOTE,
  evaluateConfidenceGate,
  buildClarifyingQuestion,
  gateTranslation,
  type GateLevel,
  type GateDecision,
  type GatedTranslation,
} from "./gate";
