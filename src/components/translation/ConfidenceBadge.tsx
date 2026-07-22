import type { GateDecision } from "../../services/translation";

/* Confidence score badge (Step 2.3). Shows the translation confidence at the
   80+ and 60-79 gates. The score is always visible when the app proceeds
   (PIPELINE.md line 30: "80 and above proceeds and shows the score"). Color is
   token-driven per gate level (see translation.css) — neutral, never alarming
   (CANON ADHD Sensory rule). */

export function ConfidenceBadge({ gate }: { gate: GateDecision }) {
  return (
    <span
      className={`confidence-badge confidence-badge--${gate.level}`}
      data-testid="confidence-badge"
    >
      Confidence {gate.confidence}
    </span>
  );
}
