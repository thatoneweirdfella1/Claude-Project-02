/* Technique selection — public surface. Step 4.1: registry + matrix. Step 4.2
   adds the auto-detect scoring/stacking service here. */

export {
  TECHNIQUES,
  TECHNIQUE_IDS,
  COMPOSABLE_TECHNIQUE_IDS,
  DEFAULT_TECHNIQUE,
  MAX_TECHNIQUE_STACK,
  getTechnique,
  isTechniqueId,
  type Technique,
} from "./registry";
export {
  autoDetectTechniques,
  selectTechniques,
  dependencyClosure,
  anyConflict,
  type TechniqueHints,
  type TechniqueScore,
  type TechniqueSelection,
} from "./autoDetect";
export {
  AUTO_MODE,
  isAutoMode,
  canSelectManually,
  selectManualTechnique,
  deselectManualTechnique,
  type ManualSelectVerdict,
} from "./manualSelection";
