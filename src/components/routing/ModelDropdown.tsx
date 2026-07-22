import { isModelId } from "../../services/modelRegistry";
import { useSessionStore } from "../../stores/sessionStore";
import type { ModelSelection } from "../../stores/types";
import { Dropdown } from "../primitives";
import { MODEL_DROPDOWN_OPTIONS } from "./modelDropdownOptions";

/* Model dropdown (Step 3.2) — CANON LAYOUT's center-column "Model" control.
   Bound directly to the session store's `model` field (SessionState.model:
   ModelSelection, built ahead of time at Step 1.7, autosaved since Step 1.8)
   — no new store state needed.

   This control never blocks Opus on the free plan; routing.js's own override
   gate does that, with a visible note, per CANON's "never a black box" rule
   (see routingService.overrideFromSelection + ModelRoutingDemo, which shows
   that note live). The dropdown's only job is to record what the user picked. */
export function ModelDropdown() {
  const model = useSessionStore((s) => s.model);
  const setModel = useSessionStore((s) => s.setModel);

  return (
    <div className="model-dropdown-field">
      <label htmlFor="model-dropdown" className="model-dropdown-field__label">
        Model
      </label>
      <Dropdown
        id="model-dropdown"
        options={MODEL_DROPDOWN_OPTIONS}
        value={model}
        onChange={(event) => {
          const next = event.target.value;
          const selection: ModelSelection =
            next === "auto" || isModelId(next) ? (next as ModelSelection) : "auto";
          setModel(selection);
        }}
      />
    </div>
  );
}
