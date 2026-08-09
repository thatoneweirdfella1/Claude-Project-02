import { useEffect, useState } from "react";
import { AlertTriangle, Sparkles, X } from "lucide-react";
import {
  registerCostConfirmationHost,
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

  const finish = (confirmed: boolean) => {
    request.resolve(confirmed);
    setRequest(null);
  };

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
          onClick={() => finish(false)}
        >
          <X size={18} />
        </button>
        <div className={`cost-confirm__icon ${request.affordable ? "" : "cost-confirm__icon--warning"}`}>
          {request.affordable ? <Sparkles size={24} /> : <AlertTriangle size={24} />}
        </div>
        <h2 id="cost-confirm-title">
          {request.affordable ? "Confirm AI Cost" : "More Credits Needed"}
        </h2>
        <p className="cost-confirm__label">{request.label}</p>
        <p className="cost-confirm__amount">${request.amount.toFixed(4)} credits</p>
        <p className="cost-confirm__note">
          {request.developerMode
            ? "Developer Mode is unlimited. This estimate is shown so you can test the customer experience; no credits will be deducted."
            : request.affordable
              ? "This estimate covers the complete action before any AI request begins."
              : "This tier cannot cover the action (Free is UI-only, or the balance is too low), so no AI request will be sent."}
        </p>
        <div className="cost-confirm__actions">
          <button type="button" className="cost-confirm__secondary" onClick={() => finish(false)}>
            {request.affordable ? "Cancel" : "Close"}
          </button>
          {request.affordable && (
            <button type="button" className="cost-confirm__primary" onClick={() => finish(true)} autoFocus>
              Continue
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
