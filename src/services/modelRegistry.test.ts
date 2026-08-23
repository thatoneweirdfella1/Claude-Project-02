/* Model registry verification. Confirms the approved provider models, the
   Claude scorer tiers/plans, and that extended thinking is a call flag rather
   than a model identity. */

import { describe, expect, it } from "vitest";
import {
  MODEL_IDS,
  MODEL_REGISTRY,
  getModel,
  isModelId,
  type ModelCallOptions,
} from "./modelRegistry";

describe("model registry", () => {
  it("holds the approved provider-model strings", () => {
    expect(MODEL_IDS).toEqual([
      "claude-haiku-4-5",
      "claude-sonnet-5",
      "claude-opus-4-8",
      "gpt-4o",
      "gpt-5",
      "gemini-flash",
      "gemini-pro",
      "grok",
      "deepseek",
      "deepseek-reasoner",
    ]);
    // Explicitly not the retired string.
    expect(MODEL_IDS).not.toContain("claude-sonnet-4-6");
  });

  it("maps tiers and plan gating per ROUTING.md (free: haiku+sonnet, paid: opus)", () => {
    expect(getModel("claude-haiku-4-5")).toMatchObject({ tier: "Fast", plan: "free" });
    expect(getModel("claude-sonnet-5")).toMatchObject({ tier: "Balanced", plan: "free" });
    expect(getModel("claude-opus-4-8")).toMatchObject({ tier: "Deep", plan: "paid" });
  });

  it("labels match the corrected routing.js MODELS table", () => {
    expect(MODEL_REGISTRY["claude-sonnet-5"].label).toBe("Sonnet 5");
  });

  it("isModelId guards unknown strings", () => {
    expect(isModelId("claude-sonnet-5")).toBe(true);
    expect(isModelId("claude-sonnet-4-6")).toBe(false);
    expect(isModelId(42)).toBe(false);
  });

  it("extended thinking is a call flag, not a model", () => {
    const opts: ModelCallOptions = { extendedThinking: true };
    expect(opts.extendedThinking).toBe(true);
    expect(MODEL_IDS).not.toContain("extended-thinking");
  });
});
