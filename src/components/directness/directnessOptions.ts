import { DIRECTNESS_LEVELS } from "../../services/directness";
import type { DropdownOption } from "../primitives";

/* Directness dropdown options (Step 4.4), matching the V3 screenshot's
   "Directness Level N" labels. Values are the level number as a string (the
   native <select> is string-valued); the component parses back to a
   DirectnessLevel. Unlike the Model dropdown, the screenshot shows no
   descriptor suffix on the directness option, so none is added. */
export const DIRECTNESS_DROPDOWN_OPTIONS: DropdownOption[] = DIRECTNESS_LEVELS.map(
  (level) => ({ value: String(level.level), label: level.label }),
);
