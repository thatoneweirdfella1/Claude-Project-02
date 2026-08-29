/* Step 4.3 verification — the composition engine. The load-bearing property is
   the FIXED order (PIPELINE.md Stage 4): base template → role prime → question →
   directness → techniques → output format → confidence requirement. Every other
   test guards a specific assembly rule (role-prime hoisting, directness
   encoding, ADHD output default, confidence note, meta filtering). */

import { describe, expect, it } from "vitest";
import { COMPOSITION_ORDER, composeFinalPrompt } from "./compose";

describe("composeFinalPrompt — fixed order", () => {
  it("emits all seven sections in PIPELINE.md's exact order", () => {
    const { sections, order } = composeFinalPrompt({ question: "Explain indexing." });
    expect(order).toEqual([
      "base-template",
      "role-prime",
      "question",
      "directness",
      "techniques",
      "output-format",
      "confidence-requirement",
    ]);
    expect(sections.map((s) => s.name)).toEqual(order);
    expect(order).toBe(COMPOSITION_ORDER);
  });

  it("the assembled prompt string preserves that order", () => {
    const { prompt } = composeFinalPrompt({
      question: "How do B-tree indexes work?",
      techniques: ["chain-of-thought", "examples"],
      directness: 3,
      confidence: 70,
    });
    const order = [
      "## CONTEXT",
      "## ROLE",
      "## REQUEST",
      "## TONE",
      "## TECHNIQUES",
      "## OUTPUT FORMAT",
      "## BEFORE YOU ANSWER",
    ];
    const positions = order.map((h) => prompt.indexOf(h));
    expect(positions.every((p) => p >= 0)).toBe(true);
    const sorted = [...positions].sort((a, b) => a - b);
    expect(positions).toEqual(sorted); // strictly increasing = in order
  });
});

