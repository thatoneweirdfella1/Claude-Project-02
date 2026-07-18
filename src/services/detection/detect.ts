/* The Detection Engine runtime service (Step 6.1 — the on-demand detection
   service, this step's OUTPUT).

   raw text in → four-dimension state reading out, matching the ./schema.ts
   shape, by calling claude-haiku-4-5 through the injected proxy client with the
   Step 6.1/6.2 system prompt. This is the "single on-demand classification"
   PIPELINE.md's RESOLVED note describes: it fires ON the TRANSLATE & ASK button
   press, alongside the translation call — NOT live while typing, NOT a local
   heuristic, NOT sub-300ms-budgeted.

   detectState() never throws: every path returns a typed DetectionOutcome the
   caller switches on. The pills UI (Step 6.3) and the state feeds (Step 6.5)
   are the consumers; this step builds the service standalone and stub-tested,
   same "service built, then wired" pattern as translation (2.2 → 5.2).

   Deliberately mirrors translate() (translation/translate.ts) field-for-field
   — same injected-client seam, same never-throws outcome union, same empty/
   too-large/error handling — because the two run TOGETHER on the same input on
   the same button press, so keeping their shapes parallel makes the Step 6.3/
   6.5 code that drives both at once uniform. */

import { DETECTION_MODEL, type DetectionModelClient } from "./client";
import { DETECTION_SYSTEM_PROMPT } from "./prompt";
import { parseDetectionOutput, type StateDetectionResult } from "./schema";

/** Ceiling on detection-input size — shared value with translation
    (MAX_TRANSLATION_INPUT_CHARS), since detection classifies the SAME message
    translation reframes and the two fire together. ~24k chars ≈ ~6k tokens.
    Configurable per call. */
export const MAX_DETECTION_INPUT_CHARS = 24_000;

/** Every outcome of a detection attempt. detectState() returns one of these;
    it never throws, so the pills UI can render each case deliberately (an
    absent/failed detection simply shows no pills — detection is best-effort
    and must never block or crash the answer pipeline running beside it). */
export type DetectionOutcome =
  | { status: "ok"; result: StateDetectionResult }
  | { status: "empty" }
  | { status: "too-large"; chars: number; limit: number }
  | { status: "error"; message: string };

export interface DetectOptions {
  /** The proxy/model client (Step 1.10 in prod; a stub in tests). */
  client: DetectionModelClient;
  signal?: AbortSignal;
  maxInputChars?: number;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Pull a JSON object out of the model's text reply — strip ```json fences and,
    if needed, slice from the first "{" to the last "}" (models sometimes wrap
    JSON in prose). Throws (caught by detectState) if nothing parses. Same
    extraction the translation service uses. */
export function extractJsonObject(text: string): unknown {
  const withoutFences = text.replace(/```(?:json)?/gi, "").trim();
  try {
    return JSON.parse(withoutFences);
  } catch {
    const start = withoutFences.indexOf("{");
    const end = withoutFences.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new SyntaxError("No JSON object found in the model reply.");
    }
    return JSON.parse(withoutFences.slice(start, end + 1));
  }
}

export async function detectState(
  rawInput: string,
  options: DetectOptions,
): Promise<DetectionOutcome> {
  const limit = options.maxInputChars ?? MAX_DETECTION_INPUT_CHARS;
  const text = typeof rawInput === "string" ? rawInput : "";

  // Empty input: nothing to read. Not an error — no message was submitted.
  if (text.trim().length === 0) {
    return { status: "empty" };
  }

  // Huge input: reject rather than truncate, matching translation's cap so the
  // two on-demand calls agree on what they will and won't process.
  if (text.length > limit) {
    return { status: "too-large", chars: text.length, limit };
  }

  let reply: string;
  try {
    reply = await options.client({
      model: DETECTION_MODEL,
      system: DETECTION_SYSTEM_PROMPT,
      input: text.trim(),
      signal: options.signal,
    });
  } catch (error) {
    // Transport/API failure (network, timeout, abort, proxy down).
    return { status: "error", message: errorMessage(error) };
  }

  try {
    const parsed = extractJsonObject(reply);
    return { status: "ok", result: parseDetectionOutput(parsed) };
  } catch (error) {
    // Malformed JSON or a reply that isn't an object.
    return { status: "error", message: errorMessage(error) };
  }
}
