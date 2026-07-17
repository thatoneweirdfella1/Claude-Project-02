/* Translation Engine — public surface (Step 2.1: schema + prompt; Step 2.2
   adds the runtime service here). Import from "@/services/translation". */

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
