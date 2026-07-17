/* Auto-detect technique selection service (Step 4.2). Scores each composable
   technique for the current question, respects the conflict/dependency matrix
   (Step 4.1 registry), and stacks AT MOST 4 (MAX_TECHNIQUE_STACK).

   Deterministic and rule-based, on purpose — same rationale as routing.js's
   scorer (FINDINGS.md): no model call, so it's offline-testable, same input →
   same output, and fully auditable for the Transparency card (Feature 8). A
   model-scored variant is a possible future upgrade (parked). */

import type { TechniqueId } from "../../stores/types";
import {
  COMPOSABLE_TECHNIQUE_IDS,
  DEFAULT_TECHNIQUE,
  MAX_TECHNIQUE_STACK,
  TECHNIQUES,
  getTechnique,
  isTechniqueId,
} from "./registry";

/** Optional signals from earlier pipeline stages that nudge scoring. All
    optional — the scorer works on the question text alone. */
export interface TechniqueHints {
  /** routing.js complexity 1-10. */
  complexity?: number;
  /** routing.js domain (health/code/creative/decision-making/analytical/...). */
  domain?: string;
}

export interface TechniqueScore {
  id: TechniqueId;
  score: number;
  reasons: string[];
}

export interface TechniqueSelection {
  /** ≤4 techniques, conflict-free, every dependency satisfied, dep-before-
      dependent order (composition-ready for Step 4.3). */
  selected: TechniqueId[];
  /** Every composable technique, scored, highest first (for transparency). */
  scores: TechniqueScore[];
  /** User-facing one-liner on why these were chosen. */
  reasoning: string;
}

interface Signal {
  technique: TechniqueId;
  test: RegExp;
  points: number;
  reason: string;
}

/* Lexical signals. Each firing adds points + a reason to its technique. Socratic
   gets a baseline elsewhere so it's the default fallback (CANON Feature 4). */
const SIGNALS: Signal[] = [
  { technique: "quote-first", test: /\b(this (?:post|article|claim|quote|text|comment|paragraph|draft)|the (?:docs?|paper|article|source|author) (?:says?|states?|claims?)|according to|quoted?)\b/i, points: 2, reason: "refers to a specific text to anchor on" },

  { technique: "chain-of-thought", test: /\b(why|how does|how do(?:es)? .*\bwork|explain how|reason(?:ing)?|derive|logic|figure out how|think through)\b/i, points: 2, reason: "asks for reasoning, not just a fact" },

  { technique: "role-prime", test: /\b(as an? (?:expert|lawyer|doctor|engineer|scientist|therapist|accountant)|legal|medical|clinical|diagnos|contract|lawsuit|attorney|physician)\b/i, points: 2, reason: "calls for domain expertise" },

  { technique: "verify", test: /\b(fact.?check|verify|is (?:it|this|that) (?:true|accurate|correct|real)|debunk|double.?check|make sure|are you sure|correct me|accurate)\b/i, points: 2, reason: "correctness matters here" },

  { technique: "examples", test: /\b(examples?|for instance|e\.g\.|such as|sample|demonstrate|show me (?:an?|some)|give me (?:an?|some)|illustrat)\b/i, points: 2, reason: "asks to be shown concretely" },

  { technique: "simplify", test: /\b(simpl(?:e|y|ify|er)|eli5|explain like i'?m|in plain (?:english|terms)|dumb(?:ed)? down|too complicated|basic terms|i'?m (?:confused|lost)|make it easy)\b/i, points: 2, reason: "wants a simpler explanation" },

  { technique: "detailed", test: /\b(detailed|comprehensive|thorough(?:ly)?|in.?depth|deep dive|exhaustive|as (?:thorough|detailed) as|complete (?:list|guide|overview|breakdown)|everything (?:about|there is))\b/i, points: 2, reason: "wants depth and completeness" },

  { technique: "step-by-step", test: /\b(how (?:do|can|would) (?:i|we|you)|how to|step.?by.?step|steps?|guide|walk.?(?:me )?through|tutorial|instructions?|set ?up|configure|install|implement)\b/i, points: 2, reason: "a procedural how-to" },

  { technique: "comparative", test: /\b(vs\.?|versus|compare|comparison|difference between|better|best (?:option|way|choice|approach)|pros and cons|trade.?offs?|which (?:is|one)|or should i)\b/i, points: 2, reason: "weighs options against each other" },

  { technique: "metaphor", test: /\b(analogy|metaphor|like a\b|as if|imagine|think of it as|in terms of)\b/i, points: 2, reason: "an analogy would help" },

  { technique: "socratic", test: /\b(should i|help me (?:think|understand|decide|figure)|not sure (?:if|whether|what)|figure (?:this )?out|thinking through|explore|talk me through my)\b/i, points: 1, reason: "open-ended, worth reasoning through together" },
];

/** Socratic's baseline so it's the default when nothing else fires (CANON). */
const SOCRATIC_BASELINE = 1;

