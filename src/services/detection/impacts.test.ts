/* Step 6.2 verification — the system-impact table matches PIPELINE.md's four
   dimensions, the derivations are deterministic and trace only to the table,
   the prompt names every mapped state (no prompt/table drift), and the
   directness recommendation agrees with directness.ts. */

import { describe, expect, it } from "vitest";
import {
  STATE_IMPACTS,
  impactsFor,
  recommendedDirectness,
  suggestedTechniques,
} from "./impacts";
import { DETECTION_SYSTEM_PROMPT } from "./prompt";
import {
  COGNITIVE_MODES,
  EMOTION_STATES,
  INTEREST_LEVELS,
  RSD_LEVELS,
  type StateDetectionResult,
} from "./schema";
import { recommendDirectnessFromEmotion } from "../directness";
import { isTechniqueId } from "../techniques";

function reading<T extends string>(value: T) {
  return { value, confidence: 80 };
}

const FULL: StateDetectionResult = {
  emotion: reading("overwhelmed"),
  rsd: reading("high"),
  interest: reading("high"),
  cognitive: reading("analytical"),
  summary: "s",
};

describe("STATE_IMPACTS — covers every value of every dimension", () => {
  it("has an impact for every approved emotion, RSD level, interest level, and cognitive mode", () => {
    for (const v of EMOTION_STATES) expect(STATE_IMPACTS.emotion[v]).toBeDefined();
    for (const v of RSD_LEVELS) expect(STATE_IMPACTS.rsd[v]).toBeDefined();
    for (const v of INTEREST_LEVELS) expect(STATE_IMPACTS.interest[v]).toBeDefined();
    for (const v of COGNITIVE_MODES) expect(STATE_IMPACTS.cognitive[v]).toBeDefined();
  });

  it("every impact has a non-empty user-facing description", () => {
    const all = [
      ...Object.values(STATE_IMPACTS.emotion),
      ...Object.values(STATE_IMPACTS.rsd),
      ...Object.values(STATE_IMPACTS.interest),
      ...Object.values(STATE_IMPACTS.cognitive),
    ];
    for (const impact of all) expect(impact.description.trim().length).toBeGreaterThan(0);
  });

  it("every technique named in the table is a real, valid TechniqueId", () => {
    const all = [
      ...Object.values(STATE_IMPACTS.emotion),
      ...Object.values(STATE_IMPACTS.interest),
      ...Object.values(STATE_IMPACTS.cognitive),
    ];
    for (const impact of all) {
      for (const id of impact.techniques ?? []) expect(isTechniqueId(id)).toBe(true);
    }
  });
});

describe("STATE_IMPACTS — matches PIPELINE.md's specific mappings", () => {
  it("Overwhelmed is the only emotion with a directness impact, and it is Level 1", () => {
    expect(STATE_IMPACTS.emotion.overwhelmed.directness).toBe(1);
    for (const v of EMOTION_STATES) {
      if (v !== "overwhelmed") expect(STATE_IMPACTS.emotion[v].directness).toBeUndefined();
    }
  });

  it("emotion techniques match the approved request-support mappings", () => {
    expect(STATE_IMPACTS.emotion.frustrated.techniques).toEqual(["simplify"]);
    expect(STATE_IMPACTS.emotion.calm.techniques).toBeUndefined();
    expect(STATE_IMPACTS.emotion["low-energy"].techniques).toEqual(["simplify"]);
    expect(STATE_IMPACTS.emotion.excited.techniques).toEqual(["detailed"]);
    expect(STATE_IMPACTS.emotion.anxious.techniques).toEqual(["verify"]);
  });

  it("RSD levels carry a tone and NO technique", () => {
    for (const v of RSD_LEVELS) {
      expect(STATE_IMPACTS.rsd[v].tone).toBeTruthy();
      expect(STATE_IMPACTS.rsd[v].techniques).toBeUndefined();
    }
  });

  it("high interest suggests BOTH Detailed and Comparative (PIPELINE 'Detailed or Comparative')", () => {
    expect(STATE_IMPACTS.interest.low.techniques).toEqual(["simplify"]);
    expect(STATE_IMPACTS.interest.medium.techniques).toBeUndefined();
    expect(STATE_IMPACTS.interest.high.techniques).toEqual(["detailed", "comparative"]);
  });

  it("cognitive modes match the approved five-value vocabulary", () => {
    expect(STATE_IMPACTS.cognitive.exploratory.techniques).toEqual(["socratic"]);
    expect(STATE_IMPACTS.cognitive.analytical.techniques).toEqual(["step-by-step", "verify"]);
    expect(STATE_IMPACTS.cognitive.creative.techniques).toEqual(["metaphor", "comparative"]);
    expect(STATE_IMPACTS.cognitive.decision.techniques).toEqual(["comparative", "verify"]);
    expect(STATE_IMPACTS.cognitive.execution.techniques).toEqual(["step-by-step", "examples"]);
  });
});

