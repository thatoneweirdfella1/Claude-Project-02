import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSessionStore } from "../../stores/sessionStore";
import { DirectnessDropdown } from "../directness";
import { MethodologyDropdown } from "../methodology";
import { TechniqueDropdown } from "../techniques";

export function AdvancedControls() {
  const [open, setOpen] = useState(false);
  const translatorEngine = useSessionStore((s) => s.translatorEngine);
  const setTranslatorEngine = useSessionStore((s) => s.setTranslatorEngine);
  const reviewBeforeSend = useSessionStore((s) => s.reviewBeforeSend);
  const setReviewBeforeSend = useSessionStore((s) => s.setReviewBeforeSend);

  return (
    <section className={"advanced-controls " + (open ? "is-open" : "")}>
      <button type="button" className="utility-bar" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span>Advanced</span>{open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && (
        <div className="advanced-controls__overlay surface-smoked-glass">
          <DirectnessDropdown />
          <TechniqueDropdown />
          <MethodologyDropdown />
          <label className="advanced-controls__field">
            <span>Translator Engine</span>
            <select value={translatorEngine} onChange={(event) => setTranslatorEngine(event.target.value === "legacy-claude" ? "legacy-claude" : "local-rules")}>
              <option value="local-rules">Local Rules — No Divergence credits</option>
              <option value="legacy-claude">Connected Claude — paid route confirmation required</option>
            </select>
          </label>
          <label className="advanced-controls__check">
            <input type="checkbox" checked={reviewBeforeSend} onChange={(event) => setReviewBeforeSend(event.target.checked)} />
            Review AI-ready request before handoff
          </label>
        </div>
      )}
    </section>
  );
}
