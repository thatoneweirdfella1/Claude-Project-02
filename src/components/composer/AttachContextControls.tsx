import { GlassButton } from "../primitives";

/* Attach and Context controls (Step 5.0) — real, focusable buttons that emit
   their click events. Phase 7 gives them their actual behavior (7.1 file
   upload, 7.3 URL fetch, 7.4 variables, 7.5 the Context Snapshot panel); this
   step builds the controls and their events, not the file handling — onAttach
   /onContext default to a harmless no-op so the composer works standalone
   before Phase 7 wires real handlers in.

   Text-only labels, no icons (repo-wide icon debt since Step 1.5 — no icon
   library chosen yet; see BUILD-LOG PARKED). The screenshot's small chevron
   glyphs are approximated with plain unicode characters, not a real icon
   asset. */

export interface AttachContextControlsProps {
  onAttach?: () => void;
  onContext?: () => void;
}

export function AttachContextControls({
  onAttach = () => {},
  onContext = () => {},
}: AttachContextControlsProps) {
  return (
    <div className="attach-context-controls">
      <GlassButton onClick={onAttach} aria-haspopup="menu">
        Attach ▾
      </GlassButton>
      <GlassButton onClick={onContext} aria-haspopup="dialog">
        Context ›
      </GlassButton>
    </div>
  );
}
