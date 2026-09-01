/* Central cost estimation and usage tracking. Values are dollar-denominated
   API cost; subscription markup is handled by the credit allocation, not by
   inflating each call a second time. */

export interface ModelPrice {
  inputPerMillion: number;
  outputPerMillion: number;
}

export const MODEL_PRICE_VERSION = "multi-provider-prices-2026-09-01";

/** First-party Claude API list prices current for the model ids used here.
    Keep this table explicit and version-controlled so price changes are
    reviewable instead of silently arriving from a remote configuration.

    R27: Multi-AI debate partners (services/debate/roster.ts) each get their
    own explicit entry here too — before this, every participant's estimate
    silently used Claude Opus pricing regardless of which provider it
    actually called. Same "explicit price per model, never borrowed" rule
    R14 already enforces for calculateUsageCost/priceFor. */
export const MODEL_PRICES: Record<string, ModelPrice> = {
  "claude-haiku-4-5": { inputPerMillion: 1, outputPerMillion: 5 },
  "claude-sonnet-5": { inputPerMillion: 3, outputPerMillion: 15 },
  "claude-opus-4-8": { inputPerMillion: 5, outputPerMillion: 25 },
  "gpt-5.5": { inputPerMillion: 3, outputPerMillion: 12 },
  "gemini-3.1-pro": { inputPerMillion: 2.5, outputPerMillion: 10 },
  "grok-4.3": { inputPerMillion: 3, outputPerMillion: 15 },
  "deepseek-v4-pro": { inputPerMillion: 0.6, outputPerMillion: 2.2 },
};

export interface SessionCost {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
}

export interface CostEstimateInput {
  model: string;
  inputTokens: number;
  maxOutputTokens: number;
}

const sessionCost: SessionCost = {
  totalTokens: 0,
  inputTokens: 0,
  outputTokens: 0,
  estimatedCost: 0,
};

function roundDollars(value: number): number {
  return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000;
}

function priceFor(model: string): ModelPrice | null {
  return MODEL_PRICES[model] ?? null;
}

export function hasPricingFor(model: string): boolean {
  return priceFor(model) !== null;
}

export function getModelPrice(model: string): ModelPrice | null {
  const price = priceFor(model);
  return price ? { ...price } : null;
}

export function calculateUsageCost(
  inputTokens: number,
  outputTokens: number,
  model = "claude-haiku-4-5",
): number {
  if (inputTokens < 0 || outputTokens < 0) return 0;
  const price = priceFor(model);
  if (!price) return 0;
  return roundDollars(
    (inputTokens / 1_000_000) * price.inputPerMillion +
      (outputTokens / 1_000_000) * price.outputPerMillion,
  );
}

/** Conservative pre-call estimate used by the confirmation dialog. */
export function getEstimatedCostForCall(input: CostEstimateInput): number {
  return calculateUsageCost(input.inputTokens, input.maxOutputTokens, input.model);
}

/** Estimate one complete Translate action: prompt normalization, state
    detection, and answer generation. The input repeats across those calls,
    which is intentionally reflected here so the user sees the whole action's
    likely cost before any network request starts. */
export function getEstimatedCostForPipeline(
  rawInput: string,
  answerModel = "claude-haiku-4-5",
  includedContextCharacters = 0,
): number {
  const messageTokens = Math.max(1, Math.ceil((rawInput.length + Math.max(0, includedContextCharacters)) / 4));
  const scaffoldTokens = 650;
  const normalizedInput = messageTokens + scaffoldTokens;
  const translation = getEstimatedCostForCall({
    model: "claude-sonnet-5",
    inputTokens: normalizedInput,
    maxOutputTokens: 450,
  });
  const stateDetection = getEstimatedCostForCall({
    model: "claude-haiku-4-5",
    inputTokens: messageTokens + 350,
    maxOutputTokens: 180,
  });
  const answer = getEstimatedCostForCall({
    model: answerModel,
    inputTokens: normalizedInput + 600,
    maxOutputTokens: 1_400,
  });
  return roundDollars(translation + stateDetection + answer);
}

export function addTokenUsage(
  inputTokens: number,
  outputTokens: number,
  model = "claude-haiku-4-5",
): number {
  const callCost = calculateUsageCost(inputTokens, outputTokens, model);
  sessionCost.inputTokens += inputTokens;
  sessionCost.outputTokens += outputTokens;
  sessionCost.totalTokens += inputTokens + outputTokens;
  sessionCost.estimatedCost = roundDollars(sessionCost.estimatedCost + callCost);

  window.dispatchEvent(new CustomEvent("costUpdated", { detail: getSessionCost() }));
  return callCost;
}

export function emitCreditDeducted(amount: number, referenceId?: string): void {
  window.dispatchEvent(
    new CustomEvent("creditDeducted", { detail: { amount, referenceId } }),
  );
}

export function getSessionCost(): SessionCost {
  return { ...sessionCost };
}

export function resetSessionCost(): void {
  sessionCost.totalTokens = 0;
  sessionCost.inputTokens = 0;
  sessionCost.outputTokens = 0;
  sessionCost.estimatedCost = 0;
  window.dispatchEvent(new CustomEvent("costUpdated", { detail: getSessionCost() }));
}

export function isApproachingLimit(threshold = 5): boolean {
  return sessionCost.estimatedCost >= threshold;
}
