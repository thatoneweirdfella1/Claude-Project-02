/* Model registry (Step 1.10 deliverable #2). The single typed source of the
   three model strings CANON LOCKED DECISION 3 fixes, aligned with the api
   strings routing.js's MODELS table uses and the ModelId union the stores
   already declare (stores/types.ts). The proxy validates against this; UI/model
   pickers read labels/tiers from it.

   Extended thinking is a per-call FLAG, not a model (CANON / the step): it is
   ModelCallOptions.extendedThinking, applied to a call to any paid-tier model —
   never a fourth registry entry. */

import type { ModelId, PlanFlag } from "../stores/types.js";

export type { ModelId } from "../stores/types.js";

export type ModelTier = "Fast" | "Balanced" | "Deep";
/** Semantic key matching routing.js's MODELS keys (haiku/sonnet/opus). */
export type ModelKey = "haiku" | "sonnet" | "opus" | "gpt-4o" | "gpt-5" | "gemini-flash" | "gemini-pro" | "grok" | "deepseek";
/** Provider type for routing. */
export type Provider = "anthropic" | "openai" | "google" | "xai" | "deepseek";

export interface ModelInfo {
  /** The api string sent to the model — the ModelId value. */
  id: ModelId;
  key: ModelKey;
  label: string;
  tier: ModelTier;
  /** Lowest plan that may select this model via manual override
      (ROUTING.md: free = Haiku + Sonnet; Opus is paid). */
  plan: PlanFlag;
  /** Provider this model belongs to — for routing at the proxy. */
  provider: Provider;
}

export const MODEL_REGISTRY: Record<ModelId, ModelInfo> = {
  // Anthropic models
  "claude-haiku-4-5": {
    id: "claude-haiku-4-5",
    key: "haiku",
    label: "Haiku 4.5",
    tier: "Fast",
    plan: "free",
    provider: "anthropic",
  },
  "claude-sonnet-5": {
    id: "claude-sonnet-5",
    key: "sonnet",
    label: "Sonnet 5",
    tier: "Balanced",
    plan: "free",
    provider: "anthropic",
  },
  "claude-opus-4-8": {
    id: "claude-opus-4-8",
    key: "opus",
    label: "Opus 4.8",
    tier: "Deep",
    plan: "paid",
    provider: "anthropic",
  },
  // OpenAI models
  "gpt-4o": {
    id: "gpt-4o",
    key: "gpt-4o",
    label: "GPT-4o",
    tier: "Balanced",
    plan: "paid",
    provider: "openai",
  },
  "gpt-5": {
    id: "gpt-5",
    key: "gpt-5",
    label: "GPT-5",
    tier: "Deep",
    plan: "paid",
    provider: "openai",
  },
  // Google models
  "gemini-flash": {
    id: "gemini-flash",
    key: "gemini-flash",
    label: "Gemini Flash",
    tier: "Fast",
    plan: "free",
    provider: "google",
  },
  "gemini-pro": {
    id: "gemini-pro",
    key: "gemini-pro",
    label: "Gemini Pro",
    tier: "Balanced",
    plan: "paid",
    provider: "google",
  },
  // xAI Grok
  "grok": {
    id: "grok",
    key: "grok",
    label: "Grok",
    tier: "Balanced",
    plan: "paid",
    provider: "xai",
  },
  // DeepSeek models
  "deepseek": {
    id: "deepseek",
    key: "deepseek",
    label: "DeepSeek",
    tier: "Balanced",
    plan: "paid",
    provider: "deepseek",
  },
  "deepseek-reasoner": {
    id: "deepseek-reasoner",
    key: "deepseek",
    label: "DeepSeek Reasoner",
    tier: "Deep",
    plan: "paid",
    provider: "deepseek",
  },
};

/** Every model the provider proxy currently recognizes. */
export const MODEL_IDS = Object.keys(MODEL_REGISTRY) as ModelId[];

/** Models supported by the legacy complexity scorer and its Model control.
    Destination AI is selected separately, so provider models must not leak
    into this Claude-only routing override. */
export const ROUTABLE_MODEL_IDS = [
  "claude-haiku-4-5",
  "claude-sonnet-5",
  "claude-opus-4-8",
] as const satisfies readonly ModelId[];

export type RoutableModelId = (typeof ROUTABLE_MODEL_IDS)[number];

export function isModelId(value: unknown): value is ModelId {
  return typeof value === "string" && value in MODEL_REGISTRY;
}

export function getModel(id: ModelId): ModelInfo {
  return MODEL_REGISTRY[id];
}

/** Get the provider for a given model ID. */
export function getProvider(modelId: ModelId): Provider {
  return getModel(modelId).provider;
}

/** Per-call options that are NOT part of the model identity. Extended thinking
    is recommended by the router (thinkingRecommended) and applied only on paid
    (routing.js), but it is a flag on the call, not a distinct model. */
export interface ModelCallOptions {
  extendedThinking?: boolean;
}
