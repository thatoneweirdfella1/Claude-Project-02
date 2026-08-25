import type { LearningAuditEntry, SignalLearningAuditEntry } from "../../stores/types";
import { computeAccuracyScore, computeSignalWeight } from "../learningEngine";

function isSignal(entry: LearningAuditEntry): entry is SignalLearningAuditEntry {
  return entry.kind === "signal";
}

export function generateLearningReport(entries: LearningAuditEntry[], limit = 100) {
  const signals = entries.filter(isSignal).slice(-Math.max(0, limit));
  return {
    total: signals.length,
    accuracyScore: computeAccuracyScore(signals),
    hierarchyCounts: {
      primary: signals.filter((entry) => entry.hierarchy === "primary").length,
      secondary: signals.filter((entry) => entry.hierarchy === "secondary").length,
      tertiary: signals.filter((entry) => entry.hierarchy === "tertiary").length,
    },
    signals,
  };
}

export function validateSignalWeights(entries: LearningAuditEntry[]) {
  return entries.filter(isSignal).map((entry) => ({
    id: entry.id,
    signalType: entry.signalType,
    hierarchy: entry.hierarchy,
    expectedWeight: computeSignalWeight(entry.signalType),
    valid:
      (entry.hierarchy === "primary" && computeSignalWeight(entry.signalType) === 1) ||
      (entry.hierarchy === "secondary" && computeSignalWeight(entry.signalType) === 0.85) ||
      (entry.hierarchy === "tertiary" && computeSignalWeight(entry.signalType) === 0.7),
  }));
}
