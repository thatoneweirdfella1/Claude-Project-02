import type { TranslateAskRequest } from "../composer";
import {
  autoDetectWithPinned,
  getTechnique,
  isAutoMode,
  selectManualTechnique,
} from "../techniques";
import type { DirectnessLevel, RememberedStateChoice, TechniqueId } from "../../stores/types";
import { deriveStateFeeds } from "./stateBus";
import { toStatePills, type StateDetectionResult } from "./schema";

export interface StateRecommendation {
  directness: DirectnessLevel | null;
  techniqueCandidates: TechniqueId[];
  toneGuidance: string | null;
  changes: string[];
}

const DIRECTNESS_NAME: Record<DirectnessLevel, string> = {
  1: "Supportive",
  2: "Balanced",
  3: "Blunt",
};

function sameTechniques(left: readonly TechniqueId[], right: readonly TechniqueId[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

/** Build the exact, request-scoped adjustment that the recommendation panel
 * explains. A non-null result always represents a real change from the
 * current explicit request settings; neutral reads therefore continue
 * without forcing the user through an unnecessary dialog. */
export function buildStateRecommendation(
  result: StateDetectionResult,
  request: TranslateAskRequest,
): StateRecommendation | null {
  const feeds = deriveStateFeeds(toStatePills(result));
  let directness = feeds.directnessSuggestion !== request.directness
    ? feeds.directnessSuggestion
    : null;
  let toneGuidance: string | null = null;

  // RSD is a communication-tone signal. Convert only strong low/high reads
  // into a visible request-scoped adjustment; "medium" is the balanced
  // baseline and should not create a recommendation by itself.
  if (result.rsd?.value === "high") {
    toneGuidance = feeds.toneGuidance;
    if (directness === null && request.directness !== 1) directness = 1;
  } else if (result.rsd?.value === "low") {
    toneGuidance = feeds.toneGuidance;
    if (directness === null && request.directness !== 3) directness = 3;
  }

  let techniqueCandidates: TechniqueId[] = [];
  if (feeds.techniqueCandidates.length > 0) {
    if (isAutoMode(request.techniques)) {
      const pinned = request.techniques.filter((id) => id !== "auto-detect");
      const baseline = autoDetectWithPinned(request.rawInput, pinned).selected;
      const withState = autoDetectWithPinned(request.rawInput, pinned, {
        stateTechniques: feeds.techniqueCandidates,
      }).selected;
      if (!sameTechniques(baseline, withState)) {
        const added = withState.filter((id) => !baseline.includes(id));
        techniqueCandidates = added.length > 0 ? added : withState;
      }
    } else {
      let adjusted = [...request.techniques];
      for (const candidate of feeds.techniqueCandidates) {
        adjusted = selectManualTechnique(adjusted, candidate);
      }
      techniqueCandidates = adjusted.filter((id) => !request.techniques.includes(id));
    }
  }

  const changes: string[] = [];
  if (directness !== null) {
    changes.push(`Use ${DIRECTNESS_NAME[directness]} directness for this request.`);
  }
  if (techniqueCandidates.length > 0) {
    changes.push(`Use ${techniqueCandidates.map((id) => getTechnique(id).label).join(", ")} for this request.`);
  }
  if (toneGuidance) {
    changes.push(`Use ${toneGuidance} for this request.`);
  }

  return changes.length > 0
    ? { directness, techniqueCandidates, toneGuidance, changes }
    : null;
}

/** Apply only explicit request controls. Auto-recommend remains Auto and
 * consumes techniqueCandidates as hints at preparation time; manual stacks
 * receive only conflict-safe additions. */
export function applyStateRecommendation(
  request: TranslateAskRequest,
  recommendation: StateRecommendation,
): TranslateAskRequest {
  let techniques = [...request.techniques];
  if (!isAutoMode(techniques)) {
    for (const candidate of recommendation.techniqueCandidates) {
      techniques = selectManualTechnique(techniques, candidate);
    }
  }
  return {
    ...request,
    directness: recommendation.directness ?? request.directness,
    techniques,
  };
}

export function stateChoiceSignature(result: StateDetectionResult): string {
  return (["emotion", "rsd", "interest", "cognitive"] as const)
    .map((dimension) => `${dimension}:${result[dimension]?.value ?? "none"}`)
    .join("|");
}

export function findRememberedStateChoice(
  choices: readonly RememberedStateChoice[] | undefined,
  result: StateDetectionResult,
): RememberedStateChoice | null {
  const signature = stateChoiceSignature(result);
  return [...(choices ?? [])].reverse().find((choice) => choice.signature === signature) ?? null;
}
