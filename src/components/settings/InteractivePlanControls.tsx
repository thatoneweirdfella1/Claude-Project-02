import { useState } from "react";
import { Check, Coins, Crown } from "lucide-react";
import { TIER_OFFERS, TOP_UP_AMOUNTS, usableCreditsForPayment } from "../../services/payment";
import { useAccountStore } from "../../stores/accountStore";

export function InteractivePlanControls() {
  const plan = useAccountStore((state) => state.plan);
  const [preview, setPreview] = useState<string | null>(null);

  return <section className="settings-section subscription-ui" aria-labelledby="interactive-plan-title">
    <div className="subscription-ui__heading">
      <div><h3 id="interactive-plan-title">Subscription &amp; Credits</h3><p className="settings-section__note">Preview plan and credit choices safely. Payment creation is disabled at this layer.</p></div>
      <div className="subscription-ui__current"><Crown size={16} /> {plan === "pro-plus" ? "Insane" : plan}</div>
    </div>
    <div className="tier-grid">
      {TIER_OFFERS.map((offer) => {
        const active = plan === offer.id || (plan === "pro-plus" && offer.id === "insane");
        return <article key={offer.id} className={`tier-card ${active ? "tier-card--active" : ""}`}>
          <div className="tier-card__title"><strong>{offer.name}</strong>{active && <span><Check size={13} /> Current</span>}</div>
          <p className="tier-card__price">${offer.monthlyPrice}<small>/month</small></p>
          <p>${offer.usableCredits.toFixed(2)} usable credits</p>
          <small>{offer.description}</small>
          {!active && offer.monthlyPrice > 0 && <button type="button" onClick={() => setPreview(`${offer.name} at $${offer.monthlyPrice}/month`)}>Preview {offer.name}</button>}
        </article>;
      })}
    </div>
    <div className="top-up-panel"><div><Coins size={17} /><strong>Credit top-up previews</strong></div><div className="top-up-panel__buttons">
      {TOP_UP_AMOUNTS.map((amount) => <button key={amount} type="button" onClick={() => setPreview(`$${amount} top-up for $${usableCreditsForPayment(amount).toFixed(2)} usable credits`)}>Preview ${amount}</button>)}
    </div></div>
    {preview && <div className="workflow-dialog" role="dialog" aria-modal="true" aria-labelledby="payment-preview-title"><div className="workflow-dialog__card surface-smoked-glass"><header><h2 id="payment-preview-title">Payment preview</h2><p>{preview}</p><p>No checkout was created, no payment was submitted, and no balance changed.</p></header><footer className="workflow-dialog__actions"><button type="button" autoFocus className="primary" onClick={() => setPreview(null)}>Close preview</button></footer></div></div>}
  </section>;
}
