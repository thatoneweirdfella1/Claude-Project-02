import { useState } from "react";
import { useSessionStore } from "../../stores/sessionStore";
import { ContextManagerDialog, isContextIncluded, setContextIncluded } from "./ContextManagerDialog";
import {
  SNAPSHOT_KIND_LABELS,
  buildSnapshotItems,
  variableNameFromSnapshotId,
} from "./contextSnapshotItems";

export function ContextSnapshotContent() {
  const context = useSessionStore((s) => s.context);
  const variables = useSessionStore((s) => s.variables);
  const removeContextItem = useSessionStore((s) => s.removeContextItem);
  const removeSessionVariable = useSessionStore((s) => s.removeSessionVariable);
  const [managerOpen, setManagerOpen] = useState(false);
  const items = buildSnapshotItems(context, variables);
  const activeCount = context.filter(isContextIncluded).length + Object.keys(variables).length;
  const names = [
    ...context.filter(isContextIncluded).map((item) => item.label),
    ...Object.keys(variables).map((name) => `$${name}`),
  ];

  function handleRemove(id: string) {
    const variableName = variableNameFromSnapshotId(id);
    if (variableName !== null) removeSessionVariable(variableName);
    else removeContextItem(id);
  }

  return <>
    <div className="context-snapshot-panel__summary">
      <strong>{activeCount} active</strong>
      <span>{names.length ? names.slice(0, 3).join(", ") + (names.length > 3 ? ` +${names.length - 3}` : "") : "Nothing loaded yet."}</span>
      <div>
        <button type="button" onClick={() => setManagerOpen(true)}>Manage context</button>
        {items.length > 0 && <button type="button" onClick={() => setManagerOpen(true)}>View All</button>}
      </div>
    </div>

    {items.length > 0 && <ul className="context-snapshot-panel__list">
      {items.slice(0, 4).map((item) => (
        <li key={item.id} className="context-snapshot-panel__row">
          <div className="context-snapshot-panel__row-text">
            <span className="context-snapshot-panel__row-kind">{SNAPSHOT_KIND_LABELS[item.kind]}</span>
            <span className="context-snapshot-panel__row-label">{item.label}</span>
            <span className="context-snapshot-panel__row-detail">
              {item.fileType ? `${item.fileType} · ` : ""}{item.detail}{item.provenance ? ` · ${item.provenance}` : ""}{item.included !== undefined ? ` · ${item.included ? "Included" : "Excluded"}` : ""}
            </span>
          </div>
          <div className="context-snapshot-panel__row-actions">
            {item.included !== undefined && <button
              type="button"
              aria-label={`${item.included ? "Exclude" : "Include"} ${item.label}`}
              onClick={() => setContextIncluded(item.id, !item.included)}
            >{item.included ? "Exclude" : "Include"}</button>}
            <button type="button" className="context-snapshot-panel__row-remove" aria-label={`Remove ${item.label}`} onClick={() => handleRemove(item.id)}>Remove</button>
          </div>
        </li>
      ))}
    </ul>}

    {managerOpen && <ContextManagerDialog onClose={() => setManagerOpen(false)} />}
  </>;
}
