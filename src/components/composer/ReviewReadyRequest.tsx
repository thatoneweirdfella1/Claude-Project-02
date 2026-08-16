import { useState } from "react";

export interface ReviewReadyRequestProps {
  initialText: string;
  destination: string;
  onConfirm: (text: string) => void;
  onCancel: () => void;
}

export function ReviewReadyRequest({ initialText, destination, onConfirm, onCancel }: ReviewReadyRequestProps) {
  const [text, setText] = useState(initialText);
  return (
    <div className="review-ready" role="dialog" aria-modal="true" aria-labelledby="review-ready-title">
      <div className="review-ready__card surface-smoked-glass">
        <header><div><h2 id="review-ready-title">Review AI-ready request</h2><p>Destination: {destination} · No Divergence credits</p></div></header>
        <label><span>Editable request</span><textarea value={text} onChange={(event) => setText(event.target.value)} /></label>
        <div className="review-ready__actions">
          <button type="button" onClick={onCancel}>Back</button>
          <button type="button" onClick={() => onConfirm(text)} disabled={!text.trim()}>Copy-ready · Continue</button>
        </div>
      </div>
    </div>
  );
}
