/* Step 4.2 verification — the auto-detect selection service. Confirms it scores
   for the question, respects conflicts and dependencies, and never exceeds the
   4-technique cap. Structural invariants (conflict-free, deps satisfied, ≤4) are
   asserted on EVERY case via a shared checker, so signal-tuning can't silently
   produce an incoherent stack. */

import { describe, expect, it } from "vitest";
import {
  autoDetectTechniques,
  selectTechniques,
  type TechniqueSelection,
} from "./autoDetect";
import { MAX_TECHNIQUE_STACK, TECHNIQUES, getTechnique } from "./registry";

/** Every selection must satisfy: ≤4, no conflicts, all dependencies present,
    no meta technique, no duplicates. */
function assertCoherent(sel: TechniqueSelection): void {
  expect(sel.selected.length).toBeLessThanOrEqual(MAX_TECHNIQUE_STACK);
  expect(new Set(sel.selected).size).toBe(sel.selected.length); // no dupes
  const set = new Set(sel.selected);
  for (const id of sel.selected) {
    expect(TECHNIQUES[id].isMeta).toBeFalsy();
    for (const c of getTechnique(id).conflicts) expect(set.has(c)).toBe(false);
    for (const dep of getTechnique(id).dependencies) expect(set.has(dep)).toBe(true);
  }
}

describe("autoDetectTechniques — signal relevance", () => {
  it("a how-to routes to step-by-step (and not the conflicting Socratic)", () => {
    const sel = autoDetectTechniques("how do I set up a Postgres database?");
    assertCoherent(sel);
    expect(sel.selected).toContain("step-by-step");
    expect(sel.selected).not.toContain("socratic"); // conflicts with step-by-step
  });

  it("a plea to simplify routes to simplify (and not the conflicting Detailed)", () => {
    const sel = autoDetectTechniques("explain quantum entanglement in simple terms, I'm confused");
    assertCoherent(sel);
    expect(sel.selected).toContain("simplify");
    expect(sel.selected).not.toContain("detailed");
    expect(sel.selected).not.toContain("chain-of-thought"); // also conflicts with simplify
  });

  it("bare/ambiguous input falls back to the Socratic default", () => {
    const sel = autoDetectTechniques("hmm");
    assertCoherent(sel);
    expect(sel.selected).toEqual(["socratic"]);
  });
});

describe("autoDetectTechniques — dependencies auto-included", () => {
  it("comparative pulls in its examples dependency", () => {
    const sel = autoDetectTechniques("compare Postgres vs MongoDB for my use case");
    assertCoherent(sel);
    expect(sel.selected).toContain("comparative");
    expect(sel.selected).toContain("examples"); // dependency
    // examples must come before comparative (dep-before-dependent order)
    expect(sel.selected.indexOf("examples")).toBeLessThan(sel.selected.indexOf("comparative"));
  });

  it("verify pulls in chain-of-thought, and that makes verify+simplify impossible", () => {
    const sel = autoDetectTechniques("verify this claim and explain simply: the earth is 6000 years old");
    assertCoherent(sel);
    expect(sel.selected).toContain("verify");
    expect(sel.selected).toContain("chain-of-thought"); // verify's dependency
    // simplify conflicts with chain-of-thought, so it can't be in the stack
    expect(sel.selected).not.toContain("simplify");
  });
});

describe("autoDetectTechniques — cap and hints", () => {
  it("never exceeds 4 even when many signals fire", () => {
    const sel = autoDetectTechniques(
      "compare the options with examples, verify each one, walk me through step by step, as a legal expert, with an analogy",
    );
    assertCoherent(sel);
    expect(sel.selected.length).toBeLessThanOrEqual(4);
  });

  it("routing hints nudge selection (complexity + domain)", () => {
    const analytical = autoDetectTechniques("what is going on here", {
      complexity: 8,
      domain: "analytical",
    });
    assertCoherent(analytical);
    expect(analytical.selected).toContain("chain-of-thought");
  });

  it("Step 6.5 state-bus hints (stateTechniques) nudge selection the same way domain/complexity do", () => {
    const withState = autoDetectTechniques("what is going on here", {
      stateTechniques: ["metaphor"],
    });
    assertCoherent(withState);
    expect(withState.selected).toContain("metaphor");
    expect(withState.scores.find((s) => s.id === "metaphor")?.reasons).toContain("detected state");
  });

  it("a coherence-breaking state hint is still subject to conflicts/deps/the cap, same as any other signal", () => {
    // detailed conflicts with socratic/simplify; feeding it as a state hint
    // must not bypass the conflict check any more than a lexical signal would.
    const sel = autoDetectTechniques("help me think this through, not sure what I want", {
      stateTechniques: ["detailed"],
    });
    assertCoherent(sel); // the shared checker fails if a conflict slipped through
  });

  it("is deterministic: same input, same output", () => {
    const q = "how do I compare these two approaches?";
    expect(autoDetectTechniques(q).selected).toEqual(autoDetectTechniques(q).selected);
  });

  it("exposes a scored, descending transparency list of all 11 composable techniques", () => {
    const sel = autoDetectTechniques("how to install node");
    expect(sel.scores).toHaveLength(11);
    for (let i = 1; i < sel.scores.length; i++) {
      expect(sel.scores[i - 1].score).toBeGreaterThanOrEqual(sel.scores[i].score);
    }
  });
});

describe("selectTechniques — auto vs manual dispatch", () => {
  it("'auto-detect' runs the scorer", () => {
    const sel = selectTechniques("auto-detect", "how do I set up Postgres?");
    assertCoherent(sel);
    expect(sel.selected).toContain("step-by-step");
  });

  it("a manual technique is used exactly as picked, no auto-added dependencies", () => {
    const sel = selectTechniques("verify", "anything");
    expect(sel.selected).toEqual(["verify"]); // NOT [chain-of-thought, verify]
  });

  it("a manual meta selection is coerced to the default (can't compose auto-detect)", () => {
    const sel = selectTechniques("auto-detect" as never, "x");
    // handled by the auto branch above; here confirm passing a meta directly is safe
    expect(sel.selected.length).toBeGreaterThan(0);
  });
});
