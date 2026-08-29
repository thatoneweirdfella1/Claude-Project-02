import { useState } from "react";
import { useSessionStore } from "../../stores/sessionStore";
import { useSettingsDefaultsStore } from "../../stores/settingsDefaultsStore";
import type { MethodologyType } from "../../stores/types";
import { Dropdown } from "../primitives";

export const METHODOLOGY_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "3-state", label: "3-State Methodology" },
];

export interface MethodologyDropdownProps {
  showPinControl?: boolean;
  showSuggestion?: boolean;
}

export function MethodologyDropdown({ showPinControl = true, showSuggestion = true }: MethodologyDropdownProps) {
  const [dismissedSuggestionFor, setDismissedSuggestionFor] = useState("");
  const methodology = useSessionStore((s) => s.methodology);
  const setMethodology = useSessionStore((s) => s.setMethodology);
  const draft = useSessionStore((s) => s.draftInput);
  const pinned = useSettingsDefaultsStore((s) => s.methodologyPinned);
  const setPinned = useSettingsDefaultsStore((s) => s.setMethodologyPinned);
  const suggestion = methodology === "standard"
    && draft !== dismissedSuggestionFor
    && (draft.length > 700 || /\b(audit|compare|validate|debug|complex|multi-step|test assumptions|stress test)\b/i.test(draft));

  return <div className="methodology-dropdown-field">
    <label htmlFor="methodology-dropdown" className="methodology-dropdown-field__label">Methodology</label>
    <Dropdown
      id="methodology-dropdown"
      options={METHODOLOGY_OPTIONS}
      value={methodology}
      onChange={(event) => {
        const next = event.target.value;
        const selection: MethodologyType = next === "3-state" ? "3-state" : "standard";
        setMethodology(selection);
      }}
    />
    {showSuggestion && suggestion && <div className="methodology-suggestion" role="status">
      <span>3-State may help here: Define → Test → Stabilize. It will not be applied automatically.</span>
      <span className="methodology-suggestion__actions">
        <button type="button" onClick={() => setMethodology("3-state")}>Accept</button>
        <button type="button" onClick={() => setDismissedSuggestionFor(draft)}>Dismiss</button>
      </span>
    </div>}
    {showPinControl && <label className="methodology-pin-control">
      <input type="checkbox" checked={pinned} onChange={(event) => setPinned(event.target.checked)} />
      Pin to composer
    </label>}
  </div>;
}
