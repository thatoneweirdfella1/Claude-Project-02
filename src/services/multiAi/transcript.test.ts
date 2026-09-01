import { describe, expect, it } from "vitest";
import { buildTranscriptInput, isCompleteTranscript, type DebateTranscript } from "./transcript";

function participant(label: string, text: string, provider = "anthropic", model = "claude-sonnet-5") {
  return { label, provider, model, text };
}

function transcript(overrides: Partial<DebateTranscript> = {}): DebateTranscript {
  return {
    question: "Should we use microservices?",
    participants: [
      participant("Claude", "Only once you have a real scaling or team-boundary problem."),
      participant("GPT-5.5", "Start with microservices so you never have to migrate later.", "openai", "gpt-5.5"),
    ],
    ...overrides,
  };
}

describe("isCompleteTranscript", () => {
  it("is true when every field has real text", () => {
    expect(isCompleteTranscript(transcript())).toBe(true);
  });

  it("is false when any participant's text is empty or whitespace-only", () => {
    expect(isCompleteTranscript(transcript({
      participants: [participant("Claude", ""), participant("GPT-5.5", "Real text", "openai", "gpt-5.5")],
    }))).toBe(false);
    expect(isCompleteTranscript(transcript({
      participants: [participant("Claude", "Real text"), participant("GPT-5.5", "   ", "openai", "gpt-5.5")],
    }))).toBe(false);
    expect(isCompleteTranscript(transcript({ question: "" }))).toBe(false);
    expect(isCompleteTranscript(transcript({
      participants: [participant("", "Real text"), participant("GPT-5.5", "Real text", "openai", "gpt-5.5")],
    }))).toBe(false);
  });

  it("is false when exact provider or model attribution is missing", () => {
    expect(isCompleteTranscript(transcript({
      participants: [participant("Claude", "A", "", "claude-sonnet-5"), participant("GPT-5.5", "B", "openai", "gpt-5.5")],
    }))).toBe(false);
    expect(isCompleteTranscript(transcript({
      participants: [participant("Claude", "A"), participant("GPT-5.5", "B", "openai", "")],
    }))).toBe(false);
  });

  it("is false with fewer than two participants — nothing to find consensus on", () => {
    expect(isCompleteTranscript(transcript({
      participants: [participant("Claude", "Solo answer")],
    }))).toBe(false);
  });

  it("is true for a 3- and 4-participant transcript when every side has real text", () => {
    expect(isCompleteTranscript(transcript({
      participants: [
        participant("Claude", "A"),
        participant("GPT-5.5", "B", "openai", "gpt-5.5"),
        participant("Gemini 3.1 Pro", "C", "google", "gemini-3.1-pro"),
      ],
    }))).toBe(true);
    expect(isCompleteTranscript(transcript({
      participants: [
        participant("Claude", "A"),
        participant("GPT-5.5", "B", "openai", "gpt-5.5"),
        participant("Gemini 3.1 Pro", "C", "google", "gemini-3.1-pro"),
        participant("Grok 4.3", "D", "xai", "grok-4.3"),
      ],
    }))).toBe(true);
  });
});

describe("buildTranscriptInput", () => {
  it("labels both sides and includes the original question", () => {
    const input = buildTranscriptInput(transcript());
    expect(input).toContain("QUESTION:");
    expect(input).toContain("Should we use microservices?");
    expect(input).toContain("CLAUDE [anthropic · claude-sonnet-5]'S ANSWER:");
    expect(input).toContain("Only once you have a real scaling");
    expect(input).toContain("GPT-5.5 [openai · gpt-5.5]'S ANSWER:");
    expect(input).toContain("Start with microservices");
  });

  it("never hardcodes a specific provider name — the participant label drives the heading", () => {
    const input = buildTranscriptInput(transcript({
      participants: [
        participant("Claude", "Answer"),
        participant("Grok 4.3", "Other answer", "xai", "grok-4.3"),
      ],
    }));
    expect(input).toContain("GROK 4.3 [xai · grok-4.3]'S ANSWER:");
  });

  it("R23: includes every participant for a 3- and 4-way debate, not just the first partner", () => {
    const threeWay = transcript({
      participants: [
        participant("Claude", "Claude's view"),
        participant("GPT-5.5", "GPT's view", "openai", "gpt-5.5"),
        participant("Gemini 3.1 Pro", "Gemini's view", "google", "gemini-3.1-pro"),
      ],
    });
    const threeWayInput = buildTranscriptInput(threeWay);
    expect(threeWayInput).toContain("CLAUDE [anthropic · claude-sonnet-5]'S ANSWER:\nClaude's view");
    expect(threeWayInput).toContain("GPT-5.5 [openai · gpt-5.5]'S ANSWER:\nGPT's view");
    expect(threeWayInput).toContain("GEMINI 3.1 PRO [google · gemini-3.1-pro]'S ANSWER:\nGemini's view");

    const fourWay = transcript({
      participants: [
        participant("Claude", "Claude's view"),
        participant("GPT-5.5", "GPT's view", "openai", "gpt-5.5"),
        participant("Gemini 3.1 Pro", "Gemini's view", "google", "gemini-3.1-pro"),
        participant("Grok 4.3", "Grok's view", "xai", "grok-4.3"),
      ],
    });
    const fourWayInput = buildTranscriptInput(fourWay);
    expect(fourWayInput).toContain("CLAUDE [anthropic · claude-sonnet-5]'S ANSWER:\nClaude's view");
    expect(fourWayInput).toContain("GPT-5.5 [openai · gpt-5.5]'S ANSWER:\nGPT's view");
    expect(fourWayInput).toContain("GEMINI 3.1 PRO [google · gemini-3.1-pro]'S ANSWER:\nGemini's view");
    expect(fourWayInput).toContain("GROK 4.3 [xai · grok-4.3]'S ANSWER:\nGrok's view");
  });

  it("preserves stable order — participants appear in the same order they're given", () => {
    const t = transcript({
      participants: [
        participant("Claude", "First"),
        participant("Grok 4.3", "Second", "xai", "grok-4.3"),
        participant("GPT-5.5", "Third", "openai", "gpt-5.5"),
      ],
    });
    const input = buildTranscriptInput(t);
    const claudeIdx = input.indexOf("CLAUDE [anthropic · claude-sonnet-5]'S ANSWER:");
    const grokIdx = input.indexOf("GROK 4.3 [xai · grok-4.3]'S ANSWER:");
    const gptIdx = input.indexOf("GPT-5.5 [openai · gpt-5.5]'S ANSWER:");
    expect(claudeIdx).toBeLessThan(grokIdx);
    expect(grokIdx).toBeLessThan(gptIdx);
  });
});
