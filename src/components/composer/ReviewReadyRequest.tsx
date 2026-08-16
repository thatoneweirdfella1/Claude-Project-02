import { useState } from "react";

export interface ReviewReadyRequestProps {
  initialText: string;
  destination: string;
  officialUrl: string | null;
  onConfirm: (text: string) => void;
  onCancel: () => void;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const fallback = document.createElement("textarea");
    fallback.value = text;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.appendChild(fallback);
    fallback.select();
    const copied = document.execCommand("copy");
    fallback.remove();
    return copied;
  }
}

export function ReviewReadyRequest({
  initialText,
  destination,
  officialUrl,
  onConfirm,
  onCancel,
}: ReviewReadyRequestProps) {
  const [text, setText] = useState(initialText);
  const [copyError, setCopyError] = useState(false);

  async function continueWithCopy(openDestination: boolean) {
    setCopyError(false);
    const copied = await copyText(text);
    if (!copied) {
      setCopyError(true);
      return;
    }
    if (openDestination && officialUrl) {
      window.open(officialUrl, "_blank", "noopener,noreferrer");
    }
    onConfirm(text);
  }

  return (
    <div className="review-ready" role="dialog" aria-modal="true" aria-labelledby="review-ready-title">
      <div className="review-ready__card surface-smoked-glass">
        <header>
          <div>
            <h2 id="review-ready-title">Review AI-ready request</h2>
            <p>Destination: {destination} · No Divergence credits</p>
          </div>
        </header>
        <label>
          <span>Editable request</span>
          <textarea value={text} onChange={(event) => setText(event.target.value)} />
        </label>
        {copyError && <p role="alert">Copy was blocked. Select the request above and copy it manually.</p>}
        <div className="review-ready__actions">
          <button type="button" onClick={onCancel}>Back</button>
          <button type="button" onClick={() => void continueWithCopy(false)} disabled={!text.trim()}>
            Copy-ready · Continue
          </button>
          {officialUrl && (
            <button type="button" onClick={() => void continueWithCopy(true)} disabled={!text.trim()}>
              Copy & Open {destination}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
