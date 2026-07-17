import { DirectnessDropdown } from "../directness";
import { ModelDropdown } from "../routing";
import { TechniqueDropdown } from "../techniques";
import { AttachContextControls } from "./AttachContextControls";
import { TranslateAskButton } from "./TranslateAskButton";

/* Control row (Step 5.0) — CANON LAYOUT's "the Model/Directness/Technique
   dropdowns, Attach and Context controls, TRANSLATE & ASK button." Hosts the
   three dropdowns already built at Steps 3.2/4.4/4.5 — ARRANGES them, does
   not rebuild them (this step's own explicit instruction). Two rows, matching
   the screenshot: dropdowns on top, Attach/Context (left) and TRANSLATE & ASK
   (right) below. */

export interface ControlRowProps {
  onAttach?: () => void;
  onContext?: () => void;
  onTranslateAsk: () => void;
}

export function ControlRow({ onAttach, onContext, onTranslateAsk }: ControlRowProps) {
  return (
    <div className="control-row">
      <div className="control-row__dropdowns">
        <ModelDropdown />
        <DirectnessDropdown />
        <TechniqueDropdown />
      </div>
      <div className="control-row__actions">
        <AttachContextControls onAttach={onAttach} onContext={onContext} />
        <TranslateAskButton onClick={onTranslateAsk} />
      </div>
    </div>
  );
}
