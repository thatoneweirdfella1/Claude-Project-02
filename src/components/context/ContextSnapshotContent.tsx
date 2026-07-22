import { useSessionStore } from "../../stores/sessionStore";
import {
  SNAPSHOT_KIND_LABELS,
  buildSnapshotItems,
  variableNameFromSnapshotId,
} from "./contextSnapshotItems";

/* Context Snapshot content (Step 7.5, restructured at Step 9.5) — CANON
   Feature 6: "A Context Snapshot panel shows loaded items with remove
   buttons." Reads session.context (files/URLs, Steps 7.1/7.3) and
   session.variables (Step 7.4) through the one pure buildSnapshotItems()
   helper, so both sources render as one flat list with a uniform remove-×
   affordance.

   Step 7.5 originally wrapped this in its own GlassPanel + "CONTEXT
   SNAPSHOT" title, rendered unconditionally always-expanded, EXPLICITLY
   waiting on Step 9.5's real accordion mechanic rather than inventing a
   one-off collapse/expand here (see that step's own DECISIONS). Step 9.5
   is that step: this file now exports content only — no wrapper, no
   title — because AccordionStack (components/layout/AccordionStack.tsx)
   owns ONE shared header/GlassPanel shell for Context Snapshot and its
   five sibling panels, so all six share identical revolving-door behavior
   rather than Context Snapshot having its own bespoke expand mechanic. The
   list/row/empty-state markup and CSS classes (context-snapshot-panel__*)
   are unchanged from Step 7.5, still styled by context-snapshot.css — only
   the outer GlassPanel+title are gone, superseded by AccordionStack's
   shell (same "old scaffolding superseded, not preserved" precedent as
   Step 5.2 removing ComposerSection/StreamingAnswerDemo). */

export function ContextSnapshotContent() {
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

  if (items.length === 0) {
    return <p className="context-snapshot-panel__empty">Nothing loaded yet.</p>;
  }

  return (
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
  );
}
