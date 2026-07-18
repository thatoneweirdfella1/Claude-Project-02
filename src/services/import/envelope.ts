/* Import envelope + per-kind payload validation (Step 9.3).

   Never throws — every failure is a typed ImportOutcome, same posture as
   translate()/detectState()/runDebate(). An import reads a file the user
   picked; a malformed one is an expected outcome, not an exception.

   VALIDATION PHILOSOPHY: an imported payload is untrusted input that lands
   directly in a persisted store, so every item is checked before it's kept.
   Items that don't validate are SKIPPED and counted (surfaced to the user),
   not silently dropped and not allowed to fail the whole import — the same
   per-item tolerance detection/schema.ts uses. Ids are REGENERATED on
   import rather than trusted: a file's ids could collide with what's
   already in the store, and a collision would silently overwrite the user's
   existing data.

   Every reachable guard here is REUSED, not rewritten: isValidVariableName
   (Step 7.4), isTechniqueId (Step 4.1), isModelId (Step 1.10),
   MAX_TECHNIQUE_STACK (Step 4.2). */

import { MAX_FILE_BYTES } from "../context/fileValidation";
import { isValidVariableName } from "../context/variables";
import { isTechniqueId, MAX_TECHNIQUE_STACK } from "../techniques";
import { isModelId } from "../modelRegistry";
import { parseChatHistory } from "./chatHistory";
import {
  IMPORT_PAYLOAD_KINDS,
  type ImportOutcome,
  type ImportPayloadKind,
} from "./types";
import type {
  ContextItem,
  ContextItemKind,
  DirectnessLevel,
  ModelSelection,
  PromptTemplate,
  SavedPrompt,
  SavedVariables,
  TechniqueId,
} from "../../stores/types";

function newId(prefix: string): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function isPayloadKind(value: unknown): value is ImportPayloadKind {
  return typeof value === "string" && (IMPORT_PAYLOAD_KINDS as readonly string[]).includes(value);
}

const CONTEXT_KINDS: readonly ContextItemKind[] = ["file", "text", "url", "variable"];

/* ── Per-kind payload validators ──────────────────────────────────────── */

function validateVariables(raw: unknown): { variables: SavedVariables; skipped: number } {
  const variables: SavedVariables = {};
  let skipped = 0;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { variables, skipped };

  for (const [name, value] of Object.entries(raw as Record<string, unknown>)) {
    // Name rules come from the SAME validator the creation form uses, so a
    // variable that can't be typed by hand can't sneak in through a file
    // either — substituteVariables()'s regex is derived from that same
    // pattern, so an unmatchable name would just be dead weight in the store.
    if (typeof value === "string" && isValidVariableName(name)) {
      variables[name] = value;
    } else {
      skipped += 1;
    }
  }
  return { variables, skipped };
}

function validateContextItems(raw: unknown): { items: ContextItem[]; skipped: number } {
  const items: ContextItem[] = [];
  let skipped = 0;
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { items?: unknown }).items)
      ? (raw as { items: unknown[] }).items
      : null;
  if (!list) return { items, skipped };

  let runningBytes = 0;
  for (const entry of list) {
    if (!entry || typeof entry !== "object") {
      skipped += 1;
      continue;
    }
    const obj = entry as Record<string, unknown>;
    const content = typeof obj.content === "string" ? obj.content : null;
    const label = typeof obj.label === "string" && obj.label.trim().length > 0 ? obj.label : null;
    if (content === null || label === null) {
      skipped += 1;
      continue;
    }
    // bytes is RECOMPUTED from the actual content, never trusted from the
    // file: it's what the 10MB/50MB budget is enforced against (Step 7.1),
    // so a file claiming `bytes: 0` on a huge string would otherwise walk
    // straight past the cap the whole context system depends on.
    const bytes = new Blob([content]).size;
    runningBytes += bytes;
    if (runningBytes > MAX_FILE_BYTES) {
      skipped += 1;
      continue;
    }
    const kind = CONTEXT_KINDS.includes(obj.kind as ContextItemKind)
      ? (obj.kind as ContextItemKind)
      : "text";
    items.push({ id: newId("context"), kind, label, content, bytes });
  }
  return { items, skipped };
}

function validateSavedPrompts(raw: unknown): { prompts: SavedPrompt[]; skipped: number } {
  const prompts: SavedPrompt[] = [];
  let skipped = 0;
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { prompts?: unknown }).prompts)
      ? (raw as { prompts: unknown[] }).prompts
      : null;
  if (!list) return { prompts, skipped };

  for (const entry of list) {
    if (!entry || typeof entry !== "object") {
      skipped += 1;
      continue;
    }
    const obj = entry as Record<string, unknown>;
    const text = typeof obj.text === "string" && obj.text.trim().length > 0 ? obj.text : null;
    if (text === null) {
      skipped += 1;
      continue;
    }
    const title =
      typeof obj.title === "string" && obj.title.trim().length > 0
        ? obj.title
        : text.slice(0, 40); // a titleless prompt is still a usable prompt
    prompts.push({ id: newId("prompt"), title, text });
  }
  return { prompts, skipped };
}

