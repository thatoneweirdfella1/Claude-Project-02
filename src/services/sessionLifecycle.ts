/* Session lifecycle helpers (Step 9.1) — CANON Feature 11. Pure: given the
   live session's fields, builds the SessionRecord Duplicate Session and
   Close Session file into accountStore.sessions (services/ stays store-
   agnostic — the caller reads sessionStore.getState() and calls
   accountStore.addSessionRecord() itself, same cross-store-at-the-
   component-level pattern ConversationArea already uses for ratings).

   Safe to hold the SAME array/object references from SessionState (no
   deep clone): every sessionStore action replaces context/variables/
   conversation with a NEW array/object on every mutation (checked —
   none of them push/mutate in place), so a snapshot reference taken here
   can never be silently changed out from under the archived record by
   the live session continuing to run. */

import type { SessionRecord, SessionState } from "../stores/types";

function newSessionRecordId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `session-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export interface BuildSessionRecordOptions {
  /** true for Close Session's "save and archive"/"archive tagged"; false
      for Duplicate Session (a filed-away copy, not a close). */
  archived: boolean;
  /** Close Session's "archive tagged" label. Never set for a duplicate or
      a plain "save and archive". */
  tag?: string;
}

/** `session` only needs the fields CANON actually names ("copy conversation,
    context, and settings") — draftInput/statePills are excluded on purpose,
    they're in-progress/derived state, not part of what gets duplicated or
    archived. */
export function buildSessionRecord(
  session: Pick<
    SessionState,
    "model" | "destination" | "translatorEngine" | "reviewBeforeSend" | "directness" | "techniques" | "context" | "variables" | "conversation"
  >,
  options: BuildSessionRecordOptions,
): SessionRecord {
  const now = Date.now();
  return {
    id: newSessionRecordId(),
    createdAt: now,
    closedAt: options.archived ? now : undefined,
    archived: options.archived,
    tag: options.tag,
    model: session.model,
    destination: session.destination,
    translatorEngine: session.translatorEngine,
    reviewBeforeSend: session.reviewBeforeSend,
    directness: session.directness,
    techniques: session.techniques,
    context: session.context,
    variables: session.variables,
    conversation: session.conversation,
  };
}
