/* Composition engine (Step 4.3) — public surface. Step 4.4 feeds it the
   directness level from the selector; Step 5.2's orchestrator calls
   composeFinalPrompt with the pipeline's assembled inputs. */

export {
  composeFinalPrompt,
  COMPOSITION_ORDER,
  type CompositionInput,
  type CompositionSection,
  type CompositionSectionName,
  type ComposedPrompt,
} from "./compose";
export {
  BASE_TEMPLATE,
  DEFAULT_ROLE_PRIME,
  DEFAULT_OUTPUT_FORMAT,
  DIRECTNESS_ENCODINGS,
  confidenceRequirement,
} from "./templates";
