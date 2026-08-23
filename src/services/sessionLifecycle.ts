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

import type {
  SessionLifecycleStatus,
  SessionRecord,
  SessionRecoveryReason,
  SessionState,
} from "../stores/types";

function newSessionRecordId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `session-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export interface BuildSessionRecordOptions {
  /** true for Close Session's "save and archive"/"archive tagged"; false
      for Duplicate Session (a filed-away copy, not a close). */
  archived?: boolean;
  status?: SessionLifecycleStatus;
  recoveryReason?: SessionRecoveryReason;
  /** Duplicate uses a fresh id; lifecycle/recovery saves keep sessionId. */
  id?: string;
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
    | "sessionId"
    | "sessionCreatedAt"
    | "sessionTitle"
    | "draftInput"
    | "draftSelectionStart"
    | "draftSelectionEnd"
    | "conversationScrollTop"
    | "model"
    | "destination"
    | "translatorEngine"
    | "reviewBeforeSend"
    | "paidFallbackEnabled"
    | "maxRequestCost"
    | "directness"
    | "techniques"
    | "context"
    | "variables"
    | "conversation"
    | "statePills"
    | "currentScreen"
    | "methodology"
    | "methodologyPhase"
    | "lockedProblemStatement"
  >,
  options: BuildSessionRecordOptions,
): SessionRecord {
  const now = Date.now();
  const status = options.status ?? (options.archived ? "archived" : "active");
  const inferredTitle = session.conversation.find((message) => message.role === "user")?.content
    ?? session.draftInput;
  const title = options.tag ?? (
    session.sessionTitle || inferredTitle.trim().slice(0, 72) || undefined
  );
  return {
    id: options.id ?? session.sessionId ?? newSessionRecordId(),
    createdAt: session.sessionCreatedAt || now,
    updatedAt: now,
    closedAt: status === "active" ? undefined : now,
    status,
    recoveryReason: options.recoveryReason,
    archived: status === "archived",
    tag: title,
    model: session.model,
    destination: session.destination,
    translatorEngine: session.translatorEngine,
    reviewBeforeSend: session.reviewBeforeSend,
    paidFallbackEnabled: session.paidFallbackEnabled,
    maxRequestCost: session.maxRequestCost,
    directness: session.directness,
    techniques: session.techniques,
    context: session.context,
    variables: session.variables,
    conversation: session.conversation,
    draftInput: session.draftInput,
    draftSelectionStart: session.draftSelectionStart,
    draftSelectionEnd: session.draftSelectionEnd,
    conversationScrollTop: session.conversationScrollTop,
    statePills: session.statePills,
    currentScreen: session.currentScreen,
    methodology: session.methodology,
    methodologyPhase: session.methodologyPhase,
    lockedProblemStatement: session.lockedProblemStatement,
  };
}

export function sessionHasRecoverableWork(
  session: Pick<SessionState, "draftInput" | "conversation" | "context" | "variables">,
): boolean {
  return Boolean(
    session.draftInput.trim() ||
      session.conversation.length > 0 ||
      session.context.length > 0 ||
      Object.keys(session.variables).length > 0,
  );
}

export function sessionRecordStatus(record: SessionRecord): SessionLifecycleStatus {
  return record.status ?? (record.archived ? "archived" : "active");
}

export function sessionRecordUpdatedAt(record: SessionRecord): number {
  return record.updatedAt ?? record.closedAt ?? record.createdAt;
}
