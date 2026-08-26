import { useEffect, useState } from "react";
import { getAccountStatus, logOutWebAccount, resolveSyncConflict, syncNow, type AccountUser, type SyncResult } from "../../services/durableSync";
import { getSyncConflict } from "../../services/durableLayer4";
import type { LocalDataset } from "../../services/localDataset";

export function DurableAccountPanel() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [hasConflict, setHasConflict] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void Promise.all([getAccountStatus(), getSyncConflict<LocalDataset>()])
      .then(([status, conflict]) => {
        setConfigured(status.configured);
        setUser(status.user);
        setHasConflict(Boolean(conflict));
      })
      .catch(() => setConfigured(false));
  }, []);

  async function runSync() {
    setBusy(true);
    const next = await syncNow();
    setResult(next);
    setHasConflict(next.status === "conflict");
    setBusy(false);
  }

  async function resolve(choice: "local" | "remote" | "both") {
    setBusy(true);
    const next = await resolveSyncConflict(choice);
    setResult(next);
    setHasConflict(next.status === "conflict" || next.status === "failed");
    setBusy(false);
  }

  if (configured === null) return <p role="status">Checking account storage…</p>;
  if (!configured) return <p className="settings-section__note">Account sync is safely off until durable account storage is configured. Local recovery remains active.</p>;
  if (!user) return <p className="settings-section__note">Sign in to use cross-device storage.</p>;

  return <div className="settings-section" aria-labelledby="durable-account-title">
    <h3 id="durable-account-title">Durable account</h3>
    <div className="settings-item"><div className="settings-item__label">Signed in</div><div className="settings-item__value">{user.displayName} · {user.email}</div></div>
    <div className="screen__actions">
      <button type="button" onClick={() => void runSync()} disabled={busy}>{busy ? "Working…" : "Sync now"}</button>
      <button type="button" onClick={() => void logOutWebAccount().then(() => window.location.reload())}>Log out</button>
    </div>
    {result && <p role={result.status === "failed" ? "alert" : "status"}>{result.message}</p>}
    {hasConflict && <div className="workflow-dialog__summary" role="alert">
      <strong>Two recoverable copies are waiting</strong>
      <p>Nothing was overwritten. Choose which copy to keep, or preserve both.</p>
      <div className="screen__actions">
        <button type="button" onClick={() => void resolve("local")} disabled={busy}>Keep this device</button>
        <button type="button" onClick={() => void resolve("remote")} disabled={busy}>Keep account copy</button>
        <button type="button" onClick={() => void resolve("both")} disabled={busy}>Keep both</button>
      </div>
    </div>}
  </div>;
}
