import { useState } from "react";
import { Check, Coins, Crown, ReceiptText, ShieldCheck } from "lucide-react";
import { TIER_OFFERS, TOP_UP_AMOUNTS, usableCreditsForPayment } from "../../services/payment";
import {
  type MoneyPreflightRequest,
  type SandboxCheckout,
} from "../../services/moneySafety";
import { getMoneyAuthority, persistMoneyAuthority } from "../../services/moneyRuntime";
import { useAccountStore } from "../../stores/accountStore";

function dollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function labRequest(idempotencyKey: string): MoneyPreflightRequest {
  const monthId = new Date().toISOString().slice(0, 7);
  return {
    idempotencyKey,
    route: "divergence-credits",
    estimatedCents: 4,
    hardMaximumCents: 5,
    sessionId: "layer-5-sandbox-session",
    monthId,
    provider: "Deterministic sandbox",
    model: "sandbox-model-v1",
    translator: "Layer 5 money-safety lab",
    payerLabel: "Your Divergence credits",
    reasonLabel: "Verify reservation, reconciliation, release, and receipt behavior",
    freeAlternativeLabel: "Keep using the local no-charge workflow",
    priceVersion: "sandbox-v1",
    explicitConsent: true,
  };
}

export function InteractivePlanControls() {
  const persistedPlan = useAccountStore((state) => state.plan);
  const authority = getMoneyAuthority();
  const [snapshot, setSnapshot] = useState(() => authority.snapshot());
  const [pendingCheckout, setPendingCheckout] = useState<SandboxCheckout | null>(null);
  const [status, setStatus] = useState("Money automation is off. No payment or provider call has been made.");
  const [operation, setOperation] = useState(0);
  const preflight = authority.preflight(labRequest(`preflight-${operation}`));

  function refresh(message: string): void {
    setSnapshot(authority.snapshot());
    setStatus(message);
    void persistMoneyAuthority();
  }

  function createCheckout(input: {
    kind: "credit-top-up" | "subscription";
    paidAmountCents: number;
    creditAmountCents: number;
    tier?: string;
  }): void {
    const nextOperation = operation + 1;
    setOperation(nextOperation);
    const checkout = authority.createSandboxCheckout({
      idempotencyKey: `checkout-${nextOperation}`,
      ...input,
    });
    setPendingCheckout(checkout);
    refresh("Sandbox checkout is pending. The balance is unchanged until the verified callback step.");
  }

  function completeCheckout(): void {
    if (!pendingCheckout) return;
    const result = authority.applyVerifiedSandboxCallback(
      pendingCheckout.id,
      `callback-${pendingCheckout.id}`,
      pendingCheckout.verificationToken,
    );
    setPendingCheckout(null);
    refresh(result.ok
      ? "Verified sandbox callback applied exactly once. No real payment was processed."
      : "Sandbox callback failed closed; no entitlement or credit was granted.");
  }

  async function runUsageDemo(): Promise<void> {
    const nextOperation = operation + 1;
    setOperation(nextOperation);
    const reserved = await authority.reserve(labRequest(`usage-${nextOperation}`));
    if (!reserved.ok || !reserved.reservation) {
      refresh(`Usage blocked before execution: ${reserved.reason ?? "unknown reason"}. Use the free route or add sandbox credits.`);
      return;
    }
    const receipt = authority.settle(reserved.reservation.id, 4, `settlement-${reserved.reservation.id}`);
    refresh(receipt
      ? "Sandbox usage settled at $0.04 and released $0.01 from the hard-maximum reservation."
      : "Settlement failed closed; no second execution was attempted.");
  }

  return <section className="settings-section subscription-ui" aria-labelledby="interactive-plan-title">
    <div className="subscription-ui__heading">
      <div>
        <h3 id="interactive-plan-title">Subscription &amp; Money Safety</h3>
        <p className="settings-section__note">Deterministic sandbox only. Live payment providers, automatic top-up, and external AI billing remain disabled.</p>
      </div>
      <div className="subscription-ui__current"><Crown size={16} /> {snapshot.subscriptionTier === "free" ? (persistedPlan === "pro-plus" ? "Insane" : persistedPlan) : snapshot.subscriptionTier}</div>
    </div>

    <div className="settings-item">
      <div className="settings-item__label">Available Divergence credits</div>
      <div className="settings-item__value">{dollars(snapshot.balanceCents)}</div>
    </div>
    <div className="settings-item">
      <div className="settings-item__label">Managed allowance</div>
      <div className="settings-item__value">{dollars(snapshot.allowanceCents)} · separately metered</div>
    </div>
    <div className="settings-item">
      <div className="settings-item__label">Hard caps</div>
      <div className="settings-item__value">{dollars(snapshot.caps.requestCents)} request · {dollars(snapshot.caps.sessionCents)} session · {dollars(snapshot.caps.monthCents)} month</div>
    </div>
    <div className="settings-item">
      <div className="settings-item__label">Automatic top-up</div>
      <div className="settings-item__value">Off · fails closed without a verified payment method</div>
    </div>

    <div className="top-up-panel">
      <div><ShieldCheck size={17} /><strong>Paid-route controls</strong></div>
      <div className="top-up-panel__buttons">
        <button type="button" onClick={() => { authority.setManagedApiEnabled(!snapshot.managedApiEnabled); refresh(`Managed API sandbox ${snapshot.managedApiEnabled ? "disabled" : "enabled"}.`); }}>
          Managed API: {snapshot.managedApiEnabled ? "On" : "Off"}
        </button>
        <button type="button" onClick={() => { authority.setPaidFallbackEnabled(!snapshot.paidFallbackEnabled); refresh(`Paid fallback ${snapshot.paidFallbackEnabled ? "disabled" : "enabled"}.`); }}>
          Paid fallback: {snapshot.paidFallbackEnabled ? "On" : "Off"}
        </button>
      </div>
      <p className="settings-section__note">These controls are saved locally and survive reloads. They cannot enable a live provider or move real funds.</p>
    </div>

    <div className="cost-confirm__note" aria-label="Cost preflight">
      <p><strong>Route:</strong> Deterministic sandbox · Divergence credits</p>
      <p><strong>Payer:</strong> {preflight.payerLabel}</p>
      <p><strong>Estimate:</strong> $0.04 · <strong>hard maximum:</strong> $0.05</p>
      <p><strong>Affordability:</strong> {preflight.allowed ? "Ready for explicit confirmation" : `Blocked — ${preflight.reason}`}</p>
      <p><strong>Free alternative:</strong> {preflight.freeAlternativeLabel}</p>
      <button type="button" className="settings-btn" onClick={() => void runUsageDemo()}>
        Confirm and run $0.05 sandbox maximum
      </button>
    </div>

    <div className="tier-grid">
      {TIER_OFFERS.map((offer) => {
        const active = snapshot.subscriptionTier === offer.id || (snapshot.subscriptionTier === "free" && (persistedPlan === offer.id || (persistedPlan === "pro-plus" && offer.id === "insane")));
        return <article key={offer.id} className={`tier-card ${active ? "tier-card--active" : ""}`}>
          <div className="tier-card__title"><strong>{offer.name}</strong>{active && <span><Check size={13} /> Current</span>}</div>
          <p className="tier-card__price">${offer.monthlyPrice}<small>/month</small></p>
          <p>{dollars(Math.round(offer.usableCredits * 100))} explicit managed credits</p>
          <small>{offer.description}</small>
          {offer.monthlyPrice > 0 && <button type="button" onClick={() => createCheckout({
            kind: "subscription",
            paidAmountCents: offer.monthlyPrice * 100,
            creditAmountCents: Math.round(offer.usableCredits * 100),
            tier: offer.id,
          })}>Start {offer.name} sandbox checkout</button>}
        </article>;
      })}
    </div>

    <div className="top-up-panel">
      <div><Coins size={17} /><strong>One-time sandbox credits · $1 paid = $1 credit</strong></div>
      <div className="top-up-panel__buttons">
        {TOP_UP_AMOUNTS.map((amount) => <button key={amount} type="button" onClick={() => createCheckout({
          kind: "credit-top-up",
          paidAmountCents: amount * 100,
          creditAmountCents: Math.round(usableCreditsForPayment(amount) * 100),
        })}>Add ${amount} in sandbox</button>)}
      </div>
    </div>

    <p role="status" className="settings-section__note">{status}</p>

    <div className="settings-section">
      <h3><ReceiptText size={17} aria-hidden="true" /> Receipts &amp; immutable events</h3>
      {snapshot.receipts.length === 0 && snapshot.ledger.length === 0
        ? <p className="settings-section__note">No sandbox money event yet.</p>
        : <>
          {snapshot.receipts.slice().reverse().slice(0, 5).map((receipt) => <div className="settings-item" key={receipt.id}>
            <div className="settings-item__label">{receipt.status} · {receipt.provider} · {receipt.model}</div>
            <div className="settings-item__value">actual {receipt.actualCents === null ? "pending" : dollars(receipt.actualCents)} · released {dollars(receipt.releasedCents)} · balance {dollars(receipt.balanceAfterCents)}</div>
          </div>)}
          <p className="settings-section__note">{snapshot.ledger.length} immutable sandbox ledger event{snapshot.ledger.length === 1 ? "" : "s"}. Subscription entitlement and credits are recorded separately.</p>
        </>}
    </div>

    {pendingCheckout && <div className="workflow-dialog" role="dialog" aria-modal="true" aria-labelledby="payment-preview-title">
      <div className="workflow-dialog__card surface-smoked-glass">
        <header>
          <h2 id="payment-preview-title">Sandbox checkout pending</h2>
          <p>{pendingCheckout.kind === "subscription" ? `${pendingCheckout.tier} plan` : "credit top-up"} · {dollars(pendingCheckout.paidAmountCents)} simulated payment · {dollars(pendingCheckout.creditAmountCents)} credits</p>
          <p>No balance or entitlement changes until the verified sandbox callback below. No real payment can occur.</p>
        </header>
        <footer className="workflow-dialog__actions">
          <button type="button" onClick={() => { setPendingCheckout(null); refresh("Sandbox checkout cancelled. No balance changed."); }}>Cancel</button>
          <button type="button" autoFocus className="primary" onClick={completeCheckout}>Apply verified sandbox callback</button>
        </footer>
      </div>
    </div>}
  </section>;
}

