import { isDirectnessLevel } from "../../services/directness";
import { useSessionStore } from "../../stores/sessionStore";
import { Dropdown } from "../primitives";
import { DIRECTNESS_DROPDOWN_OPTIONS } from "./directnessOptions";

/* Directness dropdown (Step 4.4) — CANON LAYOUT's center-column "Directness"
   control. Bound directly to the session store's `directness` field
   (DirectnessLevel, default 2, built at Step 1.7, autosaved since Step 1.8) —
   no new store state. The chosen level feeds the composition engine's TONE
   section (Step 4.3) via whoever composes the prompt (the demo here, the
   Step 5.2 orchestrator in production). */
export function DirectnessDropdown() {
  const directness = useSessionStore((s) => s.directness);
  const setDirectness = useSessionStore((s) => s.setDirectness);

  return (
    <div className="directness-field">
      <label htmlFor="directness-dropdown" className="directness-field__label">
        Directness
      </label>
      <Dropdown
        id="directness-dropdown"
        options={DIRECTNESS_DROPDOWN_OPTIONS}
        value={String(directness)}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (isDirectnessLevel(next)) setDirectness(next);
        }}
      />
    </div>
  );
}
