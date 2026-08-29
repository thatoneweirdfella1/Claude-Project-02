import { useState } from "react";
import { buildTranslateAskRequest, type TranslateAskRequest } from "../../services/composer";
import { mergeVariables, substituteVariables } from "../../services/context";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import { useSettingsDefaultsStore } from "../../stores/settingsDefaultsStore";
import type { StateDetectionResult } from "../../services/detection";
import type { ContextItem } from "../../stores/types";
import { StateDetectionStatusBar, type StateDetectionUiStatus } from "../detection/StateDetectionStatusBar";
import { MultiAiActions } from "../multiAi";
import { TransparencyCard } from "../transparency";
import { MethodologyDropdown } from "../methodology/MethodologyDropdown";
import { AttachContextControls } from "./AttachContextControls";
import { AdvancedControls } from "./AdvancedControls";
import { DestinationAiDropdown } from "./DestinationAiDropdown";
import { InputBox } from "./InputBox";
import { TranslateAskButton } from "./TranslateAskButton";
import { CONNECTED_EXECUTION_AVAILABLE } from "../../services/executionAvailability";

export interface ComposerProps {
  onSubmit: (request: TranslateAskRequest) => void | boolean | Promise<void | boolean>;
  onAttach?: () => void;
  onContext?: () => void;
  detection?: StateDetectionResult | null;
  detectionStatus?: StateDetectionUiStatus;
  onOpenStateCorrection?: () => void;
  statusMessage?: string;
  submitDisabled?: boolean;
}

export function Composer({ onSubmit, onAttach, onContext, detection, detectionStatus = "idle", onOpenStateCorrection, statusMessage = "", submitDisabled = false }: ComposerProps) {
  const [validationMessage, setValidationMessage] = useState("");
  const draftInput = useSessionStore((s) => s.draftInput);
  const model = useSessionStore((s) => s.model);
  const destination = useSessionStore((s) => s.destination);
  const translatorEngine = useSessionStore((s) => s.translatorEngine);
  const reviewBeforeSend = useSessionStore((s) => s.reviewBeforeSend);
  const directness = useSessionStore((s) => s.directness);
  const techniques = useSessionStore((s) => s.techniques);
  const context = useSessionStore((s) => s.context);
  const sessionVariables = useSessionStore((s) => s.variables);
  const accountVariables = useAccountStore((s) => s.variables);
  const hasConversation = useSessionStore((s) => s.conversation.length > 0);
  const methodologyPinned = useSettingsDefaultsStore((s) => s.methodologyPinned);

  async function handleTranslate() {
    if (submitDisabled) return;
    if (!draftInput.trim()) { setValidationMessage("Type something first. Your draft has not been changed."); return; }
    const substituted = substituteVariables(draftInput, mergeVariables(accountVariables, sessionVariables));
    const variableContext: ContextItem[] = Object.entries(sessionVariables).map(([name, value]) => ({ id: `variable:${name}`, kind: "variable", label: `$${name}`, content: value, bytes: value.length }));
    const accepted = await onSubmit(buildTranslateAskRequest(substituted, { model, destination, translatorEngine, reviewBeforeSend, directness, techniques }, [...context, ...variableContext]));
    setValidationMessage(accepted === false ? "Not sent. Your draft is still here." : "");
  }

  const feedback = validationMessage || statusMessage;
  return <section className="composer frozen-composer" data-testid="composer">
    <div className="frozen-composer__heading"><h2>What&apos;s on your mind?</h2><AttachContextControls onAttach={onAttach} onContext={onContext} /></div>
    <InputBox onSubmit={() => void handleTranslate()} />
    <StateDetectionStatusBar detection={detection} status={detectionStatus} onCorrect={onOpenStateCorrection} />
    <div className="frozen-composer__controls">
      <DestinationAiDropdown />
      {methodologyPinned && <MethodologyDropdown showPinControl={false} />}
      <TranslateAskButton onClick={() => void handleTranslate()} disabled={submitDisabled || !draftInput.trim()} />
    </div>
    <div className="composer-inline-feedback" role="status" aria-live="polite" aria-atomic="true">{feedback || "\u00a0"}</div>
    <AdvancedControls />
    {hasConversation && <div className="composer__footer-row frozen-post-submit-tools"><TransparencyCard />{CONNECTED_EXECUTION_AVAILABLE ? <MultiAiActions /> : <div className="settings-section__note" role="status">Multi-AI comparison remains unavailable until external providers are safely connected.</div>}</div>}
  </section>;
}
