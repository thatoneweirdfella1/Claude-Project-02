import { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { KEYBOARD_SHORTCUTS, formatShortcut } from "../services/keyboardShortcuts";
import { useDismissableLayer } from "../keyboard";
import "./KeyboardShortcutsModal.css";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  useDismissableLayer(open, onClose);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const categories = Array.from(new Set(KEYBOARD_SHORTCUTS.map((s) => s.category)));

  return (
    <div className="keyboard-shortcuts-overlay" onClick={onClose}>
      <div ref={rootRef} className="keyboard-shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="keyboard-shortcuts-modal__header">
          <h2>Keyboard Shortcuts</h2>
          <button
            type="button"
            className="keyboard-shortcuts-modal__close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="keyboard-shortcuts-modal__content">
          {categories.map((category) => {
            const shortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.category === category);
            return (
              <div key={category} className="shortcuts-category">
                <h3 className="shortcuts-category__title">{category}</h3>
                <div className="shortcuts-list">
                  {shortcuts.map((shortcut) => (
                    <div key={shortcut.id} className="shortcuts-item">
                      <div className="shortcuts-item__key">
                        <kbd>{formatShortcut(shortcut)}</kbd>
                      </div>
                      <div className="shortcuts-item__description">{shortcut.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
