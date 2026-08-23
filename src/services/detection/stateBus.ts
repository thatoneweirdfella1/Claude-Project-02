import type { DirectnessLevel, StatePills, TechniqueId } from "../../stores/types";
import { STATE_IMPACTS, type StateImpact } from "./impacts";

export interface TransparencyEntry {
  dimension: "emotion" | "rsd" | "interest" | "cognitive";
  value: string;
  description: string;
}

export interface StateFeeds {
  directnessSuggestion: DirectnessLevel | null;
  techniqueCandidates: TechniqueId[];
  toneGuidance: string | null;
  transparency: TransparencyEntry[];
}

function lookupImpact(map: object, value: string | null): StateImpact | null {
  if (!value) return null;
  return (map as Record<string, StateImpact>)[value] ?? null;
}

export function deriveStateFeeds(pills: StatePills): StateFeeds {
  const transparency: TransparencyEntry[] = [];
  const techniqueCandidates: TechniqueId[] = [];
  const seenTechniques = new Set<TechniqueId>();

  function addTechniques(ids: TechniqueId[] | undefined): void {
    for (const id of ids ?? []) {
      if (!seenTechniques.has(id)) {
        seenTechniques.add(id);
        techniqueCandidates.push(id);
      }
    }
  }

  const emotionImpact = lookupImpact(STATE_IMPACTS.emotion, pills.emotion);
  const rsdImpact = lookupImpact(STATE_IMPACTS.rsd, pills.rsd);
  const interestImpact = lookupImpact(STATE_IMPACTS.interest, pills.interest);
  const cognitiveImpact = lookupImpact(STATE_IMPACTS.cognitive, pills.cognitive);

  const directnessSuggestion = emotionImpact?.directness ?? null;
  if (emotionImpact && pills.emotion) {
    addTechniques(emotionImpact.techniques);
    transparency.push({ dimension: "emotion", value: pills.emotion, description: emotionImpact.description });
  }

  const toneGuidance = rsdImpact?.tone ?? null;
  if (rsdImpact && pills.rsd) transparency.push({ dimension: "rsd", value: pills.rsd, description: rsdImpact.description });
  if (interestImpact && pills.interest) {
    addTechniques(interestImpact.techniques);
    transparency.push({ dimension: "interest", value: pills.interest, description: interestImpact.description });
  }
  if (cognitiveImpact && pills.cognitive) {
    addTechniques(cognitiveImpact.techniques);
    transparency.push({ dimension: "cognitive", value: pills.cognitive, description: cognitiveImpact.description });
  }

  return { directnessSuggestion, techniqueCandidates, toneGuidance, transparency };
}
