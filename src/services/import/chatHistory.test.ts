import { describe, expect, it } from "vitest";
import { findMessageArray, parseChatHistory } from "./chatHistory";

describe("findMessageArray", () => {
  it("accepts a bare array", () => {
    expect(findMessageArray([{ role: "user" }])).toHaveLength(1);
  });

  it("accepts a { messages } wrapper", () => {
    expect(findMessageArray({ messages: [{ role: "user" }] })).toHaveLength(1);
  });

  it("accepts a { conversation } wrapper — this app's own field name", () => {
    expect(findMessageArray({ conversation: [{ role: "user" }] })).toHaveLength(1);
  });

  it("returns null for a shape with no message array in it", () => {
    expect(findMessageArray({ something: "else" })).toBeNull();
    expect(findMessageArray("a string")).toBeNull();
    expect(findMessageArray(null)).toBeNull();
  });
});

describe("parseChatHistory", () => {
  it("reads a plain role/content log in file order", () => {
    const { messages, skipped } = parseChatHistory([
      { role: "user", content: "first" },
      { role: "assistant", content: "second" },
    ]);
    expect(skipped).toBe(0);
    expect(messages.map((m) => m.content)).toEqual(["first", "second"]);
    expect(messages.map((m) => m.role)).toEqual(["user", "assistant"]);
  });

  it("maps common role aliases onto this app's two roles", () => {
    const { messages } = parseChatHistory([
      { role: "human", content: "a" },
      { role: "ai", content: "b" },
      { role: "model", content: "c" },
      { role: "bot", content: "d" },
    ]);
    expect(messages.map((m) => m.role)).toEqual(["user", "assistant", "assistant", "assistant"]);
  });

  it("skips system turns rather than relabelling them as user or assistant", () => {
    const { messages, skipped } = parseChatHistory([
      { role: "system", content: "you are a helpful assistant" },
      { role: "user", content: "real turn" },
    ]);
    expect(messages).toHaveLength(1);
    expect(messages[0]?.content).toBe("real turn");
    expect(skipped).toBe(1);
  });

  it("reads content-block arrays and joins their text", () => {
    const { messages } = parseChatHistory([
      { role: "user", content: [{ text: "part one" }, { text: "part two" }] },
    ]);
    expect(messages[0]?.content).toBe("part one\n\npart two");
  });

  it("drops non-text content blocks instead of stringifying them", () => {
    const { messages } = parseChatHistory([
      { role: "user", content: [{ text: "kept" }, { image: "data:..." }] },
    ]);
    expect(messages[0]?.content).toBe("kept");
    expect(messages[0]?.content).not.toContain("object Object");
  });

  it("accepts `text` as an alias for `content`", () => {
    const { messages } = parseChatHistory([{ role: "user", text: "via text field" }]);
    expect(messages[0]?.content).toBe("via text field");
  });

  it("skips entries with no usable content, keeping the rest", () => {
    const { messages, skipped } = parseChatHistory([
      { role: "user", content: "keep me" },
      { role: "user", content: "   " },
      { role: "user" },
      "not an object",
      null,
    ]);
    expect(messages).toHaveLength(1);
    expect(skipped).toBe(4);
  });

  it("preserves order via synthetic timestamps when the log carries none", () => {
    const { messages } = parseChatHistory(
      [
        { role: "user", content: "a" },
        { role: "assistant", content: "b" },
        { role: "user", content: "c" },
      ],
      1000,
    );
    const times = messages.map((m) => m.timestamp);
    expect(times[0]!).toBeLessThan(times[1]!);
    expect(times[1]!).toBeLessThan(times[2]!);
  });

  it("uses a real timestamp when one is present, in either number or ISO form", () => {
    const { messages } = parseChatHistory([
      { role: "user", content: "a", timestamp: 12345 },
      { role: "assistant", content: "b", timestamp: "2024-01-01T00:00:00.000Z" },
    ]);
    expect(messages[0]?.timestamp).toBe(12345);
    expect(messages[1]?.timestamp).toBe(Date.parse("2024-01-01T00:00:00.000Z"));
  });

  it("never fabricates assistant metadata on an imported message", () => {
    const { messages } = parseChatHistory([{ role: "assistant", content: "imported answer" }]);
    const message = messages[0]!;
    expect(message.confidence).toBeUndefined();
    expect(message.ratingStars).toBeUndefined();
    expect(message.telemetryId).toBeUndefined();
    expect(message.statePills).toBeUndefined();
  });

  it("gives every imported message a unique id", () => {
    const { messages } = parseChatHistory([
      { role: "user", content: "a" },
      { role: "user", content: "b" },
    ]);
    expect(messages[0]?.id).not.toBe(messages[1]?.id);
  });

  it("returns nothing for an unrecognized container, without throwing", () => {
    expect(parseChatHistory({ nope: true })).toEqual({ messages: [], skipped: 0 });
  });
});
