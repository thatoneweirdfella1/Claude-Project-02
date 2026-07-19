import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Copy, MoreHorizontal, RotateCw } from "lucide-react";
import { GlassButton } from "../primitives";
import { useConfirmable, useDismissableLayer } from "../../keyboard";
import { buildSessionRecord } from "../../services/sessionLifecycle";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import { ImportModal } from "./ImportModal";
import { LoadTemplateMenu } from "./LoadTemplateMenu";
import { SavedPromptsMenu } from "./SavedPromptsMenu";

/* QUICK ACTIONS row (Step 9.1: New Session, Duplicate Session, Close
   Session; Step 9.2 added Load Template and Saved Prompts, own files —
   LoadTemplateMenu.tsx/SavedPromptsMenu.tsx — into the same row, in the
   screenshot's order) — CANON Feature 11 / LAYOUT's center-column
   "quick actions".

   New Session calls sessionStore.newSession() (Step 9.1 STORE ADD) — keeps
   model/directness/techniques, clears conversation/context/variables/
   statePills/draftInput. Not confirmable: CANON's own text states what it
   does with no mention of a save/confirm step, unlike Close Session, which
   explicitly names three distinct outcomes. ADHD-AUDIT P2 (Step 11.5): the
   handler now archives a copy first (addSessionRecord(buildSessionRecord(...,
   { archived: false }))) before calling newSession() — CANON's defined
   clearing behavior is unchanged, but the conversation is no longer lost
   with nothing saved, so the no-confirm UX stays correct rather than merely
   convenient.

   Duplicate Session reads the live session (useSessionStore.getState(), a
   one-time read at click time, not a subscription) and files a
   `SessionRecord` (archived: false) via accountStore.addSessionRecord — the
   live session is untouched, it keeps running.

   Import (Step 9.3) is the second entry under "More ▾", opening ImportModal.
   Step 9.1's own DECISIONS entry deliberately left Import unplaced ("not a
   Quick Actions button at all ... Step 9.3's own separate step"), so this is
   that step making the call: the row shows four named buttons plus one
   overflow in the screenshot, and Import is the sixth of CANON Feature 11's
   six actions — the overflow is the only slot it can occupy without adding a
   button the screenshot doesn't have.

   Close Session lives under "More ▾" (the screenshot's fifth, unlabeled
   overflow slot) rather than its own top-level button — the screenshot only
   shows four named buttons + More, and Close Session is the rarer,
   consequential one of the five actions Feature 11 names, a natural fit for
   an overflow menu. Its three CANON-named outcomes:
     - Save and Archive: archives the current session as-is, then
       sessionStore.resetSession() (this action's first real caller —
       Close Session is a harder stop than New Session, so it resets
       settings too, not just history/context).
     - Archive Tagged: same, with a user-entered label.
     - Discard: THE destructive one named here (loses the conversation with
       no save) — gated by useConfirmable (Step 1.9's two-step confirm gate,
       unused until now), matching CANON's ADHD rule "only confirm
       destructive actions." New/Duplicate/Save-and-Archive/Archive-Tagged
       all keep or file the conversation somewhere (New Session included,
       as of the ADHD-AUDIT P2 fix above), so none of them get this gate —
       only Discard actually loses it. */

type CloseView = "menu" | "tag";

