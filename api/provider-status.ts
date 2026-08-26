/// <reference types="node" />
import { isAuthorized, unauthorizedResponse } from "../src/services/appAccess.js";

export const config = { runtime: "edge" };

export default function handler(request: Request): Response {
  if (!isAuthorized(request, process.env.APP_ACCESS_PASSWORD)) return unauthorizedResponse();
  if (request.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response(JSON.stringify({
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
    google: Boolean(process.env.GOOGLE_API_KEY),
    xai: Boolean(process.env.XAI_API_KEY),
    deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
  }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "private, no-store",
    },
  });
}
