import { describe, expect, it } from "vitest";
import {
  calculateUsageCost,
  getEstimatedCostForCall,
  getEstimatedCostForPipeline,
  hasPricingFor,
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

describe("R14: Unknown Model Pricing", () => {
  it("requires explicit versioned pricing for every model", () => {
    expect(hasPricingFor("claude-haiku-4-5")).toBe(true);
    expect(hasPricingFor("claude-sonnet-5")).toBe(true);
    expect(hasPricingFor("claude-opus-4-8")).toBe(true);
  });

  it("rejects unknown models and never silently substitutes pricing", () => {
    expect(hasPricingFor("claude-opus-4")).toBe(false);
    expect(hasPricingFor("gpt-6")).toBe(false);
    expect(hasPricingFor("some-future-model")).toBe(false);
    expect(hasPricingFor("claude-opus")).toBe(false);
  });

  it("R27: debate partner models each have their own explicit price — never borrowed from Claude's", () => {
    // These are the roster ids in services/debate/roster.ts — each has its
    // own entry in MODEL_PRICES (added for R27's per-participant estimate),
    // distinct from every Claude model's price.
    expect(hasPricingFor("gpt-5.5")).toBe(true);
    expect(hasPricingFor("gemini-3.1-pro")).toBe(true);
    expect(hasPricingFor("grok-4.3")).toBe(true);
    expect(hasPricingFor("deepseek-v4-pro")).toBe(true);

    const claudeOpusCost = calculateUsageCost(1_000_000, 1_000_000, "claude-opus-4-8");
    expect(calculateUsageCost(1_000_000, 1_000_000, "gpt-5.5")).not.toBe(claudeOpusCost);
    expect(calculateUsageCost(1_000_000, 1_000_000, "gemini-3.1-pro")).not.toBe(claudeOpusCost);
    expect(calculateUsageCost(1_000_000, 1_000_000, "grok-4.3")).not.toBe(claudeOpusCost);
    expect(calculateUsageCost(1_000_000, 1_000_000, "deepseek-v4-pro")).not.toBe(claudeOpusCost);
  });

  it("eliminates fuzzy keyword matching for unknown models", () => {
    expect(calculateUsageCost(1_000_000, 1_000_000, "claude-opus")).toBe(0);
    expect(calculateUsageCost(1_000_000, 1_000_000, "my-opus-model")).toBe(0);
    expect(calculateUsageCost(1_000_000, 1_000_000, "sonnet-custom")).toBe(0);
    expect(calculateUsageCost(1_000_000, 1_000_000, "haiku-cheap")).toBe(0);
  });

  it("shows cost unavailable (0) for unknown models instead of guessing", () => {
    expect(calculateUsageCost(1_000_000, 1_000_000, "unknown-model")).toBe(0);
    expect(calculateUsageCost(5_000, 10_000, "future-model")).toBe(0);
  });

  it("only uses pricing from the explicit MODEL_PRICES registry", () => {
    const knownModels = ["claude-haiku-4-5", "claude-sonnet-5", "claude-opus-4-8"];
    const unknownVariants = [
      "claude-haiku-5",
      "claude-sonnet-4",
      "claude-opus-5",
      "claudehaiku4.5",
      "CLAUDE-HAIKU-4-5",
    ];

    knownModels.forEach((model) => {
      expect(hasPricingFor(model)).toBe(true);
      expect(calculateUsageCost(1_000_000, 0, model)).toBeGreaterThan(0);
    });

    unknownVariants.forEach((model) => {
      expect(hasPricingFor(model)).toBe(false);
      expect(calculateUsageCost(1_000_000, 0, model)).toBe(0);
    });
  });
});
