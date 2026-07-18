/* Download and Export shapes (Step 8.5) — CANON Feature 10: "Download modal:
   pick content (answer text, confidence, rating, transparency, state pills)
   and format (Markdown default, HTML, JSON, PDF), then download or copy to
   clipboard." */

import type { ConfidenceBreakdown } from "../telemetry";
import type { StatePills } from "../../stores/types";

/** Which content the user checked in the modal — CANON's five options,
    named exactly. */
export interface ExportContentSelection {
  answerText: boolean;
  confidence: boolean;
  rating: boolean;
  transparency: boolean;
  statePills: boolean;
}

export const EXPORT_FORMATS = ["markdown", "html", "json", "pdf"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

/** CANON: "Markdown default." */
export const DEFAULT_EXPORT_FORMAT: ExportFormat = "markdown";

/** The Transparency card's own three sub-cards (Step 8.2), flattened into
    plain exportable fields rather than re-exporting TelemetryEntry wholesale
    — an export is a snapshot for the user, not an internal record. */
export interface ExportTransparencyData {
  model: string | null;
  complexity: number | null;
  domain: string | null;
  scope: string | null;
  thinkingApplied: boolean | null;
  routingNotes: string[];
  /** Technique labels (not raw ids), same as TechniquesSubCard shows. */
  techniques: string[];
  techniqueReasoning: string | null;
  confidence: ConfidenceBreakdown;
}

export interface ExportData {
  answerText?: string;
  confidence?: { value: number; downgraded: boolean; notes: string[] };
  rating?: { stars?: number; comment?: string };
  transparency?: ExportTransparencyData;
  statePills?: StatePills;
}
