import { useRef, useState } from "react";
import { GlassCard } from "../primitives";
import { useDismissableLayer, useFocusTrap } from "../../keyboard";
import {
  FILE_INPUT_ACCEPT,
  fetchUrlContext,
  getSharedOcrClient,
  uploadFiles,
} from "../../services/context";
import { parseImportText, type ImportPayloadKind } from "../../services/import";
import { buildSessionRecord } from "../../services/sessionLifecycle";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import type { SessionRecord } from "../../stores/types";

/* Import modal (Step 9.3) — CANON Feature 11's Import action and its EIGHT
   paths: file, URL, previous conversation, chat history, variables, context
   snapshot, saved prompts, template settings.

   TWO-LEVEL, NOT A FLAT LIST OF EIGHT. CANON's ADHD hard rule is explicit:
   "Never more than 5 to 7 simultaneous choices per view." Eight buttons in
   one view breaks that rule outright. The split is semantic, not arbitrary
   padding: one group brings content in from OUTSIDE the app (a file, a link,
   someone else's exported chat log), the other restores data this app's own
   features produced (a stored session, variables, a context snapshot, saved
   prompts, templates). Three and five — both inside the limit, and the group
   heading stays on screen so nothing has to be remembered mid-flow (the
   "never require remembering earlier context" half of the same rule).

   Reuses rather than rebuilds: the file path calls Step 7.1/7.2's
   uploadFiles() with the same shared OCR client and the same accept list the
   composer's Attach control uses, and the URL path calls Step 7.3's
   fetchUrlContext() — both already enforce CANON's 10MB/50MB budgets, so
   Import cannot become a side door around limits the rest of the app obeys.
   The modal shell (focus trap + Escape-dismissable layer + backdrop click)
   is Step 8.5's DownloadModal pattern, unchanged. */

type Group = "outside" | "app-data";
type View = "groups" | Group | "url" | "previous-conversation";

interface Status {
  tone: "ok" | "problem";
  text: string;
}

export interface ImportModalProps {
  onClose: () => void;
}

const PAYLOAD_LABELS: Record<ImportPayloadKind, string> = {
  variables: "Variables",
  "context-snapshot": "Context snapshot",
  "saved-prompts": "Saved prompts",
  "template-settings": "Template settings",
  "chat-history": "Chat history",
};

