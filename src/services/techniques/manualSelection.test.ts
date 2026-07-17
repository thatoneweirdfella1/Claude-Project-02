/* Step 4.5 verification — manual technique selection. The step's own explicit
   VERIFY criteria: a conflicting pair genuinely cannot both be selected, and a
   5th technique is refused rather than silently dropping one. Also covers
   dependency auto-inclusion, cascade removal, and the auto-mode fallback. */

import { describe, expect, it } from "vitest";
import type { TechniqueId } from "../../stores/types";
import { MAX_TECHNIQUE_STACK } from "./registry";
import {
  AUTO_MODE,
  canSelectManually,
  deselectManualTechnique,
  isAutoMode,
  selectManualTechnique,
} from "./manualSelection";

describe("isAutoMode / AUTO_MODE", () => {
  it("['auto-detect'] is auto mode; a real technique list is not", () => {
    expect(isAutoMode(["auto-detect"])).toBe(true);
    expect(isAutoMode(["socratic"])).toBe(false);
    expect(isAutoMode([])).toBe(false);
  });

  it("AUTO_MODE is a fresh array reference each read (no cross-session aliasing)", () => {
    expect([...AUTO_MODE]).toEqual(["auto-detect"]);
  });
});

describe("canSelectManually / selectManualTechnique — conflicts (the step's own VERIFY)", () => {
  it("a conflicting pair genuinely cannot both be selected", () => {
    const verdict = canSelectManually(["detailed"], "socratic");
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toMatch(/detailed/i);

    const result = selectManualTechnique(["detailed"], "socratic");
    expect(result).toEqual(["detailed"]); // unchanged — socratic was refused, not swapped in
  });

  it("a non-conflicting technique is added cleanly", () => {
    expect(selectManualTechnique(["examples"], "metaphor")).toEqual(["examples", "metaphor"]);
  });

  it("starting from auto mode, selecting one technique switches straight to manual", () => {
    expect(selectManualTechnique(AUTO_MODE, "socratic")).toEqual(["socratic"]);
  });
});

describe("selectManualTechnique — the 4-technique stack cap (the step's own VERIFY)", () => {
  it("a 5th technique is refused, not silently dropping one", () => {
    const fourNonConflicting = ["quote-first", "role-prime", "examples", "metaphor"] as const;
    const result = selectManualTechnique([...fourNonConflicting], "detailed");
    expect(result).toEqual([...fourNonConflicting]); // unchanged, still exactly 4
    expect(result).toHaveLength(4);
  });

  it("canSelectManually explains the cap when already at 4", () => {
    const fourNonConflicting: TechniqueId[] = ["quote-first", "role-prime", "examples", "metaphor"];
    const verdict = canSelectManually(fourNonConflicting, "detailed");
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toMatch(new RegExp(String(MAX_TECHNIQUE_STACK)));
  });

  it("a dependency closure that would push past the cap is also refused", () => {
    // comparative depends on examples; with 4 already filled (none being
    // examples/comparative), adding comparative would need 2 more slots.
    const four: TechniqueId[] = ["quote-first", "role-prime", "metaphor", "detailed"];
    const result = selectManualTechnique(four, "comparative");
    expect(result).toEqual(four); // refused — closure size (2) doesn't fit
  });
});

describe("selectManualTechnique — dependencies auto-included, visibly", () => {
  it("selecting Verify auto-includes Chain-of-Thought", () => {
    const result = selectManualTechnique([], "verify");
    expect(result).toContain("verify");
    expect(result).toContain("chain-of-thought");
  });

  it("selecting Comparative auto-includes Examples", () => {
    const result = selectManualTechnique([], "comparative");
    expect(result.sort()).toEqual(["comparative", "examples"].sort());
  });

  it("Verify cannot be added once Simplify is selected (transitive conflict via chain-of-thought)", () => {
    const verdict = canSelectManually(["simplify"], "verify");
    expect(verdict.allowed).toBe(false);
  });
});

describe("deselectManualTechnique", () => {
  it("removing a technique's own selection removes just it", () => {
    expect(deselectManualTechnique(["examples", "metaphor"], "metaphor")).toEqual(["examples"]);
  });

  it("removing a dependency cascades to remove its dependent", () => {
    const result = deselectManualTechnique(["chain-of-thought", "verify"], "chain-of-thought");
    expect(result).not.toContain("verify");
    expect(result).not.toContain("chain-of-thought");
  });

  it("emptying the manual selection falls back to auto mode", () => {
    expect(deselectManualTechnique(["socratic"], "socratic")).toEqual(["auto-detect"]);
  });

  it("deselecting from auto mode is a safe no-op back to auto mode", () => {
    expect(deselectManualTechnique(AUTO_MODE, "socratic")).toEqual(["auto-detect"]);
  });
});

describe("canSelectManually — meta and already-selected", () => {
  it("auto-detect itself is never a selectable manual technique", () => {
    const verdict = canSelectManually(["socratic"], "auto-detect");
    expect(verdict.allowed).toBe(false);
  });

  it("an already-selected technique is always 'allowed' (toggling it off)", () => {
    expect(canSelectManually(["socratic"], "socratic").allowed).toBe(true);
  });
});
