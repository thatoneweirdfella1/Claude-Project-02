/* Step 2.2 verification — the translation service. Uses stub clients (no
   network / no proxy) to confirm: a good reply validates through, the three
   "without crashing" cases (empty, huge, API/parse failure) each return a typed
   outcome instead of throwing, the model+system prompt are passed correctly,
   and messy-but-recoverable replies (fences, prose wrap) still parse. */

import { describe, expect, it, vi } from "vitest";
import type { ModelCompletionRequest } from "./client";
import { TRANSLATION_MODEL } from "./client";
import { TRANSLATION_SYSTEM_PROMPT } from "./prompt";
import { runTranslationHarness, stubTranslationClient } from "./harness";
import { extractJsonObject, translate } from "./translate";

const validReply = JSON.stringify({
  translatedPrompt: "How do I create an index in Postgres?",
  confidence: 82,
  detectedGaps: ["tangential-preamble"],
  reasoning: "Read past the late-night preamble to the indexing question.",
});

describe("translate — happy path", () => {
  it("returns ok with a validated result", async () => {
    const outcome = await translate("ramble... how do i index in postgres", {
      client: async () => validReply,
    });
    expect(outcome.status).toBe("ok");
    if (outcome.status === "ok") {
      expect(outcome.result.translatedPrompt).toContain("index in Postgres");
      expect(outcome.result.confidence).toBe(82);
      expect(outcome.result.detectedGaps).toEqual(["tangential-preamble"]);
    }
  });

  it("calls the client with the locked model and the Step 2.1 system prompt", async () => {
    const client = vi.fn(async (_req: ModelCompletionRequest) => validReply);
    await translate("  hello, a question  ", { client });
    expect(client).toHaveBeenCalledOnce();
    const req = client.mock.calls[0][0];
    expect(req.model).toBe(TRANSLATION_MODEL);
    expect(req.model).toBe("claude-sonnet-5");
    expect(req.system).toBe(TRANSLATION_SYSTEM_PROMPT);
    expect(req.input).toBe("hello, a question"); // trimmed
  });

  it("adds learned translation defaults without weakening the current-request override", async () => {
    const client = vi.fn(async (_req: ModelCompletionRequest) => validReply);
    await translate("Explain the current request", {
      client,
      personalizationInstructions: [
        "These are learned defaults only. The current request always overrides them.",
        "Preserve the customer's stated objective.",
      ],
    });
    const req = client.mock.calls[0][0];
    expect(req.system).toContain(TRANSLATION_SYSTEM_PROMPT);
    expect(req.system).toContain("LEARNED CUSTOMER DEFAULTS");
    expect(req.system).toContain("current request always overrides");
    expect(req.system).toContain("Preserve the customer's stated objective");
  });

  it("recovers JSON wrapped in code fences or prose", async () => {
    const fenced = "```json\n" + validReply + "\n```";
    const prosed = `Sure! Here you go: ${validReply} Hope that helps.`;
    for (const reply of [fenced, prosed]) {
      const outcome = await translate("x", { client: async () => reply });
      expect(outcome.status).toBe("ok");
    }
  });
});

describe("translate — the three 'without crashing' cases", () => {
  it("empty / whitespace input returns {empty}, never calls the client", async () => {
    const client = vi.fn(async () => validReply);
    expect((await translate("", { client })).status).toBe("empty");
    expect((await translate("    \n\t ", { client })).status).toBe("empty");
    expect(client).not.toHaveBeenCalled();
  });

  it("huge input returns {too-large} with sizes, never calls the client", async () => {
    const client = vi.fn(async () => validReply);
    const big = "a".repeat(50);
    const outcome = await translate(big, { client, maxInputChars: 10 });
    expect(outcome.status).toBe("too-large");
    if (outcome.status === "too-large") {
      expect(outcome.chars).toBe(50);
      expect(outcome.limit).toBe(10);
    }
    expect(client).not.toHaveBeenCalled();
  });

  it("API failure returns {error} instead of throwing", async () => {
    const outcome = await translate("x", {
      client: async () => {
        throw new Error("proxy 503");
      },
    });
    expect(outcome.status).toBe("error");
    if (outcome.status === "error") expect(outcome.message).toContain("proxy 503");
  });

  it("malformed (non-JSON) reply returns {error}", async () => {
    const outcome = await translate("x", {
      client: async () => "I could not do that.",
    });
    expect(outcome.status).toBe("error");
  });

  it("schema-invalid reply (no translatedPrompt) returns {error}", async () => {
    const outcome = await translate("x", {
      client: async () => JSON.stringify({ confidence: 90 }),
    });
    expect(outcome.status).toBe("error");
  });
});

describe("extractJsonObject", () => {
  it("parses bare, fenced, and prose-wrapped JSON", () => {
    expect(extractJsonObject('{"a":1}')).toEqual({ a: 1 });
    expect(extractJsonObject('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(extractJsonObject('text {"a":1} more')).toEqual({ a: 1 });
  });
  it("throws when there is no JSON object", () => {
    expect(() => extractJsonObject("no json here")).toThrow();
  });
});

describe("manual harness", () => {
  it("runs end-to-end over the samples with the stub client", async () => {
    const outcomes = await runTranslationHarness(stubTranslationClient);
    // Four samples; the last is whitespace → empty; the rest translate ok.
    expect(outcomes).toHaveLength(4);
    expect(outcomes[outcomes.length - 1].status).toBe("empty");
    expect(outcomes.filter((o) => o.status === "ok").length).toBe(3);
  });
});
