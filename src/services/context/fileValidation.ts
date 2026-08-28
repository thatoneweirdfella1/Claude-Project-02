/* File upload validation (Step 7.1 — CANON Feature 6 / Context Management).
   CANON: "upload files (PDF, TXT, JSON, CSV, images with OCR)... Limits: 10MB
   per file, 50MB per session." Pure, framework-free — no DOM/File dependency
   beyond the standard File type, so this is unit-testable without a browser
   upload event.

   Checks EXTENSION first (case-insensitive), MIME type as a secondary signal
   — browsers report unreliable/empty MIME types for some files (notably
   .csv on Windows), so extension is the primary, more consistent check. */

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB, CANON Feature 6
export const MAX_SESSION_BYTES = 50 * 1024 * 1024; // 50MB, CANON Feature 6

export const ACCEPTED_DOCUMENT_EXTENSIONS = [".pdf", ".txt", ".json", ".csv"] as const;
export const ACCEPTED_IMAGE_EXTENSIONS = [
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".bmp",
] as const;

/** The `accept` attribute value for the file picker — matches exactly what
    validateFile allows, so the OS-level picker and the validator never
    disagree about what's offered vs. what's accepted. */
export const FILE_INPUT_ACCEPT = [
  ...ACCEPTED_DOCUMENT_EXTENSIONS,
  ...ACCEPTED_IMAGE_EXTENSIONS,
  "image/*", // belt-and-suspenders for image variants not explicitly listed
].join(",");

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf(".");
  return dot === -1 ? "" : filename.slice(dot).toLowerCase();
}

export function isImageFile(file: Pick<File, "name" | "type">): boolean {
  if (file.type.startsWith("image/")) return true;
  return (ACCEPTED_IMAGE_EXTENSIONS as readonly string[]).includes(extensionOf(file.name));
}

function isDocumentFile(file: Pick<File, "name" | "type">): boolean {
  return (ACCEPTED_DOCUMENT_EXTENSIONS as readonly string[]).includes(extensionOf(file.name));
}

export function isAcceptedFileType(file: Pick<File, "name" | "type">): boolean {
  return isDocumentFile(file) || isImageFile(file);
}

export type FileValidationResult =
  | { ok: true }
  | { ok: false; reason: "type"; message: string }
  | { ok: false; reason: "file-too-large"; message: string }
  | { ok: false; reason: "session-too-large"; message: string };

/** Validates ONE file against the type/size rules and the running session
    total. `sessionBytesSoFar` is the caller's responsibility to accumulate
    across a multi-file picker selection (existing session.context bytes plus
    any files already accepted earlier in the SAME batch) — this function is
    pure and stateless, it doesn't track anything itself. Messages are
    neutral and specific (CANON ADHD Feedback: never judgmental), never
    blaming the user for picking a file that's simply too big or an
    unsupported type. */
export function validateFile(
  file: Pick<File, "name" | "type" | "size">,
  sessionBytesSoFar: number,
): FileValidationResult {
  if (!isAcceptedFileType(file)) {
    return {
      ok: false,
      reason: "type",
      message: `"${file.name}" isn't a supported file type. Choose a PDF, TXT, JSON, CSV, PNG, JPG, JPEG, GIF, WEBP, or BMP file.`,
    };
  }
  if (file.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      reason: "file-too-large",
      message: `"${file.name}" is ${formatBytes(file.size)}, over the ${formatBytes(MAX_FILE_BYTES)} per-file limit. Choose a file no larger than ${formatBytes(MAX_FILE_BYTES)}.`,
    };
  }
  if (sessionBytesSoFar + file.size > MAX_SESSION_BYTES) {
    return {
      ok: false,
      reason: "session-too-large",
      message: `Adding "${file.name}" would put this session's loaded context over the ${formatBytes(MAX_SESSION_BYTES)} limit. Remove something first, or start a new session.`,
    };
  }
  return { ok: true };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
