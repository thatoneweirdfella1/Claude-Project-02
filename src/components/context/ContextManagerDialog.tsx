import { useMemo, useState } from "react";
import { useSessionStore } from "../../stores/sessionStore";
import type { ContextItem } from "../../stores/types";

type ManagedContextItem = ContextItem & { included?: boolean };

export function isContextIncluded(item: ContextItem): boolean {
  return (item as ManagedContextItem).included !== false;
}

export function setContextIncluded(id: string, included: boolean): void {
  useSessionStore.setState((state) => ({
    context: state.context.map((item) => item.id === id ? { ...item, included } as ContextItem : item),
  }));
}

export interface ContextManagerDialogProps {
  onClose: () => void;
  onAddMore?: () => void;
}

export function ContextManagerDialog({ onClose, onAddMore }: ContextManagerDialogProps) {
  const context = useSessionStore((s) => s.context);
  const variables = useSessionStore((s) => s.variables);
  const removeContextItem = useSessionStore((s) => s.removeContextItem);
  const removeSessionVariable = useSessionStore((s) => s.removeSessionVariable);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const preview = useMemo(() => context.find((item) => item.id === previewId) ?? null, [context, previewId]);
  const activeCount = context.filter(isContextIncluded).length + Object.keys(variables).length;

  return <div className="workflow-dialog" role="dialog" aria-modal="true" aria-labelledby="context-manager-title">
    <div className="workflow-dialog__card surface-smoked-glass context-manager-dialog">
      <header>
        <h2 id="context-manager-title">Manage Context</h2>
        <p>{activeCount} included item{activeCount === 1 ? "" : "s"}. Excluded items stay attached but are not sent.</p>
      </header>

      {context.length === 0 && Object.keys(variables).length === 0
        ? <p>Nothing is attached yet.</p>
        : <div className="context-manager-list">
          {context.map((item) => {
            const included = isContextIncluded(item);
            return <div key={item.id} className="context-manager-row">
              <label>
                <input type="checkbox" checked={included} onChange={(event) => setContextIncluded(item.id, event.target.checked)} />
                <span><strong>{item.label}</strong><small>{item.kind} · {item.bytes.toLocaleString()} bytes{item.provenance ? ` · ${item.provenance}` : ""} · {included ? "Included" : "Excluded"}</small></span>
              </label>
              <div>
                <button type="button" onClick={() => setPreviewId(item.id)}>Preview</button>
                <button type="button" onClick={() => removeContextItem(item.id)}>Remove</button>
              </div>
            </div>;
          })}
          {Object.entries(variables).map(([name, value]) => <div key={`variable:${name}`} className="context-manager-row">
            <div><strong>${name}</strong><small>variable · Included</small></div>
            <div>
              <button type="button" onClick={() => setPreviewId(`variable:${name}`)}>Preview</button>
              <button type="button" onClick={() => removeSessionVariable(name)}>Remove</button>
            </div>
            {previewId === `variable:${name}` && <div className="context-manager-preview"><strong>${name}</strong><pre>{value}</pre></div>}
          </div>)}
        </div>}

      {preview && <div className="context-manager-preview" role="region" aria-label={`Preview ${preview.label}`}>
        <div><strong>{preview.label}</strong><span>{preview.kind} · {preview.bytes.toLocaleString()} bytes{preview.provenance ? ` · ${preview.provenance}` : ""} · {isContextIncluded(preview) ? "Included" : "Excluded"}</span></div>
        <pre>{preview.content || "No readable text was extracted."}</pre>
        <div>
          <button type="button" onClick={() => setContextIncluded(preview.id, !isContextIncluded(preview))}>
            {isContextIncluded(preview) ? "Exclude from request" : "Include in request"}
          </button>
          <button type="button" onClick={() => setPreviewId(null)}>Close preview</button>
        </div>
      </div>}

      <footer className="workflow-dialog__actions">
        {onAddMore && <button type="button" onClick={onAddMore}>Add more context</button>}
        <button type="button" className="primary" onClick={onClose}>Done</button>
      </footer>
    </div>
  </div>;
}
