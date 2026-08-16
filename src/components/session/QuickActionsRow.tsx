import { useState } from "react";
import { ChevronDown, Copy, FileUp, FolderArchive, Library, MessageSquare, Plus, RotateCcw } from "lucide-react";
import { buildSessionRecord } from "../../services/sessionLifecycle";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";

export function QuickActionsRow() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const addSession = useAccountStore((s) => s.addSessionRecord);
  const setScreen = useSessionStore((s) => s.setCurrentScreen);
  const newSession = useSessionStore((s) => s.newSession);
  const resetSession = useSessionStore((s) => s.resetSession);
  const hasRecoverable = useSessionStore((s) => Boolean(s.draftInput.trim()) || s.conversation.length > 0);

  function duplicate() {
    addSession(buildSessionRecord(useSessionStore.getState(), { archived: false }));
    setMoreOpen(false);
  }
  function finish() {
    const state = useSessionStore.getState();
    if (state.conversation.length || state.draftInput.trim()) addSession(buildSessionRecord(state, { archived: true }));
    resetSession();
    setMoreOpen(false);
  }

  return <section className={"quick-actions " + (open ? "is-open" : "")}>
    <button type="button" className="quick-actions__bar utility-bar" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <span>Quick Actions</span><ChevronDown size={15} />
    </button>
    {open && <div className="quick-actions__tray surface-smoked-glass">
      <button type="button" onClick={newSession}><Plus size={15} />New Session</button>
      <button type="button" onClick={() => setScreen("templates")}><Library size={15} />Templates</button>
      <button type="button" onClick={() => setScreen("saved-prompts")}><MessageSquare size={15} />Saved Prompts</button>
      {hasRecoverable && <button type="button" onClick={() => document.querySelector<HTMLTextAreaElement>(".input-box__textarea")?.focus()}><RotateCcw size={15} />Resume</button>}
      <div className="quick-actions__more">
        <button type="button" onClick={() => setMoreOpen((value) => !value)}><ChevronDown size={15} />More</button>
        {moreOpen && <div className="quick-actions__more-menu surface-smoked-glass">
          <button type="button" onClick={duplicate}><Copy size={15} />Duplicate</button>
          <button type="button" onClick={() => setScreen("sessions")}><FileUp size={15} />Import</button>
          <button type="button" onClick={finish}><FolderArchive size={15} />Finish Session</button>
        </div>}
      </div>
    </div>}
  </section>;
}
