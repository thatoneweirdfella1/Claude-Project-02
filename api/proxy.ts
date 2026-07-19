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

export const config = { runtime: "edge" };

export default function handler(request: Request): Promise<Response> {
  return handleProxyRequest(request, process.env.ANTHROPIC_API_KEY);
}
