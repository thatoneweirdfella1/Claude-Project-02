import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MODEL_REGISTRY, type ModelId } from "../modelRegistry";
import type { TeamMember, TeamResult } from "./runTeam";
import { mergeTeam } from "./merge";

beforeEach(() => {
  for (const name of ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY", "XAI_API_KEY", "DEEPSEEK_API_KEY", "GROQ_API_KEY", "OPENROUTER_API_KEY", "HF_TOKEN", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "NVIDIA_API_KEY"]) vi.stubEnv(name, "");
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Unexpected network"); }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
const ids: ModelId[] = ["llama-3.3-70b-versatile", "gemini-flash", "@cf/meta/llama-3.1-8b-instruct"];
function member(index: number, text: string, before = text): TeamMember {
  const model = MODEL_REGISTRY[ids[index]];
  return { model: model.id, provider: model.provider, label: model.label, status: "answered", roundOne: before, roundTwo: text, revision: "revised" };
}
const ready = (members: TeamMember[]): TeamResult => ({ status: "ready", members });

describe("S3 traceable offline merge", () => {
  it("names all three members as sources of the shared agreement", () => {
    const members = ids.map((_, i) => member(i, "SYNTHETIC_SHARED"));
    const merged = mergeTeam(ready(members));
    expect(merged.agreements).toHaveLength(1);
    expect(merged.agreements[0].sources.map((s) => s.label)).toEqual(members.map((m) => m.label));
    expect(merged.agreements[0].text).toBe("SYNTHETIC_SHARED");
  });

  it("shows both contradictory claims verbatim without choosing a winner", () => {
    const claims = ["Mock claim: adopt option A.", "Mock claim: do not adopt option A."];
    const merged = mergeTeam(ready(claims.map((text, i) => member(i, text))));
    expect(merged.agreements).toEqual([]);
    expect(merged.disagreements.map((s) => s.text)).toEqual(claims);
    expect(merged.disagreements.map((s) => s.provider)).toEqual(["groq", "google"]);
  });

  it("shows original and revised text for a changed answer", () => {
    const merged = mergeTeam(ready([member(0, "SECOND_A", "FIRST_A"), member(1, "SECOND_B")]));
    expect(merged.changes).toEqual([{ provider: "groq", label: MODEL_REGISTRY[ids[0]].label, before: "FIRST_A", after: "SECOND_A" }]);
  });

  it("names unreachable members and excludes them from agreement attribution and count", () => {
    const failed: TeamMember = { ...member(2, ""), status: "unreachable", roundOne: undefined, roundTwo: undefined, revision: undefined };
    const merged = mergeTeam(ready([member(0, "SYNTHETIC_SHARED"), member(1, "SYNTHETIC_SHARED"), failed]));
    expect(merged.members[2]).toMatchObject({ label: failed.label, status: "unreachable" });
    expect(merged.answeringCount).toBe(2);
    expect(merged.agreements[0].sources.map((s) => s.provider)).toEqual(["groq", "google"]);
  });

  it("labels unverified differences honestly instead of inferring semantic agreement", () => {
    const merged = mergeTeam(ready([member(0, "Mock claim: use A."), member(1, "Mock claim: choose A.")]));
    expect(merged.agreements).toHaveLength(0);
    expect(merged.disagreements).toHaveLength(2);
    expect(merged.comparisonRule).toContain("Meaning is not compared");
  });

  it("compares whitespace only, preserves negation and traces every passage to its round and position", () => {
    const merged = mergeTeam(ready([member(0, "SHARED\n WRAPPING\n\nADOPT"), member(1, "SHARED WRAPPING\n\nDO NOT ADOPT")]));
    expect(merged.agreements.map((a) => a.text)).toEqual(["SHARED\n WRAPPING"]);
    expect(merged.disagreements.map((s) => [s.text, s.round, s.passageIndex])).toEqual([["ADOPT", 2, 1], ["DO NOT ADOPT", 2, 1]]);
  });

  it("uses a failed revision's preserved first answer and marks it unrevised", () => {
    const unrevised = { ...member(1, ""), roundOne: "FIRST_B", roundTwo: undefined, revision: "unrevised" as const };
    const merged = mergeTeam(ready([member(0, "SECOND_A"), unrevised]));
    expect(merged.disagreements[1]).toMatchObject({ text: "FIRST_B", round: 1 });
    expect(merged.unrevised.map((m) => m.provider)).toEqual(["google"]);
    expect(merged.changes).toHaveLength(0);
  });

  it("does not merge a refused or one-member result", () => {
    expect(mergeTeam({ status: "refused", members: [], message: "SYNTHETIC_REFUSAL" }).status).toBe("refused");
    expect(mergeTeam(ready([member(0, "SYNTHETIC_SHARED")])).status).toBe("refused");
  });
});
