import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TRANSLATOR_ENGINES } from "../../services/providerNeutral";
import { useSessionStore } from "../../stores/sessionStore";
import type { TranslatorEngine } from "../../stores/types";
import { DirectnessDropdown } from "../directness";
import { MethodologyDropdown } from "../methodology";
import { TechniqueDropdown } from "../techniques";

const OVERLAY_EVENT = "divergence:composer-overlay";

export function AdvancedControls() {
  const [open, setOpen] = useState(false);
  const translatorEngine = useSessionStore((s) => s.translatorEngine);
  const setTranslatorEngine = useSessionStore((s) => s.setTranslatorEngine);
  const reviewBeforeSend = useSessionStore((s) => s.reviewBeforeSend);
  const setReviewBeforeSend = useSessionStore((s) => s.setReviewBeforeSend);
  const paidFallbackEnabled = useSessionStore((s) => s.paidFallbackEnabled);
  const setPaidFallbackEnabled = useSessionStore((s) => s.setPaidFallbackEnabled);
  const maxRequestCost = useSessionStore((s) => s.maxRequestCost);
  const setMaxRequestCost = useSessionStore((s) => s.setMaxRequestCost);

  useEffect(() => {
    const switchOverlay = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== "advanced") setOpen(false);
    };
    window.addEventListener(OVERLAY_EVENT, switchOverlay);
    return () => window.removeEventListener(OVERLAY_EVENT, switchOverlay);
  }, []);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next) window.dispatchEvent(new CustomEvent(OVERLAY_EVENT, { detail: "advanced" }));
  }

  const selectedEngine = translatorEngine === "legacy-claude" ? "managed-translator" : translatorEngine;

  return <section className={"advanced-controls " + (open ? "is-open" : "")}>
    <button type="button" className="utility-bar" aria-expanded={open} onClick={toggle}>
      <span>Show Advanced Controls</span>{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
    </button>
    {open && <div className="advanced-controls__overlay surface-smoked-glass">
      <DirectnessDropdown />
      <TechniqueDropdown />
      <MethodologyDropdown />
      <label className="advanced-controls__check">
        <input type="checkbox" checked={reviewBeforeSend} onChange={(event) => setReviewBeforeSend(event.target.checked)} />
        Review before sending
      </label>
      <label className="advanced-controls__field">
        <span>Translator Engine</span>
        <select value={selectedEngine} onChange={(event) => setTranslatorEngine(event.target.value as TranslatorEngine)}>
          {TRANSLATOR_ENGINES.map((engine) => <option key={engine.id} value={engine.id}>{engine.label} — {engine.cost}</option>)}
        </select>
      </label>
      <div className="advanced-controls__connection"><strong>Connection summary</strong><span>Manual handoff needs no connection. Connected and managed routes always require approval before a charge.</span><button type="button" onClick={() => useSessionStore.getState().setCurrentScreen("settings")}>Manage connections</button></div>
      <label className="advanced-controls__check">
        <input type="checkbox" checked={paidFallbackEnabled} onChange={(event) => setPaidFallbackEnabled(event.target.checked)} />
        Allow paid fallback (off by default)
      </label>
      <label className="advanced-controls__field"><span>Maximum per request</span><input type="number" min="0" step="0.01" value={maxRequestCost} onChange={(event) => setMaxRequestCost(Number(event.target.value))} /></label>
      <button type="button" className="advanced-controls__defaults">Set as defaults</button>
    </div>}
  </section>;
}

