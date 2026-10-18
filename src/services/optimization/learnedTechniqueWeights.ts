import type { LearnedPreferences, TechniqueId } from "../../stores/types";
import type { TranslateAskRequest } from "../composer";
import { autoDetectWithPinned, getTechnique, isAutoMode, isTechniqueId, type TechniqueHints, type TechniqueSelection } from "../techniques";

export interface TechniqueLearningAudit {
  weights: Partial<Record<TechniqueId, number>>;
  before: TechniqueId[];
  after: TechniqueId[];
  note: string;
}

/** Reuse the existing scorer's quarter-point nudge and its conflict/dependency
 * rules. Learning only fills Auto slots; checked techniques are never nudged. */
export function boundedTechniqueWeights(
  weights: Partial<Record<TechniqueId, number>>,
  pinned: TechniqueId[] = [],
): Partial<Record<TechniqueId, number>> {
  return Object.fromEntries(Object.entries(weights).flatMap(([id, value]) => {
    if (!isTechniqueId(id) || getTechnique(id).isMeta || pinned.includes(id)
      || !Number.isFinite(value) || value === 0) return [];
    return [[id, Math.max(-5, Math.min(5, value))]];
  }));
}

export function describeLearnedTechniqueInfluence(
  weights: Partial<Record<TechniqueId, number>>,
  selection: TechniqueSelection,
): string {
  const parts = Object.entries(weights).map(([id, weight]) => {
    const signed = (value: number) => `${value > 0 ? "+" : ""}${value}`;
    return `${id} ${signed(weight)} (Auto score ${signed(weight * 0.25)}; ${selection.selected.includes(id as TechniqueId) ? "included" : "not included"})`;
  });
  return parts.length ? `Learned Auto weights: ${parts.join("; ")}.` : "";
}

export function applyLearnedTechniqueWeights(
  request: TranslateAskRequest,
  preferences: LearnedPreferences,
  hints: TechniqueHints = {},
): TranslateAskRequest {
  if (!isAutoMode(request.techniques)) return request;
  const pinned = request.techniques.filter((id) => isTechniqueId(id) && !getTechnique(id).isMeta);
  const weights = boundedTechniqueWeights(Object.fromEntries(
    Object.entries(preferences.technique).map(([id, preference]) => [id, preference.weight]),
  ), pinned);
  // Preserve the original object and serialized bytes when learning is neutral.
  if (Object.keys(weights).length === 0) return request;
  const before = autoDetectWithPinned(request.rawInput, pinned, hints);
  const after = autoDetectWithPinned(request.rawInput, pinned, { ...hints, learnedTechniqueWeights: weights });
  return { ...request, techniques: after.selected, techniqueLearning: {
    weights, before: before.selected, after: after.selected,
    note: describeLearnedTechniqueInfluence(weights, after),
  } };
}
