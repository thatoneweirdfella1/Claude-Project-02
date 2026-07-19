/* Serverless platform entry for the URL-fetch proxy (Step 7.3).

   Deploy-time wrapper only — all logic lives in (and is unit-tested from)
   src/services/context/urlFetchHandler.ts. Outside src/, same reasoning as
   api/proxy.ts (Step 1.10): not part of the client bundle or the app's tsc
   build (tsconfig include is ["src"]); the deploy platform builds it.

   No API key here — unlike api/proxy.ts, this endpoint never touches
   Anthropic, it only forwards a GET to a URL the user supplied.

   Written for a Web-Fetch edge runtime (Vercel Edge / Cloudflare / Netlify
   Edge). Adjust the export shape to your host at deploy (Step 12.3). */

import { handleUrlFetchRequest } from "../src/services/context/urlFetchHandler.js";

export const config = { runtime: "edge" };

export default function handler(request: Request): Promise<Response> {
  return handleUrlFetchRequest(request);
}
