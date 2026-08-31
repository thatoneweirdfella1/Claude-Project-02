/* R20: Select Unresolved Conversation — turn a set of selected, stable
   ConversationMessage ids (one message, or a contiguous range) into the
   exact reviewable context bundle a Multi-AI action sends. Built only from
   real conversation content; never fabricated or summarized. */

import type { ConversationMessage } from "../../stores/types";

export interface MessageSelectionBundle {
  /** Stable source message ids, in conversation order — the persisted link
      back to exactly what was selected (R20's "linked to stable source
      message IDs"). */
  sourceMessageIds: string[];
  /** The exact text sent to every Multi-AI participant. */
  contextBundle: string;
}

/** Selects the messages matching `selectedIds`, in their original
    conversation order (not selection-click order), and renders them into
    one reviewable text block. Returns null for an empty selection — the
    caller falls back to its own default (the most recent question). */
export function buildMessageSelection(
  conversation: ConversationMessage[],
  selectedIds: string[],
): MessageSelectionBundle | null {
  if (selectedIds.length === 0) return null;
  const selectedIndexes = selectedIds
    .map((id) => conversation.findIndex((message) => message.id === id))
    .filter((index) => index >= 0);
  if (selectedIndexes.length === 0) return null;
  const first = Math.min(...selectedIndexes);
  const last = Math.max(...selectedIndexes);
  // The selected IDs are range boundaries. Preserve every real turn between
  // them, including assistant/imported replies, so the reviewed bundle is
  // the actual contiguous conversation rather than two disconnected prompts.
  const selected = conversation.slice(first, last + 1);

  const contextBundle = selected
    .map((m) => `${m.role === "user" ? "You" : (m.sourceLabel || "Assistant")}: ${m.content.trim()}`)
    .join("\n\n");

  return {
    sourceMessageIds: selected.map((m) => m.id),
    contextBundle,
  };
}
