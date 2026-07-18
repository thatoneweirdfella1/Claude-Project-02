/* Client-side URL context (Step 7.3 deliverable #2) — the user pastes a URL,
   this calls the Step 7.3 proxy (urlFetchHandler.ts via api/fetch-url.ts,
   NEVER a direct browser fetch of the third-party page — CANON Feature 6),
   extracts readable text, and turns it into a ContextItem, budgeted against
   the SAME 10MB-per-item / 50MB-per-session limits Step 7.1 established for
   uploads (CANON's numbers are per-file/per-session, not per-source — a
   fetched page is budgeted exactly like an uploaded file).

   Text extraction runs HERE, client-side, via the browser's native
   DOMParser — not on the server. The edge/serverless runtime has no DOM,
   and adding a server-side HTML parsing library for this alone would be an
   unnecessary new dependency (CONVENTIONS rule 3) when the browser already
   provides one for free. */

import type { ContextItem, ContextItemKind } from "../../stores/types";
import { MAX_FILE_BYTES, MAX_SESSION_BYTES, formatBytes } from "./fileValidation";
import type { UrlFetchResponseBody } from "./urlFetchHandler";

const FETCH_URL_ENDPOINT = "/api/fetch-url";
const NON_CONTENT_TAGS = [
  "script",
  "style",
  "noscript",
  "template",
  "nav",
  "header",
  "footer",
  "aside",
  "iframe",
  "svg",
  "form",
];

/** Strips non-content elements (nav/scripts/forms/etc.) and returns the
    page's visible text, whitespace collapsed. A lightweight heuristic
    (prefers <article>/<main> if present, falls back to <body>) — CANON asks
    for "readable text," not a full Readability.js-style algorithm, and a
    second HTML-parsing dependency isn't warranted for a step that already
    has DOMParser available for free. */
export function extractReadableText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  for (const tag of NON_CONTENT_TAGS) {
    doc.querySelectorAll(tag).forEach((el) => el.remove());
  }
  const main = doc.querySelector("article") ?? doc.querySelector("main") ?? doc.body;
  const raw = main?.textContent ?? "";
  return raw
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export type UrlFetchOutcome = { ok: true; item: ContextItem } | { ok: false; message: string };

export interface FetchUrlOptions {
  /** Injected fetch, defaulting to the browser global — a stub in tests. */
  fetchImpl?: typeof fetch;
}

function newContextItemId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `ctx-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

const KIND: ContextItemKind = "url";

/** Never throws — every failure path (bad URL, proxy unreachable, proxy
    rejected it, page too big for the remaining session budget) returns a
    typed { ok: false; message } the caller renders directly, same never-
    throw posture as translate()/detectState()/uploadFiles(). */
export async function fetchUrlContext(
  rawUrl: string,
  currentSessionBytes: number,
  options: FetchUrlOptions = {},
): Promise<UrlFetchOutcome> {
  const url = rawUrl.trim();
  if (url.length === 0) {
    return { ok: false, message: "Paste a URL first." };
  }
  try {
    // eslint-disable-next-line no-new
    new URL(url);
  } catch {
    return { ok: false, message: `"${url}" doesn't look like a valid URL.` };
  }

  const doFetch = options.fetchImpl ?? fetch;
  let res: Response;
  try {
    res = await doFetch(FETCH_URL_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch {
    return { ok: false, message: "Couldn't reach the fetch service. Try again in a moment." };
  }

  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, message: detail?.error ?? `That page couldn't be loaded (${res.status}).` };
  }

  const { contentType, content } = (await res.json()) as UrlFetchResponseBody;
  const extracted = contentType.includes("html") ? extractReadableText(content) : content.trim();

  if (extracted.length === 0) {
    return { ok: false, message: "That page didn't have any readable text to load." };
  }

  const bytes = new TextEncoder().encode(extracted).length;
  if (bytes > MAX_FILE_BYTES) {
    return {
      ok: false,
      message: `That page's text is ${formatBytes(bytes)}, over the ${formatBytes(MAX_FILE_BYTES)} per-item limit.`,
    };
  }
  if (currentSessionBytes + bytes > MAX_SESSION_BYTES) {
    return {
      ok: false,
      message: `Adding this page would put this session's loaded context over the ${formatBytes(MAX_SESSION_BYTES)} limit. Remove something first, or start a new session.`,
    };
  }

  return {
    ok: true,
    item: { id: newContextItemId(), kind: KIND, label: url, content: extracted, bytes },
  };
}
