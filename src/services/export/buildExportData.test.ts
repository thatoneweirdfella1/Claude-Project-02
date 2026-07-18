import { describe, expect, it } from "vitest";
import { buildExportData } from "./buildExportData";
import type { ExportContentSelection } from "./types";
import type { ConversationMessage } from "../../stores/types";
import type { TelemetryEntry } from "../telemetry";

const ALL_SELECTED: ExportContentSelection = {
  answerText: true,
  confidence: true,
  rating: true,
  transparency: true,
  statePills: true,
};

function message(overrides: Partial<ConversationMessage> = {}): ConversationMessage {
  return {
    id: "m1",
    role: "assistant",
    content: "The refined answer.",
    timestamp: 0,
    confidence: 92,
    downgraded: false,
    notes: [],
    ratingStars: 4,
    ratingComment: "Great!",
    statePills: { emotion: "calm", rsd: "low", interest: "high", cognitive: "analytical" },
    telemetryId: "tel-1",
    ...overrides,
  };
}

function telemetryEntry(overrides: Partial<TelemetryEntry> = {}): TelemetryEntry {
  return {
    id: "tel-1",
    startedAt: 0,
    finishedAt: 10,
    totalDurationMs: 10,
    stageDurationsMs: {},
    complexity: 6,
    effectiveComplexity: 6,
    domain: "code",
    model: "claude-sonnet-5",
    modelTier: "Balanced",
    downgraded: false,
    notes: [],
    scope: "medium",
    thinkingApplied: false,
    techniques: ["chain-of-thought"],
    techniqueReasoning: "Selected: Chain of Thought (technical depth).",
    techniqueMode: "auto-detect",
    techniqueSignalMatched: true,
    confidence: 92,
    translationTokens: null,
    executionTokens: null,
    outcome: "done",
    errorMessage: null,
    ...overrides,
  };
}

describe("buildExportData", () => {
  it("includes every section when everything is selected and available", () => {
    const data = buildExportData(message(), ALL_SELECTED, telemetryEntry());
    expect(data.answerText).toBe("The refined answer.");
    expect(data.confidence?.value).toBe(92);
    expect(data.rating?.stars).toBe(4);
    expect(data.transparency?.model).toBe("claude-sonnet-5");
    expect(data.transparency?.techniques).toEqual(["Chain of Thought"]);
    expect(data.statePills?.emotion).toBe("calm");
  });

  it("omits a section when it's unchecked, even if the data exists", () => {
    const selection: ExportContentSelection = { ...ALL_SELECTED, rating: false };
    const data = buildExportData(message(), selection, telemetryEntry());
    expect(data.rating).toBeUndefined();
    expect(data.answerText).toBeDefined(); // other sections unaffected
  });

  it("never fabricates a section the message doesn't have, even if checked", () => {
    const unrated = message({ ratingStars: undefined, ratingComment: undefined });
    const data = buildExportData(unrated, ALL_SELECTED, telemetryEntry());
    expect(data.rating).toBeUndefined();
  });

  it("omits transparency when no matching telemetry entry was found", () => {
    const data = buildExportData(message(), ALL_SELECTED, null);
    expect(data.transparency).toBeUndefined();
  });

  it("omits confidence when the message was never assigned one", () => {
    const noConfidence = message({ confidence: undefined });
    const data = buildExportData(noConfidence, ALL_SELECTED, telemetryEntry());
    expect(data.confidence).toBeUndefined();
  });
});
