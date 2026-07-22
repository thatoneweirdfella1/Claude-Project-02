import { capitalizeValue, type PillConfig } from "./pillOptions";

/* The "small correction control" PIPELINE.md / this step calls for — opened
   by clicking a pill. Offers this dimension's other valid values; picking one
   calls onSelect (StateDetectionPanel updates the displayed pill immediately
   AND calls its own onCorrect prop). Recording the correction for the 15+
   threshold learning loop is explicitly Step 6.4's job, not this component's —
   this control only lets the user say what's actually true right now.

   Keyboard: real <button role="menuitemradio"> options, naturally Tab-
   reachable in DOM order. Escape-to-close and outside-click are handled once,
   at the StateDetectionPanel level (not per-corrector) — "Adjust" can open all
   four at once, and trapping focus into four simultaneous regions isn't
   sensible, so no useFocusTrap here (a deliberate, narrower scope than the
   single-popover TechniqueDropdown precedent, Step 4.5). */

export interface PillCorrectorProps {
  config: PillConfig;
  currentValue: string;
  onSelect: (value: string) => void;
}

export function PillCorrector({ config, currentValue, onSelect }: PillCorrectorProps) {
  return (
    <div
      className="pill-corrector"
      role="menu"
      aria-label={`Correct ${config.label}`}
      data-testid={`pill-corrector-${config.dimension}`}
    >
      <p className="pill-corrector__prompt">Not quite right? Pick what fits better:</p>
      <div className="pill-corrector__options" role="group">
        {config.values.map((value) => (
          <button
            key={value}
            type="button"
            role="menuitemradio"
            aria-checked={value === currentValue}
            className={`pill-corrector__option ${
              value === currentValue ? "pill-corrector__option--active" : ""
            }`}
            onClick={() => onSelect(value)}
          >
            {capitalizeValue(value)}
          </button>
        ))}
      </div>
    </div>
  );
}