describe("impactsFor — deterministic derivation from a result", () => {
  it("returns one applied impact per non-null dimension, in dimension order", () => {
    const applied = impactsFor(FULL);
    expect(applied.map((a) => a.dimension)).toEqual(["emotion", "rsd", "interest", "cognitive"]);
    expect(applied[0].value).toBe("overwhelmed");
    expect(applied[0].impact).toBe(STATE_IMPACTS.emotion.overwhelmed);
  });

  it("skips null dimensions", () => {
    const applied = impactsFor({ emotion: reading("calm"), rsd: null, interest: null, cognitive: null, summary: "s" });
    expect(applied.map((a) => a.dimension)).toEqual(["emotion"]);
  });

  it("is a pure function — same result yields identical impacts", () => {
    expect(impactsFor(FULL)).toEqual(impactsFor(FULL));
  });
});

describe("recommendedDirectness — agrees with directness.ts", () => {
  it("returns Level 1 for Overwhelmed and null otherwise, matching recommendDirectnessFromEmotion", () => {
    for (const v of EMOTION_STATES) {
      const result: StateDetectionResult = { emotion: reading(v), rsd: null, interest: null, cognitive: null, summary: "s" };
      expect(recommendedDirectness(result)).toBe(recommendDirectnessFromEmotion(v));
    }
  });

  it("returns null when emotion is null", () => {
    expect(recommendedDirectness({ emotion: null, rsd: reading("high"), interest: null, cognitive: null, summary: "s" })).toBeNull();
  });
});

describe("suggestedTechniques — de-duplicated candidates from all dimensions", () => {
  it("collects technique candidates across emotion/interest/cognitive, dropping RSD (tone-only)", () => {
    // frustrated→simplify, high interest→detailed+comparative, execution→step-by-step+examples
    const result: StateDetectionResult = {
      emotion: reading("frustrated"),
      rsd: reading("high"),
      interest: reading("high"),
      cognitive: reading("execution"),
      summary: "s",
    };
    const techniques = suggestedTechniques(result);
    expect(techniques).toContain("simplify");
    expect(techniques).toContain("detailed");
    expect(techniques).toContain("comparative");
    expect(techniques).toContain("step-by-step");
    expect(techniques).toContain("examples");
    // de-duplicated values appear only once
    expect(techniques.filter((t) => t === "simplify")).toHaveLength(1);
  });

  it("returns [] when no dimension carries a technique (e.g. only RSD detected)", () => {
    expect(suggestedTechniques({ emotion: null, rsd: reading("low"), interest: null, cognitive: null, summary: "s" })).toEqual([]);
  });
});

describe("prompt/table consistency — no drift", () => {
  it("the classifier prompt names every state value the impact table maps", () => {
    const allValues = [...EMOTION_STATES, ...RSD_LEVELS, ...INTEREST_LEVELS, ...COGNITIVE_MODES];
    // RSD/interest levels (low/medium/high) are shared words; assert the
    // distinctive per-dimension VALUES appear at least once in the prompt.
    for (const v of [...EMOTION_STATES, ...COGNITIVE_MODES]) {
      expect(DETECTION_SYSTEM_PROMPT).toContain(v);
    }
    // low/medium/high each appear (shared across rsd + interest)
    for (const v of ["low", "medium", "high"]) {
      expect(DETECTION_SYSTEM_PROMPT).toContain(v);
    }
    expect(allValues.length).toBe(19); // 8 + 3 + 3 + 5, a guard on the approved taxonomy size
  });

  it("the prompt tells the model to emit JSON only and not reason aloud (Haiku tuning)", () => {
    expect(DETECTION_SYSTEM_PROMPT).toMatch(/JSON only|ONLY a JSON/i);
    expect(DETECTION_SYSTEM_PROMPT).toMatch(/Do not reason out loud|no chain-of-thought|directly/i);
  });
});
