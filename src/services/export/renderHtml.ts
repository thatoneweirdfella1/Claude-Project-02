import type { ExportData } from "./types";

function capitalize(value: string): string {
  return value.length > 0 ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function confidencePercent(value: number | null): string {
  return value === null ? "—" : `${Math.round(value)}%`;
}

/** Escapes the five HTML-significant characters. Every piece of text in
    ExportData ultimately comes from a model reply, a user's typed rating
    comment, or similar — never trusted as safe markup, since the exported
    file is opened directly in a browser later (a raw `<script>` in a
    downloaded HTML file would execute there). */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Simple semantic HTML — a standalone document (not a fragment), so the
    downloaded file opens and reads correctly on its own. Only renders
    sections whose data is present, same as renderMarkdown. */
export function renderHtml(data: ExportData): string {
  const sections: string[] = [];

  if (data.answerText !== undefined) {
    sections.push(`<section><h2>Answer</h2><p>${escapeHtml(data.answerText)}</p></section>`);
  }

  if (data.confidence) {
    const notes = data.confidence.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("");
    sections.push(
      `<section><h2>Confidence</h2><p>${Math.round(data.confidence.value)}% confident this is what you meant.</p>` +
        (data.confidence.downgraded
          ? "<p>(This answer was downgraded from a stronger model.)</p>"
          : "") +
        (notes ? `<ul>${notes}</ul>` : "") +
        "</section>",
    );
  }

  if (data.rating) {
    const stars = data.rating.stars;
    const starLine =
      stars === undefined
        ? "Not yet rated."
        : `${"★".repeat(stars)}${"☆".repeat(5 - stars)} (${stars}/5)`;
    sections.push(
      `<section><h2>Rating</h2><p>${starLine}</p>` +
        (data.rating.comment ? `<blockquote>${escapeHtml(data.rating.comment)}</blockquote>` : "") +
        "</section>",
    );
  }

  if (data.transparency) {
    const t = data.transparency;
    const routingNotes = t.routingNotes.map((note) => `<li>${escapeHtml(note)}</li>`).join("");
    const techniques =
      t.techniques.length > 0 ? t.techniques.map(escapeHtml).join(", ") : "—";
    sections.push(
      "<section><h2>Transparency</h2>" +
        "<h3>Routing</h3><ul>" +
        `<li>Model: ${escapeHtml(t.model ?? "—")}</li>` +
        `<li>Complexity: ${t.complexity ?? "—"}</li>` +
        `<li>Domain: ${escapeHtml(t.domain ? capitalize(t.domain) : "—")}</li>` +
        `<li>Scope: ${escapeHtml(t.scope ? capitalize(t.scope) : "—")}</li>` +
        `<li>Extended thinking: ${t.thinkingApplied ? "Applied" : "Not applied"}</li>` +
        routingNotes +
        "</ul>" +
        `<h3>Techniques</h3><p>${techniques}</p>` +
        (t.techniqueReasoning ? `<p>${escapeHtml(t.techniqueReasoning)}</p>` : "") +
        "<h3>Confidence</h3><ul>" +
        `<li>Translation: ${confidencePercent(t.confidence.translation)}</li>` +
        `<li>Routing: ${confidencePercent(t.confidence.routing)}</li>` +
        `<li>Technique: ${confidencePercent(t.confidence.technique)}</li>` +
        `<li>Overall: ${confidencePercent(t.confidence.overall)}</li>` +
        "</ul>" +
        "</section>",
    );
  }

  if (data.statePills) {
    const p = data.statePills;
    sections.push(
      "<section><h2>State Pills</h2><ul>" +
        `<li>Emotion: ${escapeHtml(p.emotion ? capitalize(p.emotion) : "—")}</li>` +
        `<li>RSD: ${escapeHtml(p.rsd ? capitalize(p.rsd) : "—")}</li>` +
        `<li>Interest: ${escapeHtml(p.interest ? capitalize(p.interest) : "—")}</li>` +
        `<li>Cognitive Mode: ${escapeHtml(p.cognitive ? capitalize(p.cognitive) : "—")}</li>` +
        "</ul></section>",
    );
  }

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Divergence.AI Export</title></head>
<body>
<h1>Divergence.AI Export</h1>
${sections.join("\n")}
</body>
</html>
`;
}
