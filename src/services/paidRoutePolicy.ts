export type PaidRouteBlockReason =
  | "invalid-estimate"
  | "invalid-request-cap"
  | "paid-fallback-disabled"
  | "request-cap-exceeded";

export interface PaidRoutePolicy {
  maximum: number;
  paidFallbackEnabled: boolean;
  requiresPaidFallback: boolean;
  routeLabel: string;
  payerLabel: string;
  reasonLabel: string;
  freeAlternativeLabel: string;
}

/** Pure, fail-closed policy check shared by every paid provider entry point. */
export function evaluatePaidRoutePolicy(
  amount: number,
  policy: PaidRoutePolicy,
): PaidRouteBlockReason | null {
  if (!Number.isFinite(amount) || amount <= 0) return "invalid-estimate";
  if (!Number.isFinite(policy.maximum) || policy.maximum < 0) {
    return "invalid-request-cap";
  }
  if (policy.requiresPaidFallback && !policy.paidFallbackEnabled) {
    return "paid-fallback-disabled";
  }
  if (amount > policy.maximum + Number.EPSILON) {
    return "request-cap-exceeded";
  }
  return null;
}
