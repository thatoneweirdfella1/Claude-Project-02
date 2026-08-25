import { useAccountStore } from "../stores/accountStore";
import type { SubscriptionTier } from "../stores/types";
import { saveNow } from "./persistence";

export type PurchasableTier = Exclude<SubscriptionTier, "pro-plus">;

export interface TierOffer {
  id: PurchasableTier;
  name: string;
  monthlyPrice: number;
  usableCredits: number;
  description: string;
}

export const TIER_OFFERS: TierOffer[] = [
  { id: "free", name: "Free", monthlyPrice: 0, usableCredits: 0, description: "Interface and local tools; no paid AI calls." },
  { id: "plus", name: "Plus", monthlyPrice: 15, usableCredits: 15, description: "Subscription features and $15 explicit managed credits." },
  { id: "pro", name: "Pro", monthlyPrice: 75, usableCredits: 75, description: "Subscription features and $75 explicit managed credits." },
  { id: "insane", name: "Insane", monthlyPrice: 200, usableCredits: 200, description: "Subscription features and $200 explicit managed credits." },
];

export const TOP_UP_AMOUNTS = [5, 10, 25, 50] as const;

export function usableCreditsForPayment(paidAmount: number): number {
  return Math.round(paidAmount * 100) / 100;
}

/** Legacy durable request interface retained for compatibility. Layer 5's
    active controls use DeterministicMoneyAuthority; no live provider or
    Developer-mode approval is enabled by this module. */
export async function requestSubscriptionPurchase(tier: PurchasableTier): Promise<string> {
  const offer = TIER_OFFERS.find((candidate) => candidate.id === tier);
  if (!offer || offer.monthlyPrice <= 0) throw new Error("That tier does not require purchase.");
  const id = useAccountStore.getState().requestManualPayment({
    kind: "subscription",
    paidAmount: offer.monthlyPrice,
    creditAmount: offer.usableCredits,
    tier,
  });
  await saveNow();
  return id;
}

export async function requestCreditTopUp(paidAmount: number): Promise<string> {
  if (!TOP_UP_AMOUNTS.includes(paidAmount as (typeof TOP_UP_AMOUNTS)[number])) {
    throw new Error("Unsupported top-up amount.");
  }
  const id = useAccountStore.getState().requestManualPayment({
    kind: "top-up",
    paidAmount,
    creditAmount: usableCreditsForPayment(paidAmount),
  });
  await saveNow();
  return id;
}
