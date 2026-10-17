import {
  useAccountStore,
  getCreditsRemaining,
} from "../stores/accountStore";
import { calculateUsageCost, emitCreditDeducted, hasPricingFor, MODEL_PRICE_VERSION } from "./costTracking";
import type { CreditAuthorizationRecord, PricedModel } from "../stores/types";
import type { ProxyClient, ProxyCompletionRequest } from "./proxyClient";
import { saveNow } from "./persistence";
import {
  evaluatePaidRoutePolicy,
  type PaidRouteBlockReason,
  type PaidRoutePolicy,
} from "./paidRoutePolicy";
import { getMoneyAuthority, persistMoneyAuthority } from "./moneyRuntime";
import type { MoneyBlockReason, MoneySnapshot } from "./moneySafety";

export type CostConfirmationChoice = "paid" | "free-route" | "cancelled";

export interface CostConfirmationRequest {
  id: string;
  amount: number;
  label: string;
  developerMode: boolean;
  affordable: boolean;
  availableBalance: number | null;
  policy: PaidRoutePolicy;
  blockedReason: Exclude<PaidRouteBlockReason, "invalid-estimate"> | null;
  resolve: (choice: CostConfirmationChoice) => void;
}

export interface CreditAuthorizationResult {
  authorized: boolean;
  amount: number;
  referenceId: string;
  hardMaximum?: number;
  models?: PricedModel[];
  reservationId?: string;
  deferredSettlement?: boolean;
  reason?:
    | "cancelled"
    | "free-route-selected"
    | "insufficient-credits"
    | PaidRouteBlockReason
    | MoneyBlockReason;
}

let mountedConfirmationHosts = 0;

export function registerCostConfirmationHost(): () => void {
  mountedConfirmationHosts += 1;
  return () => {
    mountedConfirmationHosts = Math.max(0, mountedConfirmationHosts - 1);
  };
}

function requestConfirmation(
  detail: Omit<CostConfirmationRequest, "resolve">,
): Promise<CostConfirmationChoice> {
  if (mountedConfirmationHosts === 0) {
    if (detail.blockedReason || !detail.affordable || typeof window.confirm !== "function") {
      return Promise.resolve("cancelled");
    }
    return Promise.resolve(
      window.confirm(
        `${detail.policy.routeLabel} is estimated to cost up to $${detail.amount.toFixed(4)}. ` +
          `Your hard maximum is $${detail.policy.maximum.toFixed(2)}. Continue?`,
      )
        ? "paid"
        : "cancelled",
    );
  }
  return new Promise((resolve) => {
    window.dispatchEvent(
      new CustomEvent<CostConfirmationRequest>("creditConfirmationRequested", {
        detail: { ...detail, resolve },
      }),
    );
  });
}

/** The authority is the source of truth. Account data is a durable projection:
 * balance before outstanding holds, plus an append-only charge mirror. */
let reconciliationQueue = Promise.resolve();
function ordered<T>(work: () => Promise<T>): Promise<T> {
  const next = reconciliationQueue.then(work);
  reconciliationQueue = next.then(() => undefined, () => undefined);
  return next;
}

function upstreamModel(model: string): string {
  return model === "gemini-3.1-pro" ? "gemini-3.1-pro-preview" : model;
}

function updateRecord(referenceId: string, patch: Partial<CreditAuthorizationRecord>): void {
  useAccountStore.setState((state) => ({
    creditAuthorizations: state.creditAuthorizations.map((record) => record.referenceId === referenceId ? { ...record, ...patch } : record),
  }));
}

