/* keyboard — the shared keyboard framework (Step 1.9). Public API every
   component plugs into for CANON's "100% usable by Tab, Enter, Escape"
   accessibility rule. Import from "@/keyboard" (this barrel), not the
   individual modules, so the surface stays stable as internals move.

   Cores (framework-agnostic, unit-tested):
     isTypingTarget    — the typing-isolation predicate
     dismissLayers     — Escape-closes-topmost LIFO stack
     shortcutRegistry  — global shortcuts with typing isolation
     focusTrap         — focus containment + return-to-trigger
     confirmable       — two-step destructive-action gate
   React surface (thin wrappers):
     useDismissableLayer, useGlobalShortcut, useFocusTrap, useConfirmable
*/

export { isTypingTarget } from "./isTypingTarget";
export {
  pushDismissLayer,
  activeDismissLayerCount,
} from "./dismissLayers";
export {
  registerShortcut,
  type ShortcutHandler,
  type ShortcutOptions,
} from "./shortcutRegistry";
export {
  createFocusTrap,
  getFocusable,
  type FocusTrap,
} from "./focusTrap";
export {
  createConfirmable,
  type Confirmable,
  type ConfirmableOptions,
} from "./confirmable";
export {
  useDismissableLayer,
  useGlobalShortcut,
  useFocusTrap,
  useConfirmable,
  type UseConfirmableResult,
} from "./hooks";
