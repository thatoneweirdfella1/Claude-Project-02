import { isModelId } from "../../services/modelRegistry";
import { useSessionStore } from "../../stores/sessionStore";
import type { ModelSelection } from "../../stores/types";
import { Dropdown } from "../primitives";
import { MODEL_DROPDOWN_OPTIONS } from "./modelDropdownOptions";

export function ModelDropdown() {
  const model = useSessionStore((s) => s.model);
  const setModel = useSessionStore((s) => s.setModel);
  return (
    <div className="model-dropdown-field">
      <label htmlFor="model-dropdown" className="model-dropdown-field__label">AI Model Preference</label>
      <Dropdown
        id="model-dropdown"
        options={MODEL_DROPDOWN_OPTIONS}
        value={model}
        onChange={(event) => {
          const next = event.target.value;
          const selection: ModelSelection = next === "auto" || isModelId(next) ? next as ModelSelection : "auto";
          setModel(selection);
        }}
      />
    </div>
  );
}
