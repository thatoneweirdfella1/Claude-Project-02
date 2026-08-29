/** Operator-only testing surface. It is controlled by the persisted
    User/Developer mode switch so it remains available in packaged builds,
    not by Vite's compile-time DEV flag. */

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, FlaskConical } from "lucide-react";
import { useAccountStore } from "../../stores/accountStore";
import { saveNow } from "../../services/persistence";
import type { SubscriptionTier } from "../../stores/types";
import { desktopBridge, type DesktopUser } from "../../services/desktopBridge";
import { loadPersistedState } from "../../services/persistence";

export function DevAdminPanel() {
  const appMode = useAccountStore((state) => state.appMode);
  const plan = useAccountStore((state) => state.plan);
  const balance = useAccountStore((state) => state.creditBalance);
  const requests = useAccountStore((state) => state.manualPaymentRequests);
  const runs = useAccountStore((state) => state.optimizationRuns);
  const setPlan = useAccountStore((state) => state.setPlan);
  const addCredits = useAccountStore((state) => state.addCredits);
  const resolvePayment = useAccountStore((state) => state.resolveManualPayment);
  const [open, setOpen] = useState(false);
  const [adjustment, setAdjustment] = useState("10");
  const [desktopUsers, setDesktopUsers] = useState<DesktopUser[]>([]);
  const desktop = desktopBridge();

  const refreshUsers = async () => {
    if (!desktop) return;
    try { setDesktopUsers(await desktop.admin.listUsers()); } catch { setDesktopUsers([]); }
  };
  useEffect(() => { if (open) void refreshUsers(); }, [open]);

  if (appMode !== "developer") return null;
  const pending = requests.filter((request) => request.status === "pending");
  const tiers: SubscriptionTier[] = ["free", "plus", "pro", "insane"];

  const persist = () => void saveNow();
  const applyAdjustment = () => {
    const amount = Number(adjustment);
    if (addCredits(amount, "Developer credit adjustment", "admin-adjustment")) persist();
  };
  const decide = (id: string, approved: boolean) => {
    resolvePayment(id, approved);
    persist();
  };
  const adjustDesktop = async (userId: string, amount: number) => {
    if (!desktop) return;
    await desktop.admin.adjustCredits(userId, amount, "Developer Lab adjustment");
    await loadPersistedState();
    await refreshUsers();
  };
  const decideDesktop = async (userId: string, requestId: string, approved: boolean) => {
    if (!desktop) return;
    await desktop.admin.resolvePayment(userId, requestId, approved);
    await loadPersistedState();
    await refreshUsers();
  };

  return (
    <aside className={`dev-admin ${open ? "dev-admin--open" : ""}`} aria-label="Developer testing controls">
      <button type="button" className="dev-admin__trigger" onClick={() => setOpen((value) => !value)}>
        <FlaskConical size={16} /> Developer Lab
        <span>{pending.length > 0 ? `${pending.length} pending` : "Unlimited credits"}</span>
        {open ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
      </button>
      {open && (
        <div className="dev-admin__body surface-smoked-glass">
          <div className="dev-admin__metric"><span>Stored user balance</span><strong>${balance.toFixed(2)}</strong></div>
          <div className="dev-admin__metric"><span>Optimization runs</span><strong>{runs.length}</strong></div>

          <label>Simulated subscription
            <select value={plan} onChange={(event) => { setPlan(event.target.value as SubscriptionTier); persist(); }}>
              {tiers.map((tier) => <option key={tier} value={tier}>{tier}</option>)}
            </select>
          </label>
          <label>Credit adjustment
            <div className="dev-admin__inline">
              <input type="number" min="0.01" step="0.01" value={adjustment} onChange={(event) => setAdjustment(event.target.value)} />
              <button type="button" onClick={applyAdjustment}>Add</button>
            </div>
          </label>

          {!desktop && pending.length > 0 && (
            <div className="dev-admin__payments">
              <strong>Manual payments</strong>
              {pending.map((request) => (
                <div key={request.id}>
                  <span>{request.kind} · paid ${request.paidAmount} → ${request.creditAmount} credits</span>
                  <button type="button" onClick={() => decide(request.id, true)}>Approve</button>
                  <button type="button" onClick={() => decide(request.id, false)}>Reject</button>
                </div>
              ))}
            </div>
          )}
          {desktopUsers.length > 0 && (
            <div className="dev-admin__users">
              <strong>Local users &amp; credits</strong>
              {desktopUsers.map((user) => (
                <div key={user.id} className="dev-admin__user">
                  <div><strong>{user.displayName}</strong><small>{user.email} · {user.plan ?? "free"} · ${(user.creditBalance ?? 0).toFixed(2)}</small></div>
                  <button type="button" onClick={() => void adjustDesktop(user.id, 5)}>+$5</button>
                  {(user.pendingPayments ?? []).map((payment) => (
                    <div key={payment.id} className="dev-admin__user-payment">
                      <span>{payment.kind}: ${payment.paidAmount} → ${payment.creditAmount}</span>
                      <button type="button" onClick={() => void decideDesktop(user.id, payment.id, true)}>Approve</button>
                      <button type="button" onClick={() => void decideDesktop(user.id, payment.id, false)}>Reject</button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          <p className="dev-admin__note">Use this lab to test pricing, credit exhaustion, purchase approval, and optimization rollback before public release.</p>
        </div>
      )}
    </aside>
  );
}
