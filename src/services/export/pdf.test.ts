import { describe, expect, it } from "vitest";
import { buildPdfBytes } from "./pdf";

function decode(bytes: Uint8Array): string {
  // buildPdfBytes only ever emits ASCII bytes (structural PDF syntax, plus
  // escapePdfText's 0x20-0x7E-only output), so UTF-8 decoding reproduces the
  // exact original string.
  return new TextDecoder().decode(bytes);
}

describe("buildPdfBytes", () => {
  it("produces a well-formed PDF header and trailer", () => {
    const pdf = decode(buildPdfBytes("Hello, world."));
    expect(pdf.startsWith("%PDF-1.4\n")).toBe(true);
    expect(pdf.trimEnd().endsWith("%%EOF")).toBe(true);
    expect(pdf).toContain("/Type /Catalog");
    expect(pdf).toContain("/Type /Pages");
    expect(pdf).toContain("/Type /Font");
    expect(pdf).toContain("/BaseFont /Helvetica");
  });

  it("embeds the given text, uncompressed and searchable, escaped for PDF strings", () => {
    const pdf = decode(buildPdfBytes("Hello, world."));
    expect(pdf).toContain("(Hello, world.) Tj");
  });

  it("escapes parentheses and backslashes so the string delimiters stay balanced", () => {
    const pdf = decode(buildPdfBytes("a (b) c \\ d"));
    expect(pdf).toContain("a \\(b\\) c \\\\ d");
  });

  it("replaces non-Latin-1 characters with '?' rather than emitting raw Unicode", () => {
    const pdf = decode(buildPdfBytes("café 你好"));
    // é (U+00E9) is within Latin-1 and passes through unescaped by this writer's
    // ASCII-only rule (0x20-0x7E) — only CJK/other non-Latin1 becomes "?".
    expect(pdf).toContain("caf? ??");
  });

  it("every xref offset points to the correct 'N 0 obj' line for a short document", () => {
    const pdf = decode(buildPdfBytes("one line only"));
    const xrefIndex = pdf.indexOf("xref\n");
    expect(xrefIndex).toBeGreaterThan(0);
    const xrefBlock = pdf.slice(xrefIndex, pdf.indexOf("trailer"));
    const entryLines = xrefBlock
      .split("\n")
      .slice(2) // "xref" header line + the "0 N" count line
      .filter((line) => line.length > 0);

    entryLines.forEach((line, i) => {
      if (i === 0) return; // the free-list head entry (object 0)
      const objectNumber = i; // objects are 1-indexed
      const offset = Number(line.slice(0, 10));
      expect(pdf.slice(offset, offset + `${objectNumber} 0 obj`.length)).toBe(`${objectNumber} 0 obj`);
    });
  });

  it("startxref points at the actual byte offset of the xref keyword", () => {
    const pdf = decode(buildPdfBytes("some content"));
    const match = pdf.match(/startxref\n(\d+)\n%%EOF/);
    expect(match).not.toBeNull();
    const offset = Number(match![1]);
    expect(pdf.slice(offset, offset + 5)).toBe("xref\n");
  });

  it("paginates long text across multiple Page objects", () => {
    const longText = Array.from({ length: 200 }, (_, i) => `Line ${i}`).join("\n");
    const pdf = decode(buildPdfBytes(longText));
    const countMatch = pdf.match(/\/Type \/Pages \/Kids \[[^\]]*\] \/Count (\d+)/);
    expect(countMatch).not.toBeNull();
    expect(Number(countMatch![1])).toBeGreaterThan(1);
  });

  it("never crashes on empty text and still produces a valid single-page document", () => {
    const pdf = decode(buildPdfBytes(""));
    expect(pdf).toContain("/Count 1");
  });
});
