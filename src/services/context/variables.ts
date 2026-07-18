/* Variable substitution (Step 7.4) — CANON Feature 6: "create variables
   ($name), the app substitutes them into prompts."

   Pure, no store import (services/ stays store-agnostic, same layering as
   every other service in this build) — the wiring point (Composer.tsx /
   CenterColumn.tsx) reads both stores and passes the merged map in. */

import type { SavedVariables } from "../../stores/types";

/** A legal variable name: letters, digits, underscore, not starting with a
    digit — the same shape most languages use for identifiers, so `$name`
    reads unambiguously in free text and there's no need to explain a
    separate naming rule to the user. */
const NAME_PATTERN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

export function isValidVariableName(name: string): boolean {
  return NAME_PATTERN.test(name);
}

/** Matches `$name` tokens in free text. Built from NAME_PATTERN so the
    substitution regex and the name-validation rule can never drift apart —
    a name the creator form accepts is exactly a name substitution can find. */
const VARIABLE_TOKEN = /\$([a-zA-Z_][a-zA-Z0-9_]*)/g;

/** Replaces every `$name` occurrence in `text` with `variables[name]`, if
    defined. A `$name` with NO matching variable is left exactly as typed —
    never blanked or dropped — because silently erasing text the user wrote
    could change what they meant to ask; an unmatched token is at worst
    inert, never destructive. Case-sensitive (matches how the variable was
    named at creation). */
export function substituteVariables(text: string, variables: SavedVariables): string {
  return text.replace(VARIABLE_TOKEN, (whole, name: string) =>
    Object.prototype.hasOwnProperty.call(variables, name) ? variables[name] : whole,
  );
}

/** Merges session variables over account (persisted) variables — a
    same-named session variable is the more current value and wins. Pure
    merge, no store access; the caller supplies both maps. */
export function mergeVariables(
  accountVariables: SavedVariables,
  sessionVariables: SavedVariables,
): SavedVariables {
  return { ...accountVariables, ...sessionVariables };
}