async function projectAuthority(snapshot: MoneySnapshot): Promise<void> {
  const state = useAccountStore.getState();
  const ledger = [...state.creditLedger];
  for (const event of snapshot.ledger.slice(state.moneyMirrorCursor)) {
    const reservation = snapshot.reservations.find((item) => item.id === event.referenceId);
    const referenceId = event.kind === "charge" ? reservation?.idempotencyKey : `sandbox-checkout:${event.referenceId}`;
    if ((event.kind !== "charge" && event.kind !== "credit-purchase") || !referenceId || ledger.some((entry) => entry.referenceId === referenceId)) continue;
    ledger.push({ id: `money-mirror:${event.id}`, timestamp: event.timestamp,
      kind: event.kind === "charge" ? "api-call" : "top-up", amount: event.amountCents / 100,
      balanceAfter: event.balanceAfterCents / 100, referenceId,
      note: event.kind === "charge" ? `Measured usage: ${reservation?.model} (${reservation?.priceVersion})` : event.note });
  }
  const records = state.creditAuthorizations.map((record) => {
    const reservation = snapshot.reservations.find((item) => item.id === record.reservationId);
    if (!reservation || reservation.status === "reserved") return record;
    return { ...record, status: reservation.status,
      billedCost: reservation.status === "settled" ? (reservation.actualCents ?? 0) / 100 : reservation.status === "released" ? 0 : null };
  });
  // Holds reduce spendable authority funds, not the account's settled balance.
  const held = snapshot.reservations.filter((item) => item.status === "reserved" || item.status === "pending-unknown")
    .reduce((sum, item) => sum + item.creditsHeldCents, 0);
  useAccountStore.setState({ creditBalance: (snapshot.balanceCents + held) / 100,
    creditLedger: ledger.slice(-1000), moneyMirrorCursor: snapshot.ledger.length,
    creditAuthorizations: records,
    autoSelectUsageLogs: state.autoSelectUsageLogs.map((entry) => {
      const record = records.find((item) => item.referenceId === entry.authorizationReferenceId);
      return record ? { ...entry, actualCost: record.actualCost, billedCost: record.billedCost, billingStatus: record.status } : entry;
    }),
  });
  await saveNow();
}

/** Called after bootstrap loads both stores; never repeats provider work.
 * A saved measurement can finish settlement. Interrupted unmeasured holds
 * remain pending because a reload cannot prove dispatch did not happen. */
export function reconcileCreditAuthorizations(recoverInterrupted = false): Promise<void> {
  return ordered(async () => {
    const authority = getMoneyAuthority();
    if (recoverInterrupted) {
      for (const reservation of authority.snapshot().reservations) {
        if (reservation.status !== "reserved") continue;
        const record = useAccountStore.getState().creditAuthorizations.find((item) => item.reservationId === reservation.id);
        if (record?.actualCost !== null && record?.actualCost !== undefined) {
          authority.settle(reservation.id, Math.min(reservation.hardMaximumCents, Math.max(0, Math.ceil(record.actualCost * 100 - 1e-9))), `settle-${reservation.idempotencyKey}`);
        } else {
          authority.markUsageUnknown(reservation.id, `unknown-${reservation.idempotencyKey}`, "Interrupted before a durable measurement; usage remains unknown.");
        }
      }
    }
    const durableProjection = authority.snapshot();
    await persistMoneyAuthority();
    await projectAuthority(durableProjection);
  });
}

/** Every authorization only reserves. Legacy callers without explicit model
 * pricing fail closed rather than reviving estimate-at-reserve charging. */
