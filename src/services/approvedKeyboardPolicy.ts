export interface ApprovedKeyboardShortcut {
  id: "nav-search" | "action-help";
  key: string;
  ctrl?: boolean;
  description: string;
  category: "Navigation" | "Help";
}

export const APPROVED_KEYBOARD_SHORTCUTS: readonly ApprovedKeyboardShortcut[] = [
  { id: "nav-search", key: "k", ctrl: true, description: "Open Search", category: "Navigation" },
  { id: "action-help", key: "?", description: "Open contextual Quick Reference", category: "Help" },
] as const;

export function matchApprovedShortcut(key: string, ctrl: boolean, shift: boolean, alt: boolean): ApprovedKeyboardShortcut | null {
  return APPROVED_KEYBOARD_SHORTCUTS.find((shortcut) => shortcut.key.toLowerCase() === key.toLowerCase() && Boolean(shortcut.ctrl) === ctrl && !shift && !alt) ?? null;
}

export function isTextEntryTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT");
}

export function formatApprovedShortcut(shortcut: ApprovedKeyboardShortcut): string {
  return `${shortcut.ctrl ? "Ctrl/Cmd + " : ""}${shortcut.key.toUpperCase()}`;
}
