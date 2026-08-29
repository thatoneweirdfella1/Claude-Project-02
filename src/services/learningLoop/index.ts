/* Learning loop (Step 10.1 Pattern Analysis + Step 10.2 Rule Refinement)
   Public exports for background pattern analysis and rule refinement. */

export { startLearningLoop } from "./backgroundJob";
export type { LearningJobConfig } from "./backgroundJob";
export { analyzePatterns } from "./analyzer";
export { applyRefinements, MAX_TECHNIQUE_WEIGHT, MIN_TECHNIQUE_WEIGHT } from "./applier";
export type { ApplyRefinementsResult } from "./applier";
