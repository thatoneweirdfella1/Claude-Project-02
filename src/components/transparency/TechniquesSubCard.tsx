import { getTechnique } from "../../services/techniques";
import type { TelemetryEntry } from "../../services/telemetry";

/* Techniques sub-card (Step 8.2) — CANON Feature 8: "Techniques (which
   applied and why)." "Which" is entry.techniques (Stage 3's selected ids,
   shown by label via the registry, same as everywhere else technique names
   render); "why" is entry.techniqueReasoning verbatim — the one-liner
   autoDetect.ts / resolveTechniqueSelection already build "for transparency"
   (autoDetect.ts's own doc comment), not a second explanation invented here. */

export interface TechniquesSubCardProps {
  entry: TelemetryEntry;
}

export function TechniquesSubCard({ entry }: TechniquesSubCardProps) {
  const reached = entry.techniques !== null;

  return (
    <div className="transparency-subcard" data-testid="techniques-subcard">
      <p className="transparency-subcard__title">Techniques</p>
      {!reached ? (
        <p className="transparency-subcard__empty">Not reached this turn.</p>
      ) : (
        <>
          <ul className="transparency-subcard__techniques">
            {entry.techniques!.map((id) => (
              <li key={id}>{getTechnique(id).label}</li>
            ))}
          </ul>
          {entry.techniqueReasoning && (
            <p className="transparency-subcard__reasoning">{entry.techniqueReasoning}</p>
          )}
        </>
      )}
    </div>
  );
}
