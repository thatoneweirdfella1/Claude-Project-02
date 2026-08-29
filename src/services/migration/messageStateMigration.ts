/* R19: Message state migration — converts legacy messageKind/handoffStatus
   fields to the new messageState model while preserving message meaning. */

import type { ConversationMessage, MessageState } from "../../stores/types";

/** Derive messageState from legacy fields. Used during load to ensure all
    messages have an explicit state, even pre-R19 ones. */
export function legacyToMessageState(message: ConversationMessage): MessageState {
  // If messageState is already set, use it as-is
  if (message.messageState) return message.messageState;

  // Infer from legacy handoffStatus
  if (message.handoffStatus === "handed-off") return "prepared";
  if (message.handoffStatus === "imported") return "imported";

  // Infer from legacy messageKind
  if (message.messageKind === "handoff") return "prepared";
  if (message.messageKind === "imported") return "imported";
  if (message.messageKind === "answer") return "answered";

  // Default: user messages are sent (they exist in history), assistant
  // messages without explicit kind are answered (they exist as responses)
  return message.role === "user" ? "sent" : "answered";
}

/** Ensure all messages have explicit messageState for uniform handling.
    Mutates messages in-place during load. */
export function migrateConversationStates(
  conversation: ConversationMessage[]
): ConversationMessage[] {
  return conversation.map((msg) => ({
    ...msg,
    messageState: msg.messageState || legacyToMessageState(msg),
  }));
}
