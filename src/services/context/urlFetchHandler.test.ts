/* Step 7.3 verification — the serverless URL-fetch handler. Uses a stub
   fetch (no network — same standing sandbox constraint as every proxy
   handler test since proxyHandler.test.ts, Step 1.10) to confirm: method/
   body guards, the SSRF blocklist, that a page over the size cap is
   rejected, and that the upstream response is passed through as
   {url, contentType, content}. */

import { describe, expect, it, vi } from "vitest";
import { MAX_FILE_BYTES } from "./fileValidation";
import { handleUrlFetchRequest, isBlockedUrl } from "./urlFetchHandler";

function fetchUrlRequest(body: unknown, method = "POST"): Request {
  return new Request("https://app.example/api/fetch-url", {
    method,
    headers: { "content-type": "application/json" },
    body: method === "POST" ? JSON.stringify(body) : undefined,
  });
}

describe("isBlockedUrl — SSRF guard", () => {
  it("allows ordinary public http(s) URLs", () => {
    expect(isBlockedUrl("https://example.com/article")).toBe(false);
    expect(isBlockedUrl("http://example.com")).toBe(false);
  });

  it("blocks non-http(s) protocols", () => {
    expect(isBlockedUrl("file:///etc/passwd")).toBe(true);
    expect(isBlockedUrl("javascript:alert(1)")).toBe(true);
    expect(isBlockedUrl("ftp://example.com/file")).toBe(true);
  });

  it("blocks an unparseable string", () => {
    expect(isBlockedUrl("not a url at all")).toBe(true);
  });

  it("blocks localhost and loopback", () => {
    expect(isBlockedUrl("http://localhost:3000")).toBe(true);
    expect(isBlockedUrl("http://127.0.0.1/")).toBe(true);
    expect(isBlockedUrl("http://0.0.0.0/")).toBe(true);
  });

  it("blocks private IPv4 ranges (10/8, 172.16/12, 192.168/16)", () => {
    expect(isBlockedUrl("http://10.0.0.5/")).toBe(true);
    expect(isBlockedUrl("http://172.16.0.1/")).toBe(true);
    expect(isBlockedUrl("http://172.31.255.255/")).toBe(true);
    expect(isBlockedUrl("http://192.168.1.1/")).toBe(true);
  });

  it("blocks the link-local range, including the cloud metadata endpoint", () => {
    expect(isBlockedUrl("http://169.254.169.254/latest/meta-data")).toBe(true);
  });

  it("does NOT block a public IP that merely starts similarly to a private one", () => {
    expect(isBlockedUrl("http://172.32.0.1/")).toBe(false); // just outside 172.16/12
    expect(isBlockedUrl("http://11.0.0.1/")).toBe(false); // not 10.x
  });
});

describe("handleUrlFetchRequest — guards", () => {
  it("rejects non-POST with 405 and never calls upstream", async () => {
    const fetchImpl = vi.fn();
    const res = await handleUrlFetchRequest(fetchUrlRequest(null, "GET"), fetchImpl as unknown as typeof fetch);
    expect(res.status).toBe(405);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON with 400", async () => {
    const badRequest = new Request("https://app.example/api/fetch-url", {
      method: "POST",
      body: "not json",
    });
    const res = await handleUrlFetchRequest(badRequest, vi.fn() as unknown as typeof fetch);
    expect(res.status).toBe(400);
  });

  it("rejects an empty/missing url with 400", async () => {
    const res = await handleUrlFetchRequest(fetchUrlRequest({ url: "" }), vi.fn() as unknown as typeof fetch);
    expect(res.status).toBe(400);
  });

  it("rejects a blocked URL with 400 and never calls upstream", async () => {
    const fetchImpl = vi.fn();
    const res = await handleUrlFetchRequest(
      fetchUrlRequest({ url: "http://169.254.169.254/" }),
      fetchImpl as unknown as typeof fetch,
    );
    expect(res.status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("handleUrlFetchRequest — forwarding", () => {
  it("fetches the URL and returns {url, contentType, content}", async () => {
    const fetchImpl = vi.fn<(url: string, init: RequestInit) => Promise<Response>>(async () =>
      new Response("<html><body>hello</body></html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      }),
    );
    const res = await handleUrlFetchRequest(
      fetchUrlRequest({ url: "https://example.com/page" }),
      fetchImpl as unknown as typeof fetch,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { url: string; contentType: string; content: string };
    expect(body.url).toBe("https://example.com/page");
    expect(body.contentType).toContain("text/html");
    expect(body.content).toContain("hello");

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://example.com/page");
    expect((init as RequestInit).method).toBe("GET");
  });

  it("returns 502 when the upstream fetch throws", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error("dns failure");
    });
    const res = await handleUrlFetchRequest(
      fetchUrlRequest({ url: "https://example.com" }),
      fetchImpl as unknown as typeof fetch,
    );
    expect(res.status).toBe(502);
  });

  it("returns 502 when the upstream responds non-OK", async () => {
    const fetchImpl = vi.fn(async () => new Response("nope", { status: 404 }));
    const res = await handleUrlFetchRequest(
      fetchUrlRequest({ url: "https://example.com/missing" }),
      fetchImpl as unknown as typeof fetch,
    );
    expect(res.status).toBe(502);
  });

  it("rejects (413) a page whose content-length header exceeds the size cap, without reading the body", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("small body", {
        status: 200,
        headers: { "content-length": String(MAX_FILE_BYTES + 1) },
      }),
    );
    const res = await handleUrlFetchRequest(
      fetchUrlRequest({ url: "https://example.com/huge" }),
      fetchImpl as unknown as typeof fetch,
    );
    expect(res.status).toBe(413);
  });

  it("rejects (413) a page whose actual body exceeds the size cap even with no/wrong content-length", async () => {
    const huge = "x".repeat(MAX_FILE_BYTES + 1);
    const fetchImpl = vi.fn(async () => new Response(huge, { status: 200 }));
    const res = await handleUrlFetchRequest(
      fetchUrlRequest({ url: "https://example.com/huge" }),
      fetchImpl as unknown as typeof fetch,
    );
    expect(res.status).toBe(413);
  });
});
