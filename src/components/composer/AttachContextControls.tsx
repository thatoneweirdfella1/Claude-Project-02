import { useEffect, useRef, useState } from "react";
import { Paperclip, Target } from "lucide-react";
import { GlassButton } from "../primitives";
import { useDismissableLayer } from "../../keyboard";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import {
  FILE_INPUT_ACCEPT,
  fetchUrlContext,
  getSharedOcrClient,
  isValidVariableName,
  uploadFiles,
  type RejectedFile,
} from "../../services/context";

/* Attach and Context controls (Step 5.0 built the buttons; Step 7.1 gave
   Attach its real file-upload behavior; Step 7.2 added OCR for images;
   Step 7.3 added "paste a URL"; Step 7.4 adds "create a variable").

   "Attach ▾" opens a small popover with three rows — "Upload a file",
   "Paste a URL", "Create a variable" — finally using the "▾" chevron for
   what it always implied (Step 7.1's own DECISIONS flagged this as "the
   simplest thing to extend into a real menu later if a future step needs
   one," and each of 7.3/7.4 is that step, in turn). Reuses the Step 1.9
   keyboard framework's dismissable-layer + outside-click pattern already
   established by TechniqueDropdown (4.5) and StateDetectionPanel (6.3) —
   Escape and an outside click both close it.

   File upload's own logic (uploadFiles, OCR, rejections, the CANON limits)
   is completely UNCHANGED from Step 7.1/7.2. URL fetch (Step 7.3) is
   completely unchanged from that step. Step 7.4 adds variable creation
   (CANON Feature 6: "create variables ($name)") — session store by
   DEFAULT (setSessionVariable, Step 7.4 STORE ADD), with an "also save for
   future sessions" checkbox that ADDITIONALLY calls the account store's
   pre-existing setVariable (Step 1.7) — the exact "explicitly savable to
   the account store" CANON/this step's own text calls for, not a new save
   path.

   "Context ›" still defaults to a harmless no-op — the Context Snapshot
   panel is Step 7.5's job. */

export interface AttachContextControlsProps {
  onAttach?: () => void;
  onContext?: () => void;
}

type PopoverView = "menu" | "url" | "variable";

