/* The Translation Engine runtime service (Step 2.2).

   raw text in → translated prompt + confidence + gap types out, matching the
   Step 2.1 schema, by calling claude-sonnet-5 through the injected proxy client
   with the Step 2.1 system prompt. Handles empty input, huge input, and API /
   malformed-reply failure WITHOUT crashing: every path returns a typed
   TranslationOutcome the caller switches on (the clarify UI is Step 2.3, the
   composer is Step 5.0+). translate() never throws. */

import {
  TRANSLATION_MODEL,
  type TranslationModelClient,
} from "./client";
import { TRANSLATION_SYSTEM_PROMPT } from "./prompt";
import { parseTranslationOutput, type TranslationResult } from "./schema";

/** Provisional ceiling on translation-input size. CANON's 10MB/50MB limits are
    for loaded CONTEXT, not the translation box; PIPELINE/CANON set no explicit
    box cap, so this guards against an absurd paste blowing the model's token
    budget. ~24k chars ≈ ~6k tokens. Configurable per call; revisit once Step
    1.10's registry exposes real per-model token budgets. */
export const MAX_TRANSLATION_INPUT_CHARS = 24_000;

/** Every outcome of a translation attempt. translate() returns one of these;
    it never throws, so the UI can render each case deliberately. */
export type TranslationOutcome =
  | { status: "ok"; result: TranslationResult }
  | { status: "empty" }
  | { status: "too-large"; chars: number; limit: number }
  | { status: "error"; message: string };

export interface TranslateOptions {
  /** The proxy/model client (Step 1.10 in prod; a stub in tests/harness). */
  client: TranslationModelClient;
  signal?: AbortSignal;
  maxInputChars?: number;
  /** Versioned customer defaults. They guide interpretation but never
      override the text currently being translated. */
  personalizationInstructions?: string[];
}

function translationSystemPrompt(instructions: string[] | undefined): string {
  const bounded = (instructions ?? [])
    .map((instruction) => instruction.replace(/\s+/g, " ").trim().slice(0, 500))
    .filter(Boolean)
    .slice(0, 12);
  if (bounded.length === 0) return TRANSLATION_SYSTEM_PROMPT;
  return [
    TRANSLATION_SYSTEM_PROMPT,
    "LEARNED CUSTOMER DEFAULTS",
    ...bounded.map((instruction) => `- ${instruction}`),
  ].join("\n\n");
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Pull a JSON object out of the model's text reply. The system prompt asks for
    bare JSON, but models sometimes wrap it in ```json fences or a sentence — so
    strip fences and, if needed, slice from the first "{" to the last "}".
    Throws (caught by translate) if nothing parses. */
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

export async function translate(
  rawInput: string,
  options: TranslateOptions,
): Promise<TranslationOutcome> {
  const limit = options.maxInputChars ?? MAX_TRANSLATION_INPUT_CHARS;
  const text = typeof rawInput === "string" ? rawInput : "";

  // Empty input: nothing to translate. Not an error — the composer simply has
  // no request yet.
  if (text.trim().length === 0) {
    return { status: "empty" };
  }

  // Huge input: reject rather than silently truncate — truncation could drop
  // the real request, which in ADHD input often trails after preamble.
  if (text.length > limit) {
    return { status: "too-large", chars: text.length, limit };
  }

  let reply: string;
  try {
    reply = await options.client({
      model: TRANSLATION_MODEL,
      system: translationSystemPrompt(options.personalizationInstructions),
      input: text.trim(),
      signal: options.signal,
    });
  } catch (error) {
    // Transport/API failure (network, timeout, abort, proxy down).
    return { status: "error", message: errorMessage(error) };
  }

  try {
    const parsed = extractJsonObject(reply);
    return { status: "ok", result: parseTranslationOutput(parsed) };
  } catch (error) {
    // Malformed JSON or a reply that fails the schema (no usable request).
    return { status: "error", message: errorMessage(error) };
  }
}
