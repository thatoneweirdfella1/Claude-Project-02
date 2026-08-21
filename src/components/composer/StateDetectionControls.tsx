import { ScanSearch } from "lucide-react";
import { useSessionStore } from "../../stores/sessionStore";
import type { StateDetectionMode } from "../../stores/types";

export interface StateDetectionControlsProps {
  disabled: boolean;
  checking: boolean;
  onCheck: (paid: boolean) => void | Promise<void>;
}

const OPTIONS: Array<{ value: StateDetectionMode; label: string }> = [
  { value: "manual-free", label: "Manual — Free" },
  { value: "manual-paid", label: "Manual — Paid" },
  { value: "automatic-paid", label: "Automatic — Paid" },
];

export function StateDetectionControls({ disabled, checking, onCheck }: StateDetectionControlsProps) {
  const mode = useSessionStore((state) => state.stateDetectionMode);
  const setMode = useSessionStore((state) => state.setStateDetectionMode);
  const automatic = mode === "automatic-paid";

  return (
    <div className="state-detection-controls" aria-label="State Detection settings">
      <label htmlFor="state-detection-mode">State Detection</label>
      <select
        id="state-detection-mode"
        value={mode}
        onChange={(event) => setMode(event.target.value as StateDetectionMode)}
      >
        {OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {automatic ? (
        <span className="state-detection-controls__status">Runs when you send · confirmation required</span>
      ) : (
        <button
          type="button"
          disabled={disabled || checking}
          onClick={() => void onCheck(mode === "manual-paid")}
        >
          <ScanSearch size={15} aria-hidden="true" />
          {checking ? "Checking…" : "Check this message"}
        </button>
      )}
    </div>
  );
}
