import { describe, expect, it } from "vitest";
import { renderJson } from "./renderJson";

describe("renderJson", () => {
  it("round-trips ExportData through JSON.parse", () => {
    const data = { answerText: "Hi", rating: { stars: 4, comment: "Nice" } };
    const output = renderJson(data);
    expect(JSON.parse(output)).toEqual(data);
  });

  it("pretty-prints with 2-space indentation", () => {
    const output = renderJson({ answerText: "Hi" });
    expect(output).toContain('{\n  "answerText"');
  });
});
