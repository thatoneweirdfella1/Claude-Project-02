import { describe, expect, it } from "vitest";
import { buildTranscriptInput, isCompleteTranscript, type DebateTranscript } from "./transcript";

function transcript(overrides: Partial<DebateTranscript> = {}): DebateTranscript {
  return {
    question: "Should we use microservices?",
    claudeText: "Only once you have a real scaling or team-boundary problem.",
    partnerLabel: "GPT-5.5",
    partnerText: "Start with microservices so you never have to migrate later.",
    ...overrides,
  };
}

describe("isCompleteTranscript", () => {
  it("is true when every field has real text", () => {
    expect(isCompleteTranscript(transcript())).toBe(true);
  });

  it("is false when any field is empty or whitespace-only", () => {
    expect(isCompleteTranscript(transcript({ claudeText: "" }))).toBe(false);
    expect(isCompleteTranscript(transcript({ partnerText: "   " }))).toBe(false);
    expect(isCompleteTranscript(transcript({ question: "" }))).toBe(false);
    expect(isCompleteTranscript(transcript({ partnerLabel: "" }))).toBe(false);
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

  it("never hardcodes a specific provider name — the partner label drives the heading", () => {
    const input = buildTranscriptInput(transcript({ partnerLabel: "Grok 4.3" }));
    expect(input).toContain("GROK 4.3'S ANSWER:");
  });
});
