/* Keyboard shortcuts registry and handler */

export interface KeyboardShortcut {
  id: string;
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  category: "Navigation" | "Actions" | "Help";
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // Navigation
  { id: "nav-translate", key: "t", ctrl: true, description: "Go to Translate", category: "Navigation" },
  { id: "nav-home", key: "h", ctrl: true, description: "Go to Home", category: "Navigation" },
  { id: "nav-dashboard", key: "d", ctrl: true, description: "Go to Dashboard", category: "Navigation" },
  { id: "nav-sessions", key: "s", ctrl: true, description: "Go to Sessions", category: "Navigation" },
  { id: "nav-templates", key: "l", ctrl: true, description: "Go to Templates", category: "Navigation" },
  { id: "nav-messages", key: "m", ctrl: true, description: "Go to Messages", category: "Navigation" },
  { id: "nav-saved-prompts", key: "p", ctrl: true, description: "Go to Saved Prompts", category: "Navigation" },
  { id: "nav-search", key: "k", ctrl: true, description: "Open Search", category: "Navigation" },

  // Actions
  { id: "action-help", key: "?", description: "Show Keyboard Shortcuts", category: "Help" },
];

export function matchesShortcut(
  key: string,
  ctrl: boolean,
  shift: boolean,
  alt: boolean
): KeyboardShortcut | null {
  return KEYBOARD_SHORTCUTS.find(
    (s) =>
      s.key.toLowerCase() === key.toLowerCase() &&
      (s.ctrl ?? false) === ctrl &&
      (s.shift ?? false) === shift &&
      (s.alt ?? false) === alt
  ) ?? null;
}

export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts = [];
  if (shortcut.ctrl) parts.push("Ctrl");
  if (shortcut.shift) parts.push("Shift");
  if (shortcut.alt) parts.push("Alt");
  parts.push(shortcut.key.toUpperCase());
  return parts.join(" + ");
}
