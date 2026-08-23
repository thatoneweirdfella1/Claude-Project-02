import { describe, expect, it } from "vitest";
import {
  calculateUsageCost,
  getEstimatedCostForCall,
  getEstimatedCostForPipeline,
} from "./costTracking";

describe("cost estimation", () => {
  it("uses model-specific per-million token prices", () => {
    expect(calculateUsageCost(1_000_000, 1_000_000, "claude-haiku-4-5")).toBe(6);
    expect(calculateUsageCost(1_000_000, 1_000_000, "claude-sonnet-5")).toBe(18);
    expect(calculateUsageCost(1_000_000, 1_000_000, "claude-opus-4-8")).toBe(30);
  });

  it("returns a conservative positive estimate before a call", () => {
    expect(getEstimatedCostForCall({ model: "claude-haiku-4-5", inputTokens: 1000, maxOutputTokens: 1000 })).toBe(0.006);
    expect(getEstimatedCostForPipeline("Help me organize this task")).toBeGreaterThan(0);
  });

  it("includes attached context in the preflight estimate", () => {
    const withoutContext = getEstimatedCostForPipeline("Use my notes", "claude-sonnet-5");
    const withContext = getEstimatedCostForPipeline("Use my notes", "claude-sonnet-5", 400_000);
    expect(withContext).toBeGreaterThan(withoutContext);
  });
});
