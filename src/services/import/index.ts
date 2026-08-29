/* Import — public surface (Step 9.3, CANON Feature 11's eight import paths). */

export { parseImportText } from "./envelope";
export { parseChatHistory, findMessageArray, type ParsedChatHistory } from "./chatHistory";
export {
  IMPORT_SOURCES,
  IMPORT_PAYLOAD_KINDS,
  IMPORT_ENVELOPE_VERSION,
  type ImportSourceId,
  type ImportPayloadKind,
  type ImportEnvelope,
  type ImportedPayload,
  type ImportOutcome,
  type ImportFailureReason,
} from "./types";
