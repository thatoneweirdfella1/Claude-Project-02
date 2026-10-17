import { MODEL_IDS, MODEL_REGISTRY, type ModelId, type ModelInfo, type Provider } from "./modelRegistry.js";
import { appAccessHeaders } from "./appAccessClient.js";
import { getModelPrice } from "./costTracking.js";

export const DEFAULT_POOL_COOLDOWN_MS = 86_400_000;
// Try the broad request allowances first; preserve OpenRouter's scarce daily requests.
// HF spends only the included credit on the owner's no-payment-method account.
export const FREE_PROVIDER_ORDER = { groq: 0, google: 1, cloudflare: 2, huggingface: 3, openrouter: 4 } as const;
const ORDER: Readonly<Record<string, number>> = FREE_PROVIDER_ORDER;
const LABEL: Record<string, string> = { groq: "Groq", google: "Google (Gemini)", cloudflare: "Cloudflare Workers AI", huggingface: "Hugging Face", openrouter: "OpenRouter" };
export interface PoolBudget { provider: Provider; model?: string; exhaustedAt: number; resetAt: number; }
export interface PoolUsage { provider: Provider; model: string; inputTokens: number; outputTokens: number; }
export interface FreePoolResult {
  status: "answered" | "refused";
  provider?: Provider;
  model?: string;
  text?: string;
  handedOff: boolean;
  attempts: Provider[];
  budgets: PoolBudget[];
  usage: PoolUsage[];
  reason?: "free-pool-unavailable" | "request-cancelled";
  message?: string;
}
interface PoolOptions {
  configured: (provider: Provider) => boolean;
  execute: (model: ModelInfo) => Promise<Response>;
  models?: readonly unknown[];
  excludedProviders?: readonly unknown[];
  budgets?: readonly unknown[];
  signal?: AbortSignal;
}
function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
}
/** Registry plan plus an independent provider boundary: legacy subscription
 * eligibility for Claude is not permission to spend its per-use credit. */
export function isFreePoolModel(id: unknown): id is ModelId {
  if (typeof id !== "string" || !Object.hasOwn(MODEL_REGISTRY, id)) return false;
  const model = MODEL_REGISTRY[id as ModelId];
  const price = getModelPrice(id);
  return price?.inputPerMillion === 0 && price.outputPerMillion === 0 && model.plan === "free" &&
    (model.provider === "groq" || model.provider === "google" || model.provider === "openrouter" ||
      model.provider === "huggingface" || model.provider === "cloudflare") &&
    (model.provider !== "openrouter" || id.endsWith(":free"));
}
function measured(payload: unknown, model: ModelInfo): PoolUsage | null {
  const data = object(payload);
  const usage = object(data.usage);
  const google = object(data.usageMetadata);
  const inputTokens = usage.prompt_tokens ?? usage.input_tokens ?? google.promptTokenCount ?? google.prompt_token_count;
  const outputTokens = usage.completion_tokens ?? usage.output_tokens ?? google.candidatesTokenCount ?? google.candidates_token_count;
  if (typeof inputTokens !== "number" || typeof outputTokens !== "number" ||
      !Number.isSafeInteger(inputTokens) || !Number.isSafeInteger(outputTokens) || inputTokens < 0 || outputTokens < 0) return null;
  return { provider: model.provider, model: model.id, inputTokens, outputTokens };
}
function answerText(payload: unknown, provider: Provider): string {
  const data = object(payload);
  if (provider === "google") {
    const first = Array.isArray(data.candidates) ? object(data.candidates[0]) : {};
    const parts = object(first.content).parts;
    return Array.isArray(parts) ? parts.map((part) => object(part).text).filter((text) => typeof text === "string").join("") : "";
  }
  const choice = Array.isArray(data.choices) ? object(data.choices[0]) : {};
  const text = object(choice.message).content;
  return typeof text === "string" ? text : "";
}
function limited(status: number, payload: unknown): boolean {
  if (status === 429 || status === 402) return true;
  const data = object(payload);
  const detail = JSON.stringify([data.error, data.message, data.code]);
  return /quota|rate.?limit|resource.exhausted|daily.*(spent|exhaust|limit|exceed)|allowance.*(spent|exhaust|exceed)|(?:credit|balance).*(spent|exhaust|insufficient|exceed)|(?:exceed|insufficient|exhaust|spent).*(?:credit|balance)|payment required/i.test(detail);
}
/** Account credit/payment failures stop the whole provider. Explicit model
 * quotas may try another model; ambiguous limits conservatively stop the provider. */