export async function authorizeEstimatedCost(
  amount: number, label: string, policy: PaidRoutePolicy,
  options: { deferSettlement?: boolean; models?: PricedModel[] } = {},
): Promise<CreditAuthorizationResult> {
  const referenceId = `authorization-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const blockedReason = evaluatePaidRoutePolicy(amount, policy);
  if (blockedReason === "invalid-estimate") return { authorized: false, amount, referenceId, reason: blockedReason };
  const models = options.models;
  if (!models?.length || models.some((item) => !item.provider || !hasPricingFor(item.model))) {
    return { authorized: false, amount, referenceId, reason: "unknown-price" };
  }
  await reconcileCreditAuthorizations();
  const authority = getMoneyAuthority();
  const estimatedCents = Math.max(1, Math.ceil(amount * 100 - 1e-9));
  // One rule for every route: 2x the rounded estimate, limited by both caps.
  const hardMaximumCents = Math.min(estimatedCents * 2, Math.floor(policy.maximum * 100 + 1e-9), authority.snapshot().caps.requestCents);
  if (!blockedReason && hardMaximumCents <= estimatedCents) return { authorized: false, amount, referenceId, reason: "invalid-hard-maximum" };
  const state = useAccountStore.getState();
  const developerMode = state.appMode === "developer";
  const affordable = developerMode || (state.plan !== "free" && state.creditBalance >= hardMaximumCents / 100);
  const remaining = getCreditsRemaining();
  const choice = await requestConfirmation({ id: referenceId, amount, label, developerMode, affordable,
    availableBalance: Number.isFinite(remaining) ? remaining : null,
    policy: { ...policy, maximum: hardMaximumCents / 100 }, blockedReason });
  if (choice === "free-route") return { authorized: false, amount, referenceId, reason: "free-route-selected" };
  if (blockedReason) return { authorized: false, amount, referenceId, reason: blockedReason };
  if (choice !== "paid" || !affordable) return { authorized: false, amount, referenceId, reason: affordable ? "cancelled" : "insufficient-credits" };
  const result = await authority.reserve({ idempotencyKey: referenceId, route: "divergence-credits",
    estimatedCents, hardMaximumCents, sessionId: "active-session", monthId: new Date().toISOString().slice(0, 7),
    provider: [...new Set(models.map((item) => item.provider))].join(" + "),
    model: [...new Set(models.map((item) => upstreamModel(item.model)))].join(" + "),
    translator: "Divergence paid-route authorization", payerLabel: policy.payerLabel,
    reasonLabel: label, freeAlternativeLabel: policy.freeAlternativeLabel,
    priceVersion: MODEL_PRICE_VERSION, explicitConsent: true, developerMode });
  if (!result.ok || !result.reservation) return { authorized: false, amount, referenceId, reason: result.reason ?? "insufficient-funds" };
  await persistMoneyAuthority();
  const reservationId = result.reservation.id;
  useAccountStore.setState((current) => ({ creditAuthorizations: [...current.creditAuthorizations, {
    referenceId, reservationId, estimatedCost: amount, hardMaximum: hardMaximumCents / 100,
    actualCost: null, billedCost: null, overageCost: 0, models: models.map((item) => ({ ...item })),
    actualModels: [], priceVersion: MODEL_PRICE_VERSION, status: "reserved", note: label,
  }] }));
  await saveNow();
  return { authorized: true, amount, hardMaximum: hardMaximumCents / 100, models,
    referenceId, reservationId, deferredSettlement: true };
}

export function settleDeferredAuthorization(
  authorization: CreditAuthorizationResult, actualAmount: number, note: string, actualModels?: string[],
): Promise<boolean> {
  return ordered(async () => {
    if (!authorization.authorized || !authorization.reservationId || !Number.isFinite(actualAmount) || actualAmount < 0) return false;
    const authority = getMoneyAuthority();
    const reservation = authority.snapshot().reservations.find((item) => item.id === authorization.reservationId);
    if (!reservation || reservation.status === "pending-unknown" || reservation.status === "released") return false;
    if (reservation.status === "reserved") {
      const billedCents = Math.min(reservation.hardMaximumCents, Math.max(0, Math.ceil(actualAmount * 100 - 1e-9)));
      // Save the measurement first, WITHOUT a debit. This is a replayable
      // settlement intent if the next durable write is interrupted.
      updateRecord(authorization.referenceId, { actualCost: actualAmount,
        billedCost: billedCents / 100, overageCost: Math.max(0, Math.round((actualAmount - reservation.hardMaximumCents / 100) * 1e6) / 1e6),
        status: "measured", note, actualModels: actualModels ?? (authorization.models?.length === 1 ? authorization.models.map((item) => upstreamModel(item.model)) : []) });
      await saveNow();
      const receipt = authority.settle(reservation.id, billedCents, `settle-${authorization.referenceId}`);
      if (receipt?.status !== "settled") return false;
    }
    // Authority first, projection second. Repeating/reloading this sequence
    // rebuilds the same balance; it never performs a second mirror debit.
    const durableProjection = authority.snapshot();
    await persistMoneyAuthority();
    await projectAuthority(durableProjection);
    emitCreditDeducted((reservation.actualCents ?? Math.min(reservation.hardMaximumCents, Math.max(0, Math.ceil(actualAmount * 100 - 1e-9)))) / 100, authorization.referenceId);
    return true;
  });
}

export function releaseDeferredAuthorization(authorization: CreditAuthorizationResult, note: string): Promise<boolean> {
  return ordered(async () => {
    if (!authorization.authorized || !authorization.reservationId) return false;
    const receipt = getMoneyAuthority().release(authorization.reservationId, `release-${authorization.referenceId}`, note);
    if (!receipt) return false;
    updateRecord(authorization.referenceId, { note });
    const durableProjection = getMoneyAuthority().snapshot();
    await persistMoneyAuthority(); await projectAuthority(durableProjection); return true;
  });
}

export function markDeferredAuthorizationUnknown(authorization: CreditAuthorizationResult, note: string): Promise<boolean> {
  return ordered(async () => {
    if (!authorization.authorized || !authorization.reservationId) return false;
    const receipt = getMoneyAuthority().markUsageUnknown(authorization.reservationId, `unknown-${authorization.referenceId}`, note);
    if (!receipt) return false;
    updateRecord(authorization.referenceId, { note });
    const durableProjection = getMoneyAuthority().snapshot();
    await persistMoneyAuthority(); await projectAuthority(durableProjection); return true;
  });
}

/** Per-attempt measurement for the main pipeline's injected client. Each
 * retry is another possibly billable call: one missing usage keeps the whole
 * reservation pending, rather than settling a partial sum. */
export function createAuthorizedClient(authorization: CreditAuthorizationResult, client: ProxyClient) {
  const costs: Array<number | null> = [];
  const actualModels = new Set<string>();
  let finished: Promise<boolean> | undefined;
  function tracked(req: ProxyCompletionRequest): ProxyCompletionRequest {
    if (finished || !authorization.authorized || !authorization.reservationId || req.signal?.aborted) throw new Error("Paid operation is not active");
    if (!authorization.models?.some((item) => item.model === req.model) || !hasPricingFor(req.model)) throw new Error("Model was not authorized with known pricing");
    const index = costs.push(null) - 1;
    actualModels.add(upstreamModel(req.model));
    return { ...req, onUsage: (usage) => {
      const price = calculateUsageCost(usage.inputTokens, usage.outputTokens, req.model);
      costs[index] = price.amount;
      req.onUsage?.(usage);
    } };
  }
  const measured: ProxyClient = { endpoint: client.endpoint,
    complete: (req) => client.complete(tracked(req)),
    async *stream(req) { yield* client.stream(tracked(req)); },
  };
  return { client: measured, finish(): Promise<boolean> {
    if (!finished) {
      const models = [...actualModels];
      updateRecord(authorization.referenceId, { actualModels: models });
      finished = costs.length === 0
        ? releaseDeferredAuthorization(authorization, "Nothing dispatched")
        : costs.some((cost) => cost === null)
          ? markDeferredAuthorizationUnknown(authorization, "Dispatched work without complete usage; hold remains pending.")
          : settleDeferredAuthorization(authorization, Math.round((costs as number[]).reduce((sum, cost) => sum + cost, 0) * 1e6) / 1e6, "Measured pipeline usage", models);
    }
    return finished;
  } };
}
