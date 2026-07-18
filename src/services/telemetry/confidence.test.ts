import { describe, expect, it } from "vitest";
import { deriveConfidenceBreakdown } from "./confidence";
import type { TelemetryEntry } from "./types";

function baseEntry(overrides: Partial<TelemetryEntry> = {}): TelemetryEntry {
  return {
    id: "t1",
    startedAt: 0,
    finishedAt: null,
    totalDurationMs: null,
    stageDurationsMs: {},
    complexity: null,
    effectiveComplexity: null,
    domain: null,
    model: null,
    modelTier: null,
    downgraded: null,
    notes: [],
    scope: null,
    thinkingApplied: null,
    techniques: null,
    techniqueReasoning: null,
    techniqueMode: null,
    techniqueSignalMatched: null,
    confidence: null,
    translationTokens: null,
    executionTokens: null,
    outcome: "done",
    errorMessage: null,
    ...overrides,
  };
}

describe("deriveConfidenceBreakdown", () => {
  it("is all-null when the run never reached translation", () => {
    expect(deriveConfidenceBreakdown(baseEntry())).toEqual({
      translation: null,
      routing: null,
      technique: null,
      overall: null,
    });
  });

  it("gives translation confidence 80+ the highest routing band, matching CONFIDENCE_COUPLING.md's 'trusted' tier", () => {
    const result = deriveConfidenceBreakdown(baseEntry({ confidence: 92 }));
    expect(result.translation).toBe(92);
    expect(result.routing).toBe(95);
  });

  it("gives translation confidence 60-79 the escalated routing band", () => {
    expect(deriveConfidenceBreakdown(baseEntry({ confidence: 65 })).routing).toBe(75);
  });

  it("gives translation confidence below 60 the floor/contract-violation routing band", () => {
    expect(deriveConfidenceBreakdown(baseEntry({ confidence: 40 })).routing).toBe(50);
  });

  it("gives a manual technique stack full confidence, regardless of signal matched", () => {
    const result = deriveConfidenceBreakdown(
      baseEntry({ techniqueMode: "manual", techniqueSignalMatched: null }),
    );
    expect(result.technique).toBe(100);
  });

  it("gives auto-detect a real matched signal higher confidence than a bare default fallback", () => {
    const matched = deriveConfidenceBreakdown(
      baseEntry({ techniqueMode: "auto-detect", techniqueSignalMatched: true }),
    );
    const fallback = deriveConfidenceBreakdown(
      baseEntry({ techniqueMode: "auto-detect", techniqueSignalMatched: false }),
    );
    expect(matched.technique).toBe(90);
    expect(fallback.technique).toBe(65);
    expect(matched.technique!).toBeGreaterThan(fallback.technique!);
  });

  it("overall is the minimum of whichever values are present — a shaky layer never gets averaged away", () => {
    const result = deriveConfidenceBreakdown(
      baseEntry({ confidence: 65, techniqueMode: "auto-detect", techniqueSignalMatched: false }),
    );
    // translation 65 -> routing 75; technique (fallback) 65; overall = min(65, 75, 65)
    expect(result.overall).toBe(65);
  });

  it("overall ignores fields that are still null rather than treating them as zero", () => {
    const result = deriveConfidenceBreakdown(baseEntry({ confidence: 92 }));
    expect(result.overall).toBe(92); // routing (95) is the only other present value, min(92,95)=92
  });
});
