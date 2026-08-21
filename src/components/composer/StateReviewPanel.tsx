import { useState } from "react";
import type { CognitiveMode, InterestLevel, RsdLevel } from "../../stores/types";
import {
  COGNITIVE_MODES,
  EMOTION_STATES,
  INTEREST_LEVELS,
  RSD_LEVELS,
  type StateDetectionResult,
} from "../../services/detection";

export interface StateReviewPanelProps {
  initial: StateDetectionResult;
  intent?: "manual" | "send";
  paid?: boolean;
  onAccept: (result: StateDetectionResult) => void;
  onKeepCurrent: () => void;
  onDismiss: () => void;
  onCancel: () => void;
}

export function StateReviewPanel({
  initial,
  intent = "manual",
  paid = false,
  onAccept,
  onKeepCurrent,
  onDismiss,
  onCancel,
}: StateReviewPanelProps) {
  const [result, setResult] = useState(initial);
  const sending = intent === "send";
  const update = (key: "emotion" | "rsd" | "interest" | "cognitive", value: string) => {
    setResult((current) => ({ ...current, [key]: value ? { value, confidence: 100 } : null } as StateDetectionResult));
  };
  return <div className="workflow-dialog" role="dialog" aria-modal="true" aria-labelledby="state-review-title">
    <div className="workflow-dialog__card surface-smoked-glass">
      <header>
        <h2 id="state-review-title">State Detection</h2>
        <p>{paid ? "Paid AI reading. Nothing changes until you approve it." : "Private local reading. Nothing was sent to an AI."}</p>
      </header>
      <p className="workflow-dialog__summary">{result.summary}</p>
      <div className="state-review-grid">
        <label><span>Emotion</span><select value={result.emotion?.value ?? ""} onChange={(e) => update("emotion", e.target.value)}><option value="">No reading</option>{EMOTION_STATES.map((v) => <option key={v}>{v}</option>)}</select></label>
        <label><span>RSD level</span><select value={result.rsd?.value ?? ""} onChange={(e) => update("rsd", e.target.value as RsdLevel)}><option value="">No reading</option>{RSD_LEVELS.map((v) => <option key={v}>{v}</option>)}</select></label>
        <label><span>Interest</span><select value={result.interest?.value ?? ""} onChange={(e) => update("interest", e.target.value as InterestLevel)}><option value="">No reading</option>{INTEREST_LEVELS.map((v) => <option key={v}>{v}</option>)}</select></label>
        <label><span>Cognitive mode</span><select value={result.cognitive?.value ?? ""} onChange={(e) => update("cognitive", e.target.value as CognitiveMode)}><option value="">No reading</option>{COGNITIVE_MODES.map((v) => <option key={v}>{v}</option>)}</select></label>
      </div>
      <footer className="workflow-dialog__actions">
        <button type="button" onClick={onCancel}>Back</button>
        <button type="button" onClick={onDismiss}>{sending ? "Dismiss & Send" : "Dismiss reading"}</button>
        <button type="button" onClick={onKeepCurrent}>{sending ? "Keep Current & Send" : "Keep current"}</button>
        <button type="button" className="primary" onClick={() => onAccept(result)}>{sending ? "Apply & Send" : "Apply to Message"}</button>
      </footer>
    </div>
  </div>;
}

