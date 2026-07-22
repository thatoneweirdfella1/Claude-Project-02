import { useLayoutEffect, useRef } from "react";
import { useSessionStore } from "../../stores/sessionStore";
import { BrainMark } from "../layout/BrainMark";

/* The input box (Step 5.0) — CANON LAYOUT's "the input box ('What's on your
   mind?')". Bound directly to the session store's new `draftInput` field
   (Step 5.0), so the existing 5-second autosave (Step 1.8) already covers it —
   a crash mid-thought costs nothing, with zero new persistence code.

   Auto-grows with content (never an internal-scroll box for normal input) up
   to MAX_TEXTAREA_HEIGHT_PX, past which it scrolls internally rather than
   pushing the rest of the page around indefinitely for a truly enormous
   paste — nothing is ever clipped or truncated, and there is no character
   limit that blocks typing (see the counter below). */

const SOFT_CHAR_TARGET = 2000; // matches the screenshot's "0 / 2000"; informational only, never enforced
const MAX_TEXTAREA_HEIGHT_PX = 480; // roomy (many paragraphs) before internal scroll kicks in

export function InputBox() {
  const draftInput = useSessionStore((s) => s.draftInput);
  const setDraftInput = useSessionStore((s) => s.setDraftInput);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT_PX)}px`;
  }, [draftInput]);

  const overSoftTarget = draftInput.length > SOFT_CHAR_TARGET;

  return (
    <div className="input-box">
      {/* VISUAL-AUDIT V11 (fixed this session): V3 shows a small BrainMark
          before this label, not bare text. */}
      <p className="input-box__label">
        <BrainMark size={18} />
        What&rsquo;s on your mind?
      </p>
      <textarea
        ref={textareaRef}
        className="input-box__textarea"
        value={draftInput}
        onChange={(event) => setDraftInput(event.target.value)}
        placeholder="Type how you actually think…"
        aria-label="What's on your mind?"
        rows={3}
      />
      <p
        className={`input-box__counter ${overSoftTarget ? "input-box__counter--over" : ""}`}
        aria-live="off"
      >
        {draftInput.length} / {SOFT_CHAR_TARGET}
      </p>
    </div>
  );
}