function limitScope(status: number, payload: unknown): "model" | "provider" | null {
  if (!limited(status, payload)) return null;
  const data = object(payload);
  const error = object(data.error);
  const metadata = object(error.metadata);
  const detail = JSON.stringify([data.error, data.message, data.code]);
  if (status === 402 || /payment required|insufficient.*(?:credit|balance|fund)|(?:account|monthly).*credit|credit.*(?:exhaust|exceed)/i.test(detail)) return "provider";
  const scope = error.scope ?? data.scope ?? metadata.scope;
  if (scope === "provider" || scope === "account" || scope === "organization") return "provider";
  if (scope === "model" || /model[_-](?:rate[_-]limit|quota)/i.test(String(error.code ?? data.code)) ||
      /rate.?limit.*(?:for|on) model|model.*(?:rate.?limit|quota.*exhaust)|temporarily rate.limited upstream/i.test(detail)) return "model";
  if (Array.isArray(error.details) && error.details.some((item) => {
    const violations = object(item).violations;
    return Array.isArray(violations) && violations.some((violation) =>
      typeof object(object(violation).quotaDimensions).model === "string");
  })) return "model";
  return "provider";
}

function duration(value: string): number | null {
  if (/^\d+(?:\.\d+)?s$/.test(value)) return Number(value.slice(0, -1)) * 1000;
  const groups = [...value.matchAll(/(\d+(?:\.\d+)?)(ms|s|m|h|d)/g)];
  if (!groups.length || groups.map((group) => group[0]).join("") !== value) return null;
  const scale: Record<string, number> = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return groups.reduce((total, group) => total + Number(group[1]) * scale[group[2]], 0);
}
function resetTime(response: Response, payload: unknown, now: number): number {
  const values: number[] = [];
  const retry = response.headers.get("retry-after");
  if (retry) values.push(/^\d+(\.\d+)?$/.test(retry) ? now + Number(retry) * 1000 : Date.parse(retry));
  for (const header of ["x-ratelimit-reset", "x-ratelimit-reset-requests", "x-ratelimit-reset-tokens"]) {
    const raw = response.headers.get(header);
    if (!raw) continue;
    const span = duration(raw);
    values.push(span !== null ? now + span : /^\d+$/.test(raw) ? Number(raw) * (Number(raw) < 1e12 ? 1000 : 1) : Date.parse(raw));
  }
  const data = object(payload);
  const error = object(data.error);
  const seconds = data.retry_after ?? error.retry_after;
  if (typeof seconds === "number") values.push(now + seconds * 1000);
  if (Array.isArray(error.details)) {
    for (const item of error.details) {
      const delay = object(item).retryDelay;
      if (typeof delay === "string") { const span = duration(delay); if (span !== null) values.push(now + span); }
    }
  }
  const valid = values.filter((time) => Number.isFinite(time) && time > now);
  return valid.length ? Math.max(...valid) : now + DEFAULT_POOL_COOLDOWN_MS;
}
function validBudget(value: unknown, now: number): value is PoolBudget {
  const item = object(value);
  return typeof item.provider === "string" && Object.hasOwn(ORDER, item.provider) &&
    (item.model === undefined || (isFreePoolModel(item.model) && MODEL_REGISTRY[item.model].provider === item.provider)) &&
    typeof item.exhaustedAt === "number" && Number.isFinite(item.exhaustedAt) && item.exhaustedAt <= now &&
    typeof item.resetAt === "number" && Number.isFinite(item.resetAt) && item.resetAt > now;
}
function budgetKey(value: Pick<PoolBudget, "provider" | "model">): string {
  return value.model ? value.provider + ":" + value.model : value.provider;
}
function copyBudget(value: PoolBudget): PoolBudget {
  return { provider: value.provider, ...(value.model ? { model: value.model } : {}),
    exhaustedAt: value.exhaustedAt, resetAt: value.resetAt };
}
/** One attempt per eligible model; provider-wide failures skip its remaining models. */
export function createProviderPool(now: () => number = () => Date.now()) {
  const out = new Map<string, PoolBudget>();
  return {
    async run(options: PoolOptions): Promise<FreePoolResult> {
      // Client metadata may defer its own request, but only a server-observed
      // quota response may exhaust a provider for unrelated requests.
      const carried = new Map<string, PoolBudget>();
      for (const value of options.budgets ?? []) {
        if (validBudget(value, now()) && (carried.get(budgetKey(value))?.resetAt ?? 0) < value.resetAt) carried.set(budgetKey(value), copyBudget(value));
      }
      for (const [provider, state] of out) if (state.resetAt <= now()) out.delete(provider);
      const usage: PoolUsage[] = [];
      const attempts: Provider[] = [];
      const seen = new Set<ModelId>();
      const unavailable = new Set<Provider>();
      const candidates = (options.models ?? MODEL_IDS)
        .map((value) => typeof value === "string" ? value : object(value).id)
        .filter(isFreePoolModel)
        .map((id) => MODEL_REGISTRY[id])
        .sort((left, right) => (ORDER[left.provider] ?? 9999) - (ORDER[right.provider] ?? 9999));
      const snapshot = () => {
        const combined = new Map(out);
        for (const [provider, budget] of carried) {
          if ((combined.get(provider)?.resetAt ?? 0) < budget.resetAt) combined.set(provider, budget);
        }
        return [...combined.values()].map(copyBudget);
      };
      for (const model of candidates) {
        // Recheck at the dispatch boundary; caller-supplied plan/provider fields never authorize a call.
        if (!isFreePoolModel(model.id) || seen.has(model.id)) continue;
        seen.add(model.id);
        if (options.signal?.aborted) break;
        const modelBudgetKey = budgetKey({ provider: model.provider, model: model.id });
        if ((out.get(model.provider)?.resetAt ?? 0) > now() || (carried.get(model.provider)?.resetAt ?? 0) > now() ||
            (out.get(modelBudgetKey)?.resetAt ?? 0) > now() || (carried.get(modelBudgetKey)?.resetAt ?? 0) > now() ||
            unavailable.has(model.provider) ||
            options.excludedProviders?.includes(model.provider) || !options.configured(model.provider)) continue;
        attempts.push(model.provider);
        try {
          const response = await options.execute(model);
          const payload: unknown = await response.json().catch(() => null);
          const actual = measured(payload, model);
          if (actual) usage.push(actual);
          const scope = limitScope(response.status, payload);
          if (scope) {
            const exhaustedAt = now();
            const budget: PoolBudget = { provider: model.provider, ...(scope === "model" ? { model: model.id } : {}),
              exhaustedAt, resetAt: resetTime(response, payload, exhaustedAt) };
            out.set(budgetKey(budget), budget);
            continue;
          }
          const text = response.ok ? answerText(payload, model.provider) : "";
          if (text.trim() && !options.signal?.aborted) {
            return { status: "answered", provider: model.provider, model: model.id, text, handedOff: attempts.length > 1, attempts, budgets: snapshot(), usage };
          }
          unavailable.add(model.provider);
        } catch {
          unavailable.add(model.provider);
          // Never echo upstream errors: they can contain a URL or authentication material.
          // Unmeasured failures do not become invented usage or a credit charge.
        }
      }
      return {
        status: "refused", handedOff: attempts.length > 1, attempts, budgets: snapshot(), usage,
        reason: options.signal?.aborted ? "request-cancelled" : "free-pool-unavailable",
        message: options.signal?.aborted ? "Free request cancelled." : "No free provider is available (not configured, out of budget, or unavailable). Use the local no-charge handoff.",
      };
    },
  };
}

