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

export function TechniqueDropdown() {
  const techniques = useSessionStore((s) => s.techniques);
  const setTechniques = useSessionStore((s) => s.setTechniques);
  const [open, setOpen] = useState(false);
  const [staged, setStaged] = useState<TechniqueId[]>(techniques);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useFocusTrap<HTMLDivElement>(open);

  function closeWithoutApplying() {
    setStaged(techniques);
    setOpen(false);
  }

  useDismissableLayer(open, closeWithoutApplying);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      closeWithoutApplying();
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open, panelRef, techniques]);

  function toggleOpen() {
    setOpen((current) => {
      const next = !current;
      if (next) setStaged([...techniques]);
      return next;
    });
  }

  function chooseAutoDetect() {
    setStaged(["auto-detect"]);
  }

  function toggle(id: TechniqueId) {
    setStaged((current) => current.includes(id)
      ? deselectManualTechnique(current, id)
      : selectManualTechnique(current, id));
  }

  function apply() {
    setTechniques(staged.length ? staged : ["auto-detect"]);
    setOpen(false);
  }

  const auto = isAutoMode(staged);
  const manualCount = auto ? 0 : staged.length;

  return <div className="technique-field">
    <label id="technique-dropdown-label" className="technique-field__label">Technique</label>
    <div className="primitive-dropdown technique-dropdown">
      <button ref={triggerRef} type="button" className="surface-smoked-glass technique-dropdown__trigger" aria-haspopup="dialog" aria-expanded={open} aria-labelledby="technique-dropdown-label" onClick={toggleOpen}>
        {techniqueSummaryLabel(techniques)}
      </button>
    </div>

    {open && <div ref={panelRef} className="surface-smoked-glass technique-popover" role="dialog" aria-label="Choose techniques" data-testid="technique-popover">
      <div className="technique-popover__recommendation">
        <strong>Recommendation</strong>
        <span>Auto lets Divergence recommend up to {MAX_TECHNIQUE_STACK} techniques from the request. Nothing changes until Apply.</span>
      </div>
      <button type="button" role="radio" aria-checked={auto} className={`technique-popover__auto ${auto ? "technique-popover__auto--active" : ""}`} onClick={chooseAutoDetect}>
        Auto recommend{auto ? " ✓" : ""}
      </button>
      <p className="technique-popover__summary">
        {auto ? `Divergence will recommend up to ${MAX_TECHNIQUE_STACK} techniques for this request.` : `Selected (${manualCount}/${MAX_TECHNIQUE_STACK}): ${staged.map((id) => getTechnique(id).label).join(", ")}`}
      </p>
      <div className="technique-popover__list" role="group" aria-label="Manual technique choices">
        {MANUAL_TECHNIQUE_IDS.map((id) => {
          const technique = getTechnique(id);
          const checked = staged.includes(id);
          const verdict = checked ? { allowed: true } : canSelectManually(staged, id);
          return <label key={id} className={`technique-popover__row ${verdict.allowed ? "" : "technique-popover__row--disabled"}`} title={verdict.allowed ? technique.effect : verdict.reason}>
            <input type="checkbox" checked={checked} disabled={!verdict.allowed} onChange={() => toggle(id)} />
            <span className="technique-popover__row-label">{technique.label}</span>
            <span className="technique-popover__row-effect">{technique.effect}</span>
          </label>;
        })}
      </div>
      <div className="technique-popover__actions">
        <button type="button" onClick={closeWithoutApplying}>Cancel</button>
        <button type="button" className="primary" onClick={apply}>Apply</button>
      </div>
    </div>}
  </div>;
}
