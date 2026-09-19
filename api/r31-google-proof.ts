/// <reference types="node" />

import { isAuthorized, unauthorizedResponse } from "../src/services/appAccess.js";
import {
  handlePartnerRequest,
  type PartnerAdapter,
  type PartnerProxyRequestBody,
} from "../src/services/debate/partnerProxy.js";

export const config = { runtime: "edge" };

const PROOF_MODEL_ID = "gemini-2.5-flash-lite";
const PROOF_MARKER = "R31_GOOGLE_LIVE_OK";

interface GeminiProofResponse {
  candidates?: { content?: { parts?: { text?: unknown }[] } }[];
  usageMetadata?: {
    promptTokenCount?: unknown;
    candidatesTokenCount?: unknown;
  };
}

const PROOF_ADAPTER: PartnerAdapter = {
  modelId: PROOF_MODEL_ID,
  keyEnvVar: "GOOGLE_API_KEY",
  url: () =>
    `https://generativelanguage.googleapis.com/v1beta/models/${PROOF_MODEL_ID}:generateContent`,
  headers: (apiKey) => ({ "x-goog-api-key": apiKey }),
  body: (body: PartnerProxyRequestBody, maxTokens: number) => ({
    systemInstruction: {
      parts: [{
        text: "This is an automated connectivity proof. Follow the user's formatting instruction exactly.",
      }],
    },
    contents: [{ role: "user", parts: [{ text: body.input }] }],
    generationConfig: { maxOutputTokens: maxTokens },
  }),
  extractText: (payload: unknown) => {
    const parts = (payload as GeminiProofResponse)?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) return null;
    const text = parts
      .map((part) => (typeof part?.text === "string" ? part.text : ""))
      .join("");
    return text.length > 0 ? text : null;
  },
  extractUsage: (payload: unknown) => {
    const usage = (payload as GeminiProofResponse)?.usageMetadata;
    if (!usage) return null;
    const inputTokens =
      typeof usage.promptTokenCount === "number" ? usage.promptTokenCount : undefined;
    const outputTokens =
      typeof usage.candidatesTokenCount === "number" ? usage.candidatesTokenCount : undefined;
    return inputTokens === undefined && outputTokens === undefined
      ? null
      : { inputTokens, outputTokens };
  },
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return json({ pass: false, error: "Method not allowed" }, 405);
  }

  if (!isAuthorized(request, process.env.APP_ACCESS_PASSWORD)) {
    return unauthorizedResponse();
  }

  // Separate arming switch so a deployed endpoint cannot make live calls
  // merely because GOOGLE_API_KEY happens to exist.
  if (process.env.R31_LIVE_PROOF_ENABLED !== "1") {
    return json({
      pass: false,
      live: false,
      provider: "google",
      model: PROOF_MODEL_ID,
      error: "R31 live proof is not armed",
    }, 403);
  }

  // The caller cannot supply prompt text. This keeps the free-tier proof
  // synthetic and prevents conversation/project data from being sent.
  const proofRequest = new Request(request.url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: PROOF_MODEL_ID,
      system: "R31 live-provider connectivity proof",
      input: `Return exactly this token and nothing else: ${PROOF_MARKER}`,
      maxTokens: 24,
    }),
    signal: request.signal,
  });

  const startedAt = Date.now();
  const result = await handlePartnerRequest(
    proofRequest,
    process.env.GOOGLE_API_KEY,
    PROOF_ADAPTER,
  );
  const durationMs = Date.now() - startedAt;

  let payload: any;
  try {
    payload = await result.json();
  } catch {
    return json({
      pass: false,
      live: true,
      provider: "google",
      model: PROOF_MODEL_ID,
      durationMs,
      error: "Proof path returned unreadable JSON",
    }, 502);
  }

  if (!result.ok) {
    return json({
      pass: false,
      live: true,
      provider: "google",
      model: PROOF_MODEL_ID,
      durationMs,
      upstreamStatus: result.status,
      error: typeof payload?.error === "string" ? payload.error : "Google proof failed",
    }, result.status);
  }

  const text = typeof payload?.text === "string" ? payload.text.trim() : "";
  const usage = payload?.usage;
  const markerObserved = text === PROOF_MARKER;
  const usageObserved =
    Number.isFinite(usage?.inputTokens) && Number.isFinite(usage?.outputTokens);
  const pass = markerObserved && usageObserved;

  return json({
    pass,
    live: true,
    provider: "google",
    model: PROOF_MODEL_ID,
    markerObserved,
    usageObserved,
    durationMs,
    usage: usageObserved ? usage : null,
    response: text,
  }, pass ? 200 : 502);
}
