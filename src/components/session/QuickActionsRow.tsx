import { useEffect, useRef, useState } from "react";
import { ChevronDown, Copy, FileUp, FolderArchive, Library, MessageSquare, Plus, RotateCcw } from "lucide-react";
import { buildSessionRecord } from "../../services/sessionLifecycle";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import type { SessionRecord } from "../../stores/types";

type Dialog = "resume" | "import" | "finish" | "discard-confirm" | null;

export function QuickActionsRow() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [undoLabel, setUndoLabel] = useState("");
  const undoRef = useRef<(() => void) | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessions = useAccountStore((s) => s.sessions);
  const addSession = useAccountStore((s) => s.addSessionRecord);
  const removeSession = useAccountStore((s) => s.removeSessionRecord);
  const setScreen = useSessionStore((s) => s.setCurrentScreen);
  const newSession = useSessionStore((s) => s.newSession);
  const resetSession = useSessionStore((s) => s.resetSession);
  const loadSession = useSessionStore((s) => s.loadSessionRecord);
  const hasWork = useSessionStore((s) => Boolean(s.draftInput.trim()) || s.conversation.length > 0 || s.context.length > 0);

  useEffect(() => {
    const switchOverlay = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== "quick-actions") { setOpen(false); setMoreOpen(false); }
    };
    window.addEventListener("divergence:composer-overlay", switchOverlay);
    return () => {
      window.removeEventListener("divergence:composer-overlay", switchOverlay);
      if (undoTimer.current) clearTimeout(undoTimer.current);
    };
  }, []);

  function showUndo(label: string, action: () => void) {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoRef.current = action;
    setUndoLabel(label);
    undoTimer.current = setTimeout(() => { undoRef.current = null; setUndoLabel(""); }, 10_000);
  }

  function startNewSession() {
    const recovery = buildSessionRecord(useSessionStore.getState(), { archived: false });
    if (hasWork) addSession(recovery);
    newSession();
    setOpen(false);
    document.querySelector<HTMLTextAreaElement>(".input-box__textarea")?.focus();
    showUndo("New session started", () => {
      if (hasWork) { loadSession(recovery); removeSession(recovery.id); }
    });
  }

  function duplicate() {
    const previous = buildSessionRecord(useSessionStore.getState(), { archived: false });
    const duplicateRecord: SessionRecord = {
      ...previous,
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      tag: `Copy of ${previous.tag || "current session"}`,
      conversation: previous.conversation.map((message) => ({ ...message })),
      context: previous.context.map((item) => ({ ...item })),
      variables: { ...previous.variables },
    };
    addSession(duplicateRecord);
    loadSession(duplicateRecord);
    setMoreOpen(false); setOpen(false);
    showUndo("Duplicate opened", () => { removeSession(duplicateRecord.id); loadSession(previous); });
  }

  function finish(mode: "save" | "archive" | "discard") {
    const state = useSessionStore.getState();
    if (mode !== "discard" && hasWork) addSession(buildSessionRecord(state, { archived: mode === "archive" }));
    resetSession();
    setDialog(null); setOpen(false); setMoreOpen(false);
  }

  function importSelected() {
    const selected = sessions.find((record) => record.id === previewId);
    if (!selected) return;
    loadSession(selected); setScreen("translate"); setDialog(null); setOpen(false);
  }

  const resumable = [...sessions].filter((record) => !record.archived).reverse().slice(0, 6);
  const preview = sessions.find((record) => record.id === previewId) ?? null;

  return <section className={"quick-actions " + (open ? "is-open" : "")}>
    <button type="button" className="quick-actions__bar utility-bar" aria-expanded={open} onClick={() => {
      const next = !open; setOpen(next); setMoreOpen(false);
      if (next) window.dispatchEvent(new CustomEvent("divergence:composer-overlay", { detail: "quick-actions" }));
    }}><span>Quick Actions</span><ChevronDown size={15} /></button>
    {open && <div className="quick-actions__tray surface-smoked-glass">
      <button type="button" onClick={startNewSession}><Plus size={15} />New Session</button>
      <button type="button" onClick={() => setScreen("templates")}><Library size={15} />Templates</button>
      <button type="button" onClick={() => setScreen("saved-prompts")}><MessageSquare size={15} />Saved Prompts</button>
      {resumable.length > 0 && <button type="button" onClick={() => setDialog("resume")}><RotateCcw size={15} />Resume</button>}
      <div className="quick-actions__more">
        <button type="button" onClick={() => setMoreOpen((value) => !value)}><ChevronDown size={15} />More</button>
        {moreOpen && <div className="quick-actions__more-menu surface-smoked-glass">
          <button type="button" onClick={duplicate}><Copy size={15} />Duplicate</button>
          <button type="button" onClick={() => setDialog("import")}><FileUp size={15} />Import</button>
          <button type="button" onClick={() => setDialog("finish")}><FolderArchive size={15} />Finish Session</button>
        </div>}
      </div>
    </div>}

    {(dialog === "resume" || dialog === "import") && <div className="workflow-dialog" role="dialog" aria-modal="true" aria-labelledby="session-picker-title">
      <div className="workflow-dialog__card surface-smoked-glass"><header><h2 id="session-picker-title">{dialog === "resume" ? "Resume unfinished work" : "Import a saved session"}</h2><p>Select a session, preview it, then confirm.</p></header>
        <div className="session-picker">{(dialog === "resume" ? resumable : [...sessions].reverse()).map((record) => <button key={record.id} type="button" aria-pressed={previewId === record.id} onClick={() => setPreviewId(record.id)}><strong>{record.tag || "Untitled session"}</strong><small>{record.conversation.length} messages · {record.context.length} context items</small></button>)}</div>
        {preview && <div className="session-preview"><strong>Preview</strong><p>{preview.draftInput || preview.conversation.at(-1)?.content || "Empty saved session"}</p></div>}
        <footer className="workflow-dialog__actions"><button type="button" onClick={() => setDialog(null)}>Cancel</button><button type="button" className="primary" disabled={!preview} onClick={importSelected}>{dialog === "resume" ? "Resume" : "Import"}</button></footer>
      </div>
    </div>}

    {dialog === "finish" && <div className="workflow-dialog" role="dialog" aria-modal="true" aria-labelledby="finish-session-title"><div className="workflow-dialog__card finish-session surface-smoked-glass">
      <header><h2 id="finish-session-title">Finish Session</h2><p>Choose exactly what should happen to this work.</p></header>
      <div className="finish-session__choices">
        <button type="button" onClick={() => setDialog(null)}><strong>Keep Active</strong><span>Close this window and keep working.</span></button>
        <button type="button" onClick={() => finish("save")}><strong>Save</strong><span>Save as unfinished and start fresh.</span></button>
        <button type="button" onClick={() => finish("archive")}><strong>Archive</strong><span>Mark complete and start fresh.</span></button>
        <button type="button" className="danger" onClick={() => setDialog("discard-confirm")}><strong>Discard</strong><span>Delete this active work.</span></button>
      </div>
    </div></div>}

    {dialog === "discard-confirm" && <div className="workflow-dialog" role="alertdialog" aria-modal="true"><div className="workflow-dialog__card surface-smoked-glass"><header><h2>Discard this session?</h2><p>This active work will not be saved.</p></header><footer className="workflow-dialog__actions"><button type="button" onClick={() => setDialog("finish")}>Go back</button><button type="button" className="danger" onClick={() => finish("discard")}>Discard permanently</button></footer></div></div>}

    {undoLabel && <div className="undo-toast" role="status"><span>{undoLabel}</span><button type="button" onClick={() => { undoRef.current?.(); undoRef.current = null; setUndoLabel(""); }}>Undo</button><small>10 seconds</small></div>}
  </section>;
}
