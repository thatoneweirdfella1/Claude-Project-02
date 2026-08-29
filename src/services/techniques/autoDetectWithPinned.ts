import type { TechniqueId } from "../../stores/types";
import {
  anyConflict,
  autoDetectTechniques,
  dependencyClosure,
  type TechniqueHints,
  type TechniqueSelection,
} from "./autoDetect";
import { MAX_TECHNIQUE_STACK, getTechnique, isTechniqueId } from "./registry";

function appendCoherent(selected: TechniqueId[], candidate: TechniqueId): TechniqueId[] {
  if (!isTechniqueId(candidate) || getTechnique(candidate).isMeta || selected.includes(candidate)) {
    return selected;
  }
  const closure = dependencyClosure(candidate).filter((id) => !selected.includes(id));
  const combined = [...selected, ...closure];
  if (combined.length > MAX_TECHNIQUE_STACK || anyConflict(combined)) return selected;
  return combined;
}

/** Resolve Auto recommend while treating checked techniques as pinned.
 * Pinned choices are added first and are never displaced by an automatic
 * suggestion; remaining compatible slots are filled by the normal scorer. */
export function autoDetectWithPinned(
  question: string,
  pinned: TechniqueId[],
  hints: TechniqueHints = {},
): TechniqueSelection {
  const automatic = autoDetectTechniques(question, hints);
  let selected: TechniqueId[] = [];

  for (const id of pinned) selected = appendCoherent(selected, id);
  const pinnedSelection = [...selected];
  for (const id of automatic.selected) selected = appendCoherent(selected, id);

  const autoAdded = selected.filter((id) => !pinnedSelection.includes(id));
  const parts = [
    pinnedSelection.length
      ? `Kept checked: ${pinnedSelection.map((id) => getTechnique(id).label).join(", ")}.`
      : "",
    autoAdded.length
      ? `Auto added: ${autoAdded.map((id) => getTechnique(id).label).join(", ")}.`
      : "",
  ].filter(Boolean);

  return {
    ...automatic,
    selected,
    reasoning: parts.join(" ") || automatic.reasoning,
  };
}
