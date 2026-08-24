import { describe, expect, it } from "vitest";
import { CONNECTED_EXECUTION_AVAILABLE, CONNECTED_EXECUTION_UNAVAILABLE_MESSAGE } from "./executionAvailability";

describe("Layer 2 external-effect boundary", () => {
  it("keeps connected execution closed and explains the safe fallback", () => {
    expect(CONNECTED_EXECUTION_AVAILABLE).toBe(false);
    expect(CONNECTED_EXECUTION_UNAVAILABLE_MESSAGE).toContain("no-charge manual handoff");
  });
});
