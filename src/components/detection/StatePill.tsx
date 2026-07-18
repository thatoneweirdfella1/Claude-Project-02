import { Pill } from "../primitives";
import { capitalizeValue, type PillConfig } from "./pillOptions";

/* One state pill (Step 6.3) — "Label: Value" in the dimension's color
   (screenshot: purple Emotion, red RSD, green Interest, blue Cognitive Mode).
   Two independent controls, per CANON Feature 5 / PIPELINE.md: clicking the
   pill body opens a correction control (StatePill doesn't own that popover —
   StateDetectionPanel renders PillCorrector beside it); the small × dismisses
   just this one pill. Two siblings, not a nested button, since a <button>
   cannot contain another interactive element. */

export interface StatePillProps {
  config: PillConfig;
  value: string;
  correctionOpen: boolean;
  onOpenCorrection: () => void;
  onDismiss: () => void;
}

export function StatePill({ config, value, correctionOpen, onOpenCorrection, onDismiss }: StatePillProps) {
  return (
    <span className="state-pill" data-testid={`state-pill-${config.dimension}`}>
      <Pill
        color={config.colorVar}
        onClick={onOpenCorrection}
        aria-haspopup="true"
        aria-expanded={correctionOpen}
      >
        {config.label}: {capitalizeValue(value)}
      </Pill>
      <button
        type="button"
        className="state-pill__dismiss"
        aria-label={`Dismiss ${config.label} pill`}
        onClick={onDismiss}
      >
        ×
      </button>
    </span>
  );
}
