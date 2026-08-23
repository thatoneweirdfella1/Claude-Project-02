import {
  ROUTABLE_MODEL_IDS,
  getModel,
  type RoutableModelId,
} from "../../services/modelRegistry";
import type { DropdownOption } from "../primitives";

/* Model dropdown option list (Step 3.2), matching the V3 screenshot's label
   style: "{label} — {descriptor}" (the screenshot shows "Opus 4.8 — smartest"
   selected). Only Opus's descriptor is screenshot-confirmed; Haiku's/Sonnet's
   are inferred to match ROUTING.md's own tier names (Fast/Balanced/Deep)
   phrased as adjectives, not read off the image — flag for a future
   pixel-level screenshot check, same caveat as Step 1.2's eyeballed colors. */
export const MODEL_DESCRIPTORS: Record<RoutableModelId, string> = {
  "claude-haiku-4-5": "fastest",
  "claude-sonnet-5": "balanced",
  "claude-opus-4-8": "smartest", // screenshot-confirmed
};

/** "Auto" (SessionState.model's default — CANON: free tier auto-routes) plus
    the three models, in registry/tier order. Opus is marked as Pro since it's
    a paid-tier model (CANON ROUTING.md). */
export const MODEL_DROPDOWN_OPTIONS: DropdownOption[] = [
  { value: "auto", label: "Auto-select optimal" },
  ...ROUTABLE_MODEL_IDS.map((id) => {
    const model = getModel(id);
    const isPro = model.plan === "paid";
    return {
      value: id,
      label: `${model.label} — ${MODEL_DESCRIPTORS[id]}${isPro ? " (Pro)" : ""}`,
    };
  }),
];
