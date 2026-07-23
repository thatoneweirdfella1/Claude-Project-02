/* Import shapes (Step 9.3) — CANON Feature 11's Import action.

   CANON names EIGHT paths: "Import (from file, URL, previous conversation,
   chat history, variables, context snapshot, saved prompts, template
   settings)". Step 9.3's own SPOT CHECK line in DIVERGENCE-BUILD-PROMPTS.md
   still says "seven" and omits chat history — it predates the CANON fix that
   added it (see BUILD-LOG DECISIONS, "CHAT HISTORY ADDED AS 8TH IMPORT
   OPTION"). CANON wins by its own first line ("Where anything ever disagrees
   with this file, this file wins"), and that logged decision explicitly names
   this step as the implementer, so all eight are built here.

   CANON's own clarifying note distinguishes the two conversation paths:
   "previous conversation" resumes a session ALREADY STORED IN-APP
   (accountStore.sessions, written by Step 9.1's Duplicate/Close Session);
   "chat history" imports an EXTERNALLY exported conversation log — a file. */

import type {
  ContextItem,
  PromptTemplate,
  SavedPrompt,
  SavedVariables,
  ConversationMessage,
} from "../../stores/types";

/** The eight paths, exactly as CANON Feature 11 names them. */
export const IMPORT_SOURCES = [
  "file",
  "url",
  "previous-conversation",
  "chat-history",
  "variables",
  "context-snapshot",
  "saved-prompts",
  "template-settings",
] as const;
export type ImportSourceId = (typeof IMPORT_SOURCES)[number];

/** The five paths that read a structured JSON payload this app understands.
    The other three are handled by already-built machinery instead: `file`
    and `url` reuse Steps 7.1/7.3's uploadFiles()/fetchUrlContext() verbatim
    (they load arbitrary content as context, which is exactly what those
    already do), and `previous-conversation` is an in-app picker over
    accountStore.sessions with no parsing at all. */
export const IMPORT_PAYLOAD_KINDS = [
  "variables",
  "context-snapshot",
  "saved-prompts",
  "template-settings",
  "chat-history",
] as const;
export type ImportPayloadKind = (typeof IMPORT_PAYLOAD_KINDS)[number];

/** Bumped only on a BREAKING payload shape change. A file written at
    version 1 must keep importing cleanly at version 2 or the version number
    is doing nothing useful. */
export const IMPORT_ENVELOPE_VERSION = 1;

/** The envelope this app writes around any exported app-data payload.
    `app` and `kind` together are what let an import tell "this is a
    variables file" from "this is a saved-prompts file" without the user
    having to say — CANON's ADHD "every control has a sensible default"
    read as "don't make them classify their own file." */
export interface ImportEnvelope {
  app: "divergence-ai";
  version: number;
  kind: ImportPayloadKind;
  /** Epoch ms. Informational only — never used to decide anything. */
  exportedAt?: number;
  payload: unknown;
}

/** The parsed, validated result per kind. A discriminated union so the
    caller applying it to the stores can't mix up which payload it has. */
export type ImportedPayload =
  | { kind: "variables"; variables: SavedVariables }
  | { kind: "context-snapshot"; items: ContextItem[] }
  | { kind: "saved-prompts"; prompts: SavedPrompt[] }
  | { kind: "template-settings"; templates: PromptTemplate[] }
  | { kind: "chat-history"; messages: ConversationMessage[] };

/** Why an import didn't produce anything usable. Mirrors the never-throw
    outcome-union shape translate()/detectState()/runDebate() all use — an
    unreadable import is data, not an exception. */
export type ImportFailureReason =
  | "empty"
  | "too-large"
  | "not-json"
  | "unrecognized"
  | "wrong-kind"
  | "nothing-usable";

export type ImportOutcome =
  | { ok: true; payload: ImportedPayload; /** Skipped-but-tolerated entries. */ skipped: number }
  | { ok: false; reason: ImportFailureReason; message: string };
