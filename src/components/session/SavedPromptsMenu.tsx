import { useEffect, useRef, useState } from "react";
import { Bookmark } from "lucide-react";
import { GlassButton } from "../primitives";
import { useDismissableLayer } from "../../keyboard";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import type { SavedPrompt } from "../../stores/types";

/* Saved Prompts (Step 9.2) — CANON Feature 11: "reuse previous questions."
   Reads/writes accountStore.savedPrompts (Step 1.7's existing field/actions
   — addSavedPrompt/removeSavedPrompt already existed, unused until now).

   Loading a saved prompt replaces draftInput with its text (ready to send
   or edit, same "populate the input box" behavior as Load Template's
   starterQuestion). Saving one takes the CURRENT draftInput as the prompt's
   text — disabled while the composer is empty, since there's no question to
   save yet. */

function newSavedPromptId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `prompt-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

type View = "list" | "save";

export function SavedPromptsMenu() {
  const savedPrompts = useAccountStore((s) => s.savedPrompts);
  const addSavedPrompt = useAccountStore((s) => s.addSavedPrompt);
  const removeSavedPrompt = useAccountStore((s) => s.removeSavedPrompt);
  const draftInput = useSessionStore((s) => s.draftInput);
  const setDraftInput = useSessionStore((s) => s.setDraftInput);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("list");
  const [titleValue, setTitleValue] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useDismissableLayer(open, closePopover);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      closePopover();
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function closePopover(): void {
    setOpen(false);
    setView("list");
    setTitleValue("");
  }

  function toggle(): void {
    setOpen((wasOpen) => {
      if (wasOpen) {
        closePopover();
        return false;
      }
      return true;
    });
  }

  function loadPrompt(prompt: SavedPrompt): void {
    setDraftInput(prompt.text);
    closePopover();
  }

  function saveCurrentAsPrompt(): void {
    const title = titleValue.trim();
    const text = useSessionStore.getState().draftInput;
    if (title.length === 0 || text.trim().length === 0) return;
    addSavedPrompt({ id: newSavedPromptId(), title, text });
    closePopover();
  }

  return (
    <div ref={rootRef} className="quick-actions-row__more">
      <GlassButton aria-expanded={open} aria-haspopup="menu" onClick={toggle}>
        <Bookmark size={16} aria-hidden="true" />
        Saved Prompts
      </GlassButton>

      {open && (
        <div className="surface-smoked-glass quick-actions-row__popover" role="menu">
          {view === "list" && (
            <>
              <p className="quick-actions-row__popover-title">Saved Prompts</p>
              {savedPrompts.length === 0 && (
                <p className="quick-actions-row__popover-empty">No saved prompts yet.</p>
              )}
              {savedPrompts.map((prompt) => (
                <div key={prompt.id} className="quick-actions-row__list-row">
                  <button
                    type="button"
                    role="menuitem"
                    className="quick-actions-row__popover-row"
                    onClick={() => loadPrompt(prompt)}
                  >
                    {prompt.title}
                  </button>
                  <button
                    type="button"
                    className="quick-actions-row__list-remove"
                    aria-label={`Delete saved prompt ${prompt.title}`}
                    onClick={() => removeSavedPrompt(prompt.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                role="menuitem"
                className="quick-actions-row__popover-row"
                disabled={draftInput.trim().length === 0}
                onClick={() => setView("save")}
              >
                + Save current question as prompt
              </button>
            </>
          )}

          {view === "save" && (
            <div className="quick-actions-row__tag-form">
              <input
                type="text"
                className="quick-actions-row__tag-input"
                placeholder="Prompt title"
                aria-label="Prompt title"
                value={titleValue}
                onChange={(event) => setTitleValue(event.target.value)}
                autoFocus
              />
              <div className="quick-actions-row__tag-actions">
                <button type="button" className="quick-actions-row__tag-back" onClick={() => setView("list")}>
                  Back
                </button>
                <button
                  type="button"
                  className="quick-actions-row__tag-archive"
                  disabled={titleValue.trim().length === 0}
                  onClick={saveCurrentAsPrompt}
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
