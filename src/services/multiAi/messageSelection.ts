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
  const idSet = new Set(selectedIds);
  const selected = conversation.filter((m) => idSet.has(m.id));
  if (selected.length === 0) return null;

  const contextBundle = selected
    .map((m) => `${m.role === "user" ? "You" : (m.sourceLabel || "Assistant")}: ${m.content.trim()}`)
    .join("\n\n");

  return {
    sourceMessageIds: selected.map((m) => m.id),
    contextBundle,
  };
}
