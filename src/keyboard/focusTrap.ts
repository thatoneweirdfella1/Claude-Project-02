/* focusTrap — focus containment and return for modals/overlays (Step 1.9,
   requirement 1: "focus trapping in modals, focus returning to the trigger on
   close").

   createFocusTrap(container):
     - activate(): remembers the currently-focused element (the trigger), then
       moves focus to the first focusable element inside the container.
     - while active: Tab / Shift+Tab wrap around the container's focusables so
       focus can never leave the modal by keyboard; if focus somehow lands
       outside, the next Tab pulls it back to the first item.
     - release(): restores focus to the trigger element that was focused before
       activate(), so closing a modal returns the user exactly where they were.

   Pure DOM, no React — the useFocusTrap hook is a thin wrapper. Kept DOM-only
   so it's unit-testable under happy-dom without a component renderer. */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

/** All keyboard-focusable descendants of container, in DOM (tab) order,
    excluding those explicitly removed from the tab sequence. */
export function getFocusable(container: HTMLElement): HTMLElement[] {
  const nodes = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  );
  return nodes.filter(
    (el) => el.getAttribute("aria-hidden") !== "true" && el.tabIndex !== -1,
  );
}

export interface FocusTrap {
  activate(): void;
  release(): void;
}

export function createFocusTrap(container: HTMLElement): FocusTrap {
  let previouslyFocused: HTMLElement | null = null;

  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== "Tab") return;
    const items = getFocusable(container);
    if (items.length === 0) {
      // Nothing focusable inside — keep focus on the container itself.
      event.preventDefault();
      return;
    }

    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (!container.contains(active)) {
      event.preventDefault();
      first.focus();
      return;
    }
    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return {
    activate() {
      previouslyFocused =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      container.addEventListener("keydown", onKeydown);
      const items = getFocusable(container);
      (items[0] ?? container).focus();
    },
    release() {
      container.removeEventListener("keydown", onKeydown);
      // Return focus to the trigger, if it's still in the document.
      if (previouslyFocused && previouslyFocused.isConnected) {
        previouslyFocused.focus();
      }
    },
  };
}
