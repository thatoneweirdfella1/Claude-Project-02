import { describe, expect, it } from "vitest";
import { parseImportText } from "./envelope";
import { MAX_TECHNIQUE_STACK } from "../techniques";

function envelope(kind: string, payload: unknown): string {
  return JSON.stringify({ app: "divergence-ai", version: 1, kind, payload });
}

describe("parseImportText — envelope handling", () => {
  it("rejects empty text", () => {
    const outcome = parseImportText("   ", "variables");
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.reason).toBe("empty");
  });

  it("rejects text that isn't JSON, without throwing", () => {
    const outcome = parseImportText("this is not json {{{", "variables");
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.reason).toBe("not-json");
  });

  it("rejects a file whose kind doesn't match what the user asked to import", () => {
    const outcome = parseImportText(envelope("saved-prompts", []), "variables");
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.reason).toBe("wrong-kind");
      // Names both kinds so the user knows where it DOES belong.
      expect(outcome.message).toContain("saved prompts");
      expect(outcome.message).toContain("variables");
    }
  });

  it("rejects an envelope from this app carrying an unknown kind", () => {
    const outcome = parseImportText(envelope("something-new", {}), "variables");
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.reason).toBe("unrecognized");
  });

  it("rejects a non-envelope file for the four app-data kinds", () => {
    const outcome = parseImportText(JSON.stringify({ foo: "bar" }), "variables");
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.reason).toBe("unrecognized");
  });

  it("ACCEPTS a non-envelope file for chat history, which is external by definition", () => {
    const outcome = parseImportText(
      JSON.stringify([{ role: "user", content: "hello" }]),
      "chat-history",
    );
    expect(outcome.ok).toBe(true);
  });

  it("never blames the user in a failure message", () => {
    const messages = [
      parseImportText("", "variables"),
      parseImportText("{{{", "variables"),
      parseImportText(envelope("saved-prompts", []), "variables"),
    ]
      .filter((o): o is Extract<typeof o, { ok: false }> => !o.ok)
      .map((o) => o.message.toLowerCase());
    for (const message of messages) {
      expect(message).not.toContain("you ");
      expect(message).not.toContain("invalid file");
      expect(message).not.toContain("error");
    }
  });
});

describe("parseImportText — variables", () => {
  it("imports valid name/value pairs", () => {
    const outcome = parseImportText(envelope("variables", { projectName: "Apollo" }), "variables");
    expect(outcome.ok).toBe(true);
    if (outcome.ok && outcome.payload.kind === "variables") {
      expect(outcome.payload.variables).toEqual({ projectName: "Apollo" });
    }
  });

  it("skips names the creation form itself would reject", () => {
    const outcome = parseImportText(
      envelope("variables", { good: "kept", "2bad": "dropped", "has space": "dropped" }),
      "variables",
    );
    expect(outcome.ok).toBe(true);
    if (outcome.ok && outcome.payload.kind === "variables") {
      expect(Object.keys(outcome.payload.variables)).toEqual(["good"]);
      expect(outcome.skipped).toBe(2);
    }
  });

  it("skips non-string values", () => {
    const outcome = parseImportText(
      envelope("variables", { good: "kept", bad: { nested: true } }),
      "variables",
    );
    if (outcome.ok && outcome.payload.kind === "variables") {
      expect(Object.keys(outcome.payload.variables)).toEqual(["good"]);
    }
  });

  it("reports nothing-usable when no pair survives validation", () => {
    const outcome = parseImportText(envelope("variables", { "1bad": "x" }), "variables");
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.reason).toBe("nothing-usable");
  });
});

describe("parseImportText — context snapshot", () => {
  it("imports items and regenerates their ids", () => {
    const outcome = parseImportText(
      envelope("context-snapshot", [
        { id: "collides-with-existing", kind: "file", label: "notes.txt", content: "hello", bytes: 5 },
      ]),
      "context-snapshot",
    );
    expect(outcome.ok).toBe(true);
    if (outcome.ok && outcome.payload.kind === "context-snapshot") {
      expect(outcome.payload.items[0]?.id).not.toBe("collides-with-existing");
      expect(outcome.payload.items[0]?.label).toBe("notes.txt");
    }
  });

  it("RECOMPUTES bytes rather than trusting the file's own claim", () => {
    const content = "x".repeat(1000);
    const outcome = parseImportText(
      envelope("context-snapshot", [{ kind: "text", label: "big", content, bytes: 0 }]),
      "context-snapshot",
    );
    if (outcome.ok && outcome.payload.kind === "context-snapshot") {
      expect(outcome.payload.items[0]?.bytes).toBe(1000);
    }
  });

  it("falls back to kind 'text' for an unrecognized kind", () => {
    const outcome = parseImportText(
      envelope("context-snapshot", [{ kind: "wormhole", label: "l", content: "c" }]),
      "context-snapshot",
    );
    if (outcome.ok && outcome.payload.kind === "context-snapshot") {
      expect(outcome.payload.items[0]?.kind).toBe("text");
    }
  });

  it("skips items with no content or no label", () => {
    const outcome = parseImportText(
      envelope("context-snapshot", [
        { kind: "text", label: "kept", content: "c" },
        { kind: "text", label: "", content: "c" },
        { kind: "text", label: "no content" },
      ]),
      "context-snapshot",
    );
    if (outcome.ok && outcome.payload.kind === "context-snapshot") {
      expect(outcome.payload.items).toHaveLength(1);
      expect(outcome.skipped).toBe(2);
    }
  });
});

