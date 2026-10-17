/* hooks — the React surface of the keyboard framework (Step 1.9). Thin
   wrappers over the pure/DOM cores (dismissLayers, shortcutRegistry,
   focusTrap, confirmable) so components "plug in" with one line and the
   registration/cleanup lifecycle is handled for them. The cores stay
   framework-agnostic and independently testable; these adapt them to
   component lifetimes. Grouped in one file because each is a few lines. */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createConfirmable, type ConfirmableOptions } from "./confirmable";
import { pushDismissLayer } from "./dismissLayers";
import { createFocusTrap } from "./focusTrap";
import {
  registerShortcut,
  type ShortcutHandler,
  type ShortcutOptions,
} from "./shortcutRegistry";

/** Register the topmost Escape layer. Supplying roots also dismisses on
    outside pointers; include the trigger so its click can toggle normally. */
export function useDismissableLayer(
  active: boolean,
  onDismiss: () => void,
  roots?: () => readonly (Node | null)[],
): void {
  // Keep the latest onDismiss without re-subscribing the layer each render.
  const handlerRef = useRef(onDismiss);
  handlerRef.current = onDismiss;
  const rootsRef = useRef(roots);
  rootsRef.current = roots;

  useEffect(() => {
    if (!active) return;
    return pushDismissLayer(() => handlerRef.current(), () => rootsRef.current?.());
  }, [active]);
}

// One active menu across component boundaries. Subscribe to a boolean so
// only the menu being closed and the menu being opened need to render.
let activeMenu: symbol | null = null;
const menuListeners = new Set<() => void>();
function subscribeMenus(listener: () => void): () => void {
  menuListeners.add(listener);
  return () => { menuListeners.delete(listener); };
}
function selectMenu(id: symbol | null): void {
  if (activeMenu === id) return;
  activeMenu = id;
  for (const listener of menuListeners) listener();
}
export function closeOpenMenu(): void {
  selectMenu(null);
}

/** Use this for shell menus instead of independent booleans. Attach rootRef
    to the wrapper containing the trigger and menu. Mutual exclusion, outside
    pointers, Escape and unmount cleanup are automatic; extraRoots is only
    needed for content rendered elsewhere (for example the right rail). */
export function useMenuLayer<T extends HTMLElement>(
  extraRoots?: () => readonly (Node | null)[],
) {
  const [id] = useState(() => Symbol("menu"));
  const rootRef = useRef<T>(null);
  const open = useSyncExternalStore(subscribeMenus, () => activeMenu === id, () => false);
  const setOpen = useCallback((value: boolean) => {
    if (value) selectMenu(id);
    else if (activeMenu === id) selectMenu(null);
  }, [id]);
  useDismissableLayer(open, () => setOpen(false), () => [rootRef.current, ...(extraRoots?.() ?? [])]);
  useEffect(() => () => setOpen(false), [setOpen]);
  return { open, setOpen, rootRef };
}

/** Register a global keyboard shortcut for this component's lifetime.
    Skipped while typing in a field unless options.allowInTextField. */
export function useGlobalShortcut(
  combo: string,
  handler: ShortcutHandler,
  options?: ShortcutOptions,
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const allowInTextField = options?.allowInTextField ?? false;

  useEffect(() => {
    return registerShortcut(
      combo,
      (event) => handlerRef.current(event),
      { allowInTextField },
    );
  }, [combo, allowInTextField]);
}

/** Trap focus inside the returned ref's element while `active` is true, and
    return focus to the trigger on deactivate. Attach the ref to the modal
    container:  const ref = useFocusTrap<HTMLDivElement>(open). */
export function useFocusTrap<T extends HTMLElement>(
  active: boolean,
): React.RefObject<T | null> {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!active || !ref.current) return;
    const trap = createFocusTrap(ref.current);
    trap.activate();
    return () => trap.release();
  }, [active]);

  return ref;
}

export interface UseConfirmableResult {
  /** True while awaiting the confirming second trigger. */
  armed: boolean;
  /** Call to arm, then call again to run the action. */
  trigger: () => void;
  /** Disarm without running. */
  cancel: () => void;
}

/** Gate a destructive action behind a two-step confirm so a single stray
    keypress can never fire it. Returns armed state for a "Press again to
    confirm" affordance. */
export function useConfirmable(
  action: () => void,
  options?: ConfirmableOptions,
): UseConfirmableResult {
  const [armed, setArmed] = useState(false);
  const actionRef = useRef(action);
  actionRef.current = action;

  const timeoutMs = options?.timeoutMs;
  // One confirmable instance per mount; onArmedChange drives re-render.
  const confirmableRef = useRef<ReturnType<typeof createConfirmable> | null>(
    null,
  );
  if (confirmableRef.current === null) {
    confirmableRef.current = createConfirmable(() => actionRef.current(), {
      timeoutMs,
      onArmedChange: setArmed,
    });
  }

  useEffect(() => {
    return () => confirmableRef.current?.dispose();
  }, []);

  const trigger = useCallback(() => confirmableRef.current?.trigger(), []);
  const cancel = useCallback(() => confirmableRef.current?.cancel(), []);

  return { armed, trigger, cancel };
}
