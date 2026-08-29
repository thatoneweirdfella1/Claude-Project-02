import { useState } from "react";
import { Check, Coins, Crown } from "lucide-react";
import { useAccountStore } from "../../stores/accountStore";
import {
  requestCreditTopUp,
  requestSubscriptionPurchase,
  TIER_OFFERS,
  TOP_UP_AMOUNTS,
  usableCreditsForPayment,
} from "../../services/payment";

export function SubscriptionUI() {
  const plan = useAccountStore((state) => state.plan);
  const billingDate = useAccountStore((state) => state.billingDate);
  const paymentRequests = useAccountStore((state) => state.manualPaymentRequests);
  const pending = paymentRequests.filter((request) => request.status === "pending");
  const [message, setMessage] = useState("");

  const requestTier = async (tier: Parameters<typeof requestSubscriptionPurchase>[0]) => {
    const id = await requestSubscriptionPurchase(tier);
    setMessage(`Payment request ${id.slice(-7)} is ready for operator approval.`);
  };
  const requestTopUp = async (amount: number) => {
    const id = await requestCreditTopUp(amount);
    setMessage(`Top-up request ${id.slice(-7)} is ready for operator approval.`);
  };

  return (
    <section className="settings-section subscription-ui" aria-labelledby="subscription-title">
      <div className="subscription-ui__heading">
        <div>
          <h3 id="subscription-title">Subscription &amp; Credits</h3>
          <p className="settings-section__note">Manual test payments are approved from Developer Mode.</p>
        </div>
        <div className="subscription-ui__current">
          <Crown size={16} /> {plan === "pro-plus" ? "Insane" : plan}
          {billingDate > 0 && <small>Renews {new Date(billingDate).toLocaleDateString()}</small>}
        </div>
      </div>

      <div className="tier-grid">
        {TIER_OFFERS.map((offer) => {
          const active = plan === offer.id || (plan === "pro-plus" && offer.id === "insane");
          return (
            <article key={offer.id} className={`tier-card ${active ? "tier-card--active" : ""}`}>
              <div className="tier-card__title">
                <strong>{offer.name}</strong>
                {active && <span><Check size={13} /> Current</span>}
              </div>
              <p className="tier-card__price">${offer.monthlyPrice}<small>/month</small></p>
              <p>${offer.usableCredits.toFixed(2)} usable credits</p>
              <small>{offer.description}</small>
              {offer.monthlyPrice > 0 && (
                <button type="button" disabled={active} onClick={() => void requestTier(offer.id)}>
                  {active ? "Active" : "Purchase"}
                </button>
              )}
            </article>
          );
        })}
      </div>

      <div className="top-up-panel">
        <div><Coins size={17} /><strong>Buy Credits</strong></div>
        <div className="top-up-panel__buttons">
          {TOP_UP_AMOUNTS.map((amount) => (
            <button
              key={amount}
              type="button"
              disabled={plan === "free"}
              title={plan === "free" ? "Choose Plus, Pro, or Insane before adding API credits." : undefined}
              onClick={() => void requestTopUp(amount)}
            >
              Pay ${amount} <small>Get ${usableCreditsForPayment(amount).toFixed(2)}</small>
            </button>
          ))}
        </div>
      </div>
      {pending.length > 0 && <p className="subscription-ui__pending">{pending.length} payment request{pending.length === 1 ? "" : "s"} awaiting approval.</p>}
      {message && <p className="subscription-ui__message" role="status">{message}</p>}
    </section>
  );
}
