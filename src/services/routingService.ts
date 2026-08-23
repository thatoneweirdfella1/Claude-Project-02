/* Routing service (Step 3.1) — routing.js integrated into the app, typed.

   routing.js is already built and tested (ROUTING.md: "Do not rebuild the
   scorer"); this file changes NOTHING about its logic. It only gives the rest
   of the TypeScript app a typed, named entry point to call through, per
   CONVENTIONS.md's services/ layout ("the drop-in routing engine").

   Re-exports ModelKey so callers don't need to reach into routing.d.ts
   directly; PlanFlag/ModelId already exist elsewhere (stores/types.ts,
   modelRegistry.ts) and are intentionally NOT redeclared here — see
   BUILD-LOG.md DECISIONS for how the three keying schemes line up. */

import engine, {
  type ModelKey,
  type RouteInput,
  type RouteResult,
} from "./routing.js";
import { isModelId } from "./modelRegistry";
import type { ModelSelection } from "../stores/types";

export type { ModelKey, RouteInput, RouteResult } from "./routing.js";

/** Route a translated prompt to a model. Thin pass-through to routing.js's
    route() — no logic added, removed, or changed here. */
export function route(input: RouteInput): RouteResult {
  return engine.route(input);
}

/** The model keys the free plan may auto-route or override to (haiku, sonnet). */
export const FREE_MODEL_KEYS: ModelKey[] = engine.FREE_MODELS;

/** The engine's own model table (key -> tier/label/api). Prefer
    src/services/modelRegistry.ts (keyed by ModelId) for UI/model-picker code;
    this is exposed for callers that already have a routing ModelKey, e.g.
    reading tier/label off a RouteResult. */
export const ROUTING_MODELS = engine.MODELS;

/** Convert the Model dropdown's selection (SessionState.model, Step 1.7) into
    routing.js's override input (Step 3.2). "auto" — and any value that isn't a
    known ModelId, e.g. a stale value from an old persisted session — becomes
    null (no override; the scorer decides), never a thrown error. A real
    ModelId becomes its routing ModelKey via modelRegistry's key field. */
export function overrideFromSelection(selection: ModelSelection): ModelKey | null {
  if (selection === "auto" || !isModelId(selection)) return null;
  switch (selection) {
    case "claude-haiku-4-5": return "haiku";
    case "claude-sonnet-5": return "sonnet";
    case "claude-opus-4-8": return "opus";
    default: return null;
  }
}
