/* Step 2.1 verification — the schema validator (parseTranslationOutput).
   Confirms it trusts a good reply, tolerates LLM noise safely, and refuses a
   reply with no usable request rather than passing garbage downstream. */

import { describe, expect, it } from "vitest";
import {
  GAP_TYPES,
  parseTranslationOutput,
  TranslationSchemaError,
} from "./schema";

describe("parseTranslationOutput", () => {
  it("accepts a well-formed reply unchanged", () => {
    const result = parseTranslationOutput({
      translatedPrompt: "Explain how React's useEffect cleanup runs.",
      confidence: 85,
      detectedGaps: ["tangential-preamble", "scope-ambiguity"],
      reasoning: "Read past the backstory to the effect-cleanup question.",
    });
    expect(result.translatedPrompt).toBe(
      "Explain how React's useEffect cleanup runs.",
    );
    expect(result.confidence).toBe(85);
    expect(result.detectedGaps).toEqual([
      "tangential-preamble",
      "scope-ambiguity",
    ]);
  });

  it("clamps and rounds out-of-range confidence", () => {
    expect(parseTranslationOutput({ translatedPrompt: "x", confidence: 140 }).confidence).toBe(100);
    expect(parseTranslationOutput({ translatedPrompt: "x", confidence: -5 }).confidence).toBe(0);
    expect(parseTranslationOutput({ translatedPrompt: "x", confidence: 72.6 }).confidence).toBe(73);
  });

  it("treats missing/garbage confidence as 0 (safe for the gates, not fabricated high)", () => {
    expect(parseTranslationOutput({ translatedPrompt: "x" }).confidence).toBe(0);
    expect(parseTranslationOutput({ translatedPrompt: "x", confidence: "nope" }).confidence).toBe(0);
  });

  it("drops unknown gap ids and dedupes", () => {
    const result = parseTranslationOutput({
      translatedPrompt: "x",
      confidence: 50,
      detectedGaps: [
        "scope-ambiguity",
        "scope-ambiguity",
        "not-a-real-gap",
        42,
      ],
    });
    expect(result.detectedGaps).toEqual(["scope-ambiguity"]);
  });

  it("defaults gaps to [] and fills reasoning when absent", () => {
    const result = parseTranslationOutput({ translatedPrompt: "x", confidence: 90 });
    expect(result.detectedGaps).toEqual([]);
    expect(result.reasoning.length).toBeGreaterThan(0);
  });

  it("throws when translatedPrompt is missing or empty", () => {
    expect(() => parseTranslationOutput({ confidence: 90 })).toThrow(
      TranslationSchemaError,
    );
    expect(() =>
      parseTranslationOutput({ translatedPrompt: "   ", confidence: 90 }),
    ).toThrow(TranslationSchemaError);
  });

  it("throws when the reply is not an object", () => {
    expect(() => parseTranslationOutput(null)).toThrow(TranslationSchemaError);
    expect(() => parseTranslationOutput("just a string")).toThrow(
      TranslationSchemaError,
    );
  });

  it("exposes exactly the six PIPELINE.md gap types", () => {
    expect(GAP_TYPES).toHaveLength(6);
    expect(GAP_TYPES).toContain("unstated-assumptions");
  });
});