export function ImportModal({ onClose }: ImportModalProps) {
  const trapRef = useFocusTrap<HTMLDivElement>(true);
  useDismissableLayer(true, onClose);

  const [view, setView] = useState<View>("groups");
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [urlValue, setUrlValue] = useState("");

  /* Which payload kind the pending file-picker click is for. A ref, not
     state: it's set immediately before .click() and read in the change
     handler, so it must not wait for a re-render. */
  const pendingKind = useRef<ImportPayloadKind | null>(null);
  const contextFileInput = useRef<HTMLInputElement>(null);
  const jsonFileInput = useRef<HTMLInputElement>(null);

  const addContextItem = useSessionStore((s) => s.addContextItem);
  const addMessage = useSessionStore((s) => s.addMessage);
  const setSessionVariable = useSessionStore((s) => s.setSessionVariable);
  const loadSessionRecord = useSessionStore((s) => s.loadSessionRecord);
  const addSavedPrompt = useAccountStore((s) => s.addSavedPrompt);
  const addTemplate = useAccountStore((s) => s.addTemplate);
  const sessions = useAccountStore((s) => s.sessions);
  const addSessionRecord = useAccountStore((s) => s.addSessionRecord);

  function currentSessionBytes(): number {
    return useSessionStore.getState().context.reduce((sum, item) => sum + item.bytes, 0);
  }

  function report(tone: Status["tone"], text: string): void {
    setStatus({ tone, text });
  }

  /** Appends the "and N entries were skipped" half of a result message.
      Skips are surfaced, never swallowed — CANON "no hidden info". */
  function withSkipped(text: string, skipped: number): string {
    if (skipped === 0) return text;
    return `${text} ${skipped} ${skipped === 1 ? "entry" : "entries"} couldn't be read and ${skipped === 1 ? "was" : "were"} skipped.`;
  }

  /* ── file / URL: straight through Steps 7.1–7.3, nothing rebuilt ────── */

  async function handleContextFiles(files: FileList | null): Promise<void> {
    if (!files || files.length === 0) return;
    setBusy(true);
    setStatus(null);
    try {
      const { accepted, rejected } = await uploadFiles(files, currentSessionBytes(), {
        ocrClient: getSharedOcrClient(),
      });
      accepted.forEach(addContextItem);
      if (accepted.length === 0) {
        report("problem", rejected[0]?.result.message ?? "Nothing could be read from that.");
      } else {
        report(
          "ok",
          withSkipped(
            `Loaded ${accepted.length} ${accepted.length === 1 ? "file" : "files"} into context.`,
            rejected.length,
          ),
        );
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleUrlFetch(): Promise<void> {
    const url = urlValue.trim();
    if (url.length === 0) return;
    setBusy(true);
    setStatus(null);
    try {
      const outcome = await fetchUrlContext(url, currentSessionBytes());
      if (outcome.ok) {
        addContextItem(outcome.item);
        setUrlValue("");
        report("ok", `Loaded "${outcome.item.label}" into context.`);
      } else {
        report("problem", outcome.message);
      }
    } finally {
      setBusy(false);
    }
  }

  /* ── the five JSON-payload paths ────────────────────────────────────── */

  function pickJsonFor(kind: ImportPayloadKind): void {
    pendingKind.current = kind;
    setStatus(null);
    jsonFileInput.current?.click();
  }

  async function handleJsonFile(files: FileList | null): Promise<void> {
    const file = files?.[0];
    const kind = pendingKind.current;
    pendingKind.current = null;
    if (!file || !kind) return;

    setBusy(true);
    setStatus(null);
    try {
      const outcome = parseImportText(await file.text(), kind);
      if (!outcome.ok) {
        report("problem", outcome.message);
        return;
      }
      report("ok", withSkipped(applyPayload(outcome.payload), outcome.skipped));
    } catch {
      // Reading the file itself failed (permissions, a device that went
      // away mid-read). Neutral copy, same as every other failure here.
      report("problem", "That file couldn't be read.");
    } finally {
      setBusy(false);
    }
  }

  /** Applies a validated payload to the right store and returns the
      user-facing summary. Every write goes through an EXISTING store action
      — Import adds no new way to mutate state, it just feeds the actions
      the rest of the app already uses. */
  function applyPayload(payload: NonNullable<ReturnType<typeof parseImportText> & { ok: true }>["payload"]): string {
    switch (payload.kind) {
      case "variables": {
        const entries = Object.entries(payload.variables);
        entries.forEach(([name, value]) => setSessionVariable(name, value));
        return `Imported ${entries.length} ${entries.length === 1 ? "variable" : "variables"}.`;
      }
      case "context-snapshot": {
        payload.items.forEach(addContextItem);
        return `Imported ${payload.items.length} context ${payload.items.length === 1 ? "item" : "items"}.`;
      }
      case "saved-prompts": {
        payload.prompts.forEach(addSavedPrompt);
        return `Imported ${payload.prompts.length} saved ${payload.prompts.length === 1 ? "prompt" : "prompts"}.`;
      }
      case "template-settings": {
        payload.templates.forEach(addTemplate);
        return `Imported ${payload.templates.length} ${payload.templates.length === 1 ? "template" : "templates"}.`;
      }
      case "chat-history": {
        payload.messages.forEach(addMessage);
        return `Imported ${payload.messages.length} ${payload.messages.length === 1 ? "message" : "messages"}.`;
      }
    }
  }

  /* ── previous conversation: in-app, no file at all ──────────────────── */

  function handleLoadSession(record: SessionRecord): void {
    // ADHD-AUDIT P1: file the live session first — loadSessionRecord replaces
    // conversation/context/variables outright, and the next 5s autosave would
    // otherwise overwrite the only persisted copy of what was there. No
    // confirm dialog needed since nothing is lost (same pattern as
    // QuickActionsRow's newSession, ADHD-AUDIT P2).
    addSessionRecord(buildSessionRecord(useSessionStore.getState(), { archived: false }));
    loadSessionRecord(record);
    report("ok", "Loaded that conversation into this session.");
  }

  function sessionLabel(record: SessionRecord): string {
    if (record.tag) return record.tag;
    const firstUserTurn = record.conversation.find((m) => m.role === "user");
    if (firstUserTurn) return firstUserTurn.content.slice(0, 60);
    return record.archived ? "Archived session" : "Duplicated session";
  }

  /* ── views ──────────────────────────────────────────────────────────── */

  function renderBack(to: View, label: string) {
    return (
      <button type="button" className="import-modal__back" onClick={() => setView(to)}>
        ← {label}
      </button>
    );
  }

  return (
    <div
      className="import-modal-overlay"
      data-testid="import-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div ref={trapRef}>
        <GlassCard
          className="import-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Import"
          data-testid="import-modal"
        >
          <div className="import-modal__header">
            <p className="import-modal__title">Import</p>
            <button
              type="button"
              className="import-modal__close"
              aria-label="Close import dialog"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          {view === "groups" && (
            <div className="import-modal__rows">
              <button
                type="button"
                className="surface-smoked-glass import-modal__row"
                onClick={() => setView("outside")}
              >
                <span className="import-modal__row-label">Bring in outside content</span>
                <span className="import-modal__row-hint">A file, a link, or an exported chat log</span>
              </button>
              <button
                type="button"
                className="surface-smoked-glass import-modal__row"
                onClick={() => setView("app-data")}
              >
                <span className="import-modal__row-label">Restore saved data</span>
                <span className="import-modal__row-hint">
                  A past conversation, variables, context, prompts, or templates
                </span>
              </button>
            </div>
          )}

          {view === "outside" && (
            <div className="import-modal__rows">
              {renderBack("groups", "Import")}
              <button
                type="button"
                className="surface-smoked-glass import-modal__row"
                disabled={busy}
                onClick={() => contextFileInput.current?.click()}
              >
                <span className="import-modal__row-label">From a file</span>
                <span className="import-modal__row-hint">PDF, TXT, JSON, CSV, or an image</span>
              </button>
              <button
                type="button"
                className="surface-smoked-glass import-modal__row"
                disabled={busy}
                onClick={() => setView("url")}
              >
                <span className="import-modal__row-label">From a URL</span>
                <span className="import-modal__row-hint">Fetched through the proxy</span>
              </button>
              <button
                type="button"
                className="surface-smoked-glass import-modal__row"
                disabled={busy}
                onClick={() => pickJsonFor("chat-history")}
              >
                <span className="import-modal__row-label">Chat history</span>
                <span className="import-modal__row-hint">A conversation log exported from elsewhere</span>
              </button>
            </div>
          )}

          {view === "app-data" && (
            <div className="import-modal__rows">
              {renderBack("groups", "Import")}
              <button
                type="button"
                className="surface-smoked-glass import-modal__row"
                disabled={busy}
                onClick={() => setView("previous-conversation")}
              >
                <span className="import-modal__row-label">Previous conversation</span>
                <span className="import-modal__row-hint">
                  {sessions.length > 0
                    ? `${sessions.length} saved in this app`
                    : "None saved yet"}
                </span>
              </button>
              {(["variables", "context-snapshot", "saved-prompts", "template-settings"] as const).map(
                (kind) => (
                  <button
                    key={kind}
                    type="button"
                    className="surface-smoked-glass import-modal__row"
                    disabled={busy}
                    onClick={() => pickJsonFor(kind)}
                  >
                    <span className="import-modal__row-label">{PAYLOAD_LABELS[kind]}</span>
                    <span className="import-modal__row-hint">From a file this app exported</span>
                  </button>
                ),
              )}
            </div>
          )}

          {view === "url" && (
            <form
              className="import-modal__rows"
              onSubmit={(event) => {
                event.preventDefault();
                void handleUrlFetch();
              }}
            >
              {renderBack("outside", "Outside content")}
              <input
                type="url"
                className="import-modal__input"
                placeholder="https://"
                aria-label="URL to import"
                value={urlValue}
                onChange={(event) => setUrlValue(event.target.value)}
                autoFocus
              />
              <button
                type="submit"
                className="surface-smoked-glass import-modal__primary"
                disabled={busy || urlValue.trim().length === 0}
              >
                Fetch
              </button>
            </form>
          )}

          {view === "previous-conversation" && (
            <div className="import-modal__rows">
              {renderBack("app-data", "Saved data")}
              {sessions.length === 0 && (
                <p className="import-modal__empty">
                  No saved conversations yet. Duplicate or close a session to save one.
                </p>
              )}
              {sessions
                .slice()
                .reverse()
                .map((record) => (
                  <button
                    key={record.id}
                    type="button"
                    className="surface-smoked-glass import-modal__row"
                    disabled={busy}
                    onClick={() => handleLoadSession(record)}
                  >
                    <span className="import-modal__row-label">{sessionLabel(record)}</span>
                    <span className="import-modal__row-hint">
                      {record.conversation.length}{" "}
                      {record.conversation.length === 1 ? "message" : "messages"}
                      {record.archived ? " · archived" : ""}
                    </span>
                  </button>
                ))}
            </div>
          )}

          {busy && <p className="import-modal__status">Reading…</p>}
          {status && !busy && (
            <p
              className={`import-modal__status import-modal__status--${status.tone}`}
              role="status"
            >
              {status.text}
            </p>
          )}

          <input
            ref={contextFileInput}
            type="file"
            multiple
            accept={FILE_INPUT_ACCEPT}
            className="import-modal__file-input"
            onChange={(event) => {
              void handleContextFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <input
            ref={jsonFileInput}
            type="file"
            accept="application/json,.json"
            className="import-modal__file-input"
            onChange={(event) => {
              void handleJsonFile(event.target.files);
              event.target.value = "";
            }}
          />
        </GlassCard>
      </div>
    </div>
  );
}
