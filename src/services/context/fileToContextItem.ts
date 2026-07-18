/* Turns a validated upload into a ContextItem (Step 7.1). Call AFTER
   validateFile() has already passed — this does no validation itself, only
   reads content.

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
     image/*      — same honest-placeholder treatment for THIS step; Step 7.2
                    ("OCR pipeline") explicitly extends file upload to run
                    real OCR on images in a web worker and replace this
                    placeholder with extracted text. */

import type { ContextItem, ContextItemKind } from "../../stores/types";
import { isImageFile } from "./fileValidation";

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

async function extractContent(file: File): Promise<string> {
  const ext = extensionOf(file.name);
  if (TEXT_EXTENSIONS.includes(ext)) {
    return file.text();
  }
  if (ext === ".pdf") {
    return `[PDF file "${file.name}" — text extraction isn't available in this build yet. The file is tracked for size/limit purposes, but its content can't be read into a question.]`;
  }
  if (isImageFile(file)) {
    return `[Image file "${file.name}" — awaiting OCR (Step 7.2). Not yet readable as text.]`;
  }
  // Unreachable once validateFile() has already run, but never throws on an
  // unexpected type — same defensive posture as every other service here.
  return `[File "${file.name}" — content not extracted.]`;
}

/** Kind is always "file" here (Step 7.1's own scope) — "text"/"url"/
    "variable" ContextItems are Steps 7.3/7.4's, built through their own
    constructors, not this one. */
const KIND: ContextItemKind = "file";

export async function readFileAsContextItem(file: File): Promise<ContextItem> {
  const content = await extractContent(file);
  return {
    id: newContextItemId(),
    kind: KIND,
    label: file.name,
    content,
    bytes: file.size,
  };
}
