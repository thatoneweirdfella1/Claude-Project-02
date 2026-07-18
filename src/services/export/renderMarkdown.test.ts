import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./renderMarkdown";
import type { ExportData } from "./types";

describe("renderMarkdown", () => {
  it("renders only the title when nothing is selected", () => {
    const output = renderMarkdown({});
    expect(output.trim()).toBe("# Divergence.AI Export");
  });

  it("renders each present section and omits absent ones", () => {
    const data: ExportData = {
      answerText: "The answer.",
      rating: { stars: 3 },
    };
    const output = renderMarkdown(data);
    expect(output).toContain("## Answer");
    expect(output).toContain("The answer.");
    expect(output).toContain("## Rating");
    expect(output).toContain("★★★☆☆ (3/5)");
    expect(output).not.toContain("## Confidence");
    expect(output).not.toContain("## Transparency");
    expect(output).not.toContain("## State Pills");
  });

  it("includes a rating comment in quotes when present", () => {
    const output = renderMarkdown({ rating: { stars: 5, comment: "Loved it" } });
    expect(output).toContain('"Loved it"');
  });

  it("renders the three transparency sub-sections with confidence percentages", () => {
    const data: ExportData = {
      transparency: {
        model: "claude-sonnet-5",
        complexity: 6,
        domain: "code",
        scope: "medium",
        thinkingApplied: false,
        routingNotes: [],
        techniques: ["Chain of Thought"],
        techniqueReasoning: "Selected: Chain of Thought.",
        confidence: { translation: 92, routing: 95, technique: 90, overall: 90 },
      },
    };
    const output = renderMarkdown(data);
    expect(output).toContain("### Routing");
    expect(output).toContain("Model: claude-sonnet-5");
    expect(output).toContain("Domain: Code");
    expect(output).toContain("### Techniques");
    expect(output).toContain("Chain of Thought");
    expect(output).toContain("### Confidence");
    expect(output).toContain("Overall: 90%");
  });
});
