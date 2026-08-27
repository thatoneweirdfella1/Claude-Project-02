import { beforeEach, describe, expect, it } from "vitest";
import {
  ModelPricingUnavailableError,
  addTokenUsage,
  calculateUsageCost,
  getEstimatedCostForCall,
  getEstimatedCostForPipeline,
  getSessionCost,
  resetSessionCost,
} from "./costTracking";

beforeEach(() => resetSessionCost());

describe("cost estimation", () => {
  it("uses model-specific per-million token prices", () => {
    expect(calculateUsageCost(1_000_000, 1_000_000, "claude-haiku-4-5")).toBe(6);
    expect(calculateUsageCost(1_000_000, 1_000_000, "claude-sonnet-5")).toBe(18);
    expect(calculateUsageCost(1_000_000, 1_000_000, "claude-opus-4-8")).toBe(30);
  });
  it("fails closed instead of borrowing another model's price", () => {
    expect(() => calculateUsageCost(1000, 1000, "gpt-5.5")).toThrow(ModelPricingUnavailableError);
    expect(() => getEstimatedCostForCall({ model: "gpt-5.5", inputTokens: 1000, maxOutputTokens: 1000 })).toThrow(ModelPricingUnavailableError);
  });
  it("records provider-reported tokens even when exact dollar pricing is unavailable", () => {
    expect(addTokenUsage(123, 45, "gpt-5.5")).toBe(0);
    expect(getSessionCost()).toEqual({ inputTokens: 123, outputTokens: 45, totalTokens: 168, estimatedCost: 0 });
  });
  it("returns a conservative positive estimate before a priced call", () => {
    expect(getEstimatedCostForCall({ model: "claude-haiku-4-5", inputTokens: 1000, maxOutputTokens: 1000 })).toBe(0.006);
    expect(getEstimatedCostForPipeline("Help me organize this task")).toBeGreaterThan(0);
  });
  it("includes attached context in the preflight estimate", () => {
    const withoutContext = getEstimatedCostForPipeline("Use my notes", "claude-sonnet-5");
    const withContext = getEstimatedCostForPipeline("Use my notes", "claude-sonnet-5", 400_000);
    expect(withContext).toBeGreaterThan(withoutContext);
  });
});
