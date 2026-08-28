/* R19: Message state migration tests — verify legacy field conversion and
   state inference for backward compatibility. */

import { describe, it, expect } from "vitest";
import { legacyToMessageState, migrateConversationStates } from "./messageStateMigration";
import type { ConversationMessage } from "../../stores/types";

describe("R19: Message state migration", () => {
  describe("legacyToMessageState — converts legacy fields to messageState", () => {
    it("uses explicit messageState if present", () => {
      const msg: ConversationMessage = {
        id: "1", role: "user", content: "Hi", timestamp: 1,
        messageState: "sent",
        handoffStatus: "handed-off", // ignored
      };
      expect(legacyToMessageState(msg)).toBe("sent");
    });

    it("converts handoffStatus: handed-off to prepared", () => {
      const msg: ConversationMessage = {
        id: "1", role: "assistant", content: "Handoff", timestamp: 1,
        handoffStatus: "handed-off",
      };
      expect(legacyToMessageState(msg)).toBe("prepared");
    });

    it("converts handoffStatus: imported to imported", () => {
      const msg: ConversationMessage = {
        id: "1", role: "assistant", content: "Imported", timestamp: 1,
        handoffStatus: "imported",
      };
      expect(legacyToMessageState(msg)).toBe("imported");
    });

    it("converts messageKind: handoff to prepared", () => {
      const msg: ConversationMessage = {
        id: "1", role: "assistant", content: "Handoff", timestamp: 1,
        messageKind: "handoff",
      };
      expect(legacyToMessageState(msg)).toBe("prepared");
    });

    it("converts messageKind: imported to imported", () => {
      const msg: ConversationMessage = {
        id: "1", role: "assistant", content: "Imported", timestamp: 1,
        messageKind: "imported",
      };
      expect(legacyToMessageState(msg)).toBe("imported");
    });

    it("converts messageKind: answer to answered", () => {
      const msg: ConversationMessage = {
        id: "1", role: "assistant", content: "Answer", timestamp: 1,
        messageKind: "answer",
      };
      expect(legacyToMessageState(msg)).toBe("answered");
    });

    it("defaults user message (no legacy fields) to sent", () => {
      const msg: ConversationMessage = {
        id: "1", role: "user", content: "Question", timestamp: 1,
      };
      expect(legacyToMessageState(msg)).toBe("sent");
    });

    it("defaults assistant message (no legacy fields) to answered", () => {
      const msg: ConversationMessage = {
        id: "1", role: "assistant", content: "Response", timestamp: 1,
      };
      expect(legacyToMessageState(msg)).toBe("answered");
    });
  });

  describe("migrateConversationStates — ensures all messages have messageState", () => {
    it("adds messageState to all messages in a conversation", () => {
      const conversation: ConversationMessage[] = [
        {
          id: "1", role: "user", content: "Q1", timestamp: 1,
          messageKind: "answer", // legacy
        },
        {
          id: "2", role: "assistant", content: "A1", timestamp: 2,
          messageKind: "handoff", // legacy
        },
        {
          id: "3", role: "user", content: "Q2", timestamp: 3,
          messageState: "sent", // already has explicit state
        },
      ];

      const migrated = migrateConversationStates(conversation);

      expect(migrated).toHaveLength(3);
      expect(migrated[0]).toMatchObject({ id: "1", messageState: "answered" });
      expect(migrated[1]).toMatchObject({ id: "2", messageState: "prepared" });
      expect(migrated[2]).toMatchObject({ id: "3", messageState: "sent" });
    });

    it("preserves other message fields during migration", () => {
      const conversation: ConversationMessage[] = [
        {
          id: "1", role: "assistant", content: "Handoff", timestamp: 1,
          messageKind: "handoff",
          confidence: 85,
          ratingStars: 4,
          sourceLabel: "Test",
          preparedRequest: "REQUEST",
        },
      ];

      const migrated = migrateConversationStates(conversation);

      expect(migrated[0]).toMatchObject({
        id: "1",
        messageState: "prepared",
        confidence: 85,
        ratingStars: 4,
        sourceLabel: "Test",
        preparedRequest: "REQUEST",
      });
    });

    it("handles empty conversation", () => {
      const migrated = migrateConversationStates([]);
      expect(migrated).toEqual([]);
    });

    it("preserves imported and failed states through migration", () => {
      const conversation: ConversationMessage[] = [
        {
          id: "1", role: "assistant", content: "Imported", timestamp: 1,
          messageState: "imported",
        },
        {
          id: "2", role: "assistant", content: "Failed", timestamp: 2,
          messageState: "failed",
        },
        {
          id: "3", role: "assistant", content: "Cancelled", timestamp: 3,
          messageState: "cancelled",
        },
      ];

      const migrated = migrateConversationStates(conversation);

      expect(migrated[0].messageState).toBe("imported");
      expect(migrated[1].messageState).toBe("failed");
      expect(migrated[2].messageState).toBe("cancelled");
    });
  });

  describe("R19: Message state constraints", () => {
    it("user action tracking (copied/opened) is independent of messageState", () => {
      const msg: ConversationMessage = {
        id: "1", role: "assistant", content: "Answer", timestamp: 1,
        messageState: "sent",
        userCopied: true,
        userOpened: true,
      };

      // Copied/opened are orthogonal to sent state
      expect(msg.messageState).toBe("sent");
      expect(msg.userCopied).toBe(true);
      expect(msg.userOpened).toBe(true);
    });

    it("message in prepared state can have userCopied/userOpened set without changing state", () => {
      const msg: ConversationMessage = {
        id: "1", role: "user", content: "Draft", timestamp: 1,
        messageState: "prepared",
        userCopied: true, // User copied the draft
      };

      // State remains prepared even though user copied
      expect(msg.messageState).toBe("prepared");
      expect(msg.userCopied).toBe(true);
    });
  });
});
