import { MODEL_REGISTRY } from "../modelRegistry";
import { getProviderAvailability } from "../providerStatus";
import { getStoredFreePoolBudgets, requestFreePool } from "../providerPool";
import { runTeam } from "./runTeam";

/** Existing /api/proxy freePool route rechecks actual keys and registry rules
 * server-side. No paid or debate client is reachable from this entry point. */
export async function runBrowserTeam(question: string, options: { fetchImpl?: typeof fetch; signal?: AbortSignal } = {}) {
  const availability = question.trim() ? await getProviderAvailability(options.fetchImpl) : null;
  return runTeam(question, {
    configured: (provider) => availability?.[provider] === true,
    budgets: getStoredFreePoolBudgets(),
    signal: options.signal,
    execute: async (model, input, signal) => {
      const excludedProviders = [...new Set(Object.values(MODEL_REGISTRY).map((m) => m.provider))].filter((p) => p !== model.provider);
      const result = await requestFreePool(input, { fetchImpl: options.fetchImpl, signal, excludedProviders, model: model.id });
      if (result.status !== "answered" || result.provider !== model.provider || result.model !== model.id || !result.text?.trim()) throw new Error("Member unreachable");
      return result.text;
    },
  });
}
