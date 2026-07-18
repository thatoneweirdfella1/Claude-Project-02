import { GlassPanel } from "../primitives";
import { useSessionStore } from "../../stores/sessionStore";
import {
  SNAPSHOT_KIND_LABELS,
  buildSnapshotItems,
  variableNameFromSnapshotId,
} from "./contextSnapshotItems";

/* Context Snapshot panel (Step 7.5) — CANON Feature 6: "A Context Snapshot
   panel shows loaded items with remove buttons." Reads session.context
   (files/URLs, Steps 7.1/7.3) and session.variables (Step 7.4) through the
   one pure buildSnapshotItems() helper, so both sources render as one flat
   list with a uniform remove-× affordance.

   The screenshot (CANON's LAYOUT: right column, 300px, "the accordion stack
   ... Context Snapshot") only ever shows this as a COLLAPSED row with a ">"
   chevron — no expanded state is visible in any frame, so this component's
   internal layout (list + remove ×) is a reasonable, CANON-consistent build
   from the written spec, not a pixel-matched copy (same "screenshot shows
   the closed state only" situation as the Model/Directness/Technique
   dropdowns, Steps 3.2/4.4/4.5).

   Rendered ALWAYS EXPANDED, not wrapped in real accordion collapse/expand
   behavior — that revolving-door mechanic is explicitly Step 9.5's job
   ("Revolving-door accordions"); building a one-off interaction here would
   risk inventing something 9.5 then has to rebuild around. Same "real
   content now, the fancier interactive shell is a later step's job"
   precedent as the State Detection panel (Step 6.3, built as an
   always-visible card before Phase 9 existed). Visibility-toggle wiring
   (CANON Feature 12: Context Snapshot defaults ON) is Step 9.4's job; since
   ON is the default, rendering unconditionally is correct today, not a
   contradiction (the opposite of Quick Tools' OFF default, which is why
   THAT placeholder stays hidden — see Step 1.5's DECISIONS). */

export function ContextSnapshotPanel() {
  const context = useSessionStore((s) => s.context);
  const variables = useSessionStore((s) => s.variables);
  const removeContextItem = useSessionStore((s) => s.removeContextItem);
  const removeSessionVariable = useSessionStore((s) => s.removeSessionVariable);

  const items = buildSnapshotItems(context, variables);

  function handleRemove(id: string) {
    const variableName = variableNameFromSnapshotId(id);
    if (variableName !== null) {
      removeSessionVariable(variableName);
    } else {
      removeContextItem(id);
    }
  }

  return (
    <GlassPanel className="context-snapshot-panel" data-testid="context-snapshot-panel">
      <p className="context-snapshot-panel__title">CONTEXT SNAPSHOT</p>

      {items.length === 0 ? (
        <p className="context-snapshot-panel__empty">Nothing loaded yet.</p>
      ) : (
        <ul className="context-snapshot-panel__list">
          {items.map((item) => (
            <li key={item.id} className="context-snapshot-panel__row">
              <div className="context-snapshot-panel__row-text">
                <span className="context-snapshot-panel__row-kind">{SNAPSHOT_KIND_LABELS[item.kind]}</span>
                <span className="context-snapshot-panel__row-label">{item.label}</span>
                <span className="context-snapshot-panel__row-detail">{item.detail}</span>
              </div>
              <button
                type="button"
                className="context-snapshot-panel__row-remove"
                aria-label={`Remove ${item.label} from context`}
                onClick={() => handleRemove(item.id)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </GlassPanel>
  );
}
