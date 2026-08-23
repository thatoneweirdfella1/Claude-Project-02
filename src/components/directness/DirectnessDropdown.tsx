import { isDirectnessLevel } from "../../services/directness";
import { useSessionStore } from "../../stores/sessionStore";
import { useSettingsDefaultsStore } from "../../stores/settingsDefaultsStore";
import { Dropdown } from "../primitives";
import { DIRECTNESS_DROPDOWN_OPTIONS } from "./directnessOptions";

/* Directness is a persistent reply-style choice. It updates the active
   request immediately and becomes the default used after a full session
   reset, so the selected style stays in effect until the user changes it. */
export function DirectnessDropdown() {
  const directness = useSessionStore((s) => s.directness);
  const setDirectness = useSessionStore((s) => s.setDirectness);
  const setDefaultDirectness = useSettingsDefaultsStore((s) => s.setDirectness);

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
          if (!isDirectnessLevel(next)) return;
          setDirectness(next);
          setDefaultDirectness(next);
        }}
      />
    </div>
  );
}
