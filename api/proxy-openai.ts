/* Serverless platform entry for the Openai debate-partner proxy (Step 8.3).

   Deploy-time wrapper only — all logic lives in (and is unit-tested from)
   src/services/debate/openaiHandler.ts. Intentionally OUTSIDE src/, so it is
   not part of the client bundle or the app's tsc build (tsconfig include is
   ["src"]); the deploy platform builds it. Same treatment as api/proxy.ts and
   api/fetch-url.ts.

   OPENAI_API_KEY is read from the server environment here and never reaches
   the browser (ROUTING.md DEBATE PARTNERS: "Each provider's API key is a
   separate secret... Not committed to the repo, ever."). */

/// <reference types="node" />
import { handleOpenAiRequest } from "../src/services/debate/openaiHandler.js";
import { isAuthorized, unauthorizedResponse } from "../src/services/appAccess.js";

export const config = { runtime: "edge" };

export default function handler(request: Request): Promise<Response> {
  if (!isAuthorized(request, process.env.APP_ACCESS_PASSWORD)) {
    return Promise.resolve(unauthorizedResponse());
  }
  return handleOpenAiRequest(request, process.env.OPENAI_API_KEY);
}
