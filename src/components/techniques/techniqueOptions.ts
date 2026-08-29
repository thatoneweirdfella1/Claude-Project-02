import {
  COMPOSABLE_TECHNIQUE_IDS,
  MAX_TECHNIQUE_STACK,
  getTechnique,
} from "../../services/techniques";
import type { TechniqueId } from "../../stores/types";

/* Technique popover option list (Step 4.5) — the 11 composable techniques, in
   registry order, for the manual-selection checklist. Auto-detect is handled
   as a separate, always-first row in the popover, not part of this list (it
   is a mode, not a checkbox item — Step 4.1's isMeta). */
export const MANUAL_TECHNIQUE_IDS: TechniqueId[] = COMPOSABLE_TECHNIQUE_IDS;

export { MAX_TECHNIQUE_STACK };

/** Summary label for the dropdown's closed/trigger state, matching the
    screenshot's single-value look ("Socratic") for the common cases, while
    still being truthful when manual mode has multiple techniques stacked —
    something the screenshot's single static frame never shows, since it only
    depicts one technique selected. */
export function techniqueSummaryLabel(
  techniques: TechniqueId[],
  autoSelection: TechniqueId[] = [],
): string {
  if (techniques.length === 0) return "Choose technique";
  if (techniques.includes("auto-detect")) {
    if (autoSelection.length === 1) return getTechnique(autoSelection[0]).label;
    if (autoSelection.length > 1) return `${autoSelection.length} techniques`;
    return "Auto recommend";
  }
  if (techniques.length === 1) return getTechnique(techniques[0]).label;
  return `${techniques.length} techniques`;
}
