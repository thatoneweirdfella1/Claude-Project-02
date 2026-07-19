import { useEffect, useRef, useState, type ReactNode } from "react";
import { BookOpen } from "lucide-react";
import { GlassButton } from "../primitives";
import { useDismissableLayer } from "../../keyboard";
import { DEFAULT_TEMPLATES, useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import type { PromptTemplate } from "../../stores/types";

// ADHD-AUDIT D1 (Step 11.5): the three shipped presets are deletable but not
// user-recreatable — Reset to defaults only restores visibility, not
// templates. Excluding their ids from the remove control avoids an
// unrecoverable loss without adding a confirm dialog or a new "restore"
// feature the audit didn't specify.
const DEFAULT_TEMPLATE_IDS = new Set(DEFAULT_TEMPLATES.map((t) => t.id));

/* Load Template (Step 9.2) — CANON Feature 11: "pre-populate model,
   directness, technique, optional context and starter question." Reads/
   writes accountStore.templates (Step 9.2 STORE ADD, seeded with a few
   built-in presets — DEFAULT_TEMPLATES, accountStore.ts — so the picker
   isn't empty before any user has saved one of their own).

   Loading a template does NOT clear the current conversation (unlike New
   Session) — CANON describes it purely as "pre-populate," so it applies on
   top of whatever's already there: model/directness/techniques are set
   outright, any template context items are ADDED (not a replace — they
   have their own ids), and a starterQuestion (if present) replaces
   draftInput, ready for the user to send or edit. */

function newTemplateId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `template-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

type View = "list" | "save";

export interface LoadTemplateMenuProps {
  /** Step 9.6 — Quick Tools' Prompt Library tile ("save/load prompt
      templates," the exact same feature Feature 12 names) reuses this
      component wholesale rather than rebuilding a second destination for
      the same data, same "one screen not two" precedent CANON states
      explicitly for Dashboard. Supplying this swaps only the trigger's
      look (a grid tile instead of a composer-row button); the popover
      content, state, and every store call are 100% shared, unchanged. */
  renderTrigger?: (props: { open: boolean; onClick: () => void }) => ReactNode;
}

export function LoadTemplateMenu({ renderTrigger }: LoadTemplateMenuProps = {}) {
  const templates = useAccountStore((s) => s.templates);
  const addTemplate = useAccountStore((s) => s.addTemplate);
  const removeTemplate = useAccountStore((s) => s.removeTemplate);
  const setModel = useSessionStore((s) => s.setModel);
  const setDirectness = useSessionStore((s) => s.setDirectness);
  const setTechniques = useSessionStore((s) => s.setTechniques);
  const addContextItem = useSessionStore((s) => s.addContextItem);
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

  function loadTemplate(template: PromptTemplate): void {
    setModel(template.model);
    setDirectness(template.directness);
    setTechniques(template.techniques);
    for (const item of template.context ?? []) addContextItem(item);
    if (template.starterQuestion) setDraftInput(template.starterQuestion);
    closePopover();
  }

  function saveCurrentAsTemplate(): void {
    const title = titleValue.trim();
    if (title.length === 0) return;
    const current = useSessionStore.getState();
    addTemplate({
      id: newTemplateId(),
      title,
      model: current.model,
      directness: current.directness,
      techniques: current.techniques,
    });
    closePopover();
  }

  return (
    <div ref={rootRef} className="quick-actions-row__more">
      {renderTrigger ? (
        renderTrigger({ open, onClick: toggle })
      ) : (
        <GlassButton aria-expanded={open} aria-haspopup="menu" onClick={toggle}>
          <BookOpen size={16} aria-hidden="true" />
          Load Template
        </GlassButton>
      )}

      {open && (
        <div className="quick-actions-row__popover" role="menu">
          {view === "list" && (
            <>
              <p className="quick-actions-row__popover-title">Templates</p>
              {templates.length === 0 && (
                <p className="quick-actions-row__popover-empty">No templates yet.</p>
              )}
              {templates.map((template) => (
                <div key={template.id} className="quick-actions-row__list-row">
                  <button
                    type="button"
                    role="menuitem"
                    className="quick-actions-row__popover-row"
                    onClick={() => loadTemplate(template)}
                  >
                    {template.title}
                  </button>
                  {!DEFAULT_TEMPLATE_IDS.has(template.id) && (
                    <button
                      type="button"
                      className="quick-actions-row__list-remove"
                      aria-label={`Delete template ${template.title}`}
                      onClick={() => removeTemplate(template.id)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                role="menuitem"
                className="quick-actions-row__popover-row"
                onClick={() => setView("save")}
              >
                + Save current settings as template
              </button>
            </>
          )}

          {view === "save" && (
            <div className="quick-actions-row__tag-form">
              <input
                type="text"
                className="quick-actions-row__tag-input"
                placeholder="Template name"
                aria-label="Template name"
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
                  onClick={saveCurrentAsTemplate}
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
