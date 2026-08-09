import { authorizeEstimatedCost } from "../creditAuthorization";
import { addTokenUsage, getEstimatedCostForCall } from "../costTracking";
import { createProxyClient, type ProxyCompletionRequest } from "../proxyClient";
import type { LearnedPreferences, OptimizationChange, OptimizationRun } from "../../stores/types";
import { runPersonalOptimization, type PersonalOptimizationInput } from "./personalOptimizer";

const MODEL = "claude-haiku-4-5";
const client = createProxyClient();

export interface PersonalOptimizationRunnerDeps {
  complete?: (request: ProxyCompletionRequest) => Promise<string>;
  authorize?: (amount: number, label: string) => Promise<{ authorized: boolean }>;
}

interface AiDecision {
  target?: unknown;
  accept?: unknown;
  confidence?: unknown;
  reason?: unknown;
}

function parseJson(text: string): { decisions?: AiDecision[] } {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(cleaned) as { decisions?: AiDecision[] };
}

function promptFor(run: OptimizationRun, minimumEvidence: number): string {
  const compactEvidence = run.evidence.slice(0, 80).map((item) => ({
    messageId: item.messageId,
    sessionId: item.sessionId,
    signal: item.signal,
    excerpt: item.excerpt,
  }));
  const candidates = run.changes.map((change) => ({
    target: change.target,
    proposedChange: `${change.before} -> ${change.after}`,
    evidenceCount: change.evidenceCount,
    reason: change.reason,
  }));
  return JSON.stringify({
    job: "Validate evidence-backed personal response optimizations",
    goals: run.goals,
    minimumEvidence,
    candidates,
    evidence: compactEvidence,
    rules: [
      "Judge only the requested goals and supplied evidence.",
      "Reject generic ADHD assumptions or adjacent topics.",
      "Accept only when at least minimumEvidence distinct examples support the exact target.",
      "Do not invent evidence, targets, or user preferences.",
      "Return JSON only: {\"decisions\":[{\"target\":string,\"accept\":boolean,\"confidence\":0..1,\"reason\":string}]}",
    ],
  });
}

function applyValidatedChanges(
  before: LearnedPreferences,
  changes: OptimizationChange[],
  timestamp: number,
): LearnedPreferences {
  const after: LearnedPreferences = {
    routing: { ...before.routing },
    technique: Object.fromEntries(Object.entries(before.technique).map(([key, value]) => [key, { ...value }])),
  };
  for (const change of changes) {
    const previous = after.technique[change.target] ?? { weight: 0, lastAdjustedAt: 0, totalAdjustments: 0 };
    after.technique[change.target] = {
      weight: Number(change.after),
      lastAdjustedAt: timestamp,
      totalAdjustments: previous.totalAdjustments + 1,
    };
  }
  return after;
}

/** Script-prefiltered, Haiku-validated runner. Only short candidate excerpts
    reach the model; whole conversations never do, keeping the active goal and
    token bill bounded across large histories. */
export async function runPersonalOptimizationWithAi(
  input: PersonalOptimizationInput,
  deps: PersonalOptimizationRunnerDeps = {},
): Promise<OptimizationRun | null> {
  const minimumEvidence = Math.max(1, input.minimumEvidence ?? 3);
  const base = runPersonalOptimization({ ...input, apply: false });
  if (base.changes.length === 0) return base;

  const prompt = promptFor(base, minimumEvidence);
  const estimate = getEstimatedCostForCall({
    model: MODEL,
    inputTokens: Math.ceil(prompt.length / 4) + 300,
    maxOutputTokens: 900,
  });
  const authorize = deps.authorize ?? authorizeEstimatedCost;
  const authorization = await authorize(estimate, "Validate personal optimization evidence");
  if (!authorization.authorized) return null;

  try {
    const complete = deps.complete ?? ((request) => client.complete(request));
    const response = await complete({
      model: MODEL,
      system: "You are a strict evidence validator. Preserve the requested objective and return only the required JSON.",
      input: prompt,
      onUsage: (usage) => addTokenUsage(usage.inputTokens, usage.outputTokens, MODEL),
    });
    const parsed = parseJson(response);
    const decisions = Array.isArray(parsed.decisions) ? parsed.decisions : [];
    const accepted = base.changes.flatMap((change) => {
      const decision = decisions.find((item) => item.target === change.target);
      if (!decision || decision.accept !== true) return [];
      const rawConfidence = Number(decision.confidence);
      const confidence = Number.isFinite(rawConfidence)
        ? Math.max(0, Math.min(1, rawConfidence > 1 ? rawConfidence / 100 : rawConfidence))
        : change.confidence;
      return [{
        ...change,
        confidence,
        reason: typeof decision.reason === "string" && decision.reason.trim()
          ? decision.reason.trim().slice(0, 300)
          : change.reason,
      }];
    });
    const applied = Boolean(input.apply) && accepted.length > 0;
    return {
      ...base,
      status: applied ? "applied" : "preview",
      changes: accepted,
      afterPreferences: applyValidatedChanges(base.beforePreferences, accepted, base.timestamp),
      summary: accepted.length === 0
        ? "Haiku rejected every proposed change as insufficiently supported."
        : `${applied ? "Applied" : "Validated"} ${accepted.length} token-efficient, evidence-backed preference change${accepted.length === 1 ? "" : "s"}.`,
    };
  } catch (error) {
    return {
      ...base,
      status: "failed",
      changes: [],
      afterPreferences: base.beforePreferences,
      summary: `Validation failed without changing the profile: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
