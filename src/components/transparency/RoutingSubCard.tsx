import type { TelemetryEntry } from "../../services/telemetry";

/* Routing sub-card (Step 8.2) — CANON Feature 8: "Routing (model, complexity
   score, domain, scope)"; this step's own text adds "whether extended
   thinking was applied, and any downgrade or escalation note" — the full
   audit trail routing.js already produces (ROUTING.md), read straight off
   the latest TelemetryEntry rather than re-deriving anything. */

export interface RoutingSubCardProps {
  entry: TelemetryEntry;
}

function capitalize(value: string): string {
  return value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

export function RoutingSubCard({ entry }: RoutingSubCardProps) {
  const reached = entry.model !== null;

  return (
    <div className="transparency-subcard" data-testid="routing-subcard">
      <p className="transparency-subcard__title">Routing</p>
      {!reached ? (
        <p className="transparency-subcard__empty">Not reached this turn.</p>
      ) : (
        <>
          <dl className="transparency-subcard__list">
            <div className="transparency-subcard__row">
              <dt>Model</dt>
              <dd>{entry.model}</dd>
            </div>
            <div className="transparency-subcard__row">
              <dt>Complexity</dt>
              <dd>{entry.complexity}</dd>
            </div>
            <div className="transparency-subcard__row">
              <dt>Domain</dt>
              <dd>{entry.domain ? capitalize(entry.domain) : "—"}</dd>
            </div>
            <div className="transparency-subcard__row">
              <dt>Scope</dt>
              <dd>{entry.scope ? capitalize(entry.scope) : "—"}</dd>
            </div>
            <div className="transparency-subcard__row">
              <dt>Extended thinking</dt>
              <dd>{entry.thinkingApplied ? "Applied" : "Not applied"}</dd>
            </div>
          </dl>
          {(entry.downgraded || entry.notes.length > 0) && (
            <div className="transparency-subcard__notes">
              {entry.notes.map((note) => (
                <p key={note} className="transparency-subcard__note">
                  {note}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
