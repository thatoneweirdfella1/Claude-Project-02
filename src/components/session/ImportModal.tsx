import { useRef, useState } from "react";
import { GlassCard } from "../primitives";
import { useDismissableLayer, useFocusTrap } from "../../keyboard";
import {
  FILE_INPUT_ACCEPT,
  fetchUrlContext,
  getSharedOcrClient,
  uploadFiles,
} from "../../services/context";
import { parseImportText, type ImportPayloadKind, type ImportOutcome } from "../../services/import";
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
   is Step 8.5's DownloadModal pattern, unchanged.

   R08 REQUIREMENT: Session Import Selector now provides:
   - Visible supported-file chooser (R08.1)
   - File preview before import (R08.2)
   - Validation with actionable feedback (R08.3)
   - Explicit confirmation before applying changes (R08.4)
   - No partial import after failure — atomic operations (R08.5) */

type Group = "outside" | "app-data";
type View = "groups" | Group | "url" | "previous-conversation" | "json-file-preview";
type ImportPhase = "select" | "preview" | "confirm" | null;

interface Status {
  tone: "ok" | "problem";
  text: string;
}

interface FilePreviewState {
  file: File;
  kind: ImportPayloadKind;
  phase: ImportPhase;
  validationResult: ImportOutcome | null;
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
  const [filePreview, setFilePreview] = useState<FilePreviewState | null>(null);

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
    setView("json-file-preview");
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
      const fileText = await file.text();
      const validationResult = parseImportText(fileText, kind);

      /* R08.1: Show file selection with visible UI.
         R08.2: Display preview with validation results before confirming.
         R08.3: Validation happens here, results shown to user.
         R08.4: Require explicit confirmation before applying.
         Atomic operation: we validate first, then only apply if validation
         succeeds AND user confirms. No partial state changes. */
      setFilePreview({
        file,
        kind,
        phase: "preview",
        validationResult,
      });
    } catch {
      // Reading the file itself failed (permissions, a device that went
      // away mid-read). Neutral copy, same as every other failure here.
      report("problem", "That file couldn't be read.");
      setFilePreview(null);
    } finally {
      setBusy(false);
    }
  }

  /** Apply the validated payload to the appropriate store. Only called after
      explicit user confirmation. This ensures R08.5: no partial import on
      failure — either the entire confirmed payload applies, or nothing does. */
  async function confirmImport(): Promise<void> {
    if (!filePreview || !filePreview.validationResult || !filePreview.validationResult.ok) return;

    setBusy(true);
    try {
      const validResult = filePreview.validationResult;
      const message = applyPayload(validResult.payload);
      report("ok", withSkipped(message, validResult.skipped));
      setFilePreview(null);
    } finally {
      setBusy(false);
    }
  }

  function cancelFileImport(): void {
    setFilePreview(null);
    setStatus(null);
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

  /** R08.2: Describe what will be imported from the validated payload.
      Shows the user a clear preview before they confirm. */
  function describePreview(validationResult: ImportOutcome | null): string {
    if (!validationResult || !validationResult.ok) {
      return `Cannot import: ${validationResult?.message ?? "Unknown error"}`;
    }

    const { payload, skipped } = validationResult;
    let description = "";

    switch (payload.kind) {
      case "variables": {
        const count = Object.keys(payload.variables).length;
        description = `Will import ${count} variable${count === 1 ? "" : "s"}`;
        break;
      }
      case "context-snapshot": {
        const count = payload.items.length;
        description = `Will import ${count} context item${count === 1 ? "" : "s"}`;
        break;
      }
      case "saved-prompts": {
        const count = payload.prompts.length;
        description = `Will import ${count} saved prompt${count === 1 ? "" : "s"}`;
        break;
      }
      case "template-settings": {
        const count = payload.templates.length;
        description = `Will import ${count} template${count === 1 ? "" : "s"}`;
        break;
      }
      case "chat-history": {
        const count = payload.messages.length;
        description = `Will import ${count} message${count === 1 ? "" : "s"}`;
        break;
      }
    }

    if (skipped > 0) {
      description += ` (${skipped} item${skipped === 1 ? "" : "s"} skipped)`;
    }

    return description;
  }

  /* ── views ──────────────────────────────────────────────────────────── */

  function renderBack(to: View, label: string) {
    return (
      <button type="button" className="import-modal__back" onClick={() => setView(to)}>
        ← {label}
      </button>
    );
  }

  /** R08.1–R08.5: Render the file preview and confirmation UI. Shows the
      selected file, validation results, and allows the user to confirm or
      reject the import before any changes are made to the store. */
  function renderJsonFilePreview() {
    if (!filePreview || !filePreview.validationResult) return null;

    const { file, kind, validationResult } = filePreview;
    const isValid = validationResult.ok;
    const preview = describePreview(validationResult);

    return (
      <div className="import-modal__rows">
        {renderBack("app-data", "Saved data")}

        <div className="import-modal__file-info">
          <p className="import-modal__label">File selected</p>
          <p className="import-modal__filename" title={file.name}>
            {file.name}
          </p>
          <p className="import-modal__label import-modal__label--muted">Type: {PAYLOAD_LABELS[kind]}</p>
        </div>

        <div
          className={`import-modal__preview import-modal__preview--${isValid ? "ok" : "problem"}`}
          role="status"
        >
          <p>{preview}</p>
          {!isValid && (
            <p className="import-modal__preview-detail">
              This file cannot be imported. Try another file or check that it was exported from this app.
            </p>
          )}
        </div>

        <div className="import-modal__actions">
          <button
            type="button"
            className="surface-smoked-glass import-modal__action-button import-modal__action-button--primary"
            disabled={busy || !isValid}
            onClick={() => void confirmImport()}
          >
            {busy ? "Importing…" : "Confirm import"}
          </button>
          <button
            type="button"
            className="surface-smoked-glass import-modal__action-button import-modal__action-button--secondary"
            disabled={busy}
            onClick={cancelFileImport}
          >
            Cancel
          </button>
        </div>
      </div>
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

          {view === "json-file-preview" && renderJsonFilePreview()}

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
