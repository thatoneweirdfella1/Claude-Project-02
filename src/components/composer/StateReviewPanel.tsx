import { useState } from "react";
import {
  COGNITIVE_MODES,
  EMOTION_STATES,
  INTEREST_LEVELS,
  RSD_LEVELS,
  type StateDetectionResult,
} from "../../services/detection";

export interface StateReviewPanelProps {
  initial: StateDetectionResult;
  recommendationChanges?: string[];
  initialMode?: "recommendation" | "correct";
  onAccept: (result: StateDetectionResult, remember: boolean) => void;
  onKeepCurrent: (remember: boolean) => void;
  onDismiss: (remember: boolean) => void;
  onCorrectionCancel?: () => void;
}

const DISPLAY_LABEL: Record<string, string> = {
  "low-energy": "Low-energy",
  rsd: "RSD sensitivity",
  cognitive: "Cognitive Mode",
};
const pretty = (value: string) => DISPLAY_LABEL[value] ?? value.charAt(0).toUpperCase() + value.slice(1);

export function StateReviewPanel({
  initial,
  recommendationChanges = [],
  initialMode = "recommendation",
  onAccept,
  onKeepCurrent,
  onDismiss,
  onCorrectionCancel,
}: StateReviewPanelProps) {
  const [mode, setMode] = useState<"recommendation" | "correct">(initialMode);
  const [result, setResult] = useState(initial);
  const [remember, setRemember] = useState(false);
  const [applying, setApplying] = useState(false);

  const update = (key: "emotion" | "rsd" | "interest" | "cognitive", value: string) => {
    setResult((current) => ({ ...current, [key]: value ? { value, confidence: 100 } : null } as StateDetectionResult));
  };

  function commit(action: () => void) {
    if (applying) return;
    setApplying(true);
    action();
  }

  function cancelCorrection() {
    setResult(initial);
    if (initialMode === "correct") onCorrectionCancel?.();
    else setMode("recommendation");
  }

  return <div className="workflow-dialog" role="dialog" aria-modal="true" aria-labelledby="state-review-title">
    <div className="workflow-dialog__card surface-smoked-glass state-review-dialog">
      <header>
        <div>
          <h2 id="state-review-title">{mode === "correct" ? "Correct State Detection" : "State change suggested"}</h2>
          <p>Request-scoped communication support. Nothing changes unless you choose it.</p>
        </div>
        {mode === "recommendation" && <button
          type="button"
          className="state-review-dismiss"
          aria-label="Dismiss and continue with current settings"
          disabled={applying}
          onClick={() => commit(() => onDismiss(remember))}
        >×</button>}
      </header>
      <p className="workflow-dialog__summary">{result.summary}</p>

      {mode === "recommendation" ? <>
        <div className="state-review-chips" aria-label="Detected state values">
          {(["emotion", "rsd", "interest", "cognitive"] as const).map((key) => {
            const reading = result[key];
            return <div key={key} className="state-review-chip"><span>{pretty(key)}</span><strong>{reading ? pretty(reading.value) : "No reading"}</strong></div>;
          })}
        </div>
        <div className="state-review-adjustments" aria-label="Recommended adjustments">
          <strong>Recommended for this request</strong>
          <ul>{recommendationChanges.map((change) => <li key={change}>{change}</li>)}</ul>
        </div>
      </> : <div className="state-review-grid">
        <label><span>Emotion</span><select value={result.emotion?.value ?? ""} onChange={(e) => update("emotion", e.target.value)}><option value="">No reading</option>{EMOTION_STATES.map((v) => <option key={v} value={v}>{pretty(v)}</option>)}</select></label>
        <label><span>RSD sensitivity</span><select value={result.rsd?.value ?? ""} onChange={(e) => update("rsd", e.target.value)}><option value="">No reading</option>{RSD_LEVELS.map((v) => <option key={v} value={v}>{pretty(v)}</option>)}</select></label>
        <label><span>Interest</span><select value={result.interest?.value ?? ""} onChange={(e) => update("interest", e.target.value)}><option value="">No reading</option>{INTEREST_LEVELS.map((v) => <option key={v} value={v}>{pretty(v)}</option>)}</select></label>
        <label><span>Cognitive Mode</span><select value={result.cognitive?.value ?? ""} onChange={(e) => update("cognitive", e.target.value)}><option value="">No reading</option>{COGNITIVE_MODES.map((v) => <option key={v} value={v}>{pretty(v)}</option>)}</select></label>
      </div>}

      <label className="state-review-remember">
        <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
        Remember for a similar situation
      </label>

      <footer className="workflow-dialog__actions">
        {mode === "correct" ? <>
          <button type="button" disabled={applying} onClick={cancelCorrection}>Cancel</button>
          <button type="button" className="primary" disabled={applying} onClick={() => commit(() => onAccept(result, remember))}>{applying ? "Applying…" : "Save & Continue"}</button>
        </> : <>
          <button type="button" disabled={applying} onClick={() => setMode("correct")}>Correct</button>
          <button type="button" disabled={applying} onClick={() => commit(() => onKeepCurrent(remember))}>Keep Current & Continue</button>
          <button type="button" className="primary" disabled={applying} onClick={() => commit(() => onAccept(result, remember))}>{applying ? "Applying…" : "Accept & Continue"}</button>
        </>}
      </footer>
    </div>
  </div>;
}
