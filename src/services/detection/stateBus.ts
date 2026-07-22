/* The state bus (Step 6.5) — CANON Feature 5 / PIPELINE.md STATE DETECTION:
   "The detected state feeds four consumers: directness auto-recommendation,
   technique selection, answer tone, and the transparency card." ONE SOURCE,
   FOUR SUBSCRIBERS: every consumer reads from the same deriveStateFeeds()
   call, so they can never disagree about what the detected state implies.

   Reads StatePills (Step 1.7's session.statePills), NOT the richer
   StateDetectionResult impacts.ts's confidence-aware functions consume —
   deliberately, because StatePills is the one source that's synchronously
   available the instant a submission starts. Detection runs IN PARALLEL with
   the pipeline (PIPELINE.md's RESOLVED note — "alongside the translation
   call," not before it), so the pipeline's technique/tone consumers cannot
   reliably await THIS turn's own detection without reintroducing the
   sequential wait the RESOLVED note explicitly rejected. They read whatever
   is currently in session.statePills — the last completed detection, which
   is usually the prior turn's, and is itself updated the moment a detection
   this turn succeeds (Step 6.3's CenterColumn wiring). This is a deliberate,
   documented trade-off, not an oversight (see BUILD-LOG.md DECISIONS). */

import type { DirectnessLevel, StatePills, TechniqueId } from "../../stores/types";
import { STATE_IMPACTS } from "./impacts";

export interface TransparencyEntry {
  dimension: "emotion" | "rsd" | "interest" | "cognitive";
  value: string;
  description: string;
}

export interface StateFeeds {
  /** Directness consumer — the raw recommendation only. Never applied
      silently (CANON "no black box" / Step 4.4's own PARKED note) — the UI
      wiring (CenterColumn) surfaces this as a visible, one-click suggestion,
      it does not call setDirectness on its own. */
  directnessSuggestion: DirectnessLevel | null;
  /** Technique-selection consumer — candidate ids fed into auto-detect's
      scoring as HINTS (autoDetect.ts's stateTechniques), not a final stack;
      auto-detect still applies its own conflict/dependency/≤4-cap logic. */
  techniqueCandidates: TechniqueId[];
  /** Answer-tone consumer — RSD's tone guidance, injected into composition's
      directness section (compose.ts's stateTone). Null when RSD wasn't read. */
  toneGuidance: string | null;
  /** Transparency-card consumer — every non-null dimension's applied impact.
      Step 8.2 (Transparency Details) is this data's actual UI; this bus only
      makes it available and tested — see BUILD-LOG.md PARKED. */
  transparency: TransparencyEntry[];
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

  let directnessSuggestion: DirectnessLevel | null = null;
  if (pills.emotion) {
    const impact = STATE_IMPACTS.emotion[pills.emotion];
    directnessSuggestion = impact.directness ?? null;
    addTechniques(impact.techniques);
    transparency.push({ dimension: "emotion", value: pills.emotion, description: impact.description });
  }

  let toneGuidance: string | null = null;
  if (pills.rsd) {
    const impact = STATE_IMPACTS.rsd[pills.rsd];
    toneGuidance = impact.tone ?? null;
    transparency.push({ dimension: "rsd", value: pills.rsd, description: impact.description });
  }

  if (pills.interest) {
    const impact = STATE_IMPACTS.interest[pills.interest];
    addTechniques(impact.techniques);
    transparency.push({ dimension: "interest", value: pills.interest, description: impact.description });
  }

  if (pills.cognitive) {
    const impact = STATE_IMPACTS.cognitive[pills.cognitive];
    addTechniques(impact.techniques);
    transparency.push({ dimension: "cognitive", value: pills.cognitive, description: impact.description });
  }

  return { directnessSuggestion, techniqueCandidates, toneGuidance, transparency };
}
