import { useLayoutEffect, useRef } from "react";
import { useSessionStore } from "../../stores/sessionStore";

const MAX_TEXTAREA_HEIGHT_PX = 280;

export function InputBox() {
  const draftInput = useSessionStore((s) => s.draftInput);
  const setDraftInput = useSessionStore((s) => s.setDraftInput);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const element = textareaRef.current;
    if (!element) return;
    element.style.height = "auto";
    element.style.height = `${Math.min(element.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
  }, [draftInput]);

  return (
    <div className="input-box">
      <textarea
        ref={textareaRef}
        className="input-box__textarea"
        value={draftInput}
        onChange={(event) => setDraftInput(event.target.value)}
        placeholder={"Type your thoughts here...\nRaw ideas, questions, context, anything you want to communicate to AI"}
        aria-label="What's on your mind?"
        rows={6}
      />
    </div>
  );
}
