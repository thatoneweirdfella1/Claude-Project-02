/* R19: Message state persistence and constraint tests — verify that
   copying/opening can never transition to sent/answered, and all states
   are properly persisted and migrated. */

import { describe, it, expect, beforeEach } from "vitest";
import { useSessionStore } from "./sessionStore";
import type { ConversationMessage, MessageState } from "./types";

describe("R19: Message state persistence", () => {
  beforeEach(() => {
    useSessionStore.getState().resetSession();
  });

  describe("addMessage with messageState", () => {
    it("persists explicit messageState on new messages", () => {
      const msg: ConversationMessage = {
        id: "1", role: "user", content: "Question", timestamp: 1,
        messageState: "sent",
      };
      useSessionStore.getState().addMessage(msg);

      const stored = useSessionStore.getState().conversation[0];
      expect(stored.messageState).toBe("sent");
    });

    it("allows setting messageState for all valid states", () => {
      const states: MessageState[] = [
        "prepared", "sent", "answered", "imported", "cancelled", "failed"
      ];

      states.forEach((state) => {
        useSessionStore.getState().resetSession();
        useSessionStore.getState().addMessage({
          id: `msg-${state}`, role: "user", content: "Test", timestamp: 1,
          messageState: state,
        });

        expect(useSessionStore.getState().conversation[0].messageState).toBe(state);
      });
    });
  });

  describe("updateMessage preserves state", () => {
    it("updates userCopied without changing messageState", () => {
      const msg: ConversationMessage = {
        id: "1", role: "assistant", content: "Answer", timestamp: 1,
        messageState: "answered",
      };
      useSessionStore.getState().addMessage(msg);
      useSessionStore.getState().updateMessage("1", { userCopied: true });

      const updated = useSessionStore.getState().conversation[0];
      expect(updated.messageState).toBe("answered");
      expect(updated.userCopied).toBe(true);
    });

    it("updates userOpened without changing messageState", () => {
      const msg: ConversationMessage = {
        id: "1", role: "user", content: "Question", timestamp: 1,
        messageState: "sent",
      };
      useSessionStore.getState().addMessage(msg);
      useSessionStore.getState().updateMessage("1", { userOpened: true });

      const updated = useSessionStore.getState().conversation[0];
      expect(updated.messageState).toBe("sent");
      expect(updated.userOpened).toBe(true);
    });

    it("allows state transitions: prepared -> sent", () => {
      const msg: ConversationMessage = {
        id: "1", role: "user", content: "Draft", timestamp: 1,
        messageState: "prepared",
      };
      useSessionStore.getState().addMessage(msg);
      useSessionStore.getState().updateMessage("1", { messageState: "sent" });

      expect(useSessionStore.getState().conversation[0].messageState).toBe("sent");
    });

    it("allows state transitions: sent -> answered", () => {
      const msg: ConversationMessage = {
        id: "1", role: "assistant", content: "Response", timestamp: 1,
        messageState: "sent",
      };
      useSessionStore.getState().addMessage(msg);
      useSessionStore.getState().updateMessage("1", { messageState: "answered" });

      expect(useSessionStore.getState().conversation[0].messageState).toBe("answered");
    });

    it("can mark message as failed", () => {
      const msg: ConversationMessage = {
        id: "1", role: "user", content: "Q", timestamp: 1,
        messageState: "prepared",
      };
      useSessionStore.getState().addMessage(msg);
      useSessionStore.getState().updateMessage("1", { messageState: "failed" });

      expect(useSessionStore.getState().conversation[0].messageState).toBe("failed");
    });

    it("can mark message as cancelled", () => {
      const msg: ConversationMessage = {
        id: "1", role: "user", content: "Q", timestamp: 1,
        messageState: "prepared",
      };
      useSessionStore.getState().addMessage(msg);
      useSessionStore.getState().updateMessage("1", { messageState: "cancelled" });

      expect(useSessionStore.getState().conversation[0].messageState).toBe("cancelled");
    });
  });

  describe("R19 constraint: Copying/opening are orthogonal to sent/answered", () => {
    it("message can be copied (userCopied=true) regardless of state", () => {
      const states: MessageState[] = [
        "prepared", "sent", "answered", "imported", "cancelled", "failed"
      ];

      states.forEach((state) => {
        useSessionStore.getState().resetSession();
        useSessionStore.getState().addMessage({
          id: `msg-${state}`, role: "assistant", content: "Text", timestamp: 1,
          messageState: state,
        });
        useSessionStore.getState().updateMessage(`msg-${state}`, { userCopied: true });

        const msg = useSessionStore.getState().conversation[0];
        expect(msg.messageState).toBe(state);
        expect(msg.userCopied).toBe(true);
      });
    });

    it("message can be opened (userOpened=true) regardless of state", () => {
      const states: MessageState[] = [
        "prepared", "sent", "answered", "imported", "cancelled", "failed"
      ];

      states.forEach((state) => {
        useSessionStore.getState().resetSession();
        useSessionStore.getState().addMessage({
          id: `msg-${state}`, role: "user", content: "Text", timestamp: 1,
          messageState: state,
        });
        useSessionStore.getState().updateMessage(`msg-${state}`, { userOpened: true });

        const msg = useSessionStore.getState().conversation[0];
        expect(msg.messageState).toBe(state);
        expect(msg.userOpened).toBe(true);
      });
    });

    it("copied/opened status persists independently of state changes", () => {
      const msg: ConversationMessage = {
        id: "1", role: "assistant", content: "Answer", timestamp: 1,
        messageState: "prepared",
        userCopied: true,
      };
      useSessionStore.getState().addMessage(msg);
      useSessionStore.getState().updateMessage("1", { messageState: "answered" });

      const updated = useSessionStore.getState().conversation[0];
      expect(updated.messageState).toBe("answered");
      expect(updated.userCopied).toBe(true); // Persists
    });
  });

  describe("R19 backward compatibility", () => {
    it("message without explicit messageState gets one on load", () => {
      const legacyMsg: ConversationMessage = {
        id: "1", role: "user", content: "Q", timestamp: 1,
        // No messageState, no legacy fields — should default to "sent"
      };
      useSessionStore.getState().addMessage(legacyMsg);
      useSessionStore.getState().loadSessionRecord({
        id: "session-1", createdAt: 1, archived: false, directness: 1,
        techniques: [], context: [], variables: {}, conversation: [legacyMsg],
        model: "auto",
      });

      expect(useSessionStore.getState().conversation[0].messageState).toBe("sent");
    });

    it("legacy handoffStatus: handed-off migrates to prepared", () => {
      const legacyMsg: ConversationMessage = {
        id: "1", role: "assistant", content: "Handoff", timestamp: 1,
        handoffStatus: "handed-off",
        messageKind: "handoff",
      };
      useSessionStore.getState().loadSessionRecord({
        id: "session-1", createdAt: 1, archived: false, directness: 1,
        techniques: [], context: [], variables: {}, conversation: [legacyMsg],
        model: "auto",
      });

      expect(useSessionStore.getState().conversation[0].messageState).toBe("prepared");
    });

    it("legacy messageKind: imported migrates to imported state", () => {
      const legacyMsg: ConversationMessage = {
        id: "1", role: "assistant", content: "Imported", timestamp: 1,
        messageKind: "imported",
        sourceLabel: "ChatGPT",
      };
      useSessionStore.getState().loadSessionRecord({
        id: "session-1", createdAt: 1, archived: false, directness: 1,
        techniques: [], context: [], variables: {}, conversation: [legacyMsg],
        model: "auto",
      });

      expect(useSessionStore.getState().conversation[0].messageState).toBe("imported");
    });

    it("preserves legacy fields after migration for backward compat", () => {
      const legacyMsg: ConversationMessage = {
        id: "1", role: "assistant", content: "Handoff", timestamp: 1,
        handoffStatus: "handed-off",
        messageKind: "handoff",
        preparedRequest: "REQUEST",
        sourceLabel: "Manual",
      };
      useSessionStore.getState().loadSessionRecord({
        id: "session-1", createdAt: 1, archived: false, directness: 1,
        techniques: [], context: [], variables: {}, conversation: [legacyMsg],
        model: "auto",
      });

      const msg = useSessionStore.getState().conversation[0];
      expect(msg.messageState).toBe("prepared");
      expect(msg.handoffStatus).toBe("handed-off"); // Legacy field preserved
      expect(msg.messageKind).toBe("handoff");
      expect(msg.preparedRequest).toBe("REQUEST");
      expect(msg.sourceLabel).toBe("Manual");
    });
  });

  describe("conversation state across session lifecycle", () => {
    it("persists message states through save/load cycle", () => {
      const msg1: ConversationMessage = {
        id: "1", role: "user", content: "Q", timestamp: 1,
        messageState: "sent", userCopied: true,
      };
      const msg2: ConversationMessage = {
        id: "2", role: "assistant", content: "A", timestamp: 2,
        messageState: "answered", userOpened: true,
      };
      useSessionStore.getState().addMessage(msg1);
      useSessionStore.getState().addMessage(msg2);

      const savedConversation = useSessionStore.getState().conversation;

      // Simulate reload: hydrate from saved state
      const freshStore = useSessionStore.getState();
      freshStore.resetSession();
      freshStore.hydrate({ conversation: savedConversation });

      const restored = freshStore.conversation;
      expect(restored).toHaveLength(2);
      expect(restored[0]).toMatchObject({
        id: "1", messageState: "sent", userCopied: true,
      });
      expect(restored[1]).toMatchObject({
        id: "2", messageState: "answered", userOpened: true,
      });
    });
  });
});
