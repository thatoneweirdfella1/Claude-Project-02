import { useEffect, useState } from "react";
import type { StateDetectionResult } from "../../services/detection";
import type { DirectnessLevel } from "../../stores/types";
import { StateDetectionPanel, type PillDimension } from "./StateDetectionPanel";

export interface StateDetectionStatusBarProps {
  detection?: StateDetectionResult | null;
  detecting?: boolean;
  suggestedDirectness?: DirectnessLevel | null;
  onCorrectState?: (dimension: PillDimension, value: string) => void;
  onApplyDirectness?: () => void;
}

export function StateDetectionStatusBar({ detection, detecting = false, suggestedDirectness = null, onCorrectState, onApplyDirectness }: StateDetectionStatusBarProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  useEffect(() => { if (!detection) setDetailsOpen(false); }, [detection]);

  const label = detecting
    ? "Checking state…"
    : detection
      ? suggestedDirectness
        ? "State checked · recommendation available"
        : "State checked · no silent changes"
      : "State Detection runs when you send";

  return <div className={"state-detection-status " + (detecting ? "is-checking" : detection ? "is-ready" : "is-idle")}>
    <div className="state-detection-status__bar" role="status" aria-live="polite">
      <span>{label}</span>
      {detection && <button type="button" onClick={() => setDetailsOpen((open) => !open)}>{detailsOpen ? "Hide" : "Details"}</button>}
    </div>
    {detailsOpen && detection && <StateDetectionPanel result={detection} onCorrect={onCorrectState} suggestedDirectness={suggestedDirectness} onApplyDirectness={onApplyDirectness} />}
  </div>;
}