describe("composeFinalPrompt — assembly rules", () => {
  it("injects the translated question verbatim in the REQUEST section", () => {
    const q = "What is the capital of France?";
    const { sections } = composeFinalPrompt({ question: `  ${q}  ` });
    const request = sections.find((s) => s.name === "question")!;
    expect(request.content).toBe(q); // trimmed
  });

  it("defaults directness to level 2 (balanced), and encodes each level distinctly", () => {
    const d2 = composeFinalPrompt({ question: "x" }).sections.find((s) => s.name === "directness")!;
    const d1 = composeFinalPrompt({ question: "x", directness: 1 }).sections.find((s) => s.name === "directness")!;
    const d3 = composeFinalPrompt({ question: "x", directness: 3 }).sections.find((s) => s.name === "directness")!;
    expect(d2.content).toContain("Balanced");
    expect(d1.content).not.toBe(d2.content);
    expect(d3.content).not.toBe(d2.content);
    expect(d1.content).toContain("supportive");
    expect(d3.content).toContain("direct");
  });

  it("Step 6.5 stateTone appends to the directness section without replacing its fixed wording", () => {
    const plain = composeFinalPrompt({ question: "x", directness: 2 }).sections.find(
      (s) => s.name === "directness",
    )!;
    const toned = composeFinalPrompt({
      question: "x",
      directness: 2,
      stateTone: "extra warm, with explicit positive framing",
    }).sections.find((s) => s.name === "directness")!;
    expect(toned.content).toContain(plain.content); // base wording preserved verbatim
    expect(toned.content).toContain("extra warm, with explicit positive framing");
    expect(toned.content).not.toBe(plain.content); // genuinely extended, not identical
  });

  it("omits any tone addendum when stateTone is absent (the common case, unchanged from before Step 6.5)", () => {
    const d2 = composeFinalPrompt({ question: "x", directness: 2 }).sections.find(
      (s) => s.name === "directness",
    )!;
    expect(d2.content).not.toContain("Also: keep the tone");
  });

  it("hoists the Role-Prime technique into the ROLE section, not the techniques body", () => {
    const { sections } = composeFinalPrompt({
      question: "x",
      techniques: ["role-prime", "chain-of-thought"],
    });
    const role = sections.find((s) => s.name === "role-prime")!;
    const techniques = sections.find((s) => s.name === "techniques")!;
    expect(role.content).toMatch(/domain expert/i); // the role-prime fragment
    expect(techniques.content).not.toMatch(/domain expert/i); // not duplicated
    expect(techniques.content).toMatch(/reasoning steps/i); // chain-of-thought is here
  });

  it("an explicit role overrides both the technique and the default", () => {
    const { sections } = composeFinalPrompt({
      question: "x",
      role: "Answer as a senior Postgres DBA.",
      techniques: ["role-prime"],
    });
    expect(sections.find((s) => s.name === "role-prime")!.content).toBe(
      "Answer as a senior Postgres DBA.",
    );
  });

  it("uses the ADHD-friendly output format by default", () => {
    const { sections } = composeFinalPrompt({ question: "x" });
    expect(sections.find((s) => s.name === "output-format")!.content).toMatch(
      /3 short paragraphs|scannable/i,
    );
  });

  it("adds a moderate-confidence note only when confidence < 80", () => {
    const low = composeFinalPrompt({ question: "x", confidence: 65 });
    const high = composeFinalPrompt({ question: "x", confidence: 92 });
    const note = (r: typeof low) =>
      r.sections.find((s) => s.name === "confidence-requirement")!.content;
    expect(note(low)).toContain("moderate confidence");
    expect(note(low)).toContain("65/100");
    expect(note(high)).not.toContain("moderate confidence");
  });

  it("ignores meta/unknown technique ids (auto-detect never composes a fragment)", () => {
    const { sections } = composeFinalPrompt({
      question: "x",
      techniques: ["auto-detect", "metaphor"],
    });
    const techniques = sections.find((s) => s.name === "techniques")!;
    expect(techniques.content).toMatch(/analogy|metaphor/i);
    expect(techniques.content).toContain("1."); // exactly one numbered technique
    expect(techniques.content).not.toContain("2.");
  });

  it("with no techniques, says to answer directly", () => {
    const { sections } = composeFinalPrompt({ question: "x" });
    expect(sections.find((s) => s.name === "techniques")!.content).toMatch(/answer directly/i);
  });

  it("delivers included context and keeps excluded context out of the prompt", () => {
    const { prompt } = composeFinalPrompt({
      question: "Use my notes.",
      context: [
        { id: "included", kind: "text", label: "Meeting notes", content: "UNIQUE_INCLUDED_FACT_7281", bytes: 25 },
        { id: "excluded", kind: "text", label: "Old notes", content: "UNIQUE_EXCLUDED_FACT_9914", bytes: 25, included: false },
      ],
    });
    expect(prompt).toContain("ATTACHED REFERENCE MATERIAL");
    expect(prompt).toContain("Meeting notes");
    expect(prompt).toContain("UNIQUE_INCLUDED_FACT_7281");
    expect(prompt).not.toContain("Old notes");
    expect(prompt).not.toContain("UNIQUE_EXCLUDED_FACT_9914");
  });

  it("keeps learned response defaults inside the existing base-template slot", () => {
    const composed = composeFinalPrompt({
      question: "Give me the full walkthrough this time.",
      personalizationInstructions: [
        "These are learned defaults only; the current request always overrides them.",
        "Start with a concise answer.",
      ],
    });
    expect(composed.order).toBe(COMPOSITION_ORDER);
    expect(composed.sections).toHaveLength(7);
    expect(composed.sections[0].name).toBe("base-template");
    expect(composed.sections[0].content).toContain("LEARNED CUSTOMER DEFAULTS");
    expect(composed.sections[0].content).toContain("current request always overrides");
    expect(composed.sections.find((section) => section.name === "question")?.content)
      .toBe("Give me the full walkthrough this time.");
  });
});