describe("parseImportText — saved prompts", () => {
  it("imports prompts and regenerates ids", () => {
    const outcome = parseImportText(
      envelope("saved-prompts", [{ id: "old", title: "Standup", text: "What changed?" }]),
      "saved-prompts",
    );
    if (outcome.ok && outcome.payload.kind === "saved-prompts") {
      expect(outcome.payload.prompts[0]?.id).not.toBe("old");
      expect(outcome.payload.prompts[0]?.title).toBe("Standup");
    }
  });

  it("derives a title from the text when one is missing", () => {
    const outcome = parseImportText(
      envelope("saved-prompts", [{ text: "a prompt with no title at all" }]),
      "saved-prompts",
    );
    if (outcome.ok && outcome.payload.kind === "saved-prompts") {
      expect(outcome.payload.prompts[0]?.title).toBe("a prompt with no title at all");
    }
  });

  it("skips a prompt with no text — a titleless prompt is usable, a textless one isn't", () => {
    const outcome = parseImportText(
      envelope("saved-prompts", [{ title: "orphan" }, { text: "kept" }]),
      "saved-prompts",
    );
    if (outcome.ok && outcome.payload.kind === "saved-prompts") {
      expect(outcome.payload.prompts).toHaveLength(1);
      expect(outcome.skipped).toBe(1);
    }
  });
});

describe("parseImportText — template settings", () => {
  it("ENFORCES CANON's 4-technique stack cap on an oversized imported stack", () => {
    const outcome = parseImportText(
      envelope("template-settings", [
        {
          title: "Overstuffed",
          model: "auto",
          directness: 2,
          techniques: [
            "socratic",
            "verify",
            "examples",
            "detailed",
            "metaphor",
            "comparative",
            "step-by-step",
          ],
        },
      ]),
      "template-settings",
    );
    if (outcome.ok && outcome.payload.kind === "template-settings") {
      expect(outcome.payload.templates[0]?.techniques.length).toBeLessThanOrEqual(
        MAX_TECHNIQUE_STACK,
      );
    }
  });

  it("drops technique ids that aren't in the registry", () => {
    const outcome = parseImportText(
      envelope("template-settings", [
        { title: "T", techniques: ["socratic", "not-a-real-technique"] },
      ]),
      "template-settings",
    );
    if (outcome.ok && outcome.payload.kind === "template-settings") {
      expect(outcome.payload.templates[0]?.techniques).toEqual(["socratic"]);
    }
  });

  it("falls back to model 'auto' for an unrecognized model id", () => {
    const outcome = parseImportText(
      envelope("template-settings", [{ title: "T", model: "gpt-9-ultra" }]),
      "template-settings",
    );
    if (outcome.ok && outcome.payload.kind === "template-settings") {
      expect(outcome.payload.templates[0]?.model).toBe("auto");
    }
  });

  it("falls back to directness 2 for an out-of-range value", () => {
    const outcome = parseImportText(
      envelope("template-settings", [{ title: "T", directness: 99 }]),
      "template-settings",
    );
    if (outcome.ok && outcome.payload.kind === "template-settings") {
      expect(outcome.payload.templates[0]?.directness).toBe(2);
    }
  });

  it("defaults an empty technique list to auto-detect", () => {
    const outcome = parseImportText(
      envelope("template-settings", [{ title: "T", techniques: [] }]),
      "template-settings",
    );
    if (outcome.ok && outcome.payload.kind === "template-settings") {
      expect(outcome.payload.templates[0]?.techniques).toEqual(["auto-detect"]);
    }
  });

  it("skips a template with no title", () => {
    const outcome = parseImportText(
      envelope("template-settings", [{ model: "auto" }, { title: "kept" }]),
      "template-settings",
    );
    if (outcome.ok && outcome.payload.kind === "template-settings") {
      expect(outcome.payload.templates).toHaveLength(1);
      expect(outcome.skipped).toBe(1);
    }
  });
});

describe("parseImportText — chat history via the envelope", () => {
  it("reads this app's own chat-history envelope", () => {
    const outcome = parseImportText(
      envelope("chat-history", { messages: [{ role: "user", content: "hi" }] }),
      "chat-history",
    );
    expect(outcome.ok).toBe(true);
    if (outcome.ok && outcome.payload.kind === "chat-history") {
      expect(outcome.payload.messages).toHaveLength(1);
    }
  });

  it("surfaces the skipped count from a partially-readable log", () => {
    const outcome = parseImportText(
      JSON.stringify([{ role: "user", content: "kept" }, { role: "system", content: "dropped" }]),
      "chat-history",
    );
    if (outcome.ok) expect(outcome.skipped).toBe(1);
  });
});
