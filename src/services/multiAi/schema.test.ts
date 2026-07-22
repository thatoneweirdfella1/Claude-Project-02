import { describe, expect, it } from "vitest";
import {
  MultiAiSchemaError,
  parseConsensusOutput,
  parseSynthesisOutput,
} from "./schema";

describe("parseConsensusOutput", () => {
  it("parses a well-formed reply", () => {
    const result = parseConsensusOutput({
      disagreement: "One says X, the other says Y.",
      commonGround: "Both agree on Z.",
      unifiedView: "On balance, Z with a caveat about X.",
    });
    expect(result.disagreement).toContain("X");
    expect(result.commonGround).toContain("Z");
    expect(result.unifiedView).toContain("caveat");
  });

  it("throws on a non-object reply", () => {
    expect(() => parseConsensusOutput("not an object")).toThrow(MultiAiSchemaError);
    expect(() => parseConsensusOutput(null)).toThrow(MultiAiSchemaError);
  });

  it.each(["disagreement", "commonGround", "unifiedView"])(
    "throws when %s is missing or blank",
    (field) => {
      const base = { disagreement: "a", commonGround: "b", unifiedView: "c", [field]: "   " };
      expect(() => parseConsensusOutput(base)).toThrow(MultiAiSchemaError);
    },
  );
});

describe("parseSynthesisOutput", () => {
  it("parses a well-formed reply", () => {
    const result = parseSynthesisOutput({ refinedAnswer: "The combined answer." });
    expect(result.refinedAnswer).toBe("The combined answer.");
  });

  it("throws on a non-object reply", () => {
    expect(() => parseSynthesisOutput([])).toThrow(MultiAiSchemaError);
  });

  it("throws when refinedAnswer is missing or blank", () => {
    expect(() => parseSynthesisOutput({})).toThrow(MultiAiSchemaError);
    expect(() => parseSynthesisOutput({ refinedAnswer: "  " })).toThrow(MultiAiSchemaError);
  });
});