function applyHints(
  scores: Map<TechniqueId, TechniqueScore>,
  hints: TechniqueHints,
): void {
  const bump = (id: TechniqueId, points: number, reason: string) => {
    const s = scores.get(id);
    if (s) {
      s.score += points;
      s.reasons.push(reason);
    }
  };

  if (typeof hints.complexity === "number") {
    if (hints.complexity >= 6) {
      bump("chain-of-thought", 1, "high-complexity question");
      bump("verify", 1, "high-complexity question");
    }
    if (hints.complexity <= 2) bump("simplify", 1, "low-complexity question");
  }

  switch (hints.domain) {
    case "code":
      bump("step-by-step", 1, "code/setup domain");
      bump("examples", 1, "code domain");
      break;
    case "health":
    case "decision-making":
      bump("verify", 1, "high-stakes domain");
      break;
    case "creative":
      bump("metaphor", 1, "creative domain");
      bump("examples", 1, "creative domain");
      break;
    case "analytical":
      bump("chain-of-thought", 1, "analytical domain");
      bump("comparative", 1, "analytical domain");
      break;
    default:
      break;
  }
}

/** Transitive dependency closure of a technique, dependencies first, the
    technique last (composition order: reason/show before verify/compare).
    Exported (Step 4.5) so the manual-selection UI logic can reuse the exact
    same closure walk the auto-detect scorer uses — no behavior change, just a
    wider export surface on an existing pure function. */
export function dependencyClosure(id: TechniqueId): TechniqueId[] {
  const out: TechniqueId[] = [];
  const seen = new Set<TechniqueId>();
  const visit = (t: TechniqueId) => {
    if (seen.has(t)) return;
    seen.add(t);
    for (const dep of getTechnique(t).dependencies) visit(dep);
    out.push(t);
  };
  visit(id);
  return out;
}

/** Exported (Step 4.5) for the same reason as dependencyClosure above. */
export function anyConflict(ids: TechniqueId[]): boolean {
  const set = new Set(ids);
  for (const id of ids) {
    for (const c of getTechnique(id).conflicts) {
      if (set.has(c)) return true;
    }
  }
  return false;
}

/** Score every composable technique, then greedily stack the highest scorers
    that fit the matrix and the ≤4 cap, pulling in dependencies with each. */
export function autoDetectTechniques(
  question: string,
  hints: TechniqueHints = {},
): TechniqueSelection {
  const text = String(question || "");

  const scores = new Map<TechniqueId, TechniqueScore>();
  for (const id of COMPOSABLE_TECHNIQUE_IDS) {
    scores.set(id, {
      id,
      score: id === DEFAULT_TECHNIQUE ? SOCRATIC_BASELINE : 0,
      reasons: id === DEFAULT_TECHNIQUE ? ["default"] : [],
    });
  }

  for (const signal of SIGNALS) {
    if (signal.test.test(text)) {
      const s = scores.get(signal.technique);
      if (s) {
        s.score += signal.points;
        s.reasons.push(signal.reason);
      }
    }
  }

  applyHints(scores, hints);

  // Rank by score desc, stable tie-break on registry order.
  const registryOrder = new Map(COMPOSABLE_TECHNIQUE_IDS.map((id, i) => [id, i]));
  const ranked = [...scores.values()].sort(
    (a, b) => b.score - a.score || registryOrder.get(a.id)! - registryOrder.get(b.id)!,
  );

  const selected: TechniqueId[] = [];
  const selectedSet = new Set<TechniqueId>();

  for (const { id, score } of ranked) {
    if (score <= 0 || selectedSet.has(id)) continue;

    const closure = dependencyClosure(id).filter((c) => !selectedSet.has(c));
    const combined = [...selectedSet, ...closure];

    if (anyConflict(combined)) continue; // conflict with an already-picked one
    if (combined.length > MAX_TECHNIQUE_STACK) continue; // wouldn't fit with deps

    for (const c of closure) {
      selected.push(c);
      selectedSet.add(c);
    }
    if (selectedSet.size >= MAX_TECHNIQUE_STACK) break;
  }

  // Belt-and-suspenders: Socratic's baseline means this never fires, but never
  // return an empty stack (CANON: Socratic is the default).
  if (selected.length === 0) selected.push(DEFAULT_TECHNIQUE);

  const reasoning = buildReasoning(selected, scores);
  return { selected, scores: ranked, reasoning };
}

function buildReasoning(
  selected: TechniqueId[],
  scores: Map<TechniqueId, TechniqueScore>,
): string {
  const parts = selected.map((id) => {
    const label = getTechnique(id).label;
    const reasons = scores.get(id)?.reasons.filter((r) => r !== "default") ?? [];
    return reasons.length > 0 ? `${label} (${reasons[0]})` : label;
  });
  return `Selected: ${parts.join("; ")}.`;
}

/** Dispatch for the whole selector: "auto-detect" runs the scorer; a manual
    technique choice is used exactly as picked (no auto-added dependencies —
    the user chose that one technique). Used by composition (4.3) and the
    selector UI (4.5). */
export function selectTechniques(
  mode: TechniqueId,
  question: string,
  hints: TechniqueHints = {},
): TechniqueSelection {
  if (mode === "auto-detect") return autoDetectTechniques(question, hints);
  const id = isTechniqueId(mode) && !TECHNIQUES[mode].isMeta ? mode : DEFAULT_TECHNIQUE;
  return {
    selected: [id],
    scores: [{ id, score: 1, reasons: ["manually selected"] }],
    reasoning: `Manually selected: ${getTechnique(id).label}.`,
  };
}
