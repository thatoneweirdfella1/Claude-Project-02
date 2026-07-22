/* State → system impact mapping (Step 6.2). The authoritative, executable
   table of what each detected state VALUE does to the system — PIPELINE.md
   STATE DETECTION "Four dimensions and their system impact." This is the "each
   state's system impact (Overwhelmed recommends directness Level 1, etc)" the
   step requires, kept as data (not prose) so the classifier prompt, the
   STATE-DETECTION-SPEC.md, and the future state-feeds consumer (Step 6.5) all
   read ONE source.

   DERIVED, NOT MODEL-EMITTED: the model returns only the four state VALUES
   (schema.ts); the system impacts are a deterministic pure function of those
   values (impactsFor, below). Keeping the mapping in code — not asking the
   model to also emit the impact — makes it auditable and impossible to
   hallucinate a different impact, the same deterministic-where-possible
   philosophy as routing.js and technique auto-detect (FINDINGS.md). Step 6.5
   consumes this to actually feed directness/technique/tone; this step only
   defines it and teaches the prompt to explain it.

   The four dimension VALUE unions and TechniqueId/DirectnessLevel come from
   stores/types.ts — no new vocabulary. */

import type {
  CognitiveMode,
  DirectnessLevel,
  EmotionState,
  InterestLevel,
  RsdLevel,
  TechniqueId,
} from "../../stores/types";
import type { StateDetectionResult } from "./schema";

/** One state value's system impact. Every field optional because different
    dimensions act on different levers: Emotion mostly suggests a technique
    (except Overwhelmed → a directness level), RSD sets tone, Interest and
    Cognitive Mode suggest technique(s). */
export interface StateImpact {
  /** User-facing one-liner (feeds the panel summary / transparency card). */
  description: string;
  /** Recommended directness level, if this state implies one. PIPELINE.md maps
      ONLY Overwhelmed → Level 1; every other value leaves this undefined. */
  directness?: DirectnessLevel;
  /** Technique(s) this state suggests to auto-detect. Where PIPELINE.md says
      "X or Y" (High interest → Detailed or Comparative; Analytical → CoT or
      Step-by-step; Creative → Metaphor or Comparative) BOTH are listed as
      CANDIDATES — this table records what the state points at; Step 6.5's feed
      reconciles candidates against auto-detect's existing conflict/dependency/
      ≤4 machinery, it does NOT blindly stack all of them. */
  techniques?: TechniqueId[];
  /** Answer-tone guidance (RSD levels; folded into tone by Step 6.5). */
  tone?: string;
}

/* ── Emotion (PIPELINE.md line 44) ──────────────────────────────────────── */
const EMOTION_IMPACTS: Record<EmotionState, StateImpact> = {
  overwhelmed: {
    directness: 1,
    description: "You seem a bit overwhelmed — I'll be extra supportive and keep things clear.",
  },
  frustrated: {
    techniques: ["simplify"],
    description: "Sounds frustrating — I'll cut to the point and keep it simple.",
  },
  calm: {
    techniques: ["socratic"],
    description: "You sound steady — I'll think it through with you.",
  },
  excited: {
    techniques: ["detailed"],
    description: "You're into this — I'll give you the full, detailed picture.",
  },
  anxious: {
    techniques: ["verify"],
    description: "I'll double-check the details so you can trust the answer.",
  },
};

/* ── RSD Level (PIPELINE.md line 46) ────────────────────────────────────── */
const RSD_IMPACTS: Record<RsdLevel, StateImpact> = {
  high: {
    tone: "extra warm, with explicit positive framing",
    description: "I'll keep the tone warm and encouraging.",
  },
  medium: {
    tone: "balanced",
    description: "I'll keep a balanced, friendly tone.",
  },
  low: {
    tone: "direct and factual",
    description: "I'll keep it direct and factual.",
  },
};

