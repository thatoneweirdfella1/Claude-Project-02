import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runTeam } from "./runTeam";
import type { ModelInfo, Provider } from "../modelRegistry";

const first: Partial<Record<Provider, string>> = { groq: "FIRST_A", google: "FIRST_B", cloudflare: "FIRST_C" };
const models = ["llama-3.3-70b-versatile", "gemini-flash", "@cf/meta/llama-3.1-8b-instruct"];
beforeEach(() => {
  for (const name of ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY", "XAI_API_KEY", "DEEPSEEK_API_KEY", "GROQ_API_KEY", "OPENROUTER_API_KEY", "HF_TOKEN", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "NVIDIA_API_KEY"]) vi.stubEnv(name, "");
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Unexpected network"); }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

function scenario(failing?: Provider) {
  const counts = new Map<Provider, number>();
  const calls: { provider: Provider; input: string; round: number }[] = [];
  const execute = vi.fn(async (model: ModelInfo, input: string) => {
    const provider = model.provider as Provider;
    const round = (counts.get(provider) ?? 0) + 1;
    counts.set(provider, round); calls.push({ provider, input, round });
    if (round === 2 && provider === failing) throw new Error("Unsafe upstream detail");
    return round === 1 ? first[provider]! : "SECOND_" + first[provider];
  });
  return { calls, execute, options: { configured: () => true, models, execute } };
}

describe("S2 independent answers then one anonymous revision", () => {
  it("puts peer round-one text and neutral labels in each revision, without vendor identities", async () => {
    const s = scenario();
    await runTeam("SYNTHETIC_QUESTION", s.options);
    const revisions = s.calls.filter((c) => c.round === 2);
    expect(revisions).toHaveLength(3);
    for (const call of revisions) {
      const data = JSON.parse(call.input.split("Inputs (JSON data):\n")[1]);
      expect(data.peers).toHaveLength(2);
      expect(data.peers.map((p: { text: string }) => p.text).sort()).toEqual(Object.entries(first).filter(([p]) => p !== call.provider).map(([, text]) => text).sort());
      expect(data.peers.every((p: { label: string }) => /^Answer [ABC]$/.test(p.label))).toBe(true);
      expect(call.input.toLowerCase()).not.toContain(call.provider);
      expect(call.input).toContain("where you still disagree and why");
    }
  });

  it("retains three first answers and three revisions, with exactly two calls per member", async () => {
    const s = scenario();
    const result = await runTeam("SYNTHETIC_QUESTION", s.options);
    expect(s.execute).toHaveBeenCalledTimes(6);
    expect(result.members.map((m) => [m.roundOne, m.roundTwo, m.revision])).toEqual([
      ["FIRST_A", "SECOND_FIRST_A", "revised"], ["FIRST_B", "SECOND_FIRST_B", "revised"], ["FIRST_C", "SECOND_FIRST_C", "revised"],
    ]);
  });

  it("retains round one and marks a failed revision unrevised without retrying", async () => {
    const s = scenario("google");
    const result = await runTeam("SYNTHETIC_QUESTION", s.options);
    expect(result.members[1]).toMatchObject({ status: "answered", roundOne: "FIRST_B", revision: "unrevised" });
    expect(result.members[1].roundTwo).toBeUndefined();
    expect(s.execute).toHaveBeenCalledTimes(6);
    expect(JSON.stringify(result)).not.toContain("Unsafe upstream detail");
  });

  it("shows no peer text in round one", async () => {
    const s = scenario();
    await runTeam("SYNTHETIC_QUESTION", s.options);
    for (const call of s.calls.filter((c) => c.round === 1)) {
      expect(call.input).toContain("SYNTHETIC_QUESTION");
      for (const text of Object.values(first)) expect(call.input).not.toContain(text);
    }
  });

  it("waits for every first answer before starting any revision", async () => {
    let finish!: (text: string) => void;
    const pending = new Promise<string>((resolve) => { finish = resolve; });
    const s = scenario();
    const execute = vi.fn(async (model: ModelInfo, input: string) => {
      const value = await s.execute(model, input);
      return model.provider === "cloudflare" && value === "FIRST_C" ? pending : value;
    });
    const run = runTeam("SYNTHETIC_QUESTION", { ...s.options, execute });
    await vi.waitFor(() => expect(execute).toHaveBeenCalledTimes(3));
    finish("FIRST_C");
    await run;
    expect(s.calls.map((c) => c.round)).toEqual([1, 1, 1, 2, 2, 2]);
  });

  it("removes known vendor and model self-identification from copied answers while preserving originals", async () => {
    const seen: string[] = [];
    const counts = new Map<Provider, number>();
    const result = await runTeam("SYNTHETIC_QUESTION", { configured: () => true, models, execute: async (model, input) => {
      const count = (counts.get(model.provider) ?? 0) + 1; counts.set(model.provider, count);
      if (count === 2) seen.push(input);
      return count === 1 ? model.label + " " + first[model.provider] : "SECOND";
    } });
    expect(seen).toHaveLength(3);
    for (const input of seen) {
      for (const brand of ["Groq", "Google", "Gemini", "Cloudflare", "llama-3.3-70b-versatile"]) expect(input.toLowerCase()).not.toContain(brand.toLowerCase());
    }
    expect(result.members[0].roundOne).toContain("Groq");
  });
});
