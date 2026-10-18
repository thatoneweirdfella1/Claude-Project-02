import { TEAM_MINIMUM, type TeamMember, type TeamResult } from "./runTeam";

export interface TeamSource {
  provider: TeamMember["provider"];
  label: string;
  model: TeamMember["model"];
  round: 1 | 2;
  passageIndex: number;
  text: string;
}
export interface TeamMerge {
  status: "ready" | "refused";
  members: TeamMember[];
  answeringCount: number;
  comparisonRule: string;
  agreements: { text: string; sources: TeamSource[] }[];
  disagreements: TeamSource[];
  changes: { provider: TeamMember["provider"]; label: string; before: string; after: string }[];
  unrevised: TeamMember[];
  message?: string;
}
export const TEAM_COMPARISON_RULE = "Agreement here means identical paragraphs after whitespace normalization, shared by every answering member. Meaning is not compared; differently worded claims could not be compared automatically. Read their exact words below.";
const normalized = (text: string) => text.trim().replace(/\s+/g, " ");

/** No model, ranking, paraphrase, confidence score or winner. Every output
 * passage points back to a real member, round and paragraph position. */
export function mergeTeam(result: TeamResult): TeamMerge {
  const answered = result.members.filter((m) => m.status === "answered" && m.roundOne?.trim());
  const merged: TeamMerge = { status: "refused", members: result.members, answeringCount: answered.length,
    comparisonRule: TEAM_COMPARISON_RULE, agreements: [], disagreements: [], changes: [], unrevised: [], message: result.message ?? TEAM_MINIMUM };
  if (result.status !== "ready" || answered.length < 2) return merged;
  const passages = answered.map((member) => {
    const round: 1 | 2 = member.revision === "revised" && member.roundTwo?.trim() ? 2 : 1;
    const text = round === 2 ? member.roundTwo! : member.roundOne!;
    return text.split(/\n\s*\n/).map((text, passageIndex): TeamSource => ({
      provider: member.provider, model: member.model, label: member.label, round, passageIndex, text: text.trim(),
    })).filter((s) => s.text.length > 0);
  });
  const common = new Set(passages[0].map((s) => normalized(s.text)).filter((key) =>
    passages.every((sources) => sources.some((s) => normalized(s.text) === key))));
  for (const key of common) {
    const sources = passages.map((items) => items.find((s) => normalized(s.text) === key)!);
    merged.agreements.push({ text: sources[0].text, sources });
  }
  merged.disagreements = passages.flat().filter((s) => !common.has(normalized(s.text)));
  merged.changes = answered.flatMap((m) => m.revision === "revised" && m.roundTwo && normalized(m.roundOne!) !== normalized(m.roundTwo)
    ? [{ provider: m.provider, label: m.label, before: m.roundOne!, after: m.roundTwo }] : []);
  merged.unrevised = answered.filter((m) => m.revision !== "revised" || !m.roundTwo?.trim());
  merged.status = "ready";
  delete merged.message;
  return merged;
}
