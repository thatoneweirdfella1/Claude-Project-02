/* Central cost estimation and usage tracking. Prices are explicit and
   version-controlled. Unknown models never inherit another model's price. */

export interface ModelPrice { inputPerMillion: number; outputPerMillion: number; }
export const MODEL_PRICES: Record<string, ModelPrice> = {
  "claude-haiku-4-5": { inputPerMillion: 1, outputPerMillion: 5 },
  "claude-sonnet-5": { inputPerMillion: 3, outputPerMillion: 15 },
  "claude-opus-4-8": { inputPerMillion: 5, outputPerMillion: 25 },
};

export interface SessionCost { totalTokens: number; inputTokens: number; outputTokens: number; estimatedCost: number; }
export interface CostEstimateInput { model: string; inputTokens: number; maxOutputTokens: number; }
export class ModelPricingUnavailableError extends Error {
  readonly model: string;
  constructor(model: string) {
    super(`Cost unavailable for model: ${model}`);
    this.name = "ModelPricingUnavailableError";
    this.model = model;
  }
}

const sessionCost: SessionCost = { totalTokens: 0, inputTokens: 0, outputTokens: 0, estimatedCost: 0 };
function roundDollars(value: number): number { return Math.round((value + Number.EPSILON) * 1_000_000) / 1_000_000; }
export function hasExplicitModelPricing(model: string): boolean { return Object.prototype.hasOwnProperty.call(MODEL_PRICES, model); }
export function getExplicitModelPrice(model: string): ModelPrice | null { return MODEL_PRICES[model] ? { ...MODEL_PRICES[model] } : null; }
function priceFor(model: string): ModelPrice {
  const price = MODEL_PRICES[model];
  if (!price) throw new ModelPricingUnavailableError(model);
  return price;
}

export function calculateUsageCost(inputTokens: number, outputTokens: number, model = "claude-haiku-4-5"): number {
  if (inputTokens < 0 || outputTokens < 0) return 0;
  const price = priceFor(model);
  return roundDollars((inputTokens / 1_000_000) * price.inputPerMillion + (outputTokens / 1_000_000) * price.outputPerMillion);
}

export function getEstimatedCostForCall(input: CostEstimateInput): number {
  return calculateUsageCost(input.inputTokens, input.maxOutputTokens, input.model);
}

export function getEstimatedCostForPipeline(rawInput: string, answerModel = "claude-haiku-4-5", includedContextCharacters = 0): number {
  const messageTokens = Math.max(1, Math.ceil((rawInput.length + Math.max(0, includedContextCharacters)) / 4));
  const scaffoldTokens = 650;
  const normalizedInput = messageTokens + scaffoldTokens;
  const translation = getEstimatedCostForCall({ model: "claude-sonnet-5", inputTokens: normalizedInput, maxOutputTokens: 450 });
  const stateDetection = getEstimatedCostForCall({ model: "claude-haiku-4-5", inputTokens: messageTokens + 350, maxOutputTokens: 180 });
  const answer = getEstimatedCostForCall({ model: answerModel, inputTokens: normalizedInput + 600, maxOutputTokens: 1_400 });
  return roundDollars(translation + stateDetection + answer);
}

/** Record provider-reported token counts even when exact dollar pricing for
    that model is unavailable. Unknown price contributes $0 to the displayed
    cost rather than borrowing another model's price. */
export function addTokenUsage(inputTokens: number, outputTokens: number, model = "claude-haiku-4-5"): number {
  if (!Number.isSafeInteger(inputTokens) || inputTokens < 0 || !Number.isSafeInteger(outputTokens) || outputTokens < 0) return 0;
  const callCost = hasExplicitModelPricing(model) ? calculateUsageCost(inputTokens, outputTokens, model) : 0;
  sessionCost.inputTokens += inputTokens;
  sessionCost.outputTokens += outputTokens;
  sessionCost.totalTokens += inputTokens + outputTokens;
  sessionCost.estimatedCost = roundDollars(sessionCost.estimatedCost + callCost);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("costUpdated", { detail: { ...getSessionCost(), model, costKnown: hasExplicitModelPricing(model) } }));
  }
  return callCost;
}

export function emitCreditDeducted(amount: number, referenceId?: string): void {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("creditDeducted", { detail: { amount, referenceId } }));
}
export function getSessionCost(): SessionCost { return { ...sessionCost }; }
export function resetSessionCost(): void {
  sessionCost.totalTokens = 0; sessionCost.inputTokens = 0; sessionCost.outputTokens = 0; sessionCost.estimatedCost = 0;
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("costUpdated", { detail: getSessionCost() }));
}
export function isApproachingLimit(threshold = 5): boolean { return sessionCost.estimatedCost >= threshold; }
