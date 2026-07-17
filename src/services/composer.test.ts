/* Step 5.0 verification — the emitted request object's shape. Confirms
   buildTranslateAskRequest carries exactly the documented fields (raw input,
   the three settings, loaded context) and nothing else — no API call, no
   translation, no routing decision baked in. */

import { describe, expect, it } from "vitest";
import { buildTranslateAskRequest } from "./composer";
import type { ContextItem } from "../stores/types";

describe("buildTranslateAskRequest", () => {
  it("carries the raw input, the three settings, and context, unchanged", () => {
    const context: ContextItem[] = [];
    const request = buildTranslateAskRequest(
      "ramble ramble how do i fix this",
      { model: "auto", directness: 2, techniques: ["auto-detect"] },
      context,
    );
    expect(request).toEqual({
      rawInput: "ramble ramble how do i fix this",
      model: "auto",
      directness: 2,
      techniques: ["auto-detect"],
      context: [],
    });
  });

  it("passes through a manual override model, directness, and technique stack exactly", () => {
    const request = buildTranslateAskRequest(
      "x",
      { model: "claude-opus-4-8", directness: 3, techniques: ["chain-of-thought", "verify"] },
      [],
    );
    expect(request.model).toBe("claude-opus-4-8");
    expect(request.directness).toBe(3);
    expect(request.techniques).toEqual(["chain-of-thought", "verify"]);
  });

  it("is plain JSON-serializable data (round-trips through JSON)", () => {
    const request = buildTranslateAskRequest("x", { model: "auto", directness: 2, techniques: ["auto-detect"] }, []);
    expect(JSON.parse(JSON.stringify(request))).toEqual(request);
  });

  it("does not clip or transform empty or huge raw input — that's translate()'s job downstream", () => {
    expect(
      buildTranslateAskRequest("", { model: "auto", directness: 2, techniques: ["auto-detect"] }, []).rawInput,
    ).toBe("");
    const huge = "a".repeat(50_000);
    expect(
      buildTranslateAskRequest(huge, { model: "auto", directness: 2, techniques: ["auto-detect"] }, []).rawInput,
    ).toBe(huge);
  });
});
