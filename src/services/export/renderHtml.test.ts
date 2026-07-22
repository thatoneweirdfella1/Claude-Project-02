import { describe, expect, it } from "vitest";
import { renderHtml } from "./renderHtml";

describe("renderHtml", () => {
  it("produces a standalone HTML document", () => {
    const output = renderHtml({ answerText: "Hello." });
    expect(output).toContain("<!doctype html>");
    expect(output).toContain("<title>Divergence.AI Export</title>");
    expect(output).toContain("<h2>Answer</h2>");
    expect(output).toContain("<p>Hello.</p>");
  });

  it("escapes HTML-significant characters in exported text", () => {
    const output = renderHtml({ answerText: "<script>alert('x')</script> & \"quoted\"" });
    expect(output).not.toContain("<script>");
    expect(output).toContain("&lt;script&gt;");
    expect(output).toContain("&amp;");
    expect(output).toContain("&quot;quoted&quot;");
    expect(output).toContain("&#39;x&#39;");
  });

  it("escapes a rating comment too, not just the answer text", () => {
    const output = renderHtml({ rating: { stars: 2, comment: "<img src=x onerror=alert(1)>" } });
    expect(output).not.toContain("<img");
    expect(output).toContain("&lt;img");
  });

  it("omits sections that are absent", () => {
    const output = renderHtml({ answerText: "Hi" });
    expect(output).not.toContain("<h2>Confidence</h2>");
    expect(output).not.toContain("<h2>Transparency</h2>");
  });
});
