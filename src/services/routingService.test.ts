/* Step 3.1 verification — the routing service integration.

   Three concerns, none of which re-tests the scorer's own correctness (that's
   tests.js's job, run separately, unchanged — ROUTING.md: "Do not rebuild the
   scorer"):
     1. Embedding integrity: the copy under src/services/ is byte-identical to
        the repo-root vendor source (FINDINGS.md item 7's own verification
        principle — "the tested engine is provably the shipped engine" —
        applied to this integration instead of a build-time string check).
     2. The typed wrapper actually calls through with no behavior change
        (spot checks mirroring a few of tests.js's own cases).
     3. The two independently-authored model tables (routing.js's vendor
        MODELS and this app's modelRegistry.ts) agree on api strings, so a
        future edit to one can't silently drift from the other. */

import { describe, expect, it } from "vitest";
// Vite ?raw imports (typed by tsconfig.app's types:["vite/client"], same
// pattern as corpus.test.ts) — avoids node:fs, which the browser tsconfig
// used to typecheck tests doesn't have types for.
import rootSource from "../../routing.js?raw";
import embeddedSource from "./routing.js?raw";
import { MODEL_REGISTRY } from "./modelRegistry";
import {
  FREE_MODEL_KEYS,
  ROUTING_MODELS,
  overrideFromSelection,
  route,
} from "./routingService";

describe("embedding integrity", () => {
  it("src/services/routing.js is byte-identical to the repo-root vendor source", () => {
    expect(embeddedSource).toBe(rootSource);
  });
});

describe("routingService.route — thin pass-through, no logic added", () => {
  it("routes a trivial retrieval question to Haiku (Fast)", () => {
    const r = route({ prompt: "what year did world war 2 end", plan: "paid" });
    expect(r.model).toBe("haiku");
    expect(r.apiString).toBe("claude-haiku-4-5");
    expect(r.complexity).toBeLessThanOrEqual(2);
  });

  it("routes a synthesis-under-constraints design question to Opus (Deep)", () => {
    const r = route({
      prompt:
        "design a caching strategy for a distributed system under a strict latency budget while tolerant to partition failures",
      plan: "paid",
      confidence: 95,
    });
    expect(r.model).toBe("opus");
    expect(r.tier).toBe("Deep");
  });

  it("confidence coupling: below-60 floors effective complexity at 4 and flags it", () => {
    const r = route({ prompt: "what year did world war 2 end", confidence: 40, plan: "paid" });
    expect(r.effectiveComplexity).toBeGreaterThanOrEqual(4);
    expect(r.notes.some((n) => /below the clarify gate/.test(n))).toBe(true);
  });

  it("free plan downgrades a Deep-tier route to Sonnet with a visible note", () => {
    const deepPrompt =
      "design and architect a fault-tolerant, byzantine consensus based distributed caching strategy under a strict latency budget while tolerant to partition failures, and prove its correctness";
    const paid = route({ prompt: deepPrompt, plan: "paid", confidence: 95 });
    expect(paid.model).toBe("opus"); // confirms the prompt actually scores Deep first

    const free = route({ prompt: deepPrompt, plan: "free", confidence: 95 });
    expect(free.model).toBe("sonnet");
    expect(free.downgraded).toBe(true);
  });

  it("manual override always wins on paid, is blocked (with a note) on free for non-free models", () => {
    const paid = route({ prompt: "hello", plan: "paid", override: "opus" });
    expect(paid.model).toBe("opus");

    const free = route({ prompt: "hello", plan: "free", override: "opus" });
    expect(free.model).not.toBe("opus");
    expect(free.notes.some((n) => /requires the paid plan/.test(n))).toBe(true);
  });

  it("health questions never route to the Fast tier", () => {
    const r = route({ prompt: "what dosage of ibuprofen is safe", plan: "paid" });
    expect(r.model).not.toBe("haiku");
  });

  it("re-exports FREE_MODEL_KEYS and ROUTING_MODELS unchanged from the engine", () => {
    expect(FREE_MODEL_KEYS).toEqual(["haiku", "sonnet"]);
    expect(ROUTING_MODELS.sonnet.api).toBe("claude-sonnet-5");
  });
});

describe("routing.js MODELS agrees with modelRegistry.ts (independent sources, same 3 models)", () => {
  it("every routing.js api string exists in the app's model registry with a matching id", () => {
    for (const key of ["haiku", "sonnet", "opus"] as const) {
      const apiString = ROUTING_MODELS[key].api;
      expect(MODEL_REGISTRY[apiString as keyof typeof MODEL_REGISTRY]).toBeDefined();
      expect(MODEL_REGISTRY[apiString as keyof typeof MODEL_REGISTRY].id).toBe(apiString);
    }
  });

  it("no stale claude-sonnet-4-6 string anywhere in the wired-in engine", () => {
    expect(JSON.stringify(ROUTING_MODELS)).not.toContain("claude-sonnet-4-6");
  });
});

describe("overrideFromSelection — Step 3.2's dropdown-to-engine wiring", () => {
  it("maps 'auto' to null (no override; the scorer decides)", () => {
    expect(overrideFromSelection("auto")).toBeNull();
  });

  it("maps each ModelId to its routing ModelKey", () => {
    expect(overrideFromSelection("claude-haiku-4-5")).toBe("haiku");
    expect(overrideFromSelection("claude-sonnet-5")).toBe("sonnet");
    expect(overrideFromSelection("claude-opus-4-8")).toBe("opus");
  });

  it("falls back to null (never throws) for a stale/unknown persisted value", () => {
    expect(overrideFromSelection("claude-sonnet-4-6" as never)).toBeNull();
  });

  it("the resulting override actually drives route(), proving the wiring end-to-end", () => {
    const paidOverride = route({
      prompt: "hello",
      plan: "paid",
      override: overrideFromSelection("claude-opus-4-8"),
    });
    expect(paidOverride.model).toBe("opus");

    const freeOverride = route({
      prompt: "hello",
      plan: "free",
      override: overrideFromSelection("claude-opus-4-8"),
    });
    expect(freeOverride.model).not.toBe("opus"); // free plan gates Opus, with a note
    expect(freeOverride.notes.some((n) => /requires the paid plan/.test(n))).toBe(true);
  });
});
