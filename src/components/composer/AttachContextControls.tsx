import { useEffect, useRef, useState } from "react";
import { GlassButton } from "../primitives";
import { useDismissableLayer } from "../../keyboard";
import { useSessionStore } from "../../stores/sessionStore";
import {
  FILE_INPUT_ACCEPT,
  createTesseractOcrClient,
  fetchUrlContext,
  uploadFiles,
  type OcrClient,
  type RejectedFile,
} from "../../services/context";

/* Attach and Context controls (Step 5.0 built the buttons; Step 7.1 gave
   Attach its real file-upload behavior; Step 7.2 added OCR for images;
   Step 7.3 adds "paste a URL" as a second way in).

   "Attach ▾" now opens a small popover with two rows — "Upload a file" and
   "Paste a URL" — finally using the "▾" chevron for what it always implied
   (Step 7.1's own DECISIONS flagged this as "the simplest thing to extend
   into a real menu later if a future step needs one," and this is that
   step). Reuses the Step 1.9 keyboard framework's dismissable-layer +
   outside-click pattern already established by TechniqueDropdown (4.5) and
   StateDetectionPanel (6.3) — Escape and an outside click both close it.

   File upload's own logic (uploadFiles, OCR, rejections, the CANON limits)
   is completely UNCHANGED from Step 7.1/7.2, just now triggered from inside
   the popover instead of directly off the visible button. URL fetch (Step
   7.3, CANON Feature 6: "paste URL (fetched through the proxy)") calls
   services/context/fetchUrlContext, which never fetches the page directly
   from the browser — it POSTs to the server-side proxy (urlFetchHandler.ts
   / api/fetch-url.ts) and only extracts/parses the returned HTML here.

   "Context ›" still defaults to a harmless no-op — the Context Snapshot
   panel is Step 7.5's job. */

export interface AttachContextControlsProps {
  onAttach?: () => void;
  onContext?: () => void;
}

/** One tesseract worker for the whole app session, created on first use —
    not per component instance, so remounting AttachContextControls (or
    rendering it twice) never spins up a second worker. */
let sharedOcrClient: OcrClient | null = null;
function getOcrClient(): OcrClient {
  sharedOcrClient ??= createTesseractOcrClient();
  return sharedOcrClient;
}

type PopoverView = "menu" | "url";

export function AttachContextControls({
  onAttach = () => {},
  onContext = () => {},
}: AttachContextControlsProps) {
  const context = useSessionStore((s) => s.context);
  const addContextItem = useSessionStore((s) => s.addContextItem);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PopoverView>("menu");
  const [rejections, setRejections] = useState<RejectedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const [urlFetching, setUrlFetching] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

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
        ocrClient: getOcrClient(),
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
        Attach ▾
      </GlassButton>
      <GlassButton onClick={onContext} aria-haspopup="dialog">
        Context ›
      </GlassButton>

      {open && (
        <div className="attach-context-controls__popover" role="menu" data-testid="attach-popover">
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
        </div>
      )}

      {uploading && (
        <p className="attach-context-controls__status" role="status" data-testid="attach-uploading">
          Reading files…
        </p>
      )}

      {rejections.length > 0 && (
        <div
          className="attach-context-controls__rejections"
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
