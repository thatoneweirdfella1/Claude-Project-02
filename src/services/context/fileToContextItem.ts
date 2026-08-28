/* Turns a validated upload into a ContextItem (Step 7.1; Step 7.2 adds real
   OCR for images). Call AFTER validateFile() has already passed — this does
   no validation itself, only reads content.

   Content extraction by type:
     TXT/JSON/CSV — read as plain text via File.text(). Genuine content.
     PDF          — no PDF-text-extraction library exists in this build (one
                    isn't installed; CONVENTIONS rule 3 makes adding a
                    dependency a logged decision, not something to slip in
                    here) and CANON doesn't ask for PDF text extraction the
                    way it explicitly asks for image OCR. The file is
                    accepted, validated, and tracked (label + bytes correct
                    for the session-limit math), but its content is a plainly
                    labeled placeholder rather than garbled binary mistaken
                    for text — silently storing junk would be worse than
                    admitting the gap. See BUILD-LOG.md PARKED.
     image/*      — Step 7.2: when an `ocrClient` is supplied, the image's
                    text is genuinely extracted (ocr.ts, tesseract.js,
                    worker-based — never blocks the main thread). Without one
                    (e.g. most tests, which stay offline), or if OCR itself
                    fails, falls back to the SAME honest placeholder Step 7.1
                    used — OCR is best-effort and must never crash or stall
                    an upload. */

import type { ContextItem, ContextItemKind } from "../../stores/types";
import { isImageFile } from "./fileValidation";
import type { OcrClient } from "./ocr";

function newContextItemId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `ctx-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

const TEXT_EXTENSIONS = [".txt", ".json", ".csv"];

export interface ReadFileOptions {
  /** Step 7.2 — when supplied and the file is an image, its text is
      extracted through this client instead of the placeholder. Omit to keep
      Step 7.1's original placeholder-only behavior (e.g. offline tests). */
  ocrClient?: OcrClient;
  /** R09 — origin/source of this file (e.g., "Uploaded", "Imported").
      Optional; display layer provides sensible defaults if omitted. */
  provenance?: string;
}

async function extractImageContent(file: File, ocrClient: OcrClient | undefined): Promise<string> {
  if (!ocrClient) {
    return `[Image file "${file.name}" — awaiting OCR. Not yet readable as text.]`;
  }
  try {
    // Trimmed defensively here, not just trusted from the client — same
    // "don't trust what an injected client hands back" posture translate.ts
    // applies to its own client's replies.
    const text = (await ocrClient(file)).trim();
    if (text.length === 0) {
      return `[Image file "${file.name}" — OCR ran but found no readable text in the image.]`;
    }
    return text;
  } catch {
    // Best-effort: OCR failing (worker init, unsupported image, network
    // fetch of tesseract's WASM/language assets blocked, etc.) must never
    // crash the upload — same defensive posture as every other client seam.
    return `[Image file "${file.name}" — text extraction failed. The image is still attached; only its text content is missing.]`;
  }
}

async function extractContent(file: File, options: ReadFileOptions): Promise<string> {
  const ext = extensionOf(file.name);
  if (TEXT_EXTENSIONS.includes(ext)) {
    return file.text();
  }
  if (ext === ".pdf") {
    return `[PDF file "${file.name}" — text extraction isn't available in this build yet. The file is tracked for size/limit purposes, but its content can't be read into a question.]`;
  }
  if (isImageFile(file)) {
    return extractImageContent(file, options.ocrClient);
  }
  // Unreachable once validateFile() has already run, but never throws on an
  // unexpected type — same defensive posture as every other service here.
  return `[File "${file.name}" — content not extracted.]`;
}

/** Kind is always "file" here (Step 7.1's own scope) — "text"/"url"/
    "variable" ContextItems are Steps 7.3/7.4's, built through their own
    constructors, not this one. */
const KIND: ContextItemKind = "file";

export async function readFileAsContextItem(
  file: File,
  options: ReadFileOptions = {},
): Promise<ContextItem> {
  const content = await extractContent(file, options);
  return {
    id: newContextItemId(),
    kind: KIND,
    label: file.name,
    content,
    bytes: file.size,
    fileType: file.type.trim() || `${extensionOf(file.name).slice(1).toUpperCase()} file`,
    included: true,
    ...(options.provenance && { provenance: options.provenance }),
  };
}
