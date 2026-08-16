import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { DESTINATION_PROVIDERS, destinationLabel } from "../../services/providerNeutral";
import { useSessionStore } from "../../stores/sessionStore";
import type { DestinationSelection } from "../../stores/types";

export function DestinationAiDropdown() {
  const destination = useSessionStore((s) => s.destination);
  const setDestination = useSessionStore((s) => s.setDestination);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
  }, [open]);

  const filtered = DESTINATION_PROVIDERS.filter((provider) =>
    (provider.label + " " + provider.models.map((model) => model.label).join(" ")).toLowerCase().includes(query.toLowerCase()),
  );

  function choose(next: DestinationSelection) {
    setDestination(next);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="destination-field" ref={rootRef}>
      <label id="destination-ai-label">Destination AI</label>
      <button type="button" className="destination-field__trigger" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span>{destinationLabel(destination)}</span><ChevronDown size={16} aria-hidden="true" />
      </button>
      {open && (
        <div className="destination-field__popover surface-smoked-glass" role="dialog" aria-label="Choose destination AI">
          <label className="destination-field__search"><Search size={15} /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search AI or model" /></label>
          {filtered.map((provider) => (
            <section key={provider.id} className="destination-field__group">
              <strong>{provider.label}</strong>
              <div>{provider.models.map((model) => (
                <button key={model.id} type="button" className="destination-field__option" aria-pressed={destination.providerId === provider.id && destination.modelId === model.id} onClick={() => choose({ providerId: provider.id, modelId: model.id })}>
                  {model.label}
                </button>
              ))}</div>
            </section>
          ))}
          {!filtered.length && <p>No matching destination.</p>}
        </div>
      )}
    </div>
  );
}
