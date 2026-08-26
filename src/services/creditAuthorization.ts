import {
  useAccountStore,
  canAffordCredits,
  getCreditsRemaining,
} from "../stores/accountStore";
import { emitCreditDeducted } from "./costTracking";
import { saveNow } from "./persistence";
import {
  evaluatePaidRoutePolicy,
  type PaidRouteBlockReason,
  type PaidRoutePolicy,
} from "./paidRoutePolicy";
import { getMoneyAuthority, persistMoneyAuthority } from "./moneyRuntime";
import type { MoneyBlockReason } from "./moneySafety";

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

/** Compatibility authorization for currently disconnected provider paths.
    Every mode is charged through the bounded ledger; Developer never bypasses.
    New Layer 5 integrations use DeterministicMoneyAuthority reservations. */
export async function authorizeEstimatedCost(
  amount: number,
  label: string,
  policy: PaidRoutePolicy,
): Promise<CreditAuthorizationResult> {
  const referenceId = `authorization-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const blockedReason = evaluatePaidRoutePolicy(amount, policy);
  if (blockedReason === "invalid-estimate") {
    return { authorized: false, amount, referenceId, reason: blockedReason };
  }

  const state = useAccountStore.getState();
  const developerMode = state.appMode === "developer";
  const affordable = canAffordCredits(amount);
  const remaining = getCreditsRemaining();
  const choice = await requestConfirmation({
    id: referenceId,
    amount,
    label,
    developerMode,
    affordable,
    availableBalance: Number.isFinite(remaining) ? remaining : null,
    policy,
    blockedReason,
  });

  if (choice === "free-route") {
    return { authorized: false, amount, referenceId, reason: "free-route-selected" };
  }
  if (blockedReason) {
    return { authorized: false, amount, referenceId, reason: blockedReason };
  }
  if (choice !== "paid") {
    return {
      authorized: false,
      amount,
      referenceId,
      reason: affordable ? "cancelled" : "insufficient-credits",
    };
  }
  if (!affordable) {
    return { authorized: false, amount, referenceId, reason: "insufficient-credits" };
  }

  const amountCents = Math.max(1, Math.ceil(amount * 100));
  const authority = getMoneyAuthority();
  const reservation = await authority.reserve({
    idempotencyKey: referenceId,
    route: "divergence-credits",
    estimatedCents: amountCents,
    hardMaximumCents: amountCents,
    sessionId: "active-session",
    monthId: new Date().toISOString().slice(0, 7),
    provider: policy.routeLabel,
    model: "selected-model",
    translator: "Divergence paid-route authorization",
    payerLabel: "Your Divergence credits",
    reasonLabel: label,
    freeAlternativeLabel: "Use the free route",
    priceVersion: "paid-route-policy-v1",
    explicitConsent: true,
    developerMode,
  });
  if (!reservation.ok || !reservation.reservation) {
    return {
      authorized: false,
      amount,
      referenceId,
      reason: reservation.reason ?? "insufficient-funds",
    };
  }

  // Persist the hard-maximum hold before any caller can dispatch paid work.
  await persistMoneyAuthority();
  const deducted = useAccountStore.getState().deductCredits(amount, label, referenceId);
  if (!deducted) {
    authority.release(reservation.reservation.id, `release-${referenceId}`, "Account ledger mirror rejected the charge.");
    await persistMoneyAuthority();
    return { authorized: false, amount, referenceId, reason: "insufficient-credits" };
  }

  authority.settle(reservation.reservation.id, amountCents, `settle-${referenceId}`);
  await persistMoneyAuthority();
  emitCreditDeducted(amount, referenceId);
  await saveNow();
  return { authorized: true, amount, referenceId };
}
