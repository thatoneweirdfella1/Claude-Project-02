/* Step 6.1 verification — the detection schema validator: tolerant per
   dimension (unknown value → null, garbage confidence → 0), throws only on a
   non-object reply, and maps cleanly onto the store's StatePills. */

import { describe, expect, it } from "vitest";
import {
  DetectionSchemaError,
  parseDetectionOutput,
  toStatePills,
} from "./schema";

describe("parseDetectionOutput", () => {
  it("parses a full, well-formed reply across all four dimensions", () => {
    const result = parseDetectionOutput({
      emotion: { value: "overwhelmed", confidence: 82 },
      rsd: { value: "high", confidence: 70 },
      interest: { value: "high", confidence: 60 },
      cognitive: { value: "processing", confidence: 55 },
      summary: "You sound a bit overwhelmed — I'll keep it clear.",
    });
    expect(result.emotion).toEqual({ value: "overwhelmed", confidence: 82 });
    expect(result.rsd).toEqual({ value: "high", confidence: 70 });
    expect(result.interest).toEqual({ value: "high", confidence: 60 });
    expect(result.cognitive).toEqual({ value: "processing", confidence: 55 });
    expect(result.summary).toContain("overwhelmed");
  });

  it("accepts a bare value string for a dimension (confidence defaults to 0)", () => {
    const result = parseDetectionOutput({ emotion: "calm", summary: "All good." });
    expect(result.emotion).toEqual({ value: "calm", confidence: 0 });
  });

  it("maps an unknown dimension value to null rather than fabricating a neutral", () => {
    const result = parseDetectionOutput({
      emotion: { value: "furious", confidence: 90 }, // not a valid EmotionState
      rsd: { value: "sideways", confidence: 90 }, // not a valid RsdLevel
      summary: "s",
    });
    expect(result.emotion).toBeNull();
    expect(result.rsd).toBeNull();
  });

  it("treats a missing dimension as null and clamps out-of-range confidence", () => {
    const result = parseDetectionOutput({
      emotion: { value: "excited", confidence: 250 },
      // rsd, interest, cognitive omitted
      summary: "s",
    });
    expect(result.emotion).toEqual({ value: "excited", confidence: 100 });
    expect(result.rsd).toBeNull();
    expect(result.interest).toBeNull();
    expect(result.cognitive).toBeNull();
  });

  it("treats non-numeric confidence as 0 (unsure), never fabricated high", () => {
    const result = parseDetectionOutput({
      emotion: { value: "anxious", confidence: "very" },
      summary: "s",
    });
    expect(result.emotion).toEqual({ value: "anxious", confidence: 0 });
  });

  it("fills a fallback summary when it is missing or blank", () => {
    expect(parseDetectionOutput({ emotion: "calm" }).summary.length).toBeGreaterThan(0);
    expect(parseDetectionOutput({ emotion: "calm", summary: "   " }).summary.length).toBeGreaterThan(0);
  });

  it("throws DetectionSchemaError only when the reply is not an object", () => {
    expect(() => parseDetectionOutput(null)).toThrow(DetectionSchemaError);
    expect(() => parseDetectionOutput("not an object")).toThrow(DetectionSchemaError);
    expect(() => parseDetectionOutput(42)).toThrow(DetectionSchemaError);
  });

  it("does NOT throw when every dimension is null — detection has no load-bearing field", () => {
    const result = parseDetectionOutput({ summary: "Couldn't read a clear state." });
    expect(result.emotion).toBeNull();
    expect(result.rsd).toBeNull();
    expect(result.interest).toBeNull();
    expect(result.cognitive).toBeNull();
  });
});

describe("toStatePills", () => {
  it("projects the four dimension values onto StatePills, dropping confidence/summary", () => {
    const pills = toStatePills({
      emotion: { value: "frustrated", confidence: 80 },
      rsd: null,
      interest: { value: "low", confidence: 40 },
      cognitive: { value: "racing", confidence: 65 },
      summary: "s",
    });
    expect(pills).toEqual({
      emotion: "frustrated",
      rsd: null,
      interest: "low",
      cognitive: "racing",
    });
  });
});
