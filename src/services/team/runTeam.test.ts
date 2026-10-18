import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MODEL_REGISTRY, type ModelInfo } from "../modelRegistry";
import { runTeam, teamMembers } from "./runTeam";

const names = ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY", "XAI_API_KEY", "DEEPSEEK_API_KEY", "GROQ_API_KEY", "OPENROUTER_API_KEY", "HF_TOKEN", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "NVIDIA_API_KEY"];
beforeEach(() => {
  for (const name of names) vi.stubEnv(name, "");
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Unexpected network"); }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
const configured = () => true;
const execute = async () => "SYNTHETIC_RESPONSE";

describe("S1 free team membership", () => {
  it("assembles only the free pool, with configured keys and no active cooldown", () => {
    const members = teamMembers({ configured });
    expect(members.map((m) => m.provider)).toEqual(["groq", "google", "cloudflare", "huggingface", "openrouter"]);
    expect(members.every((m) => MODEL_REGISTRY[m.id].plan === "free")).toBe(true);
    expect(teamMembers({ configured: (p) => p !== "google", budgets: [
      { provider: "groq", exhaustedAt: 1, resetAt: Number.MAX_SAFE_INTEGER },
    ] }).map((m) => m.provider)).toEqual(["cloudflare", "huggingface", "openrouter"]);
  });

  it("refuses paid and forged members even when the caller insists", async () => {
    const call = vi.fn(execute);
    const result = await runTeam("SYNTHETIC_QUESTION", { configured, execute: call, models: [
      { id: "gpt-5", provider: "groq", plan: "free" },
      { id: "gemini-pro", provider: "google", plan: "free" },
      { id: "claude-haiku-4-5", provider: "groq", plan: "free" },
    ] });
    expect(result.status).toBe("refused");
    expect(call).not.toHaveBeenCalled();
  });

  it("names an unreachable member and carries on with the rest", async () => {
    const result = await runTeam("SYNTHETIC_QUESTION", {
      configured, models: ["llama-3.3-70b-versatile", "gemini-flash", "@cf/meta/llama-3.1-8b-instruct"],
      execute: async (model: ModelInfo) => {
        if (model.provider === "groq") throw new Error("Unsafe upstream detail");
        return "SYNTHETIC_RESPONSE";
      },
    });
    expect(result.status).toBe("ready");
    expect(result.members.map((m) => [m.provider, m.status])).toEqual([
      ["groq", "unreachable"], ["google", "answered"], ["cloudflare", "answered"],
    ]);
    expect(JSON.stringify(result)).not.toContain("Unsafe upstream detail");
  });

  it("refuses a single member without any call", async () => {
    const call = vi.fn(execute);
    const result = await runTeam("SYNTHETIC_QUESTION", { configured: (p) => p === "groq", execute: call });
    expect(result.status).toBe("refused");
    expect(result.message).toBe("Team mode needs at least two reachable free providers with keys and available allowance.");
    expect(call).not.toHaveBeenCalled();
  });

  it("works with exactly two providers and refuses when only one answers", async () => {
    const options = { configured: (p: string) => p === "groq" || p === "google", execute };
    expect((await runTeam("SYNTHETIC_QUESTION", options)).status).toBe("ready");
    const result = await runTeam("SYNTHETIC_QUESTION", { ...options, execute: async (m) => {
      if (m.provider === "google") throw new Error("Unavailable");
      return "SYNTHETIC_RESPONSE";
    } });
    expect(result.status).toBe("refused");
    expect(result.members.filter((m) => m.status === "answered")).toHaveLength(1);
  });

  it("uses reserves after failures, caps answering members, and never duplicates a provider", async () => {
    const result = await runTeam("SYNTHETIC_QUESTION", { configured, execute: async (m) => {
      if (m.provider === "groq") throw new Error("Unavailable");
      return "SYNTHETIC_RESPONSE";
    } });
    expect(result.members.filter((m) => m.status === "answered").map((m) => m.provider)).toEqual(["google", "cloudflare", "huggingface"]);
    expect(teamMembers({ configured, models: ["gemini-flash", "gemini-flash"] })).toHaveLength(1);
  });
});
