import { beforeEach, describe, expect, it } from "vitest";
import { detectStateLocally, toStatePills } from "./detection";
import {
  buildAiReadyRequest,
  compileMeaningPacket,
  DESTINATION_PROVIDERS,
  isFreeTranslator,
  resolvePaidAnswerModel,
  TRANSLATOR_ENGINES,
} from "./providerNeutral";
import { useSessionStore } from "../stores/sessionStore";
import type { ContextItem } from "../stores/types";

describe("provider-neutral frozen flow", () => {
  beforeEach(() => useSessionStore.getState().resetSession());

  it("keeps Universal first and exposes every canonical destination", () => {
    expect(DESTINATION_PROVIDERS.map((provider) => provider.id)).toEqual([
      "universal", "anthropic", "openai", "google", "microsoft", "xai",
      "perplexity", "deepseek", "mistral", "local", "custom",
    ]);
    expect(DESTINATION_PROVIDERS[0].label).toBe("Any AI — Universal");
  });

  it("keeps the corrected translator engine set free-first and explicit", () => {
    expect(TRANSLATOR_ENGINES.map((engine) => engine.id)).toEqual([
      "auto-free-first", "local-rules", "destination-one-pass", "managed-translator",
    ]);
    expect(isFreeTranslator("auto-free-first")).toBe(true);
    expect(isFreeTranslator("local-rules")).toBe(true);
    expect(isFreeTranslator("local-ai")).toBe(false);
    expect(isFreeTranslator("managed-translator")).toBe(false);
    expect(isFreeTranslator("destination-one-pass")).toBe(false);
  });

  it("honors an exact supported Claude destination and hands unsupported providers off", () => {
    expect(resolvePaidAnswerModel({
      model: "auto",
      destination: { providerId: "anthropic", modelId: "claude-opus-4-8" },
      translatorEngine: "destination-one-pass",
    })).toBe("claude-opus-4-8");
    expect(resolvePaidAnswerModel({
      model: "auto",
      destination: { providerId: "openai", modelId: "gpt-5" },
      translatorEngine: "destination-one-pass",
    })).toBeNull();
    expect(resolvePaidAnswerModel({
      model: "auto",
      destination: { providerId: "anthropic", modelId: "fable" },
      translatorEngine: "destination-one-pass",
    })).toBeNull();
  });

  it("detects state locally before compiling the meaning packet", () => {
    const result = detectStateLocally("I am overwhelmed and stuck. Please give me a detailed plan.");
    expect(result.emotion?.value).toBe("overwhelmed");
    expect(result.cognitive?.value).toBe("execution");
    expect(result.interest?.value).toBe("high");

    const packet = compileMeaningPacket({
      rawInput: "I am overwhelmed and stuck. Please give me a detailed plan.",
      directness: 2,
      techniques: ["step-by-step"],
      context: [],
      statePills: toStatePills(result),
      stateApplied: true,
    });
    const ready = buildAiReadyRequest(packet);
    expect(ready).toContain("COMMUNICATION SUPPORT");
    expect(ready).toContain("overwhelmed");
    expect(ready).toContain("step-by-step");
  });

  it("delivers included context content and omits excluded context", () => {
    const included = {
      id: "included", kind: "text", label: "Launch notes",
      content: "UNIQUE_CONTEXT_SENTINEL_74291", bytes: 29,
    } satisfies ContextItem;
    const excluded = {
      id: "excluded", kind: "text", label: "Private scratch",
      content: "EXCLUDED_CONTEXT_SENTINEL_93517", bytes: 31, included: false,
    } as ContextItem & { included: boolean };
    const packet = compileMeaningPacket({
      rawInput: "Summarize the launch notes.", directness: 2, techniques: ["auto-detect"],
      context: [included, excluded],
    });
    const ready = buildAiReadyRequest(packet);
    expect(ready).toContain("Launch notes");
    expect(ready).toContain("UNIQUE_CONTEXT_SENTINEL_74291");
    expect(ready).not.toContain("Private scratch");
    expect(ready).not.toContain("EXCLUDED_CONTEXT_SENTINEL_93517");
  });

  it("includes learned defaults in a free handoff while preserving request authority", () => {
    const packet = compileMeaningPacket({
      rawInput: "Give me all the details for this request.",
      directness: 2,
      techniques: ["auto-detect"],
      context: [],
      personalizationGuidance: [
        "These are learned defaults only. The current request always overrides them.",
        "Start with a concise answer.",
      ],
    });
    const ready = buildAiReadyRequest(packet);
    expect(ready).toContain("LEARNED CUSTOMER DEFAULTS");
    expect(ready).toContain("current request always overrides");
    expect(ready).toContain("Give me all the details for this request.");
  });

  it("stores handoff and imported response as distinct message kinds", () => {
    const store = useSessionStore.getState();
    store.addMessage({
      id: "handoff-1", role: "assistant", content: "Handed off", timestamp: 1,
      messageKind: "handoff", handoffStatus: "handed-off", preparedRequest: "REQUEST",
    });
    store.updateMessage("handoff-1", { handoffStatus: "imported" });
    store.addMessage({
      id: "answer-1", role: "assistant", content: "Actual answer", timestamp: 2,
      messageKind: "imported", handoffStatus: "imported", sourceLabel: "ChatGPT",
    });
    const [handoff, answer] = useSessionStore.getState().conversation;
    expect(handoff.messageKind).toBe("handoff");
    expect(handoff.handoffStatus).toBe("imported");
    expect(answer.messageKind).toBe("imported");
    expect(answer.sourceLabel).toBe("ChatGPT");
  });

  it("starts a fresh session without changing user-selected settings", () => {
    const store = useSessionStore.getState();
    store.setDestination({ providerId: "openai", modelId: "gpt-5" });
    store.setTranslatorEngine("auto-free-first");
    store.setDirectness(3);
    store.setDraftInput("unfinished");
    store.addMessage({ id: "m", role: "user", content: "hello", timestamp: 1 });
    useSessionStore.getState().newSession();
    const next = useSessionStore.getState();
    expect(next.destination.providerId).toBe("openai");
    expect(next.translatorEngine).toBe("auto-free-first");
    expect(next.directness).toBe(3);
    expect(next.draftInput).toBe("");
    expect(next.conversation).toEqual([]);
  });
});
