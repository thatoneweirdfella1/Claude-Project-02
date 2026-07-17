import { buildTranslateAskRequest, type TranslateAskRequest } from "../../services/composer";
import { useSessionStore } from "../../stores/sessionStore";
import { ControlRow } from "./ControlRow";
import { InputBox } from "./InputBox";

/* The composer (Step 5.0) — CANON LAYOUT's center-column input box + control
   row + TRANSLATE & ASK. This is the real, reusable deliverable Step 5.2's
   orchestrator mounts in production; it does not call an API, translate, or
   route (that boundary is the whole point of this step) — it only builds and
   emits one typed TranslateAskRequest via onSubmit. */

export interface ComposerProps {
  onSubmit: (request: TranslateAskRequest) => void;
  onAttach?: () => void;
  onContext?: () => void;
}

export function Composer({ onSubmit, onAttach, onContext }: ComposerProps) {
  const draftInput = useSessionStore((s) => s.draftInput);
  const setDraftInput = useSessionStore((s) => s.setDraftInput);
  const model = useSessionStore((s) => s.model);
  const directness = useSessionStore((s) => s.directness);
  const techniques = useSessionStore((s) => s.techniques);
  const context = useSessionStore((s) => s.context);

  function handleTranslateAsk() {
    onSubmit(buildTranslateAskRequest(draftInput, { model, directness, techniques }, context));
    // Clears immediately — matches the screenshot's pattern (empty box, ready
    // for the next thought, conversation history holds what was asked) and
    // gives instant visual feedback with no wait on anything downstream.
    setDraftInput("");
  }

  return (
    <div className="composer" data-testid="composer">
      <InputBox />
      <ControlRow onAttach={onAttach} onContext={onContext} onTranslateAsk={handleTranslateAsk} />
    </div>
  );
}
