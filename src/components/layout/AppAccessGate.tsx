import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { GlassCard } from "../primitives";
import {
  clearStoredAppPassword,
  getStoredAppPassword,
  setStoredAppPassword,
  verifyAppAccess,
} from "../../services/appAccessClient";

export interface AppAccessGateProps {
  children: ReactNode;
}

type GateState = "checking" | "locked" | "unlocked";

export function AppAccessGate({ children }: AppAccessGateProps) {
  const [gateState, setGateState] = useState<GateState>("checking");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const storedPassword = getStoredAppPassword();

    verifyAppAccess(storedPassword)
      .then((result) => {
        if (!active) return;
        if (!result.requiresPassword || result.ok) {
          setGateState("unlocked");
          return;
        }
        clearStoredAppPassword();
        setGateState("locked");
      })
      .catch(() => {
        if (!active) return;
        setError("Could not verify access. Check the deployment and try again.");
        setGateState("locked");
      });

    return () => {
      active = false;
    };
  }, []);

  if (gateState === "unlocked") return <>{children}</>;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const result = await verifyAppAccess(password);
      if (!result.requiresPassword || result.ok) {
        if (result.requiresPassword) setStoredAppPassword(password);
        setGateState("unlocked");
      } else {
        clearStoredAppPassword();
        setError("That password did not match.");
      }
    } catch {
      setError("Could not verify access. Check the deployment and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (gateState === "checking") {
    return (
      <div className="app-access-gate" role="status" aria-live="polite">
        <GlassCard className="app-access-gate__card">
          <p className="app-access-gate__title">Checking access…</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="app-access-gate">
      <GlassCard className="app-access-gate__card">
        <form onSubmit={(event) => void submit(event)}>
          <h1 className="app-access-gate__title">Enter app password</h1>
          <label className="app-access-gate__label" htmlFor="app-access-password">
            Password
          </label>
          <input
            id="app-access-password"
            className="app-access-gate__input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            autoFocus
            required
          />
          {error && <p className="app-access-gate__error" role="alert">{error}</p>}
          <button className="app-access-gate__submit" type="submit" disabled={submitting || !password}>
            {submitting ? "Checking…" : "Continue"}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
