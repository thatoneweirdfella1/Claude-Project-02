/* Step 7.3 verification — client-side URL context: readable-text extraction
   (real DOMParser, happy-dom's implementation, not stubbed) and the
   fetch-through-the-proxy orchestration (stubbed fetch — the sandbox has no
   network; this proves fetchUrlContext NEVER calls the third-party URL
   directly, only ever POSTs to /api/fetch-url). */

import { describe, expect, it, vi } from "vitest";
import { MAX_FILE_BYTES, MAX_SESSION_BYTES } from "./fileValidation";
import { extractReadableText, fetchUrlContext } from "./urlContext";

type FetchFn = typeof fetch;

describe("extractReadableText", () => {
  it("strips script/style/nav/footer and returns the visible body text", () => {
    const html = `
      <html><body>
        <nav>Site nav</nav>
        <script>var x = 1;</script>
        <style>.a{color:red}</style>
        <main><p>The real article content.</p></main>
        <footer>Copyright 2024</footer>
      </body></html>`;
    const text = extractReadableText(html);
    expect(text).toContain("The real article content.");
    expect(text).not.toContain("Site nav");
    expect(text).not.toContain("var x = 1");
    expect(text).not.toContain("color:red");
    expect(text).not.toContain("Copyright 2024");
  });

  it("prefers <article> over the rest of the page when present", () => {
    const html = `<html><body><nav>nav</nav><article>Article text.</article><aside>sidebar junk</aside></body></html>`;
    const text = extractReadableText(html);
    expect(text).toBe("Article text.");
  });

  it("falls back to <body> when there is no <article>/<main>", () => {
    const html = `<html><body><p>Just a plain page.</p></body></html>`;
    expect(extractReadableText(html)).toBe("Just a plain page.");
  });

  it("collapses runs of whitespace and blank lines", () => {
    const html = `<body><p>Hello    world</p>\n\n\n\n<p>Next</p></body>`;
    const text = extractReadableText(html);
    expect(text).not.toMatch(/ {2,}/);
    expect(text).not.toMatch(/\n{3,}/);
  });

  it("returns an empty string for a page with no text content", () => {
    const html = `<html><body><script>1;</script></body></html>`;
    expect(extractReadableText(html)).toBe("");
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("fetchUrlContext — never fetches the third-party URL directly", () => {
  it("POSTs to /api/fetch-url with the url in the body, not the raw URL itself", async () => {
    const fetchImpl = vi.fn<FetchFn>(async () =>
      jsonResponse({ url: "https://example.com", contentType: "text/html", content: "<body><p>Hi there</p></body>" }),
    );
    const outcome = await fetchUrlContext("https://example.com", 0, { fetchImpl });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [calledUrl, init] = fetchImpl.mock.calls[0];
    expect(calledUrl).toBe("/api/fetch-url"); // the proxy endpoint, never example.com directly
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual({ url: "https://example.com" });

    expect(outcome.ok).toBe(true);
    if (outcome.ok) {
      expect(outcome.item.kind).toBe("url");
      expect(outcome.item.label).toBe("https://example.com");
      expect(outcome.item.content).toBe("Hi there");
    }
  });

  it("uses the raw content directly (no HTML extraction) for a non-HTML content type", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ url: "https://example.com/data.json", contentType: "application/json", content: '{"a":1}' }),
    );
    const outcome = await fetchUrlContext("https://example.com/data.json", 0, { fetchImpl });
    expect(outcome.ok).toBe(true);
    if (outcome.ok) expect(outcome.item.content).toBe('{"a":1}');
  });
});

describe("fetchUrlContext — never throws, always a typed outcome", () => {
  it("rejects an empty URL without calling fetch", async () => {
    const fetchImpl = vi.fn();
    const outcome = await fetchUrlContext("   ", 0, { fetchImpl });
    expect(outcome.ok).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects an unparseable URL without calling fetch", async () => {
    const fetchImpl = vi.fn();
    const outcome = await fetchUrlContext("not a url", 0, { fetchImpl });
    expect(outcome.ok).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns actionable error message for blocked URLs", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ error: "That URL can't be fetched.", errorCode: "blocked_url" }, 400));
    const outcome = await fetchUrlContext("https://example.com", 0, { fetchImpl });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.message).toContain("private or internal URL");
  });

  it("returns actionable error message for authentication failures", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ error: "The page responded with 401.", errorCode: "auth_required" }, 502));
    const outcome = await fetchUrlContext("https://example.com", 0, { fetchImpl });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.message).toContain("requires login");
  });

  it("returns actionable error message for timeouts", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ error: "Fetching that page failed: timeout", errorCode: "timeout" }, 502));
    const outcome = await fetchUrlContext("https://example.com", 0, { fetchImpl });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.message).toContain("took too long to load");
  });

  it("returns actionable error message for oversized pages", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ error: "That page is too large to load as context.", errorCode: "too_large" }, 413));
    const outcome = await fetchUrlContext("https://example.com", 0, { fetchImpl });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.message).toContain("too large");
  });

  it("returns actionable error message for fetch failures", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ error: "Fetching that page failed: network error", errorCode: "fetch_failed" }, 502));
    const outcome = await fetchUrlContext("https://example.com", 0, { fetchImpl });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.message).toContain("Couldn't reach that page");
  });

  it("handles the fetch call itself throwing (network/proxy unreachable)", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("network down");
    });
    const outcome = await fetchUrlContext("https://example.com", 0, { fetchImpl });
    expect(outcome.ok).toBe(false);
  });

  it("rejects when the page has no readable text after extraction with actionable message", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ url: "https://example.com", contentType: "text/html", content: "<body><script>1;</script></body>" }),
    );
    const outcome = await fetchUrlContext("https://example.com", 0, { fetchImpl });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.message).toContain("doesn't have text content");
  });
});

describe("fetchUrlContext — CANON Feature 6 limits (shared with file upload)", () => {
  it("rejects a page whose extracted text alone exceeds the per-item limit", async () => {
    const huge = "x".repeat(MAX_FILE_BYTES + 1);
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ url: "https://example.com", contentType: "text/plain", content: huge }),
    );
    const outcome = await fetchUrlContext("https://example.com", 0, { fetchImpl });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.message).toMatch(/per-item limit/i);
  });

  it("rejects a page that would push the session over the 50MB cap, even though the page alone is small", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ url: "https://example.com", contentType: "text/plain", content: "small content" }),
    );
    const outcome = await fetchUrlContext("https://example.com", MAX_SESSION_BYTES, { fetchImpl });
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) expect(outcome.message).toMatch(/50.0 MB limit/i);
  });
});
