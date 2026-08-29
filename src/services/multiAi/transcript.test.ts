import { describe, expect, it } from "vitest";
import { buildTranscriptInput, isCompleteTranscript, type DebateTranscript } from "./transcript";

function transcript(overrides: Partial<DebateTranscript> = {}): DebateTranscript {
  return {
    question: "Should we use microservices?",
    participants: [
      { label: "Claude", text: "Only once you have a real scaling or team-boundary problem." },
      { label: "GPT-5.5", text: "Start with microservices so you never have to migrate later." },
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
      participants: [{ label: "Claude", text: "" }, { label: "GPT-5.5", text: "Real text" }],
    }))).toBe(false);
    expect(isCompleteTranscript(transcript({
      participants: [{ label: "Claude", text: "Real text" }, { label: "GPT-5.5", text: "   " }],
    }))).toBe(false);
    expect(isCompleteTranscript(transcript({ question: "" }))).toBe(false);
    expect(isCompleteTranscript(transcript({
      participants: [{ label: "", text: "Real text" }, { label: "GPT-5.5", text: "Real text" }],
    }))).toBe(false);
  });

  it("is false with fewer than two participants — nothing to find consensus on", () => {
    expect(isCompleteTranscript(transcript({
      participants: [{ label: "Claude", text: "Solo answer" }],
    }))).toBe(false);
  });

  it("is true for a 3- and 4-participant transcript when every side has real text", () => {
    expect(isCompleteTranscript(transcript({
      participants: [
        { label: "Claude", text: "A" },
        { label: "GPT-5.5", text: "B" },
        { label: "Gemini 3.1 Pro", text: "C" },
      ],
    }))).toBe(true);
    expect(isCompleteTranscript(transcript({
      participants: [
        { label: "Claude", text: "A" },
        { label: "GPT-5.5", text: "B" },
        { label: "Gemini 3.1 Pro", text: "C" },
        { label: "Grok 4.3", text: "D" },
      ],
    }))).toBe(true);
  });
});

describe("buildTranscriptInput", () => {
  it("labels both sides and includes the original question", () => {
    const input = buildTranscriptInput(transcript());
    expect(input).toContain("QUESTION:");
    expect(input).toContain("Should we use microservices?");
    expect(input).toContain("CLAUDE'S ANSWER:");
    expect(input).toContain("Only once you have a real scaling");
    expect(input).toContain("GPT-5.5'S ANSWER:");
    expect(input).toContain("Start with microservices");
  });

  it("never hardcodes a specific provider name — the participant label drives the heading", () => {
    const input = buildTranscriptInput(transcript({
      participants: [
        { label: "Claude", text: "Answer" },
        { label: "Grok 4.3", text: "Other answer" },
      ],
    }));
    expect(input).toContain("GROK 4.3'S ANSWER:");
  });

  it("R23: includes every participant for a 3- and 4-way debate, not just the first partner", () => {
    const threeWay = transcript({
      participants: [
        { label: "Claude", text: "Claude's view" },
        { label: "GPT-5.5", text: "GPT's view" },
        { label: "Gemini 3.1 Pro", text: "Gemini's view" },
      ],
    });
    const threeWayInput = buildTranscriptInput(threeWay);
    expect(threeWayInput).toContain("CLAUDE'S ANSWER:\nClaude's view");
    expect(threeWayInput).toContain("GPT-5.5'S ANSWER:\nGPT's view");
    expect(threeWayInput).toContain("GEMINI 3.1 PRO'S ANSWER:\nGemini's view");

    const fourWay = transcript({
      participants: [
        { label: "Claude", text: "Claude's view" },
        { label: "GPT-5.5", text: "GPT's view" },
        { label: "Gemini 3.1 Pro", text: "Gemini's view" },
        { label: "Grok 4.3", text: "Grok's view" },
      ],
    });
    const fourWayInput = buildTranscriptInput(fourWay);
    expect(fourWayInput).toContain("CLAUDE'S ANSWER:\nClaude's view");
    expect(fourWayInput).toContain("GPT-5.5'S ANSWER:\nGPT's view");
    expect(fourWayInput).toContain("GEMINI 3.1 PRO'S ANSWER:\nGemini's view");
    expect(fourWayInput).toContain("GROK 4.3'S ANSWER:\nGrok's view");
  });

  it("preserves stable order — participants appear in the same order they're given", () => {
    const t = transcript({
      participants: [
        { label: "Claude", text: "First" },
        { label: "Grok 4.3", text: "Second" },
        { label: "GPT-5.5", text: "Third" },
      ],
    });
    const input = buildTranscriptInput(t);
    const claudeIdx = input.indexOf("CLAUDE'S ANSWER:");
    const grokIdx = input.indexOf("GROK 4.3'S ANSWER:");
    const gptIdx = input.indexOf("GPT-5.5'S ANSWER:");
    expect(claudeIdx).toBeLessThan(grokIdx);
    expect(grokIdx).toBeLessThan(gptIdx);
  });
});
