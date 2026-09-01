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
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  const model = url.searchParams.get("model");
  const route = url.searchParams.get("route");
  const configured = {
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
    google: Boolean(process.env.GOOGLE_API_KEY),
    xai: Boolean(process.env.XAI_API_KEY),
    deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
  };
  const knownProvider = provider !== null && Object.hasOwn(configured, provider);
  const routeStatus = provider && model && route ? {
    providerId: provider,
    modelId: model,
    route,
    configured: knownProvider && configured[provider as keyof typeof configured],
    // This safe status endpoint does not make a paid/live provider request.
    // Key presence therefore cannot honestly prove authentication or health.
    authenticated: false,
    healthy: false,
    verifiedAt: null,
    failureReason: knownProvider && configured[provider as keyof typeof configured] ? "unverified" : "unavailable",
  } : undefined;
  return new Response(JSON.stringify({ ...configured, routeStatus }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "cache-control": "private, no-store",
    },
  });
}
