/* Model registry (Step 1.10 deliverable #2). The single typed source of the
   three model strings CANON LOCKED DECISION 3 fixes, aligned with the api
   strings routing.js's MODELS table uses and the ModelId union the stores
   already declare (stores/types.ts). The proxy validates against this; UI/model
   pickers read labels/tiers from it.

   Extended thinking is a per-call FLAG, not a model (CANON / the step): it is
   ModelCallOptions.extendedThinking, applied to a call to any paid-tier model —
   never a fourth registry entry. */

import type { ModelId, PlanFlag } from "../stores/types.js";

export type { ModelId } from "../stores/types";

export type ModelTier = "Fast" | "Balanced" | "Deep";
/** Semantic key matching routing.js's MODELS keys (haiku/sonnet/opus). */
export type ModelKey = "haiku" | "sonnet" | "opus";

export interface ModelInfo {
  /** The api string sent to the model — the ModelId value. */
  id: ModelId;
  key: ModelKey;
  label: string;
  tier: ModelTier;
  /** Lowest plan that may select this model via manual override
      (ROUTING.md: free = Haiku + Sonnet; Opus is paid). */
  plan: PlanFlag;
}

export const MODEL_REGISTRY: Record<ModelId, ModelInfo> = {
  "claude-haiku-4-5": {
    id: "claude-haiku-4-5",
    key: "haiku",
    label: "Haiku 4.5",
    tier: "Fast",
    plan: "free",
  },
  "claude-sonnet-5": {
    id: "claude-sonnet-5",
    key: "sonnet",
    label: "Sonnet 5",
    tier: "Balanced",
    plan: "free",
  },
  "claude-opus-4-8": {
    id: "claude-opus-4-8",
    key: "opus",
    label: "Opus 4.8",
    tier: "Deep",
    plan: "paid",
  },
};

/** All three model ids, in tier order. */
export const MODEL_IDS = Object.keys(MODEL_REGISTRY) as ModelId[];

export function isModelId(value: unknown): value is ModelId {
  return typeof value === "string" && value in MODEL_REGISTRY;
}

export function getModel(id: ModelId): ModelInfo {
  return MODEL_REGISTRY[id];
}

/** Per-call options that are NOT part of the model identity. Extended thinking
    is recommended by the router (thinkingRecommended) and applied only on paid
    (routing.js), but it is a flag on the call, not a distinct model. */
export interface ModelCallOptions {
  extendedThinking?: boolean;
}
