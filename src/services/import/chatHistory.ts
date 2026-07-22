/* Chat-history parsing (Step 9.3) — CANON Feature 11's "chat history"
   import path, which its own note defines as "an externally exported
   conversation log (a file import)."

   EXTERNALLY exported is the operative word: this file will not generally
   have been written by this app, so parsing is STRUCTURAL, not per-vendor.
   No "ChatGPT adapter" / "Claude adapter" / etc. is built here — CANON names
   no vendor, and inventing a named-format zoo would be fabricating spec (the
   same reasoning LEFT NAVIGATION's Integrations entry gets: "do not invent
   behavior for it"). Instead this accepts the shapes that conversation logs
   overwhelmingly share, and tolerates the rest by SKIPPING unusable entries
   rather than failing the whole file — the same per-item tolerance
   detection/schema.ts uses when one dimension of a reading is garbage.

   Accepted container shapes:
     [ ...messages ]                      a bare array
     { messages:     [ ...messages ] }    the common wrapper
     { conversation: [ ...messages ] }    this app's own field name
   Accepted per-message shapes:
     { role, content }   content may be a string, or an array of
     { role, text   }    content blocks with .text — both are common. */

import type { ConversationMessage, MessageRole } from "../../stores/types";

function newMessageId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `imported-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** Role strings seen in the wild, mapped onto this app's two roles. A
    "system" turn is deliberately NOT mapped — it isn't a turn the user or
    the assistant took, so importing it as either would misrepresent the
    conversation. It's skipped (and counted), not silently relabelled. */
const ROLE_ALIASES: Record<string, MessageRole> = {
  user: "user",
  human: "user",
  prompt: "user",
  assistant: "assistant",
  ai: "assistant",
  model: "assistant",
  bot: "assistant",
};

function normalizeRole(raw: unknown): MessageRole | null {
  if (typeof raw !== "string") return null;
  return ROLE_ALIASES[raw.trim().toLowerCase()] ?? null;
}

/** Pulls text out of either a plain string or an array of content blocks.
    Blocks without text (images, tool calls) contribute nothing rather than
    rendering as "[object Object]" — dropping what can't be represented is
    honest; stringifying it is not. */
function normalizeContent(raw: unknown): string | null {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (Array.isArray(raw)) {
    const parts = raw
      .map((block) =>
        block && typeof block === "object" && typeof (block as { text?: unknown }).text === "string"
          ? (block as { text: string }).text
          : "",
      )
      .filter((text) => text.length > 0);
    const joined = parts.join("\n\n").trim();
    return joined.length > 0 ? joined : null;
  }
  return null;
}

function normalizeTimestamp(raw: unknown, fallback: number): number {
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) return raw;
  if (typeof raw === "string") {
    const parsed = Date.parse(raw);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

/** Finds the message array inside whichever container shape was given.
    Returns null if there isn't one — that's "unrecognized", not "empty". */
export function findMessageArray(root: unknown): unknown[] | null {
  if (Array.isArray(root)) return root;
  if (root && typeof root === "object") {
    const obj = root as Record<string, unknown>;
    if (Array.isArray(obj.messages)) return obj.messages;
    if (Array.isArray(obj.conversation)) return obj.conversation;
  }
  return null;
}

export interface ParsedChatHistory {
  messages: ConversationMessage[];
  /** Entries present in the file that could not be read as a turn. Surfaced
      to the user rather than swallowed — CANON "no hidden info". */
  skipped: number;
}

/** Never throws. An entry missing a usable role or usable content is
    skipped and counted; everything readable is kept, in file order.

    Imported messages deliberately carry NO assistant metadata (confidence,
    ratings, telemetryId, statePills). Those describe a pipeline run THIS
    app performed; an external log has no such run behind it, and
    fabricating values would put invented numbers behind the Transparency
    card and the export modal. Absent is correct — every one of those fields
    is optional on ConversationMessage precisely so a message can lack them. */
export function parseChatHistory(root: unknown, now: number = Date.now()): ParsedChatHistory {
  const rawMessages = findMessageArray(root);
  if (!rawMessages) return { messages: [], skipped: 0 };

  const messages: ConversationMessage[] = [];
  let skipped = 0;

  rawMessages.forEach((raw, index) => {
    if (!raw || typeof raw !== "object") {
      skipped += 1;
      return;
    }
    const entry = raw as Record<string, unknown>;
    const role = normalizeRole(entry.role);
    const content = normalizeContent(entry.content ?? entry.text);

    if (role === null || content === null) {
      skipped += 1;
      return;
    }

    messages.push({
      id: newMessageId(),
      role,
      content,
      // Preserves file order when a log carries no timestamps at all, so an
      // imported conversation still reads top-to-bottom in the right order.
      timestamp: normalizeTimestamp(entry.timestamp ?? entry.created_at, now + index),
    });
  });

  return { messages, skipped };
}
