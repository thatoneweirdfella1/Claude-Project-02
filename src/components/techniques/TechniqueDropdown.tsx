import { useEffect, useRef, useState } from "react";
import {
  autoDetectTechniques,
  autoDetectWithPinned,
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
  const draft = useSessionStore((s) => s.draftInput);
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

  function toggleAutoRecommend() {
    setStaged((current) => current.includes("auto-detect")
      ? current.filter((id) => id !== "auto-detect")
      : ["auto-detect", ...current.filter((id) => id !== "auto-detect")]);
  }

  function toggle(id: TechniqueId) {
    setStaged((current) => {
      const autoEnabled = current.includes("auto-detect");
      const manual = current.filter((item) => item !== "auto-detect");
      const nextManual = manual.includes(id)
        ? deselectManualTechnique(manual, id).filter((item) => item !== "auto-detect")
        : selectManualTechnique(manual, id);
      return autoEnabled ? ["auto-detect", ...nextManual] : nextManual;
    });
  }

  function apply() {
    if (staged.length === 0) return;
    setTechniques(staged);
    setOpen(false);
  }

  const auto = isAutoMode(staged);
  const manual = staged.filter((id) => id !== "auto-detect");
  const manualCount = manual.length;
  const recommendation = autoDetectTechniques(draft);
  const recommendedId = recommendation.selected[0];
  const recommended = getTechnique(recommendedId);
  const recommendedScore = recommendation.scores.find((score) => score.id === recommendedId);
  const recommendationReason = recommendedScore?.reasons.find((reason) => reason !== "default")
    ?? "it is the safest starting point for an open-ended request";
  const effective = auto
    ? autoDetectWithPinned(draft, manual)
    : null;

  return <div className="technique-field">
    <label id="technique-dropdown-label" className="technique-field__label">Technique</label>
    <div className="primitive-dropdown technique-dropdown">
      <button ref={triggerRef} type="button" className="surface-smoked-glass technique-dropdown__trigger" aria-haspopup="dialog" aria-expanded={open} aria-labelledby="technique-dropdown-label" onClick={toggleOpen}>
        {techniqueSummaryLabel(
          techniques,
          isAutoMode(techniques)
            ? autoDetectWithPinned(draft, techniques.filter((id) => id !== "auto-detect")).selected
            : undefined,
        )}
      </button>
    </div>

    {open && <div ref={panelRef} className="surface-smoked-glass technique-popover" role="dialog" aria-label="Choose techniques" data-testid="technique-popover">
      <div className="technique-popover__recommendation">
        <strong>Recommended: {recommended.label}</strong>
        <span>{`This fits because ${recommendationReason}. Nothing changes until Apply.`}</span>
      </div>
      <button type="button" role="switch" aria-checked={auto} className={`technique-popover__auto ${auto ? "technique-popover__auto--active" : ""}`} onClick={toggleAutoRecommend}>
        Auto recommend: {auto ? "On" : "Off"}
      </button>
      <p className="technique-popover__summary">
        {auto
          ? `Will use (${effective?.selected.length ?? 0}/${MAX_TECHNIQUE_STACK}): ${effective?.selected.map((id) => getTechnique(id).label).join(", ")}. Manually checked choices stay selected.`
          : manualCount > 0
            ? `Selected (${manualCount}/${MAX_TECHNIQUE_STACK}): ${manual.map((id) => getTechnique(id).label).join(", ")}`
            : "Choose at least one technique or turn Auto recommend on."}
      </p>
      <div className="technique-popover__list" role="group" aria-label="Manual technique choices">
        {MANUAL_TECHNIQUE_IDS.map((id) => {
          const technique = getTechnique(id);
          const checked = staged.includes(id);
          const verdict = checked ? { allowed: true } : canSelectManually(manual, id);
          return <label key={id} className={`technique-popover__row ${verdict.allowed ? "" : "technique-popover__row--disabled"}`} title={verdict.allowed ? technique.effect : verdict.reason}>
            <input type="checkbox" checked={checked} disabled={!verdict.allowed} onChange={() => toggle(id)} />
            <span className="technique-popover__row-label">{technique.label}</span>
            <span className="technique-popover__row-effect">{technique.effect}</span>
          </label>;
        })}
      </div>
      <div className="technique-popover__actions">
        <button type="button" onClick={closeWithoutApplying}>Cancel</button>
        <button type="button" className="primary" disabled={staged.length === 0} onClick={apply}>Apply</button>
      </div>
    </div>}
  </div>;
}
