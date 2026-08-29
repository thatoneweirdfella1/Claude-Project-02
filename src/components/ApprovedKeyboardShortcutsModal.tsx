import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { APPROVED_KEYBOARD_SHORTCUTS, formatApprovedShortcut } from "../services/approvedKeyboardPolicy";
import "./KeyboardShortcutsModal.css";

export function ApprovedKeyboardShortcutsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
      queueMicrotask(() => returnFocusRef.current?.focus());
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);
  if (!open) return null;
  return <div className="keyboard-shortcuts-overlay" onClick={onClose}>
    <div className="keyboard-shortcuts-modal" role="dialog" aria-modal="true" aria-labelledby="approved-shortcuts-title" onClick={(event) => event.stopPropagation()}>
      <div className="keyboard-shortcuts-modal__header"><h2 id="approved-shortcuts-title">Keyboard Shortcuts</h2><button ref={closeRef} type="button" className="keyboard-shortcuts-modal__close" onClick={onClose} aria-label="Close shortcuts"><X size={20} /></button></div>
      <div className="keyboard-shortcuts-modal__content">
        {APPROVED_KEYBOARD_SHORTCUTS.map((shortcut) => <div key={shortcut.id} className="shortcuts-item"><div className="shortcuts-item__key"><kbd>{formatApprovedShortcut(shortcut)}</kbd></div><div className="shortcuts-item__description">{shortcut.description}</div></div>)}
        <p className="topbar-popover__text">Browser shortcuts such as Ctrl/Cmd + T, S, L, and P remain available to the browser.</p>
      </div>
    </div>
  </div>;
}
