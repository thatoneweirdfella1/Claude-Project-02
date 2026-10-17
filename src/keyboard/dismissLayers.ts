/* dismissLayers — the Escape stack (Step 1.9, requirement 2: "Escape closes
   the topmost modal or dropdown").

   A single module-level LIFO stack of dismissable "layers." A modal, popover,
   or custom dropdown pushes a layer when it opens and pops it when it closes.
   One document-level keydown listener (attached lazily on the first push,
   removed on the last pop) sees every Escape and dismisses ONLY the topmost
   layer — so nested overlays close one at a time, outermost last.

   Deliberately capture-phase and independent of the global-shortcut registry:
   Escape-to-close must work even while the user is typing inside the layer
   (e.g. a modal with a focused text field), which the shortcut registry's
   typing-isolation rule would otherwise block. Dismiss is not a "shortcut." */

interface DismissLayer {
  onDismiss: () => void;
  roots?: () => readonly (Node | null)[] | undefined;
}

const stack: DismissLayer[] = [];
let listening = false;

function handleKeydown(event: KeyboardEvent): void {
  if (event.key !== "Escape") return;
  const top = stack[stack.length - 1];
  if (!top) return;
  // Stop the Escape here so it dismisses exactly one layer and doesn't also
  // trigger anything below it.
  event.preventDefault();
  event.stopPropagation();
  top.onDismiss();
}

function handlePointerdown(event: PointerEvent): void {
  const top = stack[stack.length - 1];
  const roots = top?.roots?.();
  // Dialogs without roots keep their own backdrop handling and shield
  // lower layers. Menus include their trigger, content and any portal.
  if (!top || !roots) return;
  const path = event.composedPath();
  if (roots.some((root) => root && path.includes(root))) return;
  top.onDismiss();
}

function ensureListening(): void {
  if (listening) return;
  document.addEventListener("keydown", handleKeydown, true); // capture
  document.addEventListener("pointerdown", handlePointerdown, true);
  listening = true;
}

function stopListeningIfEmpty(): void {
  if (stack.length > 0 || !listening) return;
  document.removeEventListener("keydown", handleKeydown, true);
  document.removeEventListener("pointerdown", handlePointerdown, true);
  listening = false;
}

/** Register a dismissable layer as the new topmost. Returns an unregister
    function the caller MUST call when the layer closes (the React hook does
    this in effect cleanup). Removing the last layer detaches the listener. */
export function pushDismissLayer(
  onDismiss: () => void,
  roots?: () => readonly (Node | null)[] | undefined,
): () => void {
  const layer: DismissLayer = { onDismiss, roots };
  stack.push(layer);
  ensureListening();

  return () => {
    const index = stack.indexOf(layer);
    if (index !== -1) stack.splice(index, 1);
    stopListeningIfEmpty();
  };
}

/** Number of currently-open dismissable layers. Exposed for tests and for a
    future step that needs to know whether any overlay is open. */
export function activeDismissLayerCount(): number {
  return stack.length;
}
