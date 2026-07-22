import { useState } from "react";
import { BlueMarbleButton, GlassCard } from "../primitives";

/* Clarifying-question UI (Step 2.3) — shown at the <60 confidence gate INSTEAD
   of an answer. PIPELINE.md: "does NOT proceed; the engine asks a clarifying
   question instead, phrased neutral and curious, never corrective, never making
   the user feel stupid."

   The question text is built neutrally in the gate logic; this component only
   presents it and offers a way to refine. onRefine is wired by the pipeline
   orchestrator (Step 5.2) to re-run translation with the added detail; here it
   is just a callback so the component is self-contained and testable. */

export interface ClarifyPromptProps {
  question: string;
  onRefine?: (refinedInput: string) => void;
}

export function ClarifyPrompt({ question, onRefine }: ClarifyPromptProps) {
  const [text, setText] = useState("");
  const canRefine = text.trim().length > 0;

  return (
    <GlassCard className="clarify-prompt" data-testid="clarify-prompt">
      <p className="clarify-prompt__question">{question}</p>
      <textarea
        className="clarify-prompt__input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Add a little more, or say it a different way…"
        aria-label="Add detail to your question"
        rows={3}
      />
      <div className="clarify-prompt__actions">
        <BlueMarbleButton
          className="primitive-glass-button"
          onClick={() => canRefine && onRefine?.(text.trim())}
          disabled={!canRefine}
        >
          Refine and try again
        </BlueMarbleButton>
      </div>
    </GlassCard>
  );
}
