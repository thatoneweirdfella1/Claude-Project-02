/* Minimal, dependency-free PDF writer (Step 8.5). CANON Feature 10 names PDF
   as one of exactly four required export formats, but no PDF library exists
   in this build (package.json) and none was added here — this session had
   no npm registry access at all (BUILD-LOG.md DECISIONS), so adding and
   trusting an unverified new dependency was not an option, and CONVENTIONS
   rule 3 requires any new dependency to be a justified, logged choice in the
   first place. This hand-writes the well-documented minimal PDF structure
   instead: one Catalog, one Pages tree, one base-14 Helvetica font (no
   embedding needed — Latin-1 text only), and one Page + one Content stream
   per page of wrapped, paginated plain text. No compression, no images, no
   custom fonts — a plain readable document, not a typeset one.

   Text is produced by reusing renderMarkdown()'s output as-is (its "#"/"-"
   markdown syntax just prints literally) rather than writing a second
   content-formatting implementation for one format.

   Non-Latin-1 characters become "?" — Helvetica's base-14 encoding can't
   render arbitrary Unicode without an embedded font, which is out of scope
   here (Markdown/HTML/JSON keep full Unicode; only PDF has this limit,
   same "honest placeholder over silent corruption" posture as Step 7.1's
   PDF/image upload placeholders). */

const PAGE_WIDTH = 612; // US Letter, points
const PAGE_HEIGHT = 792;
const MARGIN = 72;
const FONT_SIZE = 11;
const LEADING = 14;
const CHARS_PER_LINE = 95; // simple character-count wrap, not font-metric-aware
const LINES_PER_PAGE = Math.floor((PAGE_HEIGHT - 2 * MARGIN) / LEADING); // safely fits within the margins

function escapePdfText(line: string): string {
  let out = "";
  for (const ch of line) {
    const code = ch.codePointAt(0) ?? 63;
    if (ch === "\\") out += "\\\\";
    else if (ch === "(") out += "\\(";
    else if (ch === ")") out += "\\)";
    else if (code >= 0x20 && code <= 0x7e) out += ch;
    else out += "?";
  }
  return out;
}

function wrapLine(line: string, maxWidth: number): string[] {
  if (line.length === 0) return [""];
  const words = line.split(" ");
  const out: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current.length === 0 ? word : `${current} ${word}`;
    if (candidate.length > maxWidth && current.length > 0) {
      out.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  out.push(current);
  return out;
}

function wrapText(text: string, maxWidth = CHARS_PER_LINE): string[] {
  const out: string[] = [];
  for (const raw of text.split("\n")) {
    out.push(...wrapLine(raw, maxWidth));
  }
  return out;
}

function paginate(lines: string[], perPage: number): string[][] {
  if (lines.length === 0) return [[]];
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += perPage) {
    pages.push(lines.slice(i, i + perPage));
  }
  return pages;
}

function buildPageContent(lines: string[]): string {
  const body = lines.map((line) => `(${escapePdfText(line)}) Tj T*`).join("\n");
  return `BT\n/F1 ${FONT_SIZE} Tf\n${LEADING} TL\n${MARGIN} ${PAGE_HEIGHT - MARGIN} Td\n${body}\nET`;
}

interface PdfObject {
  body?: string;
  stream?: string;
}

/** Builds a complete, valid PDF byte stream from plain text. Every value
    written into the file (offsets, /Length, object numbers) is computed
    exactly against the string actually emitted — no approximated or
    hand-guessed numbers — since a wrong xref offset or /Length produces a
    corrupt file most readers reject outright. */
export function buildPdfBytes(text: string): Uint8Array {
  const pages = paginate(wrapText(text), LINES_PER_PAGE);
  const numPages = pages.length;

  const pageObjNum = (i: number) => 4 + 2 * i;
  const contentObjNum = (i: number) => 5 + 2 * i;
  const kids = Array.from({ length: numPages }, (_, i) => `${pageObjNum(i)} 0 R`).join(" ");

  const objects: PdfObject[] = [
    { body: `<< /Type /Catalog /Pages 2 0 R >>` }, // 1
    { body: `<< /Type /Pages /Kids [${kids}] /Count ${numPages} >>` }, // 2
    { body: `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>` }, // 3
  ];
  for (let i = 0; i < numPages; i++) {
    objects.push({
      body: `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjNum(i)} 0 R >>`,
    }); // page object — pageObjNum(i)
    objects.push({ stream: buildPageContent(pages[i]) }); // content object — contentObjNum(i)
  }

  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((obj, idx) => {
    offsets.push(out.length); // ASCII-only output: string length === byte length
    const num = idx + 1;
    if (obj.stream !== undefined) {
      out += `${num} 0 obj\n<< /Length ${obj.stream.length} >>\nstream\n${obj.stream}\nendstream\nendobj\n`;
    } else {
      out += `${num} 0 obj\n${obj.body}\nendobj\n`;
    }
  });

  const xrefOffset = out.length;
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    out += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(out);
}
