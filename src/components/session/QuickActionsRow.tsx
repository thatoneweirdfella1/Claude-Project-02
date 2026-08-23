import { useEffect, useRef, useState } from "react";
import { ChevronDown, Copy, FileUp, FolderArchive, Library, MessageSquare, Plus, RotateCcw } from "lucide-react";
import {
  buildSessionRecord,
  sessionHasRecoverableWork,
  sessionRecordStatus,
  sessionRecordUpdatedAt,
} from "../../services/sessionLifecycle";
import { saveNow } from "../../services/persistence";
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
  const [lifecycleError, setLifecycleError] = useState("");
  const undoRef = useRef<(() => void) | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessions = useAccountStore((s) => s.sessions);
  const addSession = useAccountStore((s) => s.addSessionRecord);
  const removeSession = useAccountStore((s) => s.removeSessionRecord);
  const moveSessionToTrash = useAccountStore((s) => s.moveSessionToTrash);
  const restoreSessionFromTrash = useAccountStore((s) => s.restoreSessionFromTrash);
  const setScreen = useSessionStore((s) => s.setCurrentScreen);
  const newSession = useSessionStore((s) => s.newSession);
  const resetSession = useSessionStore((s) => s.resetSession);
  const loadSession = useSessionStore((s) => s.loadSessionRecord);
  const currentSessionId = useSessionStore((s) => s.sessionId);

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

  useEffect(() => {
    if (!dialog) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setDialog(dialog === "discard-confirm" ? "finish" : null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialog]);

  function showUndo(label: string, action: () => void | Promise<void>) {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoRef.current = action;
    setUndoLabel(label);
    undoTimer.current = setTimeout(() => { undoRef.current = null; setUndoLabel(""); }, 10_000);
  }

  async function persistCurrent(reason: "navigation" | "resume" | "new-session" | "duplicate") {
    const state = useSessionStore.getState();
    if (!sessionHasRecoverableWork(state)) {
      await saveNow({ snapshotActiveSession: false });
      return null;
    }
    const record = buildSessionRecord(state, { status: "active", recoveryReason: reason });
    addSession(record);
    await saveNow({ snapshotActiveSession: false });
    return record;
  }

  async function startNewSession() {
    const state = useSessionStore.getState();
    const recovery = sessionHasRecoverableWork(state)
      ? buildSessionRecord(state, { status: "active", recoveryReason: "new-session" })
      : null;
    try {
      setLifecycleError("");
      if (recovery) addSession(recovery);
      await saveNow({ snapshotActiveSession: false });
      newSession();
      await saveNow({ snapshotActiveSession: false });
      setOpen(false);
      document.querySelector<HTMLTextAreaElement>(".input-box__textarea")?.focus();
      showUndo("New session started", async () => {
        if (!recovery) return;
        await persistCurrent("new-session");
        loadSession(recovery);
        removeSession(recovery.id);
        await saveNow();
      });
    } catch {
      if (recovery) loadSession(recovery);
      setLifecycleError("Recovery save failed. Your current work was not cleared.");
    }
  }

  async function duplicate() {
    const state = useSessionStore.getState();
    const previous = buildSessionRecord(state, { status: "active", recoveryReason: "duplicate" });
    const now = Date.now();
    const duplicateRecord: SessionRecord = {
      ...previous,
      id: `session-${now}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: now,
      updatedAt: now,
      status: "active",
      recoveryReason: "duplicate",
      archived: false,
      closedAt: undefined,
      tag: `${previous.tag || "Current session"} — Copy`,
      conversation: previous.conversation.map((message) => ({ ...message })),
      context: previous.context.map((item) => ({ ...item })),
      variables: { ...previous.variables },
    };
    try {
      setLifecycleError("");
      addSession(previous);
      await saveNow({ snapshotActiveSession: false });
      addSession(duplicateRecord);
      loadSession(duplicateRecord);
      await saveNow();
      setMoreOpen(false); setOpen(false);
      showUndo("Duplicate opened", async () => {
        loadSession(previous);
        removeSession(duplicateRecord.id);
        await saveNow();
      });
    } catch {
      loadSession(previous);
      setLifecycleError("The duplicate could not be saved. Your original is still active.");
    }
  }

  async function finish(mode: "save" | "archive" | "discard") {
    const state = useSessionStore.getState();
    const record = sessionHasRecoverableWork(state)
      ? buildSessionRecord(state, {
          status: mode === "archive" ? "archived" : mode === "save" ? "saved" : "active",
          recoveryReason:
            mode === "archive" ? "finish-archive" : mode === "save" ? "finish-save" : "discard",
        })
      : null;
    try {
      setLifecycleError("");
      if (record) {
        addSession(record);
        if (mode === "discard") moveSessionToTrash(record.id);
      }
      await saveNow({ snapshotActiveSession: false });
      resetSession();
      await saveNow({ snapshotActiveSession: false });
      setDialog(null); setOpen(false); setMoreOpen(false);
      if (record && mode === "discard") {
        showUndo("Session moved to Trash", async () => {
          restoreSessionFromTrash(record.id);
          loadSession(record);
          await saveNow();
        });
      }
    } catch {
      if (record) {
        if (mode === "discard") restoreSessionFromTrash(record.id);
        loadSession(record);
      }
      setLifecycleError("Recovery save failed. Your current work was not discarded.");
    }
  }

  async function importSelected() {
    const selected = sessions.find((record) => record.id === previewId);
    if (!selected) return;
    try {
      setLifecycleError("");
      await persistCurrent(dialog === "resume" ? "resume" : "navigation");
      loadSession(selected);
      setScreen("translate");
      await saveNow();
      setDialog(null); setOpen(false);
    } catch {
      setLifecycleError("The current session could not be recovery-saved, so nothing was switched.");
    }
  }

  async function navigateSafely(screen: "templates" | "saved-prompts") {
    try {
      setLifecycleError("");
      await saveNow({ reason: "navigation" });
      setScreen(screen);
    } catch {
      setLifecycleError("Recovery save failed. Navigation was stopped so your work stays here.");
    }
  }

  const resumable = [...sessions]
    .filter((record) => record.id !== currentSessionId && sessionRecordStatus(record) === "active")
    .sort((a, b) => sessionRecordUpdatedAt(b) - sessionRecordUpdatedAt(a))
    .slice(0, 6);
  const preview = sessions.find((record) => record.id === previewId) ?? null;

  return <section className={"quick-actions " + (open ? "is-open" : "")}>
    <button type="button" className="quick-actions__bar utility-bar" aria-expanded={open} onClick={() => {
      const next = !open; setOpen(next); setMoreOpen(false);
      if (next) window.dispatchEvent(new CustomEvent("divergence:composer-overlay", { detail: "quick-actions" }));
    }}><span>Quick Actions</span><ChevronDown size={15} /></button>
    {open && <div className="quick-actions__tray surface-smoked-glass">
      <button type="button" onClick={() => void startNewSession()}><Plus size={15} />New Session</button>
      <button type="button" onClick={() => void navigateSafely("templates")}><Library size={15} />Templates</button>
      <button type="button" onClick={() => void navigateSafely("saved-prompts")}><MessageSquare size={15} />Saved Prompts</button>
      {resumable.length > 0 && <button type="button" onClick={() => setDialog("resume")}><RotateCcw size={15} />Resume</button>}
      <div className="quick-actions__more">
        <button type="button" onClick={() => setMoreOpen((value) => !value)}><ChevronDown size={15} />More</button>
        {moreOpen && <div className="quick-actions__more-menu surface-smoked-glass">
          <button type="button" onClick={() => void duplicate()}><Copy size={15} />Duplicate</button>
          <button type="button" onClick={() => setDialog("import")}><FileUp size={15} />Import</button>
          <button type="button" onClick={() => { void saveNow({ reason: "navigation" }).then(() => setDialog("finish")).catch(() => setLifecycleError("Recovery save failed. Finish was not opened.")); }}><FolderArchive size={15} />Finish Session</button>
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
        <button type="button" onClick={() => void finish("save")}><strong>Save</strong><span>Mark complete and keep in Saved Sessions.</span></button>
        <button type="button" onClick={() => void finish("archive")}><strong>Archive</strong><span>Mark complete and move to Archived.</span></button>
        <button type="button" className="danger" onClick={() => setDialog("discard-confirm")}><strong>Discard</strong><span>Delete this active work.</span></button>
      </div>
      <footer>Current work is recovery-saved.</footer>
    </div></div>}

    {dialog === "discard-confirm" && <div className="workflow-dialog" role="alertdialog" aria-modal="true" aria-labelledby="discard-session-title"><div className="workflow-dialog__card surface-smoked-glass"><header><h2 id="discard-session-title">Move this session to Trash?</h2><p>You can undo this now or restore it later from Trash.</p></header><footer className="workflow-dialog__actions"><button type="button" onClick={() => setDialog("finish")}>Go back</button><button type="button" className="danger" onClick={() => void finish("discard")}>Move to Trash</button></footer></div></div>}

    {lifecycleError && <div className="undo-toast" role="alert"><span>{lifecycleError}</span><button type="button" onClick={() => { void saveNow().then(() => setLifecycleError("")).catch(() => undefined); }}>Retry save</button></div>}
    {undoLabel && <div className="undo-toast" role="status"><span>{undoLabel}</span><button type="button" onClick={() => { void undoRef.current?.(); undoRef.current = null; setUndoLabel(""); }}>Undo</button><small>10 seconds</small></div>}
  </section>;
}
