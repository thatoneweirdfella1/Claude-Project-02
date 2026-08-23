import { useLayoutEffect, useRef } from "react";
import { useSessionStore } from "../../stores/sessionStore";
import { ActiveContextChips } from "../context/ActiveContextChips";

const MAX_TEXTAREA_HEIGHT_PX = 280;
export const MAX_COMPOSER_CHARACTERS = 20_000;

export interface InputBoxProps { onSubmit?: () => void; }

export function InputBox({ onSubmit }: InputBoxProps) {
  const draftInput = useSessionStore((s) => s.draftInput);
  const draftSelectionStart = useSessionStore((s) => s.draftSelectionStart);
  const draftSelectionEnd = useSessionStore((s) => s.draftSelectionEnd);
  const setDraftInput = useSessionStore((s) => s.setDraftInput);
  const setDraftSelection = useSessionStore((s) => s.setDraftSelection);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
    if (document.activeElement !== element) element.setSelectionRange(draftSelectionStart, draftSelectionEnd);
  }, [draftInput, draftSelectionStart, draftSelectionEnd]);

  const rememberSelection = (element: HTMLTextAreaElement) => setDraftSelection(
    element.selectionStart ?? element.value.length,
    element.selectionEnd ?? element.value.length,
  );

  return <div className="input-box">
    <div className="input-box__field-shell">
      <textarea
        ref={textareaRef}
        className="input-box__textarea"
        value={draftInput}
        maxLength={MAX_COMPOSER_CHARACTERS}
        onChange={(event) => {
          setDraftInput(event.target.value.slice(0, MAX_COMPOSER_CHARACTERS));
          rememberSelection(event.currentTarget);
        }}
        onSelect={(event) => rememberSelection(event.currentTarget)}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            if (draftInput.trim()) onSubmit?.();
          }
        }}
        placeholder="Type how you actually think…"
        aria-label="What's on your mind?"
        aria-describedby="composer-character-count"
        rows={6}
      />
      <ActiveContextChips />
    </div>
    <div id="composer-character-count" className="input-box__counter" aria-live="polite">
      {draftInput.length.toLocaleString()} / {MAX_COMPOSER_CHARACTERS.toLocaleString()}
    </div>
  </div>;
}