function validateTemplates(raw: unknown): { templates: PromptTemplate[]; skipped: number } {
  const templates: PromptTemplate[] = [];
  let skipped = 0;
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { templates?: unknown }).templates)
      ? (raw as { templates: unknown[] }).templates
      : null;
  if (!list) return { templates, skipped };

  for (const entry of list) {
    if (!entry || typeof entry !== "object") {
      skipped += 1;
      continue;
    }
    const obj = entry as Record<string, unknown>;
    const title = typeof obj.title === "string" && obj.title.trim().length > 0 ? obj.title : null;
    if (title === null) {
      skipped += 1;
      continue;
    }

    const model: ModelSelection = obj.model === "auto" || isModelId(obj.model)
      ? (obj.model as ModelSelection)
      : "auto"; // never import a paid-tier model choice from an untrusted file
    const directness: DirectnessLevel =
      obj.directness === 1 || obj.directness === 2 || obj.directness === 3
        ? obj.directness
        : 2; // CANON Feature 3's default

    // CANON Feature 4 caps a stack at 4 — enforced HERE, not just trusted
    // from the file. Step 5.2 already found this exact class of bug once (a
    // corrupted persisted array bypassing the cap); an imported file is the
    // same untrusted-array problem arriving through a different door.
    const techniques = Array.isArray(obj.techniques)
      ? (obj.techniques.filter(isTechniqueId) as TechniqueId[]).slice(0, MAX_TECHNIQUE_STACK)
      : [];

    templates.push({
      id: newId("template"),
      title,
      model,
      directness,
      techniques: techniques.length > 0 ? techniques : ["auto-detect"],
      ...(typeof obj.starterQuestion === "string" && obj.starterQuestion.trim().length > 0
        ? { starterQuestion: obj.starterQuestion }
        : {}),
    });
  }
  return { templates, skipped };
}

/* ── Entry point ──────────────────────────────────────────────────────── */

/** Reads one import file's text. `expectedKind` is what the user actually
    asked to import — a Saved Prompts file picked under "Import variables"
    is rejected as "wrong-kind" rather than quietly doing something the user
    didn't ask for (CANON "no black box").

    A file with no recognizable envelope is still accepted when the user is
    importing chat history, since CANON defines THAT path as reading an
    EXTERNALLY exported log which by definition won't carry this app's
    envelope. The other four kinds require the envelope — there's no
    reliable way to tell a bare `{}` of variables from a bare `{}` of
    anything else, and guessing wrong writes the user's data into the wrong
    store field. */
export function parseImportText(text: string, expectedKind: ImportPayloadKind): ImportOutcome {
  if (text.trim().length === 0) {
    return { ok: false, reason: "empty", message: "That file is empty." };
  }
  if (new Blob([text]).size > MAX_FILE_BYTES) {
    return {
      ok: false,
      reason: "too-large",
      message: "That file is over the 10MB import limit.",
    };
  }

  let root: unknown;
  try {
    root = JSON.parse(text);
  } catch {
    return {
      ok: false,
      reason: "not-json",
      message: "That file isn't valid JSON, so there's nothing to read from it yet.",
    };
  }

  const envelope =
    root && typeof root === "object" && (root as { app?: unknown }).app === "divergence-ai"
      ? (root as { kind?: unknown; payload?: unknown })
      : null;

  if (envelope) {
    if (!isPayloadKind(envelope.kind)) {
      return {
        ok: false,
        reason: "unrecognized",
        message: "This file came from this app, but it holds something this version doesn't read.",
      };
    }
    if (envelope.kind !== expectedKind) {
      return {
        ok: false,
        reason: "wrong-kind",
        message: `That file holds ${describeKind(envelope.kind)}, not ${describeKind(expectedKind)}. Pick it from that option instead.`,
      };
    }
    return buildPayload(expectedKind, envelope.payload);
  }

  if (expectedKind === "chat-history") return buildPayload("chat-history", root);

  return {
    ok: false,
    reason: "unrecognized",
    message: `That file doesn't look like ${describeKind(expectedKind)} exported from this app.`,
  };
}

function buildPayload(kind: ImportPayloadKind, payload: unknown): ImportOutcome {
  switch (kind) {
    case "variables": {
      const { variables, skipped } = validateVariables(payload);
      return Object.keys(variables).length > 0
        ? { ok: true, payload: { kind, variables }, skipped }
        : nothingUsable("variables");
    }
    case "context-snapshot": {
      const { items, skipped } = validateContextItems(payload);
      return items.length > 0
        ? { ok: true, payload: { kind, items }, skipped }
        : nothingUsable("context items");
    }
    case "saved-prompts": {
      const { prompts, skipped } = validateSavedPrompts(payload);
      return prompts.length > 0
        ? { ok: true, payload: { kind, prompts }, skipped }
        : nothingUsable("saved prompts");
    }
    case "template-settings": {
      const { templates, skipped } = validateTemplates(payload);
      return templates.length > 0
        ? { ok: true, payload: { kind, templates }, skipped }
        : nothingUsable("templates");
    }
    case "chat-history": {
      const { messages, skipped } = parseChatHistory(payload);
      return messages.length > 0
        ? { ok: true, payload: { kind, messages }, skipped }
        : nothingUsable("messages");
    }
  }
}

function nothingUsable(noun: string): ImportOutcome {
  return {
    ok: false,
    reason: "nothing-usable",
    message: `No ${noun} could be read from that file.`,
  };
}

function describeKind(kind: ImportPayloadKind): string {
  switch (kind) {
    case "variables":
      return "variables";
    case "context-snapshot":
      return "a context snapshot";
    case "saved-prompts":
      return "saved prompts";
    case "template-settings":
      return "template settings";
    case "chat-history":
      return "chat history";
  }
}
