import { buildTranslateAskRequest, type TranslateAskRequest } from "../../services/composer";
import { mergeVariables, substituteVariables } from "../../services/context";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import type { StateDetectionResult } from "../../services/detection";
import type { DirectnessLevel } from "../../stores/types";
import { StateDetectionPanel, type PillDimension } from "../detection";
import { AttachContextControls } from "./AttachContextControls";
import { AdvancedControls } from "./AdvancedControls";
import { DestinationAiDropdown } from "./DestinationAiDropdown";
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
  onSubmit, onAttach, onContext, detection, detecting = false,
  onCorrectState, suggestedDirectness, onApplyDirectness,
}: ComposerProps) {
  const draftInput = useSessionStore((s) => s.draftInput);
  const setDraftInput = useSessionStore((s) => s.setDraftInput);
  const model = useSessionStore((s) => s.model);
  const destination = useSessionStore((s) => s.destination);
  const translatorEngine = useSessionStore((s) => s.translatorEngine);
  const reviewBeforeSend = useSessionStore((s) => s.reviewBeforeSend);
  const directness = useSessionStore((s) => s.directness);
  const techniques = useSessionStore((s) => s.techniques);
  const context = useSessionStore((s) => s.context);
  const sessionVariables = useSessionStore((s) => s.variables);
  const accountVariables = useAccountStore((s) => s.variables);

  async function handleTranslate() {
    if (!draftInput.trim()) return;
    const substituted = substituteVariables(draftInput, mergeVariables(accountVariables, sessionVariables));
    const accepted = await onSubmit(buildTranslateAskRequest(substituted, {
      model, destination, translatorEngine, reviewBeforeSend, directness, techniques,
    }, context));
    if (accepted !== false) setDraftInput("");
  }

  return (
    <section className="composer frozen-composer" data-testid="composer">
      <div className="frozen-composer__heading">
        <h2>What&apos;s on your mind?</h2>
        <AttachContextControls onAttach={onAttach} onContext={onContext} />
      </div>
      <InputBox />
      {detecting && !detection && <p className="state-detection-panel__detecting" role="status">Reading your message…</p>}
      {detection && <StateDetectionPanel result={detection} onCorrect={onCorrectState} suggestedDirectness={suggestedDirectness} onApplyDirectness={onApplyDirectness} />}
      <div className="frozen-composer__controls">
        <DestinationAiDropdown />
        <TranslateAskButton onClick={() => void handleTranslate()} disabled={!draftInput.trim()} />
      </div>
      <AdvancedControls />
    </section>
  );
}
