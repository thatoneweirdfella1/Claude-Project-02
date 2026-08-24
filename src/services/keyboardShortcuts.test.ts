import { describe, expect, it } from "vitest";
import { APPROVED_KEYBOARD_SHORTCUTS, isTextEntryTarget, matchApprovedShortcut } from "./approvedKeyboardPolicy";

describe("approved keyboard policy", () => {
  it("does not override browser-reserved Ctrl/Cmd T, S, L, or P", () => {
    for (const key of ["t", "s", "l", "p"]) expect(matchApprovedShortcut(key, true, false, false)).toBeNull();
    expect(APPROVED_KEYBOARD_SHORTCUTS.map((shortcut) => shortcut.id)).not.toContain("nav-home");
    expect(APPROVED_KEYBOARD_SHORTCUTS.map((shortcut) => shortcut.id)).not.toContain("nav-messages");
  });

  it("keeps approved Search and Quick Reference shortcuts", () => {
    expect(matchApprovedShortcut("k", true, false, false)?.id).toBe("nav-search");
    expect(matchApprovedShortcut("?", false, false, false)?.id).toBe("action-help");
  });

  it("protects normal typing from the bare Quick Reference shortcut", () => {
    const textarea = document.createElement("textarea");
    const button = document.createElement("button");
    expect(isTextEntryTarget(textarea)).toBe(true);
    expect(isTextEntryTarget(button)).toBe(false);
  });
});
