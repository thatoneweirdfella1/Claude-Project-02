import type {
  LearnedPreferences,
  ModelSelection,
  SignalHierarchy,
  SignalLearningAuditEntry,
  SignalOutcome,
  SignalType,
  TechniqueId,
} from "../stores/types";

export interface SignalContext {
  sessionId: string;
  messageId?: string;
  modelUsed?: ModelSelection;
  techniquesUsed?: TechniqueId[];
}

const WEIGHTS: Record<SignalHierarchy, 1 | 0.85 | 0.7> = {
  primary: 1,
  secondary: 0.85,
  tertiary: 0.7,
};

export function computeSignalWeight(signalType: SignalType): 1 | 0.85 | 0.7 {
  return WEIGHTS[hierarchyForSignal(signalType)];
}

export function hierarchyForSignal(signalType: SignalType): SignalHierarchy {
  if (signalType === "rating" || signalType === "comment") return "primary";
  if (["usage_time", "edit_distance", "model_switch", "technique_switch"].includes(signalType)) return "secondary";
  return "tertiary";
}

export function createSignal(
  context: SignalContext,
  signalType: SignalType,
  signalValue: number | string | boolean,
  outcome: SignalOutcome = "unknown",
  verified = false,
  timestamp = Date.now(),
): SignalLearningAuditEntry {
  const hierarchy = hierarchyForSignal(signalType);
  return {
    id: `signal-${signalType}-${timestamp}-${context.messageId ?? context.sessionId}`,
    timestamp,
    kind: "signal",
    sessionId: context.sessionId,
    messageId: context.messageId ?? "",
    signalType,
    signalValue,
    signalConfidence: hierarchy === "primary" ? 0.9 : hierarchy === "secondary" ? 0.7 : 0.3,
    hierarchy,
    modelUsed: context.modelUsed ?? "auto",
    techniquesUsed: context.techniquesUsed ?? [],
    outcome,
    verified,
  };
}

export function recordSecondarySignals(
  context: SignalContext,
  metrics: {
    timeDelta?: number;
    editDistance?: number;
    modelSwitched?: boolean;
    techniqueSwitched?: boolean;
  },
): SignalLearningAuditEntry[] {
  const entries: SignalLearningAuditEntry[] = [];
  if (metrics.timeDelta !== undefined) entries.push(createSignal(context, "usage_time", metrics.timeDelta));
  if (metrics.editDistance !== undefined) entries.push(createSignal(context, "edit_distance", metrics.editDistance));
  if (metrics.modelSwitched !== undefined) entries.push(createSignal(context, "model_switch", metrics.modelSwitched, metrics.modelSwitched ? "negative" : "neutral"));
  if (metrics.techniqueSwitched !== undefined) entries.push(createSignal(context, "technique_switch", metrics.techniqueSwitched, metrics.techniqueSwitched ? "negative" : "neutral"));
  return entries;
}

export function recordTertiarySignals(
  context: SignalContext,
  metrics: {
    sessionClosed?: boolean;
    downloaded?: boolean;
    searches?: number;
    topicReturned?: boolean;
  },
): SignalLearningAuditEntry[] {
  const entries: SignalLearningAuditEntry[] = [];
  if (metrics.sessionClosed !== undefined) entries.push(createSignal(context, "session_close", metrics.sessionClosed, "neutral"));
  if (metrics.downloaded !== undefined) entries.push(createSignal(context, "download", metrics.downloaded, metrics.downloaded ? "positive" : "neutral"));
  if (metrics.searches !== undefined) entries.push(createSignal(context, "search_query", metrics.searches, metrics.searches > 0 ? "negative" : "neutral"));
  if (metrics.topicReturned !== undefined) entries.push(createSignal(context, "topic_return", metrics.topicReturned, metrics.topicReturned ? "negative" : "neutral"));
  return entries;
}

/** Confidence reflects the noisiest hierarchy consulted: 1.0, 0.85, 0.70, or 0.50 with no evidence. */
export function computeAccuracyScore(signals: SignalLearningAuditEntry[]): number {
  if (signals.length === 0) return 0.5;
  const used = new Set(signals.map((signal) => signal.hierarchy));
  if (used.has("tertiary")) return 0.7;
  if (used.has("secondary")) return 0.85;
  return 1;
}

/** Apply only after five signals, and only make small bounded technique changes. */
export function applySignalLearning(
  current: LearnedPreferences,
  signals: SignalLearningAuditEntry[],
): LearnedPreferences {
  if (signals.length < 5) return current;
  const now = Date.now();
  const technique = { ...current.technique };
  const totals = new Map<TechniqueId, number>();
  for (const signal of signals) {
    const direction = signal.outcome === "positive" ? 1 : signal.outcome === "negative" ? -1 : 0;
    for (const id of signal.techniquesUsed) totals.set(id, (totals.get(id) ?? 0) + direction * computeSignalWeight(signal.signalType));
  }
  for (const [id, total] of totals) {
    if (Math.abs(total) < 2) continue;
    const previous = technique[id];
    technique[id] = {
      weight: Math.max(-5, Math.min(5, (previous?.weight ?? 0) + (total > 0 ? 1 : -1))),
      lastAdjustedAt: now,
      totalAdjustments: (previous?.totalAdjustments ?? 0) + 1,
    };
  }
  return { routing: current.routing, technique };
}

export function recommendModelAndTechniques(
  _question: string,
  learned: LearnedPreferences,
  candidates: TechniqueId[] = ["socratic", "simplify", "detailed", "verify"],
): { model: ModelSelection; techniques: TechniqueId[]; confidence: number } {
  const techniques = [...candidates]
    .sort((a, b) => (learned.technique[b]?.weight ?? 0) - (learned.technique[a]?.weight ?? 0))
    .slice(0, 4);
  return { model: "auto", techniques, confidence: Object.keys(learned.technique).length > 0 ? 0.85 : 0.5 };
}
