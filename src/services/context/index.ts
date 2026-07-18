/* Context Management (Feature 6) — public surface.
   Step 7.1: file upload + validation. Step 7.2 extends readFileAsContextItem
   for images (real OCR). Step 7.3 adds URL fetch. Step 7.4 adds variables. */

export {
  isValidVariableName,
  substituteVariables,
  mergeVariables,
} from "./variables";

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
export {
  handleUrlFetchRequest,
  isBlockedUrl,
  type UrlFetchRequestBody,
  type UrlFetchResponseBody,
} from "./urlFetchHandler";
export {
  fetchUrlContext,
  extractReadableText,
  type UrlFetchOutcome,
  type FetchUrlOptions,
} from "./urlContext";
