/* Batch upload orchestration (Step 7.1) — the function the UI (Attach
   control) actually calls. Validates every picked file against the running
   session total (accumulating as files in THIS batch are accepted, so
   picking three 8MB files in one dialog correctly rejects the third one
   against the 50MB session cap even though no individual file is over 10MB),
   then reads content for every accepted file. Never throws — a rejected file
   is data (FileValidationResult), not an exception; one bad file in a batch
   doesn't abort the others. */

import type { ContextItem } from "../../stores/types";
import { readFileAsContextItem } from "./fileToContextItem";
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
    accepted.push(await readFileAsContextItem(file));
  }

  return { accepted, rejected };
}
