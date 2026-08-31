import { describe, expect, it } from "vitest";
import { buildMessageSelection } from "./messageSelection";
import type { ConversationMessage } from "../../stores/types";

const CONVERSATION: ConversationMessage[] = [
  { id: "m1", role: "user", content: "What is event sourcing?", timestamp: 1 },
  { id: "m2", role: "assistant", content: "It's a pattern where state changes are stored as events.", timestamp: 2 },
  { id: "m3", role: "user", content: "Should we migrate to it?", timestamp: 3 },
  { id: "m4", role: "assistant", content: "Depends on your audit and replay needs.", timestamp: 4 },
];

describe("R20: buildMessageSelection", () => {
  it("returns null for an empty selection", () => {
    expect(buildMessageSelection(CONVERSATION, [])).toBeNull();
  });

  it("returns null when none of the selected ids exist in the conversation", () => {
    expect(buildMessageSelection(CONVERSATION, ["does-not-exist"])).toBeNull();
  });

  it("selects a single message and includes its stable id", () => {
    const bundle = buildMessageSelection(CONVERSATION, ["m1"]);
    expect(bundle).not.toBeNull();
    expect(bundle?.sourceMessageIds).toEqual(["m1"]);
    expect(bundle?.contextBundle).toContain("What is event sourcing?");
  });

  it("selects a contiguous range and preserves conversation order regardless of click order", () => {
    // The two selected ids are range boundaries. The assistant turn between
    // them is part of the source conversation and must not disappear.
    const bundle = buildMessageSelection(CONVERSATION, ["m3", "m1"]);
    expect(bundle?.sourceMessageIds).toEqual(["m1", "m2", "m3"]);
    const idx1 = bundle!.contextBundle.indexOf("What is event sourcing?");
    const idx2 = bundle!.contextBundle.indexOf("It's a pattern where state changes are stored as events.");
    const idx3 = bundle!.contextBundle.indexOf("Should we migrate to it?");
    expect(idx1).toBeLessThan(idx2);
    expect(idx2).toBeLessThan(idx3);
    expect(idx1).toBeLessThan(idx3);
  });

  it("labels user vs assistant turns distinctly in the context bundle", () => {
    const bundle = buildMessageSelection(CONVERSATION, ["m1", "m2"]);
    expect(bundle?.contextBundle).toContain("You: What is event sourcing?");
    expect(bundle?.contextBundle).toContain("Assistant: It's a pattern where state changes are stored as events.");
  });

  it("uses sourceLabel for an imported/handoff assistant message instead of the generic 'Assistant'", () => {
    const conversation: ConversationMessage[] = [
      ...CONVERSATION,
      { id: "m5", role: "assistant", content: "Imported answer.", timestamp: 5, sourceLabel: "ChatGPT" },
    ];
    const bundle = buildMessageSelection(conversation, ["m5"]);
    expect(bundle?.contextBundle).toContain("ChatGPT: Imported answer.");
  });

  it("ignores unknown ids and uses the remaining valid ids as range boundaries", () => {
    const bundle = buildMessageSelection(CONVERSATION, ["m1", "not-real", "m4"]);
    expect(bundle?.sourceMessageIds).toEqual(["m1", "m2", "m3", "m4"]);
  });

  it("never fabricates content — the bundle is exactly the selected messages' real text", () => {
    const bundle = buildMessageSelection(CONVERSATION, ["m1", "m2", "m3", "m4"]);
    for (const msg of CONVERSATION) {
      expect(bundle?.contextBundle).toContain(msg.content);
    }
  });
});
