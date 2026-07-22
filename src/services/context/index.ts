/* Context Management (Feature 6) — public surface.
   Step 7.1: file upload + validation. Step 7.2 extends readFileAsContextItem
   for images (real OCR). Steps 7.3/7.4 add URL fetch and variables here. */

export {
  MAX_FILE_BYTES,
  MAX_SESSION_BYTES,
  ACCEPTED_DOCUMENT_EXTENSIONS,
  ACCEPTED_IMAGE_EXTENSIONS,
  FILE_INPUT_ACCEPT,
  isAcceptedFileType,
  isImageFile,
  validateFile,
  formatBytes,
  type FileValidationResult,
} from "./fileValidation";
export { readFileAsContextItem, type ReadFileOptions } from "./fileToContextItem";
export { uploadFiles, type UploadFilesResult, type RejectedFile } from "./uploadFiles";
export { createTesseractOcrClient, terminateOcrWorker, type OcrClient } from "./ocr";
