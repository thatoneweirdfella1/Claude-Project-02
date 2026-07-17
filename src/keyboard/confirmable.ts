/* confirmable — destructive-action safety core (Step 1.9, requirement 4:
   "Destructive actions cannot fire from a single stray keypress; they confirm
   or are undoable"). Also enforces CANON ADHD HARD RULES (Decisions): "Only
   confirm destructive actions."

   A confirmable wraps a destructive action in a two-step arm/confirm gate: the
   FIRST trigger only arms it (and starts a timeout that auto-disarms), the
   SECOND trigger within the window actually runs the action. This makes it
   structurally impossible for one stray keypress — a mis-hit Enter, a bounced
   key — to perform something destructive. The useConfirmable hook exposes the
   armed state so the UI can show "Press again to confirm."

   Pure (no React, no DOM) so it's unit-testable with fake timers. */

export interface Confirmable {
  /** True once armed and before it runs or auto-disarms. */
  readonly armed: boolean;
  /** First call arms; second call while armed runs the action and disarms. */
  trigger(): void;
  /** Disarm without running (e.g. Escape, blur, or an explicit cancel). */
  cancel(): void;
  /** Clear any pending auto-disarm timer. Call when discarding the instance. */
  dispose(): void;
}

export interface ConfirmableOptions {
  /** Auto-disarm window in ms. Default 4000. */
  timeoutMs?: number;
  /** Notified whenever armed flips, so a hook/UI can re-render. */
  onArmedChange?: (armed: boolean) => void;
}

export function createConfirmable(
  action: () => void,
  options: ConfirmableOptions = {},
): Confirmable {
  const timeoutMs = options.timeoutMs ?? 4000;
  const onArmedChange = options.onArmedChange;

  let armed = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  function clearTimer(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function setArmed(next: boolean): void {
    if (armed === next) return;
    armed = next;
    onArmedChange?.(armed);
  }

  return {
    get armed() {
      return armed;
    },
    trigger() {
      if (armed) {
        // Second, confirming trigger: run and reset.
        clearTimer();
        setArmed(false);
        action();
        return;
      }
      // First trigger: arm and schedule auto-disarm.
      setArmed(true);
      clearTimer();
      timer = setTimeout(() => {
        timer = null;
        setArmed(false);
      }, timeoutMs);
    },
    cancel() {
      clearTimer();
      setArmed(false);
    },
    dispose() {
      clearTimer();
    },
  };
}
