import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MODEL_REGISTRY, type ModelId } from "../modelRegistry";
import { getStoredFreePoolBudgets, requestFreePool } from "../providerPool";
import { _resetProviderAvailabilityForTests } from "../providerStatus";
import { runBrowserTeam } from "./client";

beforeEach(() => {
  for (const name of ["ANTHROPIC_API_KEY", "OPENAI_API_KEY", "GOOGLE_API_KEY", "XAI_API_KEY", "DEEPSEEK_API_KEY", "GROQ_API_KEY", "OPENROUTER_API_KEY", "HF_TOKEN", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID", "NVIDIA_API_KEY"]) vi.stubEnv(name, "");
  localStorage.clear();
  _resetProviderAvailabilityForTests();
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Unexpected network"); }));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); localStorage.clear(); });

function reply(model: ModelId) {
  return { freePool: { status: "answered", model, provider: MODEL_REGISTRY[model].provider,
    text: "SYNTHETIC_RESPONSE", handedOff: false, attempts: [MODEL_REGISTRY[model].provider], budgets: [], usage: [] } };
}

describe("S1 browser free-only transport", () => {
  it("uses the existing free proxy with registry model restrictions for every member", async () => {
    const called = new Set<string>();
    const fetchImpl: typeof fetch = async (url, init) => {
      if (url === "/api/provider-status") return Response.json({ groq: true, google: true, cloudflare: true, openai: true });
      expect(url).toBe("/api/proxy");
      const body = JSON.parse(String(init?.body));
      expect(body.freePool).toBe(true);
      expect(body.model).toBe("auto");
      expect(body.poolModels).toHaveLength(1);
      const model = MODEL_REGISTRY[body.poolModels[0] as ModelId];
      expect(model.plan).toBe("free");
      expect(body.excludedProviders).not.toContain(model.provider);
      expect(body.excludedProviders).toContain("openai");
      called.add(model.provider);
      return Response.json(reply(model.id));
    };
    const result = await runBrowserTeam("SYNTHETIC_QUESTION", { fetchImpl });
    expect(result.status).toBe("ready");
    expect([...called].sort()).toEqual(["cloudflare", "google", "groq"]);
  });

  it("rejects a server response claiming a paid model instead of the selected member", async () => {
    const fetchImpl: typeof fetch = async (url) => url === "/api/provider-status"
      ? Response.json({ groq: true, google: true }) : Response.json(reply("gpt-5"));
    const result = await runBrowserTeam("SYNTHETIC_QUESTION", { fetchImpl });
    expect(result.status).toBe("refused");
    expect(result.members.every((m) => m.status === "unreachable")).toBe(true);
  });

  it("preserves cooldowns when parallel member replies arrive with different budget snapshots", async () => {
    const budget = { provider: "groq", exhaustedAt: Date.now(), resetAt: Date.now() + 60000 };
    await requestFreePool("SYNTHETIC_QUESTION", { fetchImpl: async () => Response.json({
      freePool: { status: "refused", handedOff: false, attempts: ["groq"], budgets: [budget], usage: [] },
    }) });
    await requestFreePool("SYNTHETIC_QUESTION", { fetchImpl: async () => Response.json(reply("gemini-flash")) });
    expect(getStoredFreePoolBudgets()).toContainEqual(budget);
  });
});
