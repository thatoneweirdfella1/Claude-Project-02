/* Technique registry (Step 4.1) — every technique CANON Feature 4 lists, each
   with its effect, its prompt fragment (consumed by the Step 4.3 composition
   engine), and its conflicts/dependencies (consumed by the Step 4.2 auto-detect
   scorer). CANON LOCKED DECISION 8: "Include every technique, do not agonize
   over the count, prune later" — so all 12 are here, none omitted.

   auto-detect is a selection MODE, not a stackable technique: it has isMeta:true,
   no prompt fragment, and no conflicts/dependencies of its own — when chosen, the
   4.2 scorer selects among the other 11. The conflict/dependency matrix is
   documented for humans in TECHNIQUE-MATRIX.md; this file is its executable
   source of truth (a test asserts the two never drift on the invariants). */

import type { TechniqueId } from "../../stores/types";

export interface Technique {
  id: TechniqueId;
  label: string;
  /** One line, user-facing — what picking this does. Feeds the Transparency
      card (Feature 8) and the technique selector UI (Step 4.5). */
  effect: string;
  /** The instruction injected into the composed prompt (Step 4.3). Empty for
      the meta auto-detect mode. */
  promptFragment: string;
  /** Techniques this cannot stack with. SYMMETRIC by invariant (if A lists B,
      B lists A) — enforced by registry.test.ts. */
  conflicts: TechniqueId[];
  /** Techniques auto-detect must ALSO include when this one is selected. A
      dependency never points at a technique this conflicts with (invariant). */
  dependencies: TechniqueId[];
  /** Socratic is the CANON default (Feature 4). Exactly one technique sets this. */
  isDefault?: boolean;
  /** auto-detect only: a selection mode, never itself scored/stacked/composed. */
  isMeta?: boolean;
}

/** CANON Feature 4 default. */
export const DEFAULT_TECHNIQUE: TechniqueId = "socratic";

/** Max techniques auto-detect may stack (CANON Feature 4 / PIPELINE.md:
    "stacks at most 4"). Lives here as the single source; Step 4.2 reads it. */
export const MAX_TECHNIQUE_STACK = 4;

export const TECHNIQUES: Record<TechniqueId, Technique> = {
  socratic: {
    id: "socratic",
    label: "Socratic",
    effect: "Leads you to the answer with guiding questions",
    promptFragment:
      "Guide the user toward the answer with focused questions rather than stating it outright; surface the key decision points as questions they can reason through.",
    conflicts: ["detailed", "step-by-step"],
    dependencies: [],
    isDefault: true,
  },
  "quote-first": {
    id: "quote-first",
    label: "Quote-First",
    effect: "Anchors the answer in a direct quote first",
    promptFragment:
      "Begin by quoting the most relevant source text (or the user's own words) verbatim, then build the answer from that anchor.",
    conflicts: [],
    dependencies: [],
  },
  "chain-of-thought": {
    id: "chain-of-thought",
    label: "Chain-of-Thought",
    effect: "Shows the reasoning steps before the conclusion",
    promptFragment:
      "Work through the intermediate reasoning steps explicitly before stating the conclusion.",
    conflicts: ["simplify"],
    dependencies: [],
  },
  "role-prime": {
    id: "role-prime",
    label: "Role-Prime",
    effect: "Answers as the most relevant domain expert",
    promptFragment:
      "Answer in the voice of the most relevant domain expert for this question, bringing that expert's framing and standards.",
    conflicts: [],
    dependencies: [],
  },
  verify: {
    id: "verify",
    label: "Verify",
    effect: "Adds a self-check pass and flags uncertainty",
    promptFragment:
      "After answering, run a self-check pass: confirm each claim, and explicitly flag anything uncertain or unverified.",
    conflicts: [],
    // Verifying is only meaningful when there is explicit reasoning to check.
    dependencies: ["chain-of-thought"],
  },
  examples: {
    id: "examples",
    label: "Examples",
    effect: "Illustrates with concrete examples",
    promptFragment: "Ground the answer in concrete, worked examples the user can follow.",
    conflicts: [],
    dependencies: [],
  },
  simplify: {
    id: "simplify",
    label: "Simplify",
    effect: "Plain language, simplest accurate form",
    promptFragment:
      "Use plain language and the simplest accurate framing; strip jargon and keep it short.",
    conflicts: ["detailed", "chain-of-thought"],
    dependencies: [],
  },
  detailed: {
    id: "detailed",
    label: "Detailed",
    effect: "Thorough, comprehensive depth",
    promptFragment:
      "Give thorough, comprehensive coverage with the depth and edge cases a careful reader would want.",
    conflicts: ["socratic", "simplify"],
    dependencies: [],
  },
  "step-by-step": {
    id: "step-by-step",
    label: "Step-by-step",
    effect: "Ordered, actionable steps",
    promptFragment:
      "Break the answer into a numbered sequence of clear, actionable steps in order.",
    conflicts: ["socratic"],
    dependencies: [],
  },
  comparative: {
    id: "comparative",
    label: "Comparative",
    effect: "Side-by-side comparison of the options",
    promptFragment:
      "Frame the answer as a side-by-side comparison of the relevant options, with the trade-offs of each.",
    conflicts: [],
    // A comparison lands best when each option is shown concretely.
    dependencies: ["examples"],
  },
  metaphor: {
    id: "metaphor",
    label: "Metaphor",
    effect: "Explains through an analogy",
    promptFragment:
      "Explain the core idea through an analogy or metaphor mapped onto something familiar to the user.",
    conflicts: [],
    dependencies: [],
  },
  "auto-detect": {
    id: "auto-detect",
    label: "Auto-detect",
    effect: "Picks the best techniques for the question automatically",
    promptFragment: "",
    conflicts: [],
    dependencies: [],
    isMeta: true,
  },
};

/** All technique ids, including the meta auto-detect. */
export const TECHNIQUE_IDS = Object.keys(TECHNIQUES) as TechniqueId[];

/** The techniques auto-detect actually scores and stacks — everything except
    the meta auto-detect mode itself. */
export const COMPOSABLE_TECHNIQUE_IDS: TechniqueId[] = TECHNIQUE_IDS.filter(
  (id) => !TECHNIQUES[id].isMeta,
);

export function getTechnique(id: TechniqueId): Technique {
  return TECHNIQUES[id];
}

export function isTechniqueId(value: unknown): value is TechniqueId {
  return typeof value === "string" && value in TECHNIQUES;
}
