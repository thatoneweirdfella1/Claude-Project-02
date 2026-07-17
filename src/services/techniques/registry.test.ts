/* Step 4.1 verification — the technique registry's structural invariants. These
   are what the Step 4.2 scorer and Step 4.3 composer rely on; a broken invariant
   here (asymmetric conflict, dependency on a conflicting technique) would make
   downstream stacking incoherent, so it's caught at the source. */

import { describe, expect, it } from "vitest";
import {
  COMPOSABLE_TECHNIQUE_IDS,
  DEFAULT_TECHNIQUE,
  MAX_TECHNIQUE_STACK,
  TECHNIQUES,
  TECHNIQUE_IDS,
  getTechnique,
  isTechniqueId,
  type Technique,
} from "./registry";

const all: Technique[] = TECHNIQUE_IDS.map((id) => TECHNIQUES[id]);

describe("technique registry — completeness", () => {
  it("includes every CANON Feature 4 technique (12: 11 + auto-detect)", () => {
    expect(TECHNIQUE_IDS).toHaveLength(12);
    expect(TECHNIQUE_IDS).toEqual(
      expect.arrayContaining([
        "socratic", "quote-first", "chain-of-thought", "role-prime", "verify",
        "examples", "simplify", "detailed", "step-by-step", "comparative",
        "metaphor", "auto-detect",
      ]),
    );
  });

  it("each id field matches its registry key", () => {
    for (const id of TECHNIQUE_IDS) expect(TECHNIQUES[id].id).toBe(id);
  });

  it("every composable technique has a non-empty effect and prompt fragment", () => {
    for (const id of COMPOSABLE_TECHNIQUE_IDS) {
      expect(TECHNIQUES[id].effect.length).toBeGreaterThan(0);
      expect(TECHNIQUES[id].promptFragment.length).toBeGreaterThan(0);
    }
  });
});

describe("technique registry — default and meta", () => {
  it("Socratic is the one and only default", () => {
    const defaults = all.filter((t) => t.isDefault);
    expect(defaults.map((t) => t.id)).toEqual(["socratic"]);
    expect(DEFAULT_TECHNIQUE).toBe("socratic");
  });

  it("auto-detect is the one and only meta mode: 11 composable techniques", () => {
    const meta = all.filter((t) => t.isMeta);
    expect(meta.map((t) => t.id)).toEqual(["auto-detect"]);
    expect(COMPOSABLE_TECHNIQUE_IDS).toHaveLength(11);
    expect(COMPOSABLE_TECHNIQUE_IDS).not.toContain("auto-detect");
  });

  it("the meta mode has no prompt fragment and is not composed", () => {
    expect(TECHNIQUES["auto-detect"].promptFragment).toBe("");
  });

  it("MAX_TECHNIQUE_STACK is 4 (CANON Feature 4)", () => {
    expect(MAX_TECHNIQUE_STACK).toBe(4);
  });
});

describe("technique registry — matrix invariants", () => {
  it("no technique conflicts with itself", () => {
    for (const t of all) expect(t.conflicts).not.toContain(t.id);
  });

  it("conflicts are symmetric (if A conflicts B, B conflicts A)", () => {
    for (const t of all) {
      for (const other of t.conflicts) {
        expect(isTechniqueId(other)).toBe(true);
        expect(TECHNIQUES[other].conflicts).toContain(t.id);
      }
    }
  });

  it("dependencies reference real, non-self techniques", () => {
    for (const t of all) {
      for (const dep of t.dependencies) {
        expect(isTechniqueId(dep)).toBe(true);
        expect(dep).not.toBe(t.id);
      }
    }
  });

  it("no technique depends on a technique it also conflicts with", () => {
    for (const t of all) {
      for (const dep of t.dependencies) {
        expect(t.conflicts).not.toContain(dep);
        // ...and the dependency must not itself conflict with t.
        expect(TECHNIQUES[dep].conflicts).not.toContain(t.id);
      }
    }
  });
});

describe("registry accessors", () => {
  it("getTechnique / isTechniqueId behave", () => {
    expect(getTechnique("verify").dependencies).toContain("chain-of-thought");
    expect(isTechniqueId("socratic")).toBe(true);
    expect(isTechniqueId("nope")).toBe(false);
    expect(isTechniqueId(7)).toBe(false);
  });
});
