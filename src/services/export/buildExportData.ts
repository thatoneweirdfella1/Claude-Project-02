/* Assembles ExportData from one assistant message + whichever content boxes
   the user checked (Step 8.5). Pure — no DOM, no store reads (the caller
   passes in the message and, when available, the TelemetryEntry its
   `telemetryId` resolves to via services/telemetry's log). Never fabricates
   a section the underlying data doesn't have, even if checked: a message
   with no ratingStars yields no `rating` key regardless of selection.rating,
   same "don't invent what isn't there" posture as everywhere else. */

import { getTechnique } from "../techniques";
import { deriveConfidenceBreakdown, type TelemetryEntry } from "../telemetry";
import type { ConversationMessage } from "../../stores/types";
import type { ExportContentSelection, ExportData } from "./types";

export function buildExportData(
  message: ConversationMessage,
  selection: ExportContentSelection,
  telemetryEntry: TelemetryEntry | null,
): ExportData {
  const data: ExportData = {};

  if (selection.answerText) {
    data.answerText = message.content;
  }

  if (selection.confidence && typeof message.confidence === "number") {
    data.confidence = {
      value: message.confidence,
      downgraded: message.downgraded ?? false,
      notes: message.notes ?? [],
    };
  }

  if (selection.rating && message.ratingStars !== undefined) {
    data.rating = { stars: message.ratingStars, comment: message.ratingComment };
  }

  if (selection.transparency && telemetryEntry) {
    data.transparency = {
      model: telemetryEntry.model,
      complexity: telemetryEntry.complexity,
      domain: telemetryEntry.domain,
      scope: telemetryEntry.scope,
      thinkingApplied: telemetryEntry.thinkingApplied,
      routingNotes: telemetryEntry.notes,
      techniques: (telemetryEntry.techniques ?? []).map((id) => getTechnique(id).label),
      techniqueReasoning: telemetryEntry.techniqueReasoning,
      confidence: deriveConfidenceBreakdown(telemetryEntry),
    };
  }

  if (selection.statePills && message.statePills) {
    data.statePills = message.statePills;
  }

  return data;
}
