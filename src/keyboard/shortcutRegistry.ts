/* shortcutRegistry — global keyboard shortcuts with built-in typing isolation
   (Step 1.9, requirement 3, the one the prompt marks "Critical").

   Components register a shortcut (e.g. "mod+k", "ctrl+enter", "?") and get an
   unregister function back. One document-level keydown listener (attached
   lazily on the first registration) matches events against every registered
   combo. Before firing, it checks isTypingTarget: if the user is typing in a
   field the shortcut is skipped, UNLESS the shortcut explicitly opts in with
   allowInTextField (for in-field shortcuts like ctrl+enter to submit).

   "mod" means Ctrl on Windows/Linux and Cmd on macOS — matched as ctrlKey ||
   metaKey so callers write one combo that works on both. */

import { isTypingTarget } from "./isTypingTarget";

export type ShortcutHandler = (event: KeyboardEvent) => void;

export interface ShortcutOptions {
  /** Fire even when a text field is focused. Default false — the Critical
      rule. Set true only for shortcuts meant to act while typing (e.g.
      ctrl+enter to send from the input box). */
  allowInTextField?: boolean;
}

interface NormalizedCombo {
  key: string; // lower-cased key, e.g. "k", "enter", "?"
  ctrlOrMeta: boolean; // "mod"
  requireCtrl: boolean;
  requireMeta: boolean;
  shift: boolean;
  alt: boolean;
}

interface Entry {
  combo: NormalizedCombo;
  handler: ShortcutHandler;
  allowInTextField: boolean;
}

const entries: Entry[] = [];
let listening = false;

function parseCombo(combo: string): NormalizedCombo {
  const parts = combo
    .toLowerCase()
    .split("+")
    .map((p) => p.trim())
    .filter(Boolean);

  const result: NormalizedCombo = {
    key: "",
    ctrlOrMeta: false,
    requireCtrl: false,
    requireMeta: false,
    shift: false,
    alt: false,
  };

  for (const part of parts) {
    switch (part) {
      case "mod":
        result.ctrlOrMeta = true;
        break;
      case "ctrl":
      case "control":
        result.requireCtrl = true;
        break;
      case "meta":
      case "cmd":
      case "command":
        result.requireMeta = true;
        break;
      case "shift":
        result.shift = true;
        break;
      case "alt":
      case "option":
        result.alt = true;
        break;
      default:
        result.key = part;
    }
  }
  return result;
}

function matches(combo: NormalizedCombo, event: KeyboardEvent): boolean {
  if (event.key.toLowerCase() !== combo.key) return false;
  if (combo.ctrlOrMeta && !(event.ctrlKey || event.metaKey)) return false;
  if (combo.requireCtrl && !event.ctrlKey) return false;
  if (combo.requireMeta && !event.metaKey) return false;
  if (combo.shift !== event.shiftKey) return false;
  if (combo.alt !== event.altKey) return false;
  // When no modifier was requested at all, reject events carrying ctrl/meta so
  // a bare "k" shortcut doesn't also fire on ctrl+k.
  if (!combo.ctrlOrMeta && !combo.requireCtrl && !combo.requireMeta) {
    if (event.ctrlKey || event.metaKey) return false;
  }
  return true;
}

function handleKeydown(event: KeyboardEvent): void {
  const typing = isTypingTarget(event.target);
  for (const entry of entries) {
    if (typing && !entry.allowInTextField) continue; // the Critical rule
    if (matches(entry.combo, event)) {
      entry.handler(event);
    }
  }
}

function ensureListening(): void {
  if (listening) return;
  document.addEventListener("keydown", handleKeydown);
  listening = true;
}

function stopListeningIfEmpty(): void {
  if (entries.length > 0 || !listening) return;
  document.removeEventListener("keydown", handleKeydown);
  listening = false;
}

/** Register a global shortcut. Returns an unregister function the caller MUST
    call on unmount (the React hook does this in effect cleanup). */
export function registerShortcut(
  combo: string,
  handler: ShortcutHandler,
  options: ShortcutOptions = {},
): () => void {
  const entry: Entry = {
    combo: parseCombo(combo),
    handler,
    allowInTextField: options.allowInTextField ?? false,
  };
  entries.push(entry);
  ensureListening();

  return () => {
    const index = entries.indexOf(entry);
    if (index !== -1) entries.splice(index, 1);
    stopListeningIfEmpty();
  };
}
