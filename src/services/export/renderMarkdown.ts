import type { ExportData } from "./types";

function capitalize(value: string): string {
  return value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function confidencePercent(value: number | null): string {
  return value === null ? "—" : `${Math.round(value)}%`;
}

/** Plain Markdown — CANON's default export format. Only renders sections
    whose data is actually present (buildExportData already dropped anything
    unchecked or unavailable); an all-empty ExportData renders just the
    title, never a wall of empty headers. */
export function renderMarkdown(data: ExportData): string {
  const sections: string[] = ["# Divergence.AI Export"];

  if (data.answerText !== undefined) {
    sections.push(`## Answer\n\n${data.answerText}`);
  }

  if (data.confidence) {
    const lines = [`${Math.round(data.confidence.value)}% confident this is what you meant.`];
    if (data.confidence.downgraded) lines.push("(This answer was downgraded from a stronger model.)");
    for (const note of data.confidence.notes) lines.push(`- ${note}`);
    sections.push(`## Confidence\n\n${lines.join("\n")}`);
  }

  if (data.rating) {
    const stars = data.rating.stars;
    const starLine =
      stars === undefined
        ? "Not yet rated."
        : `${"★".repeat(stars)}${"☆".repeat(5 - stars)} (${stars}/5)`;
    const lines = [starLine];
    if (data.rating.comment) lines.push(`"${data.rating.comment}"`);
    sections.push(`## Rating\n\n${lines.join("\n")}`);
  }

  if (data.transparency) {
    const t = data.transparency;
    const routing = [
      `- Model: ${t.model ?? "—"}`,
      `- Complexity: ${t.complexity ?? "—"}`,
      `- Domain: ${t.domain ? capitalize(t.domain) : "—"}`,
      `- Scope: ${t.scope ? capitalize(t.scope) : "—"}`,
      `- Extended thinking: ${t.thinkingApplied ? "Applied" : "Not applied"}`,
      ...t.routingNotes.map((note) => `- Note: ${note}`),
    ].join("\n");
    const techniques = [
      `- Applied: ${t.techniques.length > 0 ? t.techniques.join(", ") : "—"}`,
      t.techniqueReasoning ? `- Why: ${t.techniqueReasoning}` : null,
    ]
      .filter((line): line is string => line !== null)
      .join("\n");
    const confidence = [
      `- Translation: ${confidencePercent(t.confidence.translation)}`,
      `- Routing: ${confidencePercent(t.confidence.routing)}`,
      `- Technique: ${confidencePercent(t.confidence.technique)}`,
      `- Overall: ${confidencePercent(t.confidence.overall)}`,
    ].join("\n");
    sections.push(
      `## Transparency\n\n### Routing\n\n${routing}\n\n### Techniques\n\n${techniques}\n\n### Confidence\n\n${confidence}`,
    );
  }

  if (data.statePills) {
    const p = data.statePills;
    const lines = [
      `- Emotion: ${p.emotion ? capitalize(p.emotion) : "—"}`,
      `- RSD: ${p.rsd ? capitalize(p.rsd) : "—"}`,
      `- Interest: ${p.interest ? capitalize(p.interest) : "—"}`,
      `- Cognitive Mode: ${p.cognitive ? capitalize(p.cognitive) : "—"}`,
    ].join("\n");
    sections.push(`## State Pills\n\n${lines}`);
  }

  return sections.join("\n\n") + "\n";
}
