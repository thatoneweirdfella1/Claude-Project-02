import { useEffect, useState } from "react";
import type { StateDetectionResult } from "../../services/detection";

export type StateDetectionUiStatus = "idle" | "checking" | "no-change" | "recommendation" | "used" | "unavailable";

export interface StateDetectionStatusBarProps {
  detection?: StateDetectionResult | null;
  status?: StateDetectionUiStatus;
  onCorrect?: () => void;
}

const STATUS_LABEL: Record<StateDetectionUiStatus, string> = {
  idle: "State Detection — runs when you send",
  checking: "Checking state…",
  "no-change": "State checked — no change suggested",
  recommendation: "A response adjustment may help",
  used: "State used",
  unavailable: "State Detection unavailable",
};

const pretty = (value: string) => value === "low-energy"
  ? "Low-energy"
  : value.charAt(0).toUpperCase() + value.slice(1);

export function StateDetectionStatusBar({ detection, status = "idle", onCorrect }: StateDetectionStatusBarProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  useEffect(() => { if (!detection) setDetailsOpen(false); }, [detection]);

  return <div className={`state-detection-status is-${status}`}>
    <div className="state-detection-status__bar" role="status" aria-live="polite">
      <span>{STATUS_LABEL[status]}</span>
      {detection && status !== "checking" && <button type="button" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((open) => !open)}>{detailsOpen ? "Hide" : "Details"}</button>}
    </div>
    {detailsOpen && detection && <div className="state-detection-details surface-smoked-glass">
      <div className="state-review-chips" aria-label="Detected state values">
        {(["emotion", "rsd", "interest", "cognitive"] as const).map((dimension) => <div key={dimension} className="state-review-chip">
          <span>{dimension === "rsd" ? "RSD sensitivity" : dimension === "cognitive" ? "Cognitive Mode" : pretty(dimension)}</span>
          <strong>{detection[dimension] ? pretty(detection[dimension]!.value) : "No reading"}</strong>
        </div>)}
      </div>
      <p>{detection.summary}</p>
      {onCorrect && <button type="button" onClick={onCorrect}>Correct</button>}
    </div>}
  </div>;
}