export function QuickActionsRow() {
  const newSession = useSessionStore((s) => s.newSession);
  const resetSession = useSessionStore((s) => s.resetSession);
  const addSessionRecord = useAccountStore((s) => s.addSessionRecord);

  const [moreOpen, setMoreOpen] = useState(false);
  const [closeView, setCloseView] = useState<CloseView>("menu");
  const [tagValue, setTagValue] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const discardConfirm = useConfirmable(() => {
    resetSession();
    closeMore();
  });

  useDismissableLayer(moreOpen, closeMore);

  useEffect(() => {
    if (!moreOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      closeMore();
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [moreOpen]);

  function closeMore(): void {
    setMoreOpen(false);
    setCloseView("menu");
    setTagValue("");
    discardConfirm.cancel();
  }

  function toggleMore(): void {
    setMoreOpen((wasOpen) => {
      if (wasOpen) {
        closeMore();
        return false;
      }
      return true;
    });
  }

  function handleDuplicateSession(): void {
    const current = useSessionStore.getState();
    addSessionRecord(buildSessionRecord(current, { archived: false }));
  }

  function handleNewSession(): void {
    // ADHD-AUDIT P2: file a copy before clearing — newSession() (CANON
    // Feature 11: "clears history and context") previously lost the
    // conversation with nothing archived, unlike every other Quick Action.
    // Archiving keeps CANON's defined clearing behavior and needs no confirm
    // dialog since nothing is actually lost (same pattern as Duplicate/Close).
    const current = useSessionStore.getState();
    addSessionRecord(buildSessionRecord(current, { archived: false }));
    newSession();
  }

  function archiveAndClose(tag?: string): void {
    const current = useSessionStore.getState();
    addSessionRecord(buildSessionRecord(current, { archived: true, tag }));
    resetSession();
    closeMore();
  }

  return (
    <div className="quick-actions">
      {/* VISUAL-AUDIT V12 (Step 11.5): V3 shows a small cyan "QUICK ACTIONS"
          label above the row; the app previously rendered bare buttons with
          no section label. */}
      <p className="quick-actions__header">QUICK ACTIONS</p>
      <div ref={rootRef} className="quick-actions-row" data-testid="quick-actions-row">
        <GlassButton onClick={handleNewSession}>
          <RotateCw size={16} aria-hidden="true" />
          New Session
        </GlassButton>
        <LoadTemplateMenu />
        <SavedPromptsMenu />
        <GlassButton onClick={handleDuplicateSession}>
          <Copy size={16} aria-hidden="true" />
          Duplicate Session
        </GlassButton>
        <div className="quick-actions-row__more">
          <GlassButton aria-expanded={moreOpen} aria-haspopup="menu" onClick={toggleMore}>
            <MoreHorizontal size={16} aria-hidden="true" />
            More
            {moreOpen ? <ChevronUp size={14} aria-hidden="true" /> : <ChevronDown size={14} aria-hidden="true" />}
          </GlassButton>

          {moreOpen && (
            <div className="quick-actions-row__popover" role="menu">
              {closeView === "menu" && (
                <button
                  type="button"
                  role="menuitem"
                  className="quick-actions-row__popover-row"
                  onClick={() => {
                    closeMore();
                    setImportOpen(true);
                  }}
                >
                  Import…
                </button>
              )}

              <p className="quick-actions-row__popover-title">Close Session</p>

              {closeView === "menu" && (
                <>
                  <button
                    type="button"
                    role="menuitem"
                    className="quick-actions-row__popover-row"
                    onClick={() => archiveAndClose()}
                  >
                    Save and Archive
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="quick-actions-row__popover-row"
                    onClick={() => setCloseView("tag")}
                  >
                    Archive Tagged
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="quick-actions-row__popover-row quick-actions-row__popover-row--destructive"
                    onClick={discardConfirm.trigger}
                  >
                    {discardConfirm.armed ? "Press again to confirm discard" : "Discard"}
                  </button>
                </>
              )}

              {closeView === "tag" && (
                <div className="quick-actions-row__tag-form">
                  <input
                    type="text"
                    className="quick-actions-row__tag-input"
                    placeholder="Tag this session"
                    aria-label="Tag this session"
                    value={tagValue}
                    onChange={(event) => setTagValue(event.target.value)}
                    autoFocus
                  />
                  <div className="quick-actions-row__tag-actions">
                    <button
                      type="button"
                      className="quick-actions-row__tag-back"
                      onClick={() => setCloseView("menu")}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="quick-actions-row__tag-archive"
                      disabled={tagValue.trim().length === 0}
                      onClick={() => archiveAndClose(tagValue.trim())}
                    >
                      Archive
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {importOpen && <ImportModal onClose={() => setImportOpen(false)} />}
      </div>
    </div>
  );
}
