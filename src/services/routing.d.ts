/* Ambient type declarations for routing.js (Step 3.1 integration).
   routing.js is the vendor-supplied, already-built, already-tested UMD
   scorer (ROUTING.md: "Do not rebuild the scorer") — this file only gives
   TypeScript its shape; it does not add or change behavior. Kept alongside
   routing.js per CONVENTIONS.md's repo layout ("routing.js + routing.d.ts").
   routingService.ts is the typed wrapper the rest of the app imports;
   consumers should generally prefer that over importing this module
   directly, but this file is what makes the raw import type-check. */

export type ModelKey = "haiku" | "sonnet" | "opus";
export type PlanFlag = "free" | "paid";

export interface ModelEntry {
  tier: "Fast" | "Balanced" | "Deep";
  label: string;
  api: string;
}

/** Contract in (ROUTING.md "THE CONTRACT"). `gaps` and `state` are accepted
    per the header contract but are NOT read by the current scorer body —
    documented here for forward compatibility, not because they do anything
    yet. */
export interface RouteInput {
  prompt: string;
  /** 0-100. Defaults to 100 (trusted) if omitted. */
  confidence?: number;
  /** Detected gap types from the Translation Engine. Currently unused by
      the scorer itself. */
  gaps?: string[];
  /** Detected state-pill values. Currently unused by the scorer itself. */
  state?: unknown;
  plan?: PlanFlag;
  /** A model KEY (haiku/sonnet/opus), not an api string. null/omitted = no override. */
  override?: ModelKey | null;
  /** Explicit false suppresses extended thinking even when recommended+paid. */
  thinkingOptIn?: boolean;
}

export type Domain =
  | "health"
  | "code"
  | "creative"
  | "decision-making"
  | "analytical"
  | "factual"
  | "other";

export interface Dimensions {
  domain: Domain;
  scope: "broad" | "medium" | "narrow";
  certainty: "clear" | "exploratory";
  depth: "deep" | "surface";
  tokenEfficiencyMatters: boolean;
}

/** The full complexity-scoring audit trail (COMPLEXITY.md), one field per
    named signal plus the retrieval-anchor override flag and word count. */
export interface ComplexitySignals {
  analysisVerbs: number;
  synthesis: number;
  designNouns: number;
  constraints: number;
  dataPoints: number;
  multipart: number;
  techDepth: number;
  proof: 0 | 1;
  openEnded: 0 | 1;
  retrievalAnchor: 0 | 1;
  words: number;
}

/** Contract out (ROUTING.md "THE CONTRACT"). */
export interface RouteResult {
  model: ModelKey;
  apiString: string;
  modelLabel: string;
  tier: "Fast" | "Balanced" | "Deep";
  complexity: number;
  effectiveComplexity: number;
  dimensions: Dimensions;
  /** User-facing explanation text — feeds the Transparency card (Feature 8). */
  reasoning: string;
  thinkingRecommended: boolean;
  thinkingApplied: boolean;
  downgraded: boolean;
  notes: string[];
  signals: ComplexitySignals;
  rawPoints: number;
}

export interface ComplexityScore {
  complexity: number;
  signals: ComplexitySignals;
  rawPoints: number;
}

export interface RoutingEngine {
  route(input: RouteInput): RouteResult;
  scoreComplexity(prompt: string): ComplexityScore;
  MODELS: Record<ModelKey, ModelEntry>;
  FREE_MODELS: ModelKey[];
}

declare const engine: RoutingEngine;
export default engine;
