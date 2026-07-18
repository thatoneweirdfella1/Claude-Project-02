import { useRef, useState } from "react";
import { GlassButton } from "../primitives";
import { useSessionStore } from "../../stores/sessionStore";
import {
  FILE_INPUT_ACCEPT,
  createTesseractOcrClient,
  uploadFiles,
  type OcrClient,
  type RejectedFile,
} from "../../services/context";

/* Attach and Context controls (Step 5.0 built the buttons; Step 7.1 gave
   Attach its real behavior; Step 7.2 adds OCR for images). "Attach ▾" opens
   a native file picker directly — CANON Feature 6's "upload files" — and
   reads the CANON limits (10MB per file, 50MB per session, PDF/TXT/JSON/CSV/
   images) through services/context/uploadFiles. Accepted files are added to
   session.context immediately (Step 1.7's existing addContextItem action —
   no new store field needed, ContextItem already had exactly this shape).
   Rejected files surface a neutral, specific, non-blaming message (CANON
   ADHD Feedback) rather than silently dropping them.

   Step 7.2: an image upload runs real OCR through a lazily-created,
   module-level tesseract client (one worker, reused across every image this
   session — see services/context/ocr.ts) — never blocking the main thread,
   since tesseract.js's worker does the recognition off-thread. Recognition
   genuinely takes seconds, so CANON's "indicator for any wait over 1 second"
   applies: `uploading` drives a status line for the whole upload+OCR pass
   (shown immediately, a strict superset of "after 1s" — same reasoning as
   the pipeline's stage indicator).

   "Context ›" still defaults to a harmless no-op — the Context Snapshot
   panel (showing everything loaded, with remove buttons) is Step 7.5's job;
   paste-text and paste-URL (Steps 7.3/7.4) are separate entry points this
   step doesn't invent ahead of their own steps. */

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

export function AttachContextControls({
  onAttach = () => {},
  onContext = () => {},
}: AttachContextControlsProps) {
  const context = useSessionStore((s) => s.context);
  const addContextItem = useSessionStore((s) => s.addContextItem);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rejections, setRejections] = useState<RejectedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  function openPicker() {
    fileInputRef.current?.click();
    onAttach();
  }

  async function handleFilesPicked(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const currentBytes = context.reduce((sum, item) => sum + item.bytes, 0);
      const { accepted, rejected } = await uploadFiles(fileList, currentBytes, {
        ocrClient: getOcrClient(),
      });
      for (const item of accepted) addContextItem(item);
      setRejections(rejected);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="attach-context-controls">
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
      <GlassButton onClick={openPicker} aria-haspopup="dialog" disabled={uploading}>
        Attach ▾
      </GlassButton>
      <GlassButton onClick={onContext} aria-haspopup="dialog">
        Context ›
      </GlassButton>

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
