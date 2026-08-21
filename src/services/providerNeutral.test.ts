import { beforeEach, describe, expect, it } from "vitest";
import { detectStateLocally, toStatePills } from "./detection";
import {
  buildAiReadyRequest,
  compileMeaningPacket,
  DESTINATION_PROVIDERS,
  isFreeTranslator,
} from "./providerNeutral";
import { useSessionStore } from "../stores/sessionStore";

describe("provider-neutral frozen flow", () => {
  beforeEach(() => useSessionStore.getState().resetSession());

  it("keeps Universal first and exposes every canonical destination", () => {
    expect(DESTINATION_PROVIDERS.map((provider) => provider.id)).toEqual([
      "universal", "anthropic", "openai", "google", "microsoft", "xai",
      "perplexity", "deepseek", "mistral", "local", "custom",
    ]);
    expect(DESTINATION_PROVIDERS[0].label).toBe("Any AI — Universal");
  });

  it("keeps free engines local and paid engines explicit", () => {
    expect(isFreeTranslator("auto-free-first")).toBe(true);
    expect(isFreeTranslator("local-rules")).toBe(true);
    expect(isFreeTranslator("local-ai")).toBe(true);
    expect(isFreeTranslator("managed-translator")).toBe(false);
    expect(isFreeTranslator("destination-one-pass")).toBe(false);
  });

  it("detects state locally before compiling the meaning packet", () => {
    const result = detectStateLocally("I am overwhelmed and stuck. Please give me a detailed plan.");
    expect(result.emotion?.value).toBe("overwhelmed");
    expect(result.cognitive?.value).toBe("stuck");
    expect(result.interest?.value).toBe("high");

    const packet = compileMeaningPacket({
      rawInput: "I am overwhelmed and stuck. Please give me a detailed plan.",
      directness: 2,
      techniques: ["step-by-step"],
      context: [],
      statePills: toStatePills(result),
    });
    const ready = buildAiReadyRequest(packet);
    expect(ready).toContain("USER STATE");
    expect(ready).toContain("overwhelmed");
    expect(ready).toContain("step-by-step");
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


