/* isTypingTarget — the "Critical" typing-isolation predicate (Step 1.9).
   CANON ADHD HARD RULES (Accessibility) + the step's own rule 3: "when the
   cursor is in a text input, keystrokes go to that input; global shortcuts
   do not fire while typing in a field." Every global shortcut consults this
   before firing. Kept as a standalone pure function so it's trivially unit-
   testable and reusable anywhere a component needs to know "is the user
   currently typing into something." */

/** True when the event target is a field that consumes keystrokes as text
    (or type-ahead, for <select>), so a global shortcut must NOT hijack the
    key. Non-text inputs (checkbox, radio, button, range, etc.) are not
    typing targets — a shortcut over them is fine. */
export function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  // contentEditable regions (rich-text areas a later step might add) count.
  if (target.isContentEditable) return true;

  const tag = target.tagName;
  if (tag === "TEXTAREA") return true;
  // <select> uses type-ahead — typing filters options — so a global shortcut
  // pressing the same key while a select is focused would fight it.
  if (tag === "SELECT") return true;

  if (tag === "INPUT") {
    const type = (target as HTMLInputElement).type;
    // Inputs that are not text entry: a shortcut over them is not "typing".
    const nonTextInput = new Set([
      "checkbox",
      "radio",
      "button",
      "submit",
      "reset",
      "range",
      "color",
      "file",
      "image",
    ]);
    return !nonTextInput.has(type);
  }

  return false;
}
