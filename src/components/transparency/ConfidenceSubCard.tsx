import type { ConfidenceBreakdown } from "../../services/telemetry";

/* Confidence sub-card (Step 8.2) — CANON Feature 8: "Confidence (translation,
   routing, technique, overall)." The four values come from
   deriveConfidenceBreakdown (services/telemetry/confidence.ts); this
   component only renders whatever it returns, null entries included. */

export interface ConfidenceSubCardProps {
  breakdown: ConfidenceBreakdown;
}

const ROWS: { key: keyof ConfidenceBreakdown; label: string }[] = [
  { key: "translation", label: "Translation" },
  { key: "routing", label: "Routing" },
  { key: "technique", label: "Technique" },
  { key: "overall", label: "Overall" },
];

export function ConfidenceSubCard({ breakdown }: ConfidenceSubCardProps) {
  return (
    <div className="transparency-subcard" data-testid="confidence-subcard">
      <p className="transparency-subcard__title">Confidence</p>
      <dl className="transparency-subcard__list">
        {ROWS.map(({ key, label }) => (
          <div key={key} className="transparency-subcard__row">
            <dt>{label}</dt>
            <dd>{breakdown[key] === null ? "—" : `${Math.round(breakdown[key]!)}%`}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
