/* Batch upload orchestration (Step 7.1; Step 7.2 threads OCR through). The
   function the UI (Attach control) actually calls. Validates every picked
   file against the running session total (accumulating as files in THIS
   batch are accepted, so picking three 8MB files in one dialog correctly
   rejects the third one against the 50MB session cap even though no
   individual file is over 10MB), then reads content for every accepted
   file. Never throws — a rejected file is data (FileValidationResult), not
   an exception; one bad file in a batch doesn't abort the others.

   Files are read SEQUENTIALLY (not Promise.all) — deliberate, not an
   oversight: an image's OCR recognize() call is queued on tesseract.js's one
   shared worker regardless (ocr.ts), so "parallel" awaits on the JS side
   wouldn't make the underlying recognition any faster, only complicate the
   accumulating byte-total logic above for no real gain. */

import type { ContextItem } from "../../stores/types";
import { readFileAsContextItem, type ReadFileOptions } from "./fileToContextItem";
import { validateFile, type FileValidationResult } from "./fileValidation";

export interface RejectedFile {
  file: File;
  result: Extract<FileValidationResult, { ok: false }>;
}

export interface UploadFilesResult {
  accepted: ContextItem[];
  rejected: RejectedFile[];
}

export async function uploadFiles(
  files: Iterable<File>,
  currentSessionBytes: number,
  options: ReadFileOptions = {},
): Promise<UploadFilesResult> {
  const accepted: ContextItem[] = [];
  const rejected: RejectedFile[] = [];
  let runningBytes = currentSessionBytes;

  for (const file of files) {
    const result = validateFile(file, runningBytes);
    if (!result.ok) {
      rejected.push({ file, result });
      continue;
    }
    runningBytes += file.size;
    accepted.push(await readFileAsContextItem(file, options));
  }

  return { accepted, rejected };
}
