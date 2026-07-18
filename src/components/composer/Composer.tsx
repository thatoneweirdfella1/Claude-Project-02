import { buildTranslateAskRequest, type TranslateAskRequest } from "../../services/composer";
import { mergeVariables, substituteVariables } from "../../services/context";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import type { StateDetectionResult } from "../../services/detection";
import type { DirectnessLevel } from "../../stores/types";
import { StateDetectionPanel, type PillDimension } from "../detection";
import { ControlRow } from "./ControlRow";
import { InputBox } from "./InputBox";

/* The composer (Step 5.0) — CANON LAYOUT's center-column input box + control
   row + TRANSLATE & ASK. This is the real, reusable deliverable Step 5.2's
   orchestrator mounts in production; it does not call an API, translate, or
   route (that boundary is the whole point of this step) — it only builds and
   emits one typed TranslateAskRequest via onSubmit.

   Step 6.3: the STATE DETECTION panel sits here, between InputBox and
   ControlRow (the exact position the Step 5.0 PARKED note named). `detection`
   is owned by whoever actually fires detectState() alongside the pipeline
   (CenterColumn, Step 6.3) — Composer stays a thin, prop-driven shell for it,
   same as onSubmit/onAttach/onContext.

   Step 7.4: variable substitution ($name -> value, CANON Feature 6) runs
   HERE, on the raw draftInput, before buildTranslateAskRequest ever sees it
   — so the SAME substituted text is both what gets submitted to the
   pipeline and what CenterColumn adds to the conversation as "what was
   asked" (CANON "no black box": the user sees what was actually sent, not a
   raw $token they never resolved). Session variables win over account
   (persisted) ones when both define the same name — mergeVariables'
   documented precedence. */

export interface ComposerProps {
  onSubmit: (request: TranslateAskRequest) => void;
  onAttach?: () => void;
  onContext?: () => void;
  /** The most recent detection result, or null before any has arrived / after
      the user dismissed it. Panel renders nothing when null. */
  detection?: StateDetectionResult | null;
  onCorrectState?: (dimension: PillDimension, value: string) => void;
  /** Step 6.5 directness consumer — non-null only when the state bus's
      recommendation differs from the current selection; the panel shows it
      as a one-click suggestion, never applies it on its own. */
  suggestedDirectness?: DirectnessLevel | null;
  onApplyDirectness?: () => void;
}

export function Composer({
  onSubmit,
  onAttach,
  onContext,
  detection,
  onCorrectState,
  suggestedDirectness,
  onApplyDirectness,
}: ComposerProps) {
  const draftInput = useSessionStore((s) => s.draftInput);
  const setDraftInput = useSessionStore((s) => s.setDraftInput);
  const model = useSessionStore((s) => s.model);
  const directness = useSessionStore((s) => s.directness);
  const techniques = useSessionStore((s) => s.techniques);
  const context = useSessionStore((s) => s.context);
  const sessionVariables = useSessionStore((s) => s.variables);
  const accountVariables = useAccountStore((s) => s.variables);

  function handleTranslateAsk() {
    const substituted = substituteVariables(
      draftInput,
      mergeVariables(accountVariables, sessionVariables),
    );
    onSubmit(buildTranslateAskRequest(substituted, { model, directness, techniques }, context));
    // Clears immediately — matches the screenshot's pattern (empty box, ready
    // for the next thought, conversation history holds what was asked) and
    // gives instant visual feedback with no wait on anything downstream.
    setDraftInput("");
  }

  return (
    <div className="composer" data-testid="composer">
      <InputBox />
      {detection && (
        <StateDetectionPanel
          result={detection}
          onCorrect={onCorrectState}
          suggestedDirectness={suggestedDirectness}
          onApplyDirectness={onApplyDirectness}
        />
      )}
      <ControlRow onAttach={onAttach} onContext={onContext} onTranslateAsk={handleTranslateAsk} />
    </div>
  );
}
