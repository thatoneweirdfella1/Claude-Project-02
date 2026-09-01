import { useEffect, useState } from "react";
import { AlertTriangle, Sparkles, X } from "lucide-react";
import {
  registerCostConfirmationHost,
  type CostConfirmationChoice,
  type CostConfirmationRequest,
} from "../../services/creditAuthorization";

export function CostConfirm() {
  const [request, setRequest] = useState<CostConfirmationRequest | null>(null);

  useEffect(() => registerCostConfirmationHost(), []);
  useEffect(() => {
    const onRequest = (event: Event) => {
      setRequest((event as CustomEvent<CostConfirmationRequest>).detail);
    };
    window.addEventListener("creditConfirmationRequested", onRequest);
    return () => window.removeEventListener("creditConfirmationRequested", onRequest);
  }, []);

  if (!request) return null;

  const finish = (choice: CostConfirmationChoice) => {
    request.resolve(choice);
    setRequest(null);
  };

  const blocked = request.blockedReason !== null || !request.affordable;
  const title = request.blockedReason === "paid-fallback-disabled"
    ? "Paid Fallback Is Off"
    : request.blockedReason === "request-cap-exceeded" || request.blockedReason === "invalid-request-cap"
      ? "Request Is Above Your Cap"
      : request.affordable
        ? "Confirm AI Cost"
        : "More Credits Needed";
  const note = request.blockedReason === "paid-fallback-disabled"
    ? "This automatic crossover stays blocked until you enable paid fallback. No paid AI request has been sent."
    : request.blockedReason === "request-cap-exceeded"
      ? "The estimate is higher than your hard maximum. No paid AI request has been sent."
      : request.blockedReason === "invalid-request-cap"
        ? "Set a valid maximum per request before using a paid route. No paid AI request has been sent."
        : request.affordable
          ? "Nothing is sent until you explicitly approve this charge."
          : "Your current plan or balance cannot cover this request. No paid AI request has been sent.";

  return (
    <div className="cost-confirm-backdrop" role="presentation">
      <section
        className="cost-confirm surface-smoked-glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cost-confirm-title"
      >
        <button
          type="button"
          className="cost-confirm__close"
          aria-label="Cancel"
          onClick={() => finish("cancelled")}
        >
          <X size={18} />
        </button>
        <div className={`cost-confirm__icon ${blocked ? "cost-confirm__icon--warning" : ""}`}>
          {blocked ? <AlertTriangle size={24} /> : <Sparkles size={24} />}
        </div>
        <h2 id="cost-confirm-title">{title}</h2>
        <p className="cost-confirm__label">{request.label}</p>
        <p className="cost-confirm__amount">Estimated: up to ${request.amount.toFixed(4)}</p>
        <div className="cost-confirm__note">
          <p><strong>Route:</strong> {request.policy.routeLabel}</p>
          <p><strong>Payer:</strong> {request.policy.payerLabel}</p>
          <p><strong>Hard maximum:</strong> ${Number.isFinite(request.policy.maximum) ? request.policy.maximum.toFixed(2) : "not set"}</p>
          <p><strong>Balance:</strong> {request.availableBalance === null ? "developer workspace" : `$${request.availableBalance.toFixed(4)}`}</p>
          <p><strong>Why:</strong> {request.policy.reasonLabel}</p>
          {request.policy.estimateLines?.length ? <div data-testid="cost-estimate-breakdown">
            <strong>Estimate assumptions ({request.policy.estimateLines.length} call{request.policy.estimateLines.length === 1 ? "" : "s"}):</strong>
            <ul>{request.policy.estimateLines.map((line) => <li key={line}>{line}</li>)}</ul>
          </div> : null}
          <p><strong>Free alternative:</strong> {request.policy.freeAlternativeLabel}</p>
          <p>{note}</p>
        </div>
        <div className="cost-confirm__actions">
          <button type="button" className="cost-confirm__secondary" onClick={() => finish("free-route")}>
            Use free route
          </button>
          {!blocked ? (
            <button type="button" className="cost-confirm__primary" onClick={() => finish("paid")} autoFocus>
              Continue for up to ${request.policy.maximum.toFixed(2)}
            </button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
