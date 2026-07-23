/* Serverless platform entry for the app access gate (operator-directed,
   post-12.3). Deliberately the one endpoint reachable with no password at
   all — the client calls this first to learn whether APP_ACCESS_PASSWORD is
   even configured, and if so whether whatever it has stored is correct. See
   src/services/appAccess.ts for the logic and BUILD-LOG.md for why this
   exists (Vercel's own Deployment Protection was an all-or-nothing page
   wall, not a scoped fix). */

/// <reference types="node" />
import { checkAccess } from "../src/services/appAccess.js";

export const config = { runtime: "edge" };

export default function handler(request: Request): Promise<Response> {
  const result = checkAccess(request, process.env.APP_ACCESS_PASSWORD);
  return Promise.resolve(
    new Response(JSON.stringify(result), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
  );
}
