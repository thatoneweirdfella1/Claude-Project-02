import { useState } from "react";
import { buildTranslateAskRequest, type TranslateAskRequest } from "../../services/composer";
import { mergeVariables, substituteVariables } from "../../services/context";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import type { StateDetectionResult } from "../../services/detection";
import type { DirectnessLevel } from "../../stores/types";
import { StateDetectionPanel, type PillDimension } from "../detection";
import { ModelDropdown } from "../routing";
import { AttachContextControls } from "./AttachContextControls";
import { InputBox } from "./InputBox";
import { TranslateAskButton } from "./TranslateAskButton";

export interface ComposerProps {
  onSubmit: (request: TranslateAskRequest) => void | boolean | Promise<void | boolean>;
  onAttach?: () => void;
  onContext?: () => void;
  detection?: StateDetectionResult | null;
  detecting?: boolean;
  onCorrectState?: (dimension: PillDimension, value: string) => void;
  suggestedDirectness?: DirectnessLevel | null;
  onApplyDirectness?: () => void;
}

export function Composer({
  onSubmit,
  onAttach,
  onContext,
  detection,
  detecting = false,
  onCorrectState,
  suggestedDirectness,
  onApplyDirectness,
}: ComposerProps) {
  const [focusArea, setFocusArea] = useState("general");
  const draftInput = useSessionStore((s) => s.draftInput);
  const setDraftInput = useSessionStore((s) => s.setDraftInput);
  const model = useSessionStore((s) => s.model);
  const directness = useSessionStore((s) => s.directness);
  const techniques = useSessionStore((s) => s.techniques);
  const context = useSessionStore((s) => s.context);
  const sessionVariables = useSessionStore((s) => s.variables);
  const accountVariables = useAccountStore((s) => s.variables);

  async function handleTranslate() {
    const substituted = substituteVariables(draftInput, mergeVariables(accountVariables, sessionVariables));
    const accepted = await onSubmit(
      buildTranslateAskRequest(substituted, { model, directness, techniques }, context),
    );
    if (accepted !== false) setDraftInput("");
  }

  return (
    <section className="composer frozen-composer" data-testid="composer">
      <div className="frozen-composer__heading">
        <h2>What&apos;s on your mind?</h2>
        <div className="frozen-composer__heading-actions">
          <AttachContextControls onAttach={onAttach} onContext={onContext} />
          <button type="button" className="frozen-clear" onClick={() => setDraftInput("")}>Clear</button>
        </div>
      </div>
      <InputBox />
      {detecting && !detection && <p className="state-detection-panel__detecting" role="status">Reading your message…</p>}
      {detection && (
        <StateDetectionPanel
          result={detection}
          onCorrect={onCorrectState}
          suggestedDirectness={suggestedDirectness}
          onApplyDirectness={onApplyDirectness}
        />
      )}
      <div className="frozen-composer__controls">
        <label className="frozen-field">
          <span>Focus Area</span>
          <select value={focusArea} onChange={(event) => setFocusArea(event.target.value)}>
            <option value="general">General</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="creative">Creative</option>
          </select>
        </label>
        <ModelDropdown />
        <TranslateAskButton onClick={() => void handleTranslate()} />
      </div>
    </section>
  );
}
