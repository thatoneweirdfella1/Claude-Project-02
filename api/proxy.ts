/* Serverless platform entry for the model proxy (Step 1.10).

   This is the deploy-time wrapper only — all logic lives in (and is unit-tested
   from) src/services/proxyHandler.ts. It is intentionally OUTSIDE src/, so it is
   not part of the client bundle or the app's tsc build (tsconfig include is
   ["src"]); the deploy platform builds it. ANTHROPIC_API_KEY is read from the
   server environment here and never reaches the browser.

   Written for a Web-Fetch edge runtime (Vercel Edge / Cloudflare / Netlify
   Edge). Adjust the export shape to your host at deploy (Step 12.3). */

/// <reference types="node" />
import { handleProxyRequest } from "../src/services/proxyHandler.js";
import { isAuthorized, unauthorizedResponse } from "../src/services/appAccess.js";

export const config = { runtime: "edge" };

/* Rate limiter — prevents runaway API spend. Tracks requests per minute
   per client IP. If a single IP exceeds 100 requests/minute, return 429.
   This is a safety valve: stops accidental loops, DoS attempts, or bugs
   from burning your entire API budget in seconds. */

const requestCounts = new Map<string, { count: number; resetAt: number }>();

function getRateLimitKey(request: Request): string {
  return request.headers.get("cf-connecting-ip") || // Cloudflare
         request.headers.get("x-forwarded-for")?.split(",")[0] || // Nginx/Vercel
         "unknown";
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const current = requestCounts.get(key);

  if (!current || now > current.resetAt) {
    // New window or expired
    requestCounts.set(key, { count: 1, resetAt: now + 60000 });
    return true; // Allowed
  }

  current.count++;
  if (current.count > 100) {
    return false; // Exceeded limit
  }
  return true; // Allowed
}

export default function handler(request: Request): Promise<Response> {
  if (!isAuthorized(request, process.env.APP_ACCESS_PASSWORD)) {
    return Promise.resolve(unauthorizedResponse());
  }

  // Rate limit check
  const limitKey = getRateLimitKey(request);
  if (!checkRateLimit(limitKey)) {
    return Promise.resolve(
      new Response(JSON.stringify({ error: "Rate limit exceeded (100 req/min)" }), {
        status: 429,
        headers: { "content-type": "application/json" },
      })
    );
  }

  return handleProxyRequest(request, process.env.ANTHROPIC_API_KEY);
}
