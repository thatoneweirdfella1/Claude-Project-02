import { useAccountStore, canAffordCredits } from "../stores/accountStore";
import { emitCreditDeducted } from "./costTracking";
import { saveNow } from "./persistence";

export interface CostConfirmationRequest {
  id: string;
  amount: number;
  label: string;
  developerMode: boolean;
  affordable: boolean;
  resolve: (confirmed: boolean) => void;
}

export interface CreditAuthorizationResult {
  authorized: boolean;
  amount: number;
  referenceId: string;
  reason?: "cancelled" | "insufficient-credits" | "invalid-estimate";
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
): Promise<boolean> {
  if (mountedConfirmationHosts === 0) {
    return Promise.resolve(
      typeof window.confirm === "function"
        ? window.confirm(`This action is estimated to cost $${detail.amount.toFixed(4)} credits. Continue?`)
        : false,
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

/** Confirm and reserve an estimated amount before any provider request. The
    persisted write completes first, so a crash immediately after dispatch
    cannot restore already-spent credit and replay the same call for free. */
export async function authorizeEstimatedCost(
  amount: number,
  label: string,
): Promise<CreditAuthorizationResult> {
  const referenceId = `authorization-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  if (!Number.isFinite(amount) || amount <= 0) {
    return { authorized: false, amount, referenceId, reason: "invalid-estimate" };
  }

  const state = useAccountStore.getState();
  const developerMode = state.appMode === "developer";
  const affordable = canAffordCredits(amount);
  const confirmed = await requestConfirmation({
    id: referenceId,
    amount,
    label,
    developerMode,
    affordable,
  });

  if (!confirmed) {
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

  if (!developerMode) {
    const deducted = useAccountStore
      .getState()
      .deductCredits(amount, label, referenceId);
    if (!deducted) {
      return { authorized: false, amount, referenceId, reason: "insufficient-credits" };
    }
    emitCreditDeducted(amount, referenceId);
    await saveNow();
  }
  return { authorized: true, amount, referenceId };
}
