import { useEffect, useRef, useState } from "react";
import {
  canSelectManually,
  deselectManualTechnique,
  getTechnique,
  isAutoMode,
  selectManualTechnique,
} from "../../services/techniques";
import { useDismissableLayer, useFocusTrap } from "../../keyboard";
import { useSessionStore } from "../../stores/sessionStore";
import type { TechniqueId } from "../../stores/types";
import { MANUAL_TECHNIQUE_IDS, MAX_TECHNIQUE_STACK, techniqueSummaryLabel } from "./techniqueOptions";

/* Technique dropdown (Step 4.5) — CANON LAYOUT's center-column "Technique"
   control, the third dropdown alongside Model (3.2) and Directness (4.4).

   CLOSED STATE matches the screenshot exactly: a trigger styled identically to
   the Model/Directness native <select>s (same .primitive-dropdown visual —
   glass background, cyan chevron), showing one summary value ("Auto-detect" or
   a technique label). It is a <button>, not a real <select>, because — unlike
   Model/Directness — this control's OPEN state must support genuine manual
   MULTI-select (up to MAX_TECHNIQUE_STACK), which a native select cannot
   represent; the screenshot only shows the closed state, so nothing here
   contradicts it (Step 1.4's Dropdown primitive decision anticipated exactly
   this: "a feature step needing a richer listbox... builds on top of this
   rather than this primitive being replaced").

   The popover reuses the Step 1.9 keyboard framework — its first real
   consumer: useFocusTrap traps Tab inside while open and returns focus to this
   trigger on close; useDismissableLayer makes Escape close it (topmost-layer
   semantics, so a future nested overlay still closes correctly). */

export function TechniqueDropdown() {
  const techniques = useSessionStore((s) => s.techniques);
  const setTechniques = useSessionStore((s) => s.setTechniques);

  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useFocusTrap<HTMLDivElement>(open);

  useDismissableLayer(open, () => setOpen(false));

  // Close on an outside click (Escape and focus-trap-release are handled by
  // the keyboard framework above; this adds the mouse-side dismiss).
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, panelRef]);

  function chooseAutoDetect() {
    setTechniques(["auto-detect"]);
    setOpen(false);
  }

  function toggle(id: TechniqueId) {
    if (techniques.includes(id)) {
      setTechniques(deselectManualTechnique(techniques, id));
    } else {
      setTechniques(selectManualTechnique(techniques, id));
    }
  }

  const auto = isAutoMode(techniques);
  const manualCount = auto ? 0 : techniques.length;

  return (
    <div className="technique-field">
      <label id="technique-dropdown-label" className="technique-field__label">
        Technique
      </label>
      <div className="primitive-dropdown technique-dropdown">
        <button
          ref={triggerRef}
          type="button"
          className="surface-smoked-glass technique-dropdown__trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-labelledby="technique-dropdown-label"
          onClick={() => setOpen((o) => !o)}
        >
          {techniqueSummaryLabel(techniques)}
        </button>
      </div>

      {open && (
        <div
          ref={panelRef}
          className="surface-smoked-glass technique-popover"
          role="menu"
          aria-label="Choose techniques"
          data-testid="technique-popover"
        >
          <button
            type="button"
            role="menuitemradio"
            aria-checked={auto}
            className={`technique-popover__auto ${auto ? "technique-popover__auto--active" : ""}`}
            onClick={chooseAutoDetect}
          >
            Auto-detect{auto ? " ✓" : ""}
          </button>

          <p className="technique-popover__summary">
            {auto
              ? "Picks up to " + MAX_TECHNIQUE_STACK + " techniques automatically for each question."
              : `Selected (${manualCount}/${MAX_TECHNIQUE_STACK}): ${techniques
                  .map((id) => getTechnique(id).label)
                  .join(", ")}`}
          </p>

          <div className="technique-popover__list" role="group" aria-label="Manual technique choices">
            {MANUAL_TECHNIQUE_IDS.map((id) => {
              const technique = getTechnique(id);
              const checked = techniques.includes(id);
              const verdict = checked ? { allowed: true } : canSelectManually(techniques, id);
              return (
                <label
                  key={id}
                  className={`technique-popover__row ${verdict.allowed ? "" : "technique-popover__row--disabled"}`}
                  title={verdict.allowed ? technique.effect : verdict.reason}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={!verdict.allowed}
                    onChange={() => toggle(id)}
                  />
                  <span className="technique-popover__row-label">{technique.label}</span>
                  <span className="technique-popover__row-effect">{technique.effect}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
