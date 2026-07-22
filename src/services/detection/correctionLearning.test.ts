/* Step 6.4 verification — correction learning: counting, the 15+ threshold,
   the tie-break, and the prompt addendum. Pure functions over plain
   StateCorrection arrays; no store involved (services/ stays store-agnostic). */

import { describe, expect, it } from "vitest";
import type { StateCorrection } from "../../stores/types";
import {
  CORRECTION_THRESHOLD,
  adaptedValueFor,
  adaptedValues,
  buildAdaptationNote,
  countCorrectionsTo,
} from "./correctionLearning";

function correction(
  dimension: StateCorrection["dimension"],
  to: string,
  timestamp: number,
  from = "x",
): StateCorrection {
  return { dimension, from, to, timestamp };
}

function repeat(
  dimension: StateCorrection["dimension"],
  to: string,
  count: number,
  startAt = 0,
): StateCorrection[] {
  return Array.from({ length: count }, (_, i) => correction(dimension, to, startAt + i));
}

describe("CORRECTION_THRESHOLD", () => {
  it("is 15, verbatim from CANON/PIPELINE.md", () => {
    expect(CORRECTION_THRESHOLD).toBe(15);
  });
});

describe("countCorrectionsTo", () => {
  it("counts only corrections matching both dimension and to-value", () => {
    const corrections = [
      ...repeat("emotion", "frustrated", 3),
      ...repeat("emotion", "calm", 2),
      ...repeat("rsd", "frustrated", 4), // same value string, different dimension
    ];
    expect(countCorrectionsTo(corrections, "emotion", "frustrated")).toBe(3);
    expect(countCorrectionsTo(corrections, "emotion", "calm")).toBe(2);
    expect(countCorrectionsTo(corrections, "rsd", "frustrated")).toBe(4);
    expect(countCorrectionsTo(corrections, "emotion", "excited")).toBe(0);
  });
});

describe("adaptedValueFor — the 15+ threshold", () => {
  it("returns null below the threshold", () => {
    const corrections = repeat("emotion", "frustrated", CORRECTION_THRESHOLD - 1);
    expect(adaptedValueFor(corrections, "emotion")).toBeNull();
  });

  it("returns the value at exactly the threshold", () => {
    const corrections = repeat("emotion", "frustrated", CORRECTION_THRESHOLD);
    expect(adaptedValueFor(corrections, "emotion")).toBe("frustrated");
  });

  it("returns null for a dimension with no corrections at all", () => {
    expect(adaptedValueFor([], "cognitive")).toBeNull();
  });

  it("does not cross-contaminate dimensions", () => {
    const corrections = repeat("emotion", "frustrated", CORRECTION_THRESHOLD);
    expect(adaptedValueFor(corrections, "rsd")).toBeNull();
  });

  it("picks the higher count when two values for the same dimension both cross threshold", () => {
    const corrections = [
      ...repeat("emotion", "frustrated", CORRECTION_THRESHOLD),
      ...repeat("emotion", "anxious", CORRECTION_THRESHOLD + 5),
    ];
    expect(adaptedValueFor(corrections, "emotion")).toBe("anxious");
  });

  it("breaks a count tie toward the most recently corrected-to value", () => {
    const corrections = [
      ...repeat("emotion", "frustrated", CORRECTION_THRESHOLD, 0), // timestamps 0..14
      ...repeat("emotion", "anxious", CORRECTION_THRESHOLD, 100), // timestamps 100..114, later
    ];
    expect(adaptedValueFor(corrections, "emotion")).toBe("anxious");
  });
});

describe("adaptedValues", () => {
  it("returns an entry per adapted dimension, omitting dimensions that haven't adapted", () => {
    const corrections = [
      ...repeat("emotion", "frustrated", CORRECTION_THRESHOLD),
      ...repeat("cognitive", "stuck", CORRECTION_THRESHOLD),
      ...repeat("rsd", "high", 2), // below threshold
    ];
    expect(adaptedValues(corrections)).toEqual({ emotion: "frustrated", cognitive: "stuck" });
  });

  it("returns {} when nothing has adapted (the common case)", () => {
    expect(adaptedValues([])).toEqual({});
    expect(adaptedValues(repeat("emotion", "calm", 5))).toEqual({});
  });
});

describe("buildAdaptationNote", () => {
  it("returns an empty string when nothing has adapted", () => {
    expect(buildAdaptationNote([])).toBe("");
    expect(buildAdaptationNote(repeat("emotion", "calm", 3))).toBe("");
  });

  it("mentions the adapted dimension and value, and says a per-message signal still wins", () => {
    const note = buildAdaptationNote(repeat("emotion", "frustrated", CORRECTION_THRESHOLD));
    expect(note).toContain("frustrated");
    expect(note).toMatch(/emotion/i);
    expect(note).toMatch(/still win|still choose/i);
  });

  it("includes one line per adapted dimension when multiple have adapted", () => {
    const corrections = [
      ...repeat("emotion", "frustrated", CORRECTION_THRESHOLD),
      ...repeat("interest", "low", CORRECTION_THRESHOLD),
    ];
    const note = buildAdaptationNote(corrections);
    expect(note).toContain("frustrated");
    expect(note).toContain("low");
  });
});
