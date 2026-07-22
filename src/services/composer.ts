/* The composer's emitted request (Step 5.0). TRANSLATE & ASK emits exactly
   this typed object — the raw input text, the three settings (Model,
   Directness, Technique), and the session's loaded context. It does NOT call
   an API, does not translate, and does not route: that boundary is the point
   (PIPELINE.md Stage 1 / Step 5.2's orchestrator is the only consumer that may
   act on this object). Keeping composer.ts free of any pipeline call is what
   makes that boundary real rather than aspirational. */

import type {
  ContextItem,
  DirectnessLevel,
  ModelSelection,
  TechniqueId,
} from "../stores/types";

export interface TranslateAskSettings {
  model: ModelSelection;
  directness: DirectnessLevel;
  techniques: TechniqueId[];
}

/** The exact shape Step 5.2's orchestrator subscribes to. Plain, JSON-
    serializable data — no functions, no store references — so it can cross a
    callback boundary (or later, a queue) with no aliasing surprises. */
export interface TranslateAskRequest {
  rawInput: string;
  model: ModelSelection;
  directness: DirectnessLevel;
  techniques: TechniqueId[];
  context: ContextItem[];
}

/** Build the request TRANSLATE & ASK emits. Pure and synchronous — no
    trimming/validation beyond what's needed to make the object well-formed
    (translate() already handles empty/huge input downstream); the button is
    always pressable regardless of what's in the box. */
export function buildTranslateAskRequest(
  rawInput: string,
  settings: TranslateAskSettings,
  context: ContextItem[],
): TranslateAskRequest {
  return {
    rawInput,
    model: settings.model,
    directness: settings.directness,
    techniques: settings.techniques,
    context,
  };
}
