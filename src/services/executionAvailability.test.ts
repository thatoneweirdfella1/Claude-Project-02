import { describe, expect, it } from "vitest";
import { CONNECTED_EXECUTION_AVAILABLE, CONNECTED_EXECUTION_UNAVAILABLE_MESSAGE } from "./executionAvailability";

describe("Layer 6 connected-execution boundary", () => {
  it("enables explicit provider execution and retains a safe fallback message", () => {
    expect(CONNECTED_EXECUTION_AVAILABLE).toBe(true);
    expect(CONNECTED_EXECUTION_UNAVAILABLE_MESSAGE).toContain("no-charge manual handoff");
  });
});
