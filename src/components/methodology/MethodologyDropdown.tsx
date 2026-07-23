import { useSessionStore } from "../../stores/sessionStore";
import type { MethodologyType } from "../../stores/types";
import { Dropdown } from "../primitives";

export const METHODOLOGY_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "3-state", label: "3-State Methodology" },
];

/* Methodology selector — choose between Standard and 3-State Methodology
   (DEFINE → TEST → STABILIZE) with ADHD communication rules. */
export function MethodologyDropdown() {
  const methodology = useSessionStore((s) => s.methodology);
  const setMethodology = useSessionStore((s) => s.setMethodology);

  return (
    <div className="methodology-dropdown-field">
      <label htmlFor="methodology-dropdown" className="methodology-dropdown-field__label">
        Methodology
      </label>
      <Dropdown
        id="methodology-dropdown"
        options={METHODOLOGY_OPTIONS}
        value={methodology}
        onChange={(event) => {
          const next = event.target.value;
          const selection: MethodologyType =
            next === "standard" || next === "3-state" ? (next as MethodologyType) : "standard";
          setMethodology(selection);
        }}
      />
    </div>
  );
}