export function AttachContextControls({
  onAttach = () => {},
  onContext = () => {},
}: AttachContextControlsProps) {
  const context = useSessionStore((s) => s.context);
  const addContextItem = useSessionStore((s) => s.addContextItem);
  const setSessionVariable = useSessionStore((s) => s.setSessionVariable);
  const setAccountVariable = useAccountStore((s) => s.setVariable);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PopoverView>("menu");
  const [rejections, setRejections] = useState<RejectedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [urlFetching, setUrlFetching] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [variableName, setVariableName] = useState("");
  const [variableValue, setVariableValue] = useState("");
  const [saveVariableToAccount, setSaveVariableToAccount] = useState(false);
  const [variableError, setVariableError] = useState<string | null>(null);

  useDismissableLayer(open, () => setOpen(false));

  // Escape is handled above; this adds the mouse-side dismiss (same pattern
  // as TechniqueDropdown/StateDetectionPanel — Step 1.9's framework covers
  // Escape/focus/typing-isolation but not click-outside).
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function closePopover() {
    setOpen(false);
    setView("menu");
    setUrlValue("");
    setUrlError(null);
    setVariableName("");
    setVariableValue("");
    setSaveVariableToAccount(false);
    setVariableError(null);
  }

  function togglePopover() {
    setOpen((wasOpen) => {
      if (wasOpen) {
        closePopover();
        return false;
      }
      onAttach();
      return true;
    });
  }

  function currentSessionBytes(): number {
    return context.reduce((sum, item) => sum + item.bytes, 0);
  }

  function chooseUpload() {
    fileInputRef.current?.click();
    closePopover();
  }

  async function handleFilesPicked(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const { accepted, rejected } = await uploadFiles(fileList, currentSessionBytes(), {
        ocrClient: getSharedOcrClient(),
      });
      for (const item of accepted) addContextItem(item);
      setRejections(rejected);
    } finally {
      setUploading(false);
    }
  }

  async function handleFetchUrl() {
    setUrlFetching(true);
    setUrlError(null);
    try {
      const outcome = await fetchUrlContext(urlValue, currentSessionBytes());
      if (outcome.ok) {
        addContextItem(outcome.item);
        closePopover();
      } else {
        setUrlError(outcome.message);
      }
    } finally {
      setUrlFetching(false);
    }
  }

  function handleCreateVariable() {
    const name = variableName.trim();
    if (!isValidVariableName(name)) {
      setVariableError("Use letters, numbers, and underscores only — starting with a letter or underscore.");
      return;
    }
    setSessionVariable(name, variableValue);
    if (saveVariableToAccount) {
      setAccountVariable(name, variableValue);
    }
    closePopover();
  }

  return (
    <div className="attach-context-controls" ref={rootRef}>
      <input
        ref={fileInputRef}
        type="file"
        accept={FILE_INPUT_ACCEPT}
        multiple
        className="attach-context-controls__file-input"
        aria-hidden="true"
        tabIndex={-1}
        onChange={(event) => {
          void handleFilesPicked(event.target.files);
          event.target.value = ""; // allow re-picking the same file later
        }}
      />
      <GlassButton
        onClick={togglePopover}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={uploading}
      >
        <Paperclip size={16} aria-hidden="true" />
        Attach ▾
      </GlassButton>
      <GlassButton onClick={onContext} aria-haspopup="dialog">
        <Target size={16} aria-hidden="true" />
        Context ›
      </GlassButton>

      {open && (
        <div
          className="surface-smoked-glass attach-context-controls__popover"
          role="menu"
          data-testid="attach-popover"
        >
          {view === "menu" && (
            <>
              <button
                type="button"
                role="menuitem"
                className="attach-context-controls__popover-row"
                onClick={chooseUpload}
              >
                Upload a file
              </button>
              <button
                type="button"
                role="menuitem"
                className="attach-context-controls__popover-row"
                onClick={() => setView("url")}
              >
                Paste a URL
              </button>
              <button
                type="button"
                role="menuitem"
                className="attach-context-controls__popover-row"
                onClick={() => setView("variable")}
              >
                Create a variable
              </button>
            </>
          )}

          {view === "url" && (
            <form
              className="attach-context-controls__url-form"
              onSubmit={(event) => {
                event.preventDefault();
                void handleFetchUrl();
              }}
            >
              <label htmlFor="attach-url-input" className="attach-context-controls__url-label">
                Paste a URL to load as context
              </label>
              <input
                id="attach-url-input"
                type="text"
                inputMode="url"
                placeholder="https://…"
                className="attach-context-controls__url-input"
                value={urlValue}
                onChange={(event) => setUrlValue(event.target.value)}
                disabled={urlFetching}
                autoFocus
              />
              {urlError && (
                <p className="attach-context-controls__url-error" data-testid="url-fetch-error">
                  {urlError}
                </p>
              )}
              <div className="attach-context-controls__url-actions">
                <button
                  type="button"
                  className="attach-context-controls__url-back"
                  onClick={() => setView("menu")}
                  disabled={urlFetching}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="attach-context-controls__url-fetch"
                  disabled={urlFetching || urlValue.trim().length === 0}
                >
                  {urlFetching ? "Fetching…" : "Fetch"}
                </button>
              </div>
            </form>
          )}

          {view === "variable" && (
            <form
              className="attach-context-controls__variable-form"
              onSubmit={(event) => {
                event.preventDefault();
                handleCreateVariable();
              }}
            >
              <label htmlFor="attach-variable-name" className="attach-context-controls__url-label">
                Create a variable — use it in a question as $name
              </label>
              <div className="attach-context-controls__variable-name-row">
                <span className="attach-context-controls__variable-prefix" aria-hidden="true">
                  $
                </span>
                <input
                  id="attach-variable-name"
                  type="text"
                  placeholder="project_name"
                  className="attach-context-controls__url-input"
                  value={variableName}
                  onChange={(event) => setVariableName(event.target.value)}
                  autoFocus
                />
              </div>
              <input
                id="attach-variable-value"
                type="text"
                placeholder="Value"
                className="attach-context-controls__url-input"
                value={variableValue}
                onChange={(event) => setVariableValue(event.target.value)}
              />
              <label className="attach-context-controls__variable-save-label">
                <input
                  type="checkbox"
                  checked={saveVariableToAccount}
                  onChange={(event) => setSaveVariableToAccount(event.target.checked)}
                />
                Also save for future sessions
              </label>
              {variableError && (
                <p className="attach-context-controls__url-error" data-testid="variable-error">
                  {variableError}
                </p>
              )}
              <div className="attach-context-controls__url-actions">
                <button
                  type="button"
                  className="attach-context-controls__url-back"
                  onClick={() => setView("menu")}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="attach-context-controls__url-fetch"
                  disabled={variableName.trim().length === 0}
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {uploading && (
        <p className="attach-context-controls__status" role="status" data-testid="attach-uploading">
          Reading files…
        </p>
      )}

      {rejections.length > 0 && (
        <div
          className="surface-smoked-glass attach-context-controls__rejections"
          role="status"
          data-testid="attach-rejections"
        >
          {rejections.map(({ file, result }) => (
            <p key={file.name} className="attach-context-controls__rejection">
              {result.message}
            </p>
          ))}
          <button
            type="button"
            className="attach-context-controls__rejections-dismiss"
            onClick={() => setRejections([])}
            aria-label="Dismiss upload messages"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
