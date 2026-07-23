import { BlueMarbleButton } from "../primitives";
import { BrainMark } from "../layout/BrainMark";

/* TRANSLATE & ASK (Step 5.0). Blue Marble — the one primary-action surface
   (MATERIALS.md). Its "pressed state is immediate, never waiting on a network
   call to acknowledge the click" (CANON ADHD Time rule): onClick here is a
   synchronous, local call (buildTranslateAskRequest + a prop callback) with no
   await, no fetch — so the browser's native immediate :active feedback is
   never blocked on anything asynchronous. Always enabled: there is no
   client-side validation gating it, so it is pressable on a cold load with
   nothing configured (CANON ADHD Decisions rule: every control has a
   sensible default).

   VISUAL-AUDIT V13 (fixed this session): V3 shows a small BrainMark before
   the label — same brand icon used everywhere else "the AI is doing the
   thinking" (composer label, message avatar), not a generic icon. */

export interface TranslateAskButtonProps {
  onClick: () => void;
}

export function TranslateAskButton({ onClick }: TranslateAskButtonProps) {
  return (
    <BlueMarbleButton className="translate-ask-button" onClick={onClick}>
      <BrainMark size={16} />
      TRANSLATE &amp; ASK →
    </BlueMarbleButton>
  );
}
