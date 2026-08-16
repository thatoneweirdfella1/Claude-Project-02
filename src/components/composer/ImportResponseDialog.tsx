import { useState } from "react";

export interface ImportResponseDialogProps {
  sourceLabel: string;
  onConfirm: (response: string, sourceLabel: string) => void;
  onCancel: () => void;
}

function sanitize(value: string): string {
  return value.replace(/<script[\s\S]*?<\/script>/gi, "").split(String.fromCharCode(0)).join("").trim();
}

export function ImportResponseDialog({ sourceLabel: initialSource, onConfirm, onCancel }: ImportResponseDialogProps) {
  const [sourceLabel, setSourceLabel] = useState(initialSource);
  const [raw, setRaw] = useState("");
  const clean = sanitize(raw);
  return <div className="workflow-dialog" role="dialog" aria-modal="true" aria-labelledby="import-response-title">
    <div className="workflow-dialog__card surface-smoked-glass">
      <header><h2 id="import-response-title">Import Response</h2><p>Paste the actual answer from the destination AI. Review it before it enters the thread.</p></header>
      <label><span>Source label</span><input value={sourceLabel} onChange={(e) => setSourceLabel(e.target.value)} placeholder="ChatGPT, Claude, Gemini…" /></label>
      <label><span>Pasted response</span><textarea autoFocus value={raw} onChange={(e) => setRaw(e.target.value)} /></label>
      {raw && <section className="import-response-preview"><strong>Preview</strong><p>{clean}</p></section>}
      <footer className="workflow-dialog__actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button type="button" className="primary" disabled={!clean || !sourceLabel.trim()} onClick={() => onConfirm(clean, sourceLabel.trim())}>Confirm import</button>
      </footer>
    </div>
  </div>;
}
