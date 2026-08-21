import { useState } from "react";
import { DESTINATION_PROVIDERS, destinationLabel, destinationOfficialUrl } from "../../services/providerNeutral";
import type { DestinationSelection } from "../../stores/types";

export interface ReviewReadyRequestProps {
  initialText: string;
  destination: DestinationSelection;
  onHandoff: (text: string, destination: DestinationSelection) => void;
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

export function ReviewReadyRequest({ initialText, destination, onHandoff, onCancel }: ReviewReadyRequestProps) {
  const [text, setText] = useState(initialText);
  const [selected, setSelected] = useState(destination);
  const [choosing, setChoosing] = useState(false);
  const [copyError, setCopyError] = useState(false);

  async function handoff(openDestination: boolean) {
    setCopyError(false);
    if (!await copyText(text)) { setCopyError(true); return; }
    if (openDestination) {
      const url = destinationOfficialUrl(selected);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    }
    onHandoff(text, selected);
  }

  return <div className="review-ready workflow-dialog" role="dialog" aria-modal="true" aria-labelledby="review-ready-title">
    <div className="review-ready__card workflow-dialog__card surface-smoked-glass">
      <header><h2 id="review-ready-title">Review AI-ready request</h2><p>Destination: {destinationLabel(selected)} · No Divergence credits</p></header>
      <label><span>Editable request</span><textarea value={text} onChange={(event) => setText(event.target.value)} /></label>
      {choosing && <div className="handoff-chooser" aria-label="Choose AI to open">
        {DESTINATION_PROVIDERS.filter((provider) => provider.officialUrl).map((provider) => (
          <button key={provider.id} type="button" aria-pressed={selected.providerId === provider.id}
            onClick={() => setSelected({ providerId: provider.id, modelId: provider.models[0].id })}>
            <strong>{provider.label}</strong><small>{provider.connection}</small>
          </button>
        ))}
      </div>}
      {copyError && <p role="alert">Copy was blocked. Select the request above and copy it manually.</p>}
      <footer className="review-ready__actions workflow-dialog__actions">
        <button type="button" onClick={onCancel}>Back</button>
        <button type="button" onClick={() => void handoff(false)} disabled={!text.trim()}>Copy only</button>
        <button type="button" className="primary" onClick={() => choosing ? void handoff(true) : setChoosing(true)} disabled={!text.trim()}>
          {choosing ? `Copy & Open ${destinationLabel(selected)}` : "Copy & Choose AI"}
        </button>
      </footer>
    </div>
  </div>;
}



