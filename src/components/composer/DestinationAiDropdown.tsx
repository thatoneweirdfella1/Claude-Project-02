import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { DESTINATION_PROVIDERS, destinationLabel } from "../../services/providerNeutral";
import { useSessionStore } from "../../stores/sessionStore";
import type { DestinationProviderId, DestinationSelection } from "../../stores/types";

const OVERLAY_EVENT = "divergence:composer-overlay";

export function DestinationAiDropdown() {
  const destination = useSessionStore((s) => s.destination);
  const setDestination = useSessionStore((s) => s.setDestination);
  const [open, setOpen] = useState(false);
  const [providerId, setProviderId] = useState<DestinationProviderId | null>(null);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const switchOverlay = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== "destination") setOpen(false);
    };
    window.addEventListener(OVERLAY_EVENT, switchOverlay);
    return () => window.removeEventListener(OVERLAY_EVENT, switchOverlay);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", escape); };
  }, [open]);

  const filtered = DESTINATION_PROVIDERS.filter((provider) =>
    (provider.label + " " + provider.models.map((model) => model.label).join(" ")).toLowerCase().includes(query.toLowerCase()),
  );
  const activeProvider = DESTINATION_PROVIDERS.find((provider) => provider.id === providerId) ?? null;

  function toggle() {
    const next = !open;
    setOpen(next);
    setProviderId(null);
    if (next) window.dispatchEvent(new CustomEvent(OVERLAY_EVENT, { detail: "destination" }));
  }
  function choose(next: DestinationSelection) {
    setDestination(next); setOpen(false); setProviderId(null); setQuery("");
  }

  return <div className="destination-field" ref={rootRef}>
    <label id="destination-ai-label">Destination AI</label>
    <button type="button" className="destination-field__trigger" aria-haspopup="dialog" aria-expanded={open} onClick={toggle}>
      <span>{destinationLabel(destination)}</span><ChevronDown size={16} aria-hidden="true" />
    </button>
    {open && <div className="destination-field__popover surface-smoked-glass" role="dialog" aria-label="Choose destination AI">
      <label className="destination-field__search"><Search size={15} /><input autoFocus value={query} onChange={(event) => { setQuery(event.target.value); setProviderId(null); }} placeholder="Search AI or model" /></label>
      {activeProvider && !query ? <>
        <button type="button" className="destination-field__back" onClick={() => setProviderId(null)}><ChevronLeft size={15} />All AIs</button>
        <section className="destination-field__group"><strong>{activeProvider.label}</strong><small>{activeProvider.connection}</small>
          <div>{activeProvider.models.map((model) => <button key={model.id} type="button" className="destination-field__option" onClick={() => choose({ providerId: activeProvider.id, modelId: model.id })}>
            <span>{model.label}</span><small>{model.cost}</small>
          </button>)}</div>
        </section>
      </> : <>
        {filtered.map((provider) => <button key={provider.id} type="button" className="destination-field__provider" onClick={() => query && provider.models.length === 1 ? choose({ providerId: provider.id, modelId: provider.models[0].id }) : setProviderId(provider.id)}>
          <span><strong>{provider.label}</strong><small>{provider.connection}</small></span><ChevronRight size={15} />
        </button>)}
        {!filtered.length && <p>No matching destination.</p>}
      </>}
    </div>}
  </div>;
}



