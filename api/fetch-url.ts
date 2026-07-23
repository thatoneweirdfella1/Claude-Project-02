/* Serverless platform entry for the URL-fetch proxy (Step 7.3).

   Deploy-time wrapper only — all logic lives in (and is unit-tested from)
   src/services/context/urlFetchHandler.ts. Outside src/, same reasoning as
   api/proxy.ts (Step 1.10): not part of the client bundle or the app's tsc
   build (tsconfig include is ["src"]); the deploy platform builds it.

   No PROVIDER API key here — unlike api/proxy.ts, this endpoint never
   touches Anthropic, it only forwards a GET to a URL the user supplied. It
   still gates on the app access password (appAccess.ts, operator-directed
   post-12.3) — an open URL-fetch relay is its own abuse surface (SSRF
   attempts, bandwidth) even with no provider key behind it, and the
   isBlockedUrl guard in urlFetchHandler.ts was never meant to be this
   endpoint's only line of defense against being hit by strangers.

   Written for a Web-Fetch edge runtime (Vercel Edge / Cloudflare / Netlify
   Edge). Adjust the export shape to your host at deploy (Step 12.3). */

/// <reference types="node" />
import { handleUrlFetchRequest } from "../src/services/context/urlFetchHandler.js";
import { isAuthorized, unauthorizedResponse } from "../src/services/appAccess.js";

export const config = { runtime: "edge" };

export default function handler(request: Request): Promise<Response> {
  if (!isAuthorized(request, process.env.APP_ACCESS_PASSWORD)) {
    return Promise.resolve(unauthorizedResponse());
  }
  return handleUrlFetchRequest(request);
}
