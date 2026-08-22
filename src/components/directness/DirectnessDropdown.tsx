import { isDirectnessLevel } from "../../services/directness";
import { useSessionStore } from "../../stores/sessionStore";
import { Dropdown } from "../primitives";
import { DIRECTNESS_DROPDOWN_OPTIONS } from "./directnessOptions";

/* Directness is an account-wide reply setting. Changing it updates both the
   active request and the persisted default, so every later AI reply keeps the
   selected tone until the user changes this control again. */
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
