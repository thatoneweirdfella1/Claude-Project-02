import { useState } from "react";
import { BlueMarbleButton, GlassCard, GlassButton } from "../primitives";
import { useDismissableLayer, useFocusTrap } from "../../keyboard";
import {
  DEFAULT_EXPORT_FORMAT,
  EXPORT_FORMATS,
  buildExportData,
  renderHtml,
  renderJson,
  renderMarkdown,
  renderPdf,
  type ExportContentSelection,
  type ExportFormat,
} from "../../services/export";
import type { TelemetryEntry } from "../../services/telemetry";
import type { ConversationMessage } from "../../stores/types";

/* Download modal (Step 8.5) — CANON Feature 10: "Download modal: pick
   content (answer text, confidence, rating, transparency, state pills) and
   format (Markdown default, HTML, JSON, PDF), then download or copy to
   clipboard." The first real modal in this build — Step 1.9's keyboard
   framework (focus trap + Escape-dismissable layer) was built anticipating
   exactly this; wired here for real rather than a one-off popover, since a
   modal genuinely needs focus containment CANON's ADHD rules require
   (everything reachable by Tab/Enter/Escape).

   Content checkboxes are pre-checked for whatever this specific message
   actually has (a message with no rating yet shows Rating unchecked AND
   disabled, not silently exportable as empty) — buildExportData already
   drops anything unchecked or unavailable, this only decides the DEFAULT
   state so a user exporting everything doesn't have to click every box. */

export interface DownloadModalProps {
  message: ConversationMessage;
  /** The TelemetryEntry message.telemetryId resolves to, or null if it
      can't be found (never logged, or fell off the bounded in-memory
      telemetry log) — Transparency is unavailable in that case, same as any
      other absent content. */
  telemetryEntry: TelemetryEntry | null;
  onClose: () => void;
}

const FORMAT_LABELS: Record<ExportFormat, string> = {
  markdown: "Markdown",
  html: "HTML",
  json: "JSON",
  pdf: "PDF",
};

const EXTENSIONS: Record<ExportFormat, string> = {
  markdown: "md",
  html: "html",
  json: "json",
  pdf: "pdf",
};

const MIME_TYPES: Record<ExportFormat, string> = {
  markdown: "text/markdown",
  html: "text/html",
  json: "application/json",
  pdf: "application/pdf",
};

function triggerDownload(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function DownloadModal({ message, telemetryEntry, onClose }: DownloadModalProps) {
  const availability: ExportContentSelection = {
    answerText: true,
    confidence: typeof message.confidence === "number",
    rating: message.ratingStars !== undefined,
    transparency: telemetryEntry !== null,
    statePills: message.statePills !== undefined,
  };

  const [selection, setSelection] = useState<ExportContentSelection>(availability);
  const [format, setFormat] = useState<ExportFormat>(DEFAULT_EXPORT_FORMAT);
  const [status, setStatus] = useState<string | null>(null);

  const trapRef = useFocusTrap<HTMLDivElement>(true);
  useDismissableLayer(true, onClose);

  function toggle(key: keyof ExportContentSelection): void {
    if (!availability[key]) return; // can't check something that isn't there
    setSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function renderText(): string {
    const data = buildExportData(message, selection, telemetryEntry);
    if (format === "html") return renderHtml(data);
    if (format === "json") return renderJson(data);
    return renderMarkdown(data);
  }

  function handleDownload(): void {
    const filename = `divergence-export.${EXTENSIONS[format]}`;
    if (format === "pdf") {
      const data = buildExportData(message, selection, telemetryEntry);
      triggerDownload(filename, new Blob([renderPdf(data)], { type: MIME_TYPES.pdf }));
    } else {
      triggerDownload(filename, new Blob([renderText()], { type: MIME_TYPES[format] }));
    }
    setStatus("Downloaded.");
  }

  async function handleCopy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(renderText());
      setStatus("Copied to clipboard.");
    } catch {
      setStatus("Couldn't copy — try downloading instead.");
    }
  }

  const CONTENT_ITEMS: { key: keyof ExportContentSelection; label: string }[] = [
    { key: "answerText", label: "Answer text" },
    { key: "confidence", label: "Confidence" },
    { key: "rating", label: "Rating" },
    { key: "transparency", label: "Transparency" },
    { key: "statePills", label: "State pills" },
  ];

  return (
    <div
      className="download-modal-overlay"
      data-testid="download-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div ref={trapRef}>
        <GlassCard
          className="download-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Download and export"
          data-testid="download-modal"
        >
          <div className="download-modal__header">
            <p className="download-modal__title">Download</p>
            <button
              type="button"
              className="download-modal__close"
              aria-label="Close download dialog"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <fieldset className="download-modal__section">
            <legend>Content</legend>
            {CONTENT_ITEMS.map((item) => (
              <label key={item.key} className="download-modal__row">
                <input
                  type="checkbox"
                  checked={selection[item.key]}
                  disabled={!availability[item.key]}
                  onChange={() => toggle(item.key)}
                />
                {item.label}
                {!availability[item.key] && (
                  <span className="download-modal__unavailable"> (not available)</span>
                )}
              </label>
            ))}
          </fieldset>

          <fieldset className="download-modal__section">
            <legend>Format</legend>
            {EXPORT_FORMATS.map((f) => (
              <label key={f} className="download-modal__row">
                <input
                  type="radio"
                  name="export-format"
                  checked={format === f}
                  onChange={() => setFormat(f)}
                />
                {FORMAT_LABELS[f]}
              </label>
            ))}
          </fieldset>

          {status && <p className="download-modal__status">{status}</p>}

          <div className="download-modal__actions">
            <GlassButton onClick={handleCopy} disabled={format === "pdf"}>
              Copy to clipboard
            </GlassButton>
            <BlueMarbleButton onClick={handleDownload}>Download</BlueMarbleButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
