/* Cost tracking — shows users how much their API calls are costing in real-time.
   Prices based on Claude Haiku (the cheapest model used in the app).
   Users need to know BEFORE they hit limits, not after their bill arrives. */

const HAIKU_INPUT_PRICE = 0.003; // $0.003 per 1K input tokens
const HAIKU_OUTPUT_PRICE = 0.015; // $0.015 per 1K output tokens

export interface SessionCost {
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number; // In dollars
}

const sessionCost: SessionCost = {
  totalTokens: 0,
  inputTokens: 0,
  outputTokens: 0,
  estimatedCost: 0,
};

export function addTokenUsage(inputTokens: number, outputTokens: number): void {
  sessionCost.inputTokens += inputTokens;
  sessionCost.outputTokens += outputTokens;
  sessionCost.totalTokens += inputTokens + outputTokens;

  // Calculate cost based on token usage
  const inputCost = (inputTokens / 1000) * HAIKU_INPUT_PRICE;
  const outputCost = (outputTokens / 1000) * HAIKU_OUTPUT_PRICE;
  sessionCost.estimatedCost += inputCost + outputCost;

  // Notify listeners
  window.dispatchEvent(
    new CustomEvent("costUpdated", { detail: sessionCost })
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

  window.dispatchEvent(
    new CustomEvent("costUpdated", { detail: sessionCost })
  );
}

export function isApproachingLimit(threshold: number = 5.0): boolean {
  return sessionCost.estimatedCost >= threshold;
}