let lastResult: FreePoolResult | null = null;
const listeners = new Set<(result: FreePoolResult) => void>();
const BUDGET_STORAGE = "divergence-free-pool-budgets";
export function getLastFreePoolResult() { return lastResult; }
export function subscribeFreePoolResult(listener: (result: FreePoolResult) => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export function describeFreePoolResult(result: FreePoolResult): string {
  if (result.status === "refused") return result.message ?? "No free provider is available. Use the local no-charge handoff.";
  const route = result.attempts.map((provider) => LABEL[provider] ?? provider).join(" → ");
  return (result.handedOff ? "Hand-off: " + route + ". " : "") + "Answered by " +
    (LABEL[result.provider ?? ""] ?? result.provider) + " · " + result.model + " · No Divergence credits.";
}
function storedBudgets(): unknown[] {
  try { const value: unknown = JSON.parse(localStorage.getItem(BUDGET_STORAGE) ?? "[]"); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
export async function isFreePoolConfigured(fetchImpl: typeof fetch = fetch): Promise<boolean> {
  try {
    const response = await fetchImpl("/api/provider-status", { headers: appAccessHeaders(), cache: "no-store" });
    return response.ok && object(await response.json()).freePoolAvailable === true;
  } catch { return false; }
}
export async function requestFreePool(text: string, options: {
  fetchImpl?: typeof fetch; signal?: AbortSignal; excludedProviders?: string[];
  onUsage?: (usage: PoolUsage) => void;
} = {}): Promise<FreePoolResult> {
  let result: FreePoolResult;
  try {
    const response = await (options.fetchImpl ?? fetch)("/api/proxy", {
      method: "POST", headers: { "content-type": "application/json", ...appAccessHeaders() },
      signal: options.signal,
      body: JSON.stringify({ freePool: true, model: "auto", messages: [{ role: "user", content: text }],
        excludedProviders: options.excludedProviders, freePoolBudgets: storedBudgets() }),
    });
    const value = object(object(await response.json()).freePool);
    if (!response.ok || !["answered", "refused"].includes(String(value.status)) ||
        !Array.isArray(value.attempts) || !Array.isArray(value.budgets) || !Array.isArray(value.usage) ||
        (value.status === "answered" && (!isFreePoolModel(value.model) ||
          MODEL_REGISTRY[value.model].provider !== value.provider || typeof value.text !== "string" || !value.text.trim()))) throw new Error("Invalid free-pool response");
    result = value as unknown as FreePoolResult;
  } catch {
    result = { status: "refused", reason: options.signal?.aborted ? "request-cancelled" : "free-pool-unavailable",
      message: "No free provider is available. Use the local no-charge handoff.", handedOff: false, attempts: [], budgets: [], usage: [] };
  }
  const reported = new Set<string>();
  for (const entry of result.usage) {
    const usage = object(entry);
    if (!isFreePoolModel(usage.model) || MODEL_REGISTRY[usage.model].provider !== usage.provider ||
        typeof usage.inputTokens !== "number" || typeof usage.outputTokens !== "number" ||
        !Number.isSafeInteger(usage.inputTokens) || !Number.isSafeInteger(usage.outputTokens) || usage.inputTokens < 0 || usage.outputTokens < 0) continue;
    const identity = String(usage.provider) + ":" + usage.model;
    if (!reported.has(identity)) { reported.add(identity); options.onUsage?.(entry); }
  }
  // Persist only exhaustion metadata; never prompts, answers, or credentials.
  const budgets = result.budgets.filter((entry) => validBudget(entry, Date.now())).map(copyBudget);
  if (budgets.length || result.status === "answered") {
    try { localStorage.setItem(BUDGET_STORAGE, JSON.stringify(budgets)); } catch { /* Memory still holds this result. */ }
  }
  lastResult = result;
  listeners.forEach((listener) => listener(result));
  return result;
}
