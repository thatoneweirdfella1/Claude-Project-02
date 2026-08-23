import type { DirectnessLevel, TechniqueId } from "../../stores/types";
import type {
  DetectedCognitive,
  DetectedEmotion,
  DetectedInterest,
  DetectedRsd,
  StateDetectionResult,
} from "./schema";

export interface StateImpact {
  description: string;
  directness?: DirectnessLevel;
  techniques?: TechniqueId[];
  tone?: string;
}

const EMOTION_IMPACTS: Record<DetectedEmotion, StateImpact> = {
  neutral: { description: "No tone adjustment is suggested from emotion." },
  calm: { description: "Your tone looks steady, so no emotion-based change is needed." },
  focused: { description: "You look focused, so the current response settings can stay in place." },
  frustrated: { techniques: ["simplify"], description: "A simpler, more direct structure may reduce friction." },
  overwhelmed: { directness: 1, description: "A more supportive response style may make this easier to process." },
  anxious: { techniques: ["verify"], description: "Extra verification may help make uncertainty explicit." },
  "low-energy": { techniques: ["simplify"], description: "A shorter, simpler structure may be easier to use right now." },
  excited: { techniques: ["detailed"], description: "More detail may fit the level of interest in the request." },
};

const RSD_IMPACTS: Record<DetectedRsd, StateImpact> = {
  low: { tone: "direct and factual", description: "A direct, factual tone fits the current signal." },
  medium: { tone: "balanced", description: "A balanced tone fits the current signal." },
  high: { tone: "warm, with explicit positive framing", description: "Warmer framing may make the response easier to receive." },
};

const INTEREST_IMPACTS: Record<DetectedInterest, StateImpact> = {
  low: { techniques: ["simplify"], description: "A shorter answer may fit the current interest signal." },
  medium: { description: "A standard amount of detail fits the current interest signal." },
  high: { techniques: ["detailed", "comparative"], description: "More depth and comparison may be useful here." },
};

const COGNITIVE_IMPACTS: Record<DetectedCognitive, StateImpact> = {
  exploratory: { techniques: ["socratic"], description: "An exploratory structure can help develop the idea without locking it down too early." },
  analytical: { techniques: ["step-by-step", "verify"], description: "A structured, verifiable breakdown may fit the request." },
  creative: { techniques: ["metaphor", "comparative"], description: "Analogies or comparisons may help develop the creative direction." },
  decision: { techniques: ["comparative", "verify"], description: "Clear tradeoffs and verification may help with the decision." },
  execution: { techniques: ["step-by-step", "examples"], description: "Concrete steps and examples may make execution easier." },
};

export const STATE_IMPACTS = {
  emotion: EMOTION_IMPACTS,
  rsd: RSD_IMPACTS,
  interest: INTEREST_IMPACTS,
  cognitive: COGNITIVE_IMPACTS,
} as const;

export interface AppliedImpact {
  dimension: "emotion" | "rsd" | "interest" | "cognitive";
  value: string;
  impact: StateImpact;
}

export function impactsFor(result: StateDetectionResult): AppliedImpact[] {
  const out: AppliedImpact[] = [];
  if (result.emotion) out.push({ dimension: "emotion", value: result.emotion.value, impact: EMOTION_IMPACTS[result.emotion.value] });
  if (result.rsd) out.push({ dimension: "rsd", value: result.rsd.value, impact: RSD_IMPACTS[result.rsd.value] });
  if (result.interest) out.push({ dimension: "interest", value: result.interest.value, impact: INTEREST_IMPACTS[result.interest.value] });
  if (result.cognitive) out.push({ dimension: "cognitive", value: result.cognitive.value, impact: COGNITIVE_IMPACTS[result.cognitive.value] });
  return out;
}

export function recommendedDirectness(result: StateDetectionResult): DirectnessLevel | null {
  return result.emotion ? EMOTION_IMPACTS[result.emotion.value].directness ?? null : null;
}

export function suggestedTechniques(result: StateDetectionResult): TechniqueId[] {
  const seen = new Set<TechniqueId>();
  for (const applied of impactsFor(result)) for (const id of applied.impact.techniques ?? []) seen.add(id);
  return [...seen];
}
