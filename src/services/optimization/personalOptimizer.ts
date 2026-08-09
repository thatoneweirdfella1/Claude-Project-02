import type {
  LearnedPreferences,
  OptimizationChange,
  OptimizationEvidenceRef,
  OptimizationGoalId,
  OptimizationRun,
  SessionRecord,
  TechniqueId,
} from "../../stores/types";

interface GoalRule {
  signal: string;
  patterns: RegExp[];
  adjustments: Array<{ technique: TechniqueId; direction: 1 | -1; reason: string }>;
}

const GOAL_RULES: Record<OptimizationGoalId, GoalRule> = {
  "reduce-overwhelm": {
    signal: "overwhelm",
    patterns: [/\boverwhelm/i, /too much/i, /can(?:not|'t) process/i, /one thing at a time/i, /simplif/i],
    adjustments: [
      { technique: "simplify", direction: 1, reason: "Prioritize lower cognitive load." },
      { technique: "step-by-step", direction: 1, reason: "Break work into visible next actions." },
      { technique: "detailed", direction: -1, reason: "Avoid adding detail when overload signals appear." },
    ],
  },
  "recover-frustration": {
    signal: "frustration",
    patterns: [/\bfrustrat/i, /not listening/i, /already (?:said|told)/i, /this is wrong/i, /stop doing/i, /annoy/i],
    adjustments: [
      { technique: "quote-first", direction: 1, reason: "Reflect the user's exact concern before solving." },
      { technique: "verify", direction: 1, reason: "Confirm the correction before continuing." },
    ],
  },
  "increase-clarity": {
    signal: "clarity gap",
    patterns: [/\bconfus/i, /unclear/i, /what do you mean/i, /do(?: not|n't) understand/i, /explain that/i],
    adjustments: [
      { technique: "simplify", direction: 1, reason: "Use plainer language when clarity breaks down." },
      { technique: "examples", direction: 1, reason: "Ground abstract explanations in examples." },
    ],
  },
  "right-size-detail": {
    signal: "detail mismatch",
    patterns: [/too long/i, /wall of text/i, /too much (?:text|detail)/i, /shorter/i, /more detail/i, /too brief/i],
    adjustments: [
      { technique: "detailed", direction: -1, reason: "Reduce default verbosity after repeated detail mismatches." },
    ],
  },
  "support-completion": {
    signal: "task completion",
    patterns: [/\bstuck\b/i, /gave up/i, /can(?:not|'t) finish/i, /did(?: not|n't) finish/i, /finally (?:done|worked)/i, /completed/i],
    adjustments: [
      { technique: "step-by-step", direction: 1, reason: "Make the next action easier to resume and complete." },
      { technique: "examples", direction: 1, reason: "Show a concrete finished form." },
    ],
  },
};

function clonePreferences(value: LearnedPreferences): LearnedPreferences {
  return {
    routing: { ...value.routing },
    technique: Object.fromEntries(
      Object.entries(value.technique).map(([key, preference]) => [key, { ...preference }]),
    ),
  };
}

function collectEvidence(
  sessions: SessionRecord[],
  goal: OptimizationGoalId,
): OptimizationEvidenceRef[] {
  const rule = GOAL_RULES[goal];
  const found: OptimizationEvidenceRef[] = [];
  for (const session of sessions) {
    for (const message of session.conversation) {
      if (message.role !== "user") continue;
      if (!rule.patterns.some((pattern) => pattern.test(message.content))) continue;
      found.push({
        sessionId: session.id,
        messageId: message.id,
        timestamp: message.timestamp,
        excerpt: message.content.replace(/\s+/g, " ").trim().slice(0, 180),
        signal: rule.signal,
      });
    }
  }
  return found;
}

export interface PersonalOptimizationInput {
  sessions: SessionRecord[];
  goals: OptimizationGoalId[];
  currentPreferences: LearnedPreferences;
  minimumEvidence?: number;
  apply?: boolean;
  now?: number;
}

export function runPersonalOptimization(input: PersonalOptimizationInput): OptimizationRun {
  const beforePreferences = clonePreferences(input.currentPreferences);
  const afterPreferences = clonePreferences(input.currentPreferences);
  const minimumEvidence = Math.max(1, input.minimumEvidence ?? 3);
  const evidence: OptimizationEvidenceRef[] = [];
  const changes: OptimizationChange[] = [];
  const now = input.now ?? Date.now();

  for (const goal of [...new Set(input.goals)]) {
    const goalEvidence = collectEvidence(input.sessions, goal);
    evidence.push(...goalEvidence);
    if (goalEvidence.length < minimumEvidence) continue;

    for (const adjustment of GOAL_RULES[goal].adjustments) {
      const current = afterPreferences.technique[adjustment.technique] ?? {
        weight: 0,
        lastAdjustedAt: 0,
        totalAdjustments: 0,
      };
      const nextWeight = Math.max(-5, Math.min(5, current.weight + adjustment.direction));
      if (nextWeight === current.weight) continue;
      afterPreferences.technique[adjustment.technique] = {
        weight: nextWeight,
        lastAdjustedAt: now,
        totalAdjustments: current.totalAdjustments + 1,
      };
      changes.push({
        target: adjustment.technique,
        before: String(current.weight),
        after: String(nextWeight),
        reason: adjustment.reason,
        confidence: Math.min(0.95, 0.6 + goalEvidence.length * 0.05),
        evidenceCount: goalEvidence.length,
      });
    }
  }

  const applied = Boolean(input.apply) && changes.length > 0;
  return {
    id: `optimization-${now}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp: now,
    goals: [...new Set(input.goals)],
    status: applied ? "applied" : "preview",
    scannedSessions: input.sessions.length,
    evidence,
    changes,
    beforePreferences,
    afterPreferences,
    summary:
      changes.length === 0
        ? `No changes met the ${minimumEvidence}-example evidence threshold.`
        : `${applied ? "Applied" : "Proposed"} ${changes.length} evidence-backed preference change${changes.length === 1 ? "" : "s"}.`,
  };
}
