import { useState } from "react";
import { GlassButton, GlassCard } from "../primitives";
import { deriveConfidenceBreakdown } from "../../services/telemetry";
import { useLatestTelemetry } from "./useLatestTelemetry";
import { RoutingSubCard } from "./RoutingSubCard";
import { TechniquesSubCard } from "./TechniquesSubCard";
import { ConfidenceSubCard } from "./ConfidenceSubCard";

/* TRANSPARENCY DETAILS (Step 8.2) — CANON Feature 8: "An expandable card with
   three sub-cards: Routing, Techniques, Confidence. The user always sees
   what the app decided and why. Never a black box." Matches the screenshot's
   collapsed composer-footer control (icon + label + chevron); expand/collapse
   here is this control's own, real interaction — distinct from the
   right-column accordion stack Step 9.5 ("Revolving-door accordions") owns,
   which names a specific six-panel list that does not include this control.

   Reads the most recently recorded TelemetryEntry (Step 5.4's log) — the
   step's own instruction is "reading from telemetry." Nothing here computes
   routing or technique decisions; it only displays what already happened. */

export function TransparencyCard() {
  const [expanded, setExpanded] = useState(false);
  const entry = useLatestTelemetry();

  return (
    <div className="transparency-card" data-testid="transparency-card">
      <GlassButton
        className="transparency-card__toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <span className="transparency-card__toggle-label">
          <span aria-hidden="true">ⓘ</span> TRANSPARENCY DETAILS
        </span>
        <span aria-hidden="true" className="transparency-card__chevron">
          {expanded ? "︿" : "⌄"}
        </span>
      </GlassButton>

      {expanded && (
        <GlassCard className="transparency-card__body" data-testid="transparency-card-body">
          {entry ? (
            <>
              <RoutingSubCard entry={entry} />
              <TechniquesSubCard entry={entry} />
              <ConfidenceSubCard breakdown={deriveConfidenceBreakdown(entry)} />
            </>
          ) : (
            <p className="transparency-card__empty">Nothing to show yet.</p>
          )}
        </GlassCard>
      )}
    </div>
  );
}
