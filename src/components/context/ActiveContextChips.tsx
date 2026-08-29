import { useState } from "react";
import { useSessionStore } from "../../stores/sessionStore";
import type { ContextItem } from "../../stores/types";
import { isContextIncluded, setContextIncluded } from "./ContextManagerDialog";

export function ActiveContextChips() {
  const context = useSessionStore((s) => s.context);
  const variables = useSessionStore((s) => s.variables);
  const removeContextItem = useSessionStore((s) => s.removeContextItem);
  const removeSessionVariable = useSessionStore((s) => s.removeSessionVariable);
  const [preview, setPreview] = useState<ContextItem | { id: string; label: string; content: string; kind: "variable"; bytes: number } | null>(null);

  if (context.length === 0 && Object.keys(variables).length === 0) return null;

  return <div className="active-context-chips" aria-label="Active context">
    {context.map((item) => <div key={item.id} className={"active-context-chip " + (isContextIncluded(item) ? "" : "is-excluded")}>
      <button type="button" className="active-context-chip__preview" onClick={() => setPreview(item)} title={`Preview ${item.label}`}>
        <span>{item.label}</span><small>{isContextIncluded(item) ? item.kind : "excluded"}</small>
      </button>
      <button type="button" className="active-context-chip__remove" aria-label={`Remove ${item.label}`} onClick={() => removeContextItem(item.id)}>×</button>
    </div>)}
    {Object.entries(variables).map(([name, value]) => <div key={`variable:${name}`} className="active-context-chip">
      <button type="button" className="active-context-chip__preview" onClick={() => setPreview({ id: `variable:${name}`, label: `$${name}`, content: value, kind: "variable", bytes: value.length })}>
        <span>${name}</span><small>variable</small>
      </button>
      <button type="button" className="active-context-chip__remove" aria-label={`Remove $${name}`} onClick={() => removeSessionVariable(name)}>×</button>
    </div>)}

    {preview && <div className="context-chip-preview surface-smoked-glass" role="dialog" aria-modal="false" aria-label={`Preview ${preview.label}`}>
      <header><strong>{preview.label}</strong><button type="button" onClick={() => setPreview(null)} aria-label="Close context preview">×</button></header>
      <small>{preview.kind} · {preview.bytes.toLocaleString()} bytes</small>
      <pre>{preview.content || "No readable text was extracted."}</pre>
      {preview.kind !== "variable" && <button type="button" onClick={() => {
        setContextIncluded(preview.id, !isContextIncluded(preview as ContextItem));
        setPreview({ ...preview } as ContextItem);
      }}>{isContextIncluded(preview as ContextItem) ? "Exclude from request" : "Include in request"}</button>}
    </div>}
  </div>;
}