/* ── Interest (PIPELINE.md line 48) ─────────────────────────────────────── */
const INTEREST_IMPACTS: Record<InterestLevel, StateImpact> = {
  low: {
    techniques: ["simplify"],
    description: "I'll keep this short and simple.",
  },
  medium: {
    description: "I'll give this a standard level of detail.",
  },
  high: {
    techniques: ["detailed", "comparative"],
    description: "You're curious about this — I'll go deeper and compare the options.",
  },
};

/* ── Cognitive Mode (PIPELINE.md line 50) ───────────────────────────────── */
const COGNITIVE_IMPACTS: Record<CognitiveMode, StateImpact> = {
  analytical: {
    techniques: ["chain-of-thought", "step-by-step"],
    description: "I'll lay out the reasoning step by step.",
  },
  creative: {
    techniques: ["metaphor", "comparative"],
    description: "I'll explain with analogies and comparisons.",
  },
  processing: {
    techniques: ["socratic"],
    description: "I'll help you think it through with questions.",
  },
  racing: {
    techniques: ["simplify"],
    description: "I'll keep it simple and easy to follow.",
  },
  stuck: {
    techniques: ["examples"],
    description: "I'll show concrete examples to get things moving.",
  },
};

/** The whole table, keyed by dimension then value. Single authoritative source
    — the prompt (prompt.ts), the spec (STATE-DETECTION-SPEC.md), and Step 6.5
    all read from here. */
export const STATE_IMPACTS = {
  emotion: EMOTION_IMPACTS,
  rsd: RSD_IMPACTS,
  interest: INTEREST_IMPACTS,
  cognitive: COGNITIVE_IMPACTS,
} as const;

/** The applicable system impacts for a detection result — one entry per
    non-null dimension, in dimension order. Pure and deterministic: the same
    result always yields the same impacts, and every impact traces to
    STATE_IMPACTS, never to the model. Step 6.5 turns these into the actual
    directness/technique/tone feed; the transparency card (Feature 8) shows
    them as the "why." */
export interface AppliedImpact {
  dimension: "emotion" | "rsd" | "interest" | "cognitive";
  value: string;
  impact: StateImpact;
}

export function impactsFor(result: StateDetectionResult): AppliedImpact[] {
  const out: AppliedImpact[] = [];
  if (result.emotion) {
    out.push({ dimension: "emotion", value: result.emotion.value, impact: EMOTION_IMPACTS[result.emotion.value] });
  }
  if (result.rsd) {
    out.push({ dimension: "rsd", value: result.rsd.value, impact: RSD_IMPACTS[result.rsd.value] });
  }
  if (result.interest) {
    out.push({ dimension: "interest", value: result.interest.value, impact: INTEREST_IMPACTS[result.interest.value] });
  }
  if (result.cognitive) {
    out.push({ dimension: "cognitive", value: result.cognitive.value, impact: COGNITIVE_IMPACTS[result.cognitive.value] });
  }
  return out;
}

/** The directness level a result recommends, or null. Only Emotion carries a
    directness impact (Overwhelmed → 1), so this is the single place directness
    auto-recommendation reads. Kept consistent with directness.ts's
    recommendDirectnessFromEmotion (a test asserts they agree). */
export function recommendedDirectness(result: StateDetectionResult): DirectnessLevel | null {
  return result.emotion ? EMOTION_IMPACTS[result.emotion.value].directness ?? null : null;
}

/** All technique candidates a result's states point at, de-duplicated, in
    dimension order (emotion → interest → cognitive). NOT a final stack — Step
    6.5 feeds these into auto-detect, which applies conflicts/dependencies/the
    ≤4 cap. RSD carries no technique (it's a tone lever). */
export function suggestedTechniques(result: StateDetectionResult): TechniqueId[] {
  const seen = new Set<TechniqueId>();
  for (const applied of impactsFor(result)) {
    for (const id of applied.impact.techniques ?? []) seen.add(id);
  }
  return [...seen];
}
