import { freePoolCandidates, isFreePoolModel } from "../providerPool";
import type { ModelId, ModelInfo, Provider } from "../modelRegistry";
import { MODEL_REGISTRY } from "../modelRegistry";
import { independentInput, revisionInput } from "./prompt";

export interface TeamMember {
  model: ModelId;
  provider: Provider;
  label: string;
  status: "answered" | "unreachable";
  roundOne?: string;
  roundTwo?: string;
  revision?: "revised" | "unrevised";
}
export interface TeamResult {
  status: "ready" | "refused";
  members: TeamMember[];
  message?: string;
}
export interface TeamOptions {
  configured: (provider: Provider) => boolean;
  execute: (model: ModelInfo, input: string, signal?: AbortSignal) => Promise<string>;
  models?: readonly unknown[];
  budgets?: readonly unknown[];
  signal?: AbortSignal;
}
export const TEAM_MINIMUM = "Team mode needs at least two reachable free providers with keys and available allowance.";

/** One model per provider; the pool owns every eligibility decision. */
export function teamMembers(options: Pick<TeamOptions, "configured" | "models" | "budgets">): ModelInfo[] {
  const seen = new Set<Provider>();
  return freePoolCandidates(options).filter((model) => {
    if (seen.has(model.provider)) return false;
    seen.add(model.provider);
    return true;
  });
}

export async function runTeam(question: string, options: TeamOptions): Promise<TeamResult> {
  const members: TeamMember[] = [];
  const refused = (message = TEAM_MINIMUM): TeamResult => ({ status: "refused", members, message });
  if (!question.trim()) return refused("Enter a question before running a team.");
  const candidates = teamMembers(options);
  if (candidates.length < 2) return refused();
  let cursor = 0;
  while (cursor < candidates.length && members.filter((m) => m.status === "answered").length < 3 && !options.signal?.aborted) {
    const needed = 3 - members.filter((m) => m.status === "answered").length;
    const batch = candidates.slice(cursor, cursor + needed);
    cursor += batch.length;
    members.push(...await Promise.all(batch.map(async (model): Promise<TeamMember> => {
      const member = { model: model.id, provider: model.provider, label: model.label };
      try {
        // Repeat the registry boundary at dispatch, not a caller-supplied plan.
        if (!isFreePoolModel(model.id) || options.signal?.aborted) throw new Error("Unavailable");
        const text = await options.execute(model, independentInput(question), options.signal);
        if (!text.trim() || options.signal?.aborted) throw new Error("Unavailable");
        return { ...member, status: "answered", roundOne: text };
      } catch {
        return { ...member, status: "unreachable" };
      }
    })));
  }
  if (options.signal?.aborted) return refused("Team mode was cancelled.");
  if (members.filter((m) => m.status === "answered").length < 2) return refused();
  const answered = members.filter((m) => m.status === "answered");
  // A single barrier after round one; exactly one revision per answering
  // member. No retry, convergence loop or third round.
  await Promise.all(answered.map(async (member, index) => {
    try {
      if (!isFreePoolModel(member.model) || options.signal?.aborted) throw new Error("Unavailable");
      const text = await options.execute(MODEL_REGISTRY[member.model], revisionInput(question, answered, index), options.signal);
      if (!text.trim() || options.signal?.aborted) throw new Error("Unavailable");
      member.roundTwo = text;
      member.revision = "revised";
    } catch {
      // Preserve the original verbatim. Never turn provider errors into text.
      member.revision = "unrevised";
    }
  }));
  if (options.signal?.aborted) return refused("Team mode was cancelled.");
  return { status: "ready", members };
}
