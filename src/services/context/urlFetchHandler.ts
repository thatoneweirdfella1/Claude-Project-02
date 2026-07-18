/* Serverless URL-fetch handler (Step 7.3 deliverable #1) — CANON Feature 6:
   "paste URL (fetched through the proxy)". The browser never fetches a
   third-party URL directly — this is the ONLY thing that fetches it, same
   centralize-all-egress-through-one-server-side-function principle as the
   Step 1.10 model proxy (and it sidesteps CORS entirely, which a direct
   browser fetch of an arbitrary third-party page would usually hit anyway).

   Platform-agnostic Web Fetch handler (Request -> Response), same shape as
   proxyHandler.ts: the thin platform entry lives in api/fetch-url.ts.
   fetchImpl is injectable so this is unit-testable without a real network
   (the sandbox has none — same standing constraint as every proxy call
   since Step 1.10). No API key here — this endpoint never touches
   Anthropic, it only forwards a GET to a URL the user supplied. */

import { MAX_FILE_BYTES } from "./fileValidation";

const FETCH_TIMEOUT_MS = 15_000;

export interface UrlFetchRequestBody {
  url: string;
}

export interface UrlFetchResponseBody {
  url: string;
  contentType: string;
  content: string;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** Blocks the obvious SSRF targets before this server-side function ever
    dials out: non-http(s) protocols, localhost, and the private/link-local
    IPv4 ranges (10/8, 172.16/12, 192.168/16, 169.254/16 — the last one
    covers cloud metadata endpoints like 169.254.169.254). This is a
    first-layer literal-address check, not exhaustive — it can't catch DNS
    rebinding (a public hostname resolving to a private IP at fetch time),
    which needs platform-level network policy to fully close. See
    BUILD-LOG.md PARKED. */
export function isBlockedUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return true; // not a parseable absolute URL at all
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return true;

  const host = parsed.hostname.toLowerCase();
  if (host === "localhost" || host === "0.0.0.0" || host === "::1") return true;

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/);
  if (ipv4) {
    const a = Number(ipv4[1]);
    const b = Number(ipv4[2]);
    if (a === 127) return true; // loopback
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 (link-local + cloud metadata)
  }
  return false;
}

/** Handle one proxied URL fetch. `fetchImpl` defaults to the platform
    fetch; tests pass a stub. Rejects (not truncates) a page over
    MAX_FILE_BYTES — same "reject rather than silently drop content"
    posture Step 2.2/7.1 already established for oversized input. */
export async function handleUrlFetchRequest(
  request: Request,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body: UrlFetchRequestBody;
  try {
    body = (await request.json()) as UrlFetchRequestBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (typeof body.url !== "string" || body.url.trim().length === 0) {
    return jsonResponse({ error: "url must be a non-empty string" }, 400);
  }

  if (isBlockedUrl(body.url)) {
    return jsonResponse({ error: "That URL can't be fetched." }, 400);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetchImpl(body.url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "DivergenceAI-ContextFetcher/1.0" },
    });
  } catch (error) {
    return jsonResponse(
      {
        error: `Fetching that page failed: ${error instanceof Error ? error.message : String(error)}`,
      },
      502,
    );
  } finally {
    clearTimeout(timer);
  }

  if (!upstream.ok) {
    return jsonResponse({ error: `The page responded with ${upstream.status}.` }, 502);
  }

  const contentLength = upstream.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_FILE_BYTES) {
    return jsonResponse({ error: "That page is too large to load as context." }, 413);
  }

  const text = await upstream.text();
  if (text.length > MAX_FILE_BYTES) {
    return jsonResponse({ error: "That page is too large to load as context." }, 413);
  }

  const responseBody: UrlFetchResponseBody = {
    url: body.url,
    contentType: upstream.headers.get("content-type") ?? "text/plain",
    content: text,
  };
  return jsonResponse(responseBody, 200);
}
