import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildTranslateAskRequest } from "../composer";
import { buildAiReadyRequest, compileMeaningPacket } from "../providerNeutral";
import { composeFinalPrompt } from "../composition";
import { getTechnique } from "../techniques";
import type { LearnedPreferences, TechniqueId } from "../../stores/types";

beforeEach(() => vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Unexpected network access"); })));
afterEach(() => vi.unstubAllGlobals());

function preferences(weights: Record<string, number>): LearnedPreferences {
  return { routing: {}, technique: Object.fromEntries(Object.entries(weights).map(([id, weight]) =>
    [id, { weight, lastAdjustedAt: 1, totalAdjustments: 1 }])) };
}

const settings = { model: "auto" as const, directness: 2 as const, techniques: ["auto-detect" as const] };

describe("learned technique weights in produced requests", () => {
  it("adds a positively weighted technique to both the handoff and composed prompt", () => {
    const baseline = buildTranslateAskRequest("neutral", settings, []);
    const learned = buildTranslateAskRequest("neutral", settings, [], preferences({ metaphor: 5 }));
    const before = compileMeaningPacket(baseline);
    const after = compileMeaningPacket(learned);
    expect(before.techniques).not.toContain("metaphor");
    expect(after.techniques).toContain("metaphor");
    expect(buildAiReadyRequest(after)).toContain("metaphor");
    const composed = composeFinalPrompt({ question: after.original, techniques: after.techniques as TechniqueId[] });
    expect(composed.prompt).toContain(getTechnique("metaphor").promptFragment);
    expect(learned.techniqueLearning?.note).toContain("metaphor +5");
    expect(learned.techniqueLearning?.note).toContain("+1.25");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("removes a negatively weighted automatic technique that the same request otherwise selects", () => {
    const baseline = buildTranslateAskRequest("example", settings, []);
    const learned = buildTranslateAskRequest("example", settings, [], preferences({ socratic: -5 }));
    expect(compileMeaningPacket(baseline).techniques).toContain("socratic");
    expect(compileMeaningPacket(learned).techniques).not.toContain("socratic");
    expect(learned.techniqueLearning?.note).toContain("socratic -5");
  });

  it("leaves an explicit user selection and every other setting untouched", () => {
    const manual = { ...settings, techniques: ["detailed", "verify"] as TechniqueId[] };
    const baseline = buildTranslateAskRequest("neutral", manual, []);
    const learned = buildTranslateAskRequest("neutral", manual, [], preferences({ detailed: -5, simplify: 5, verify: -5 }));
    expect(learned).toEqual(baseline);
    expect(learned.techniques).toBe(manual.techniques);
    expect(JSON.stringify(learned)).toBe(JSON.stringify(baseline));
  });

  it("produces byte-for-byte identical requests and handoff text for all-zero weights", () => {
    const baseline = buildTranslateAskRequest("neutral", settings, []);
    const learned = buildTranslateAskRequest("neutral", settings, [], preferences({ metaphor: 0, simplify: 0, socratic: 0 }));
    expect(JSON.stringify(learned)).toBe(JSON.stringify(baseline));
    expect(buildAiReadyRequest(compileMeaningPacket(learned))).toBe(buildAiReadyRequest(compileMeaningPacket(baseline)));
  });

  it("clamps weights, ignores invalid entries, and keeps Auto pins", () => {
    const pinned = { ...settings, techniques: ["auto-detect", "examples"] as TechniqueId[] };
    const learned = buildTranslateAskRequest("neutral", pinned, [], preferences({ metaphor: 500, examples: -500, invalid: 5, detailed: Number.NaN }));
    expect(learned.techniques).toContain("examples");
    expect(learned.techniqueLearning?.weights).toEqual({ metaphor: 5 });
    expect(learned.techniques.length).toBeLessThanOrEqual(4);
    expect(pinned.techniques).toEqual(["auto-detect", "examples"]);
  });
});
