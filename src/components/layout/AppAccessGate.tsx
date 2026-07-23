import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { GlassCard } from "../primitives";
import {
  appAccessHeaders,
  clearStoredAppPassword,
  setStoredAppPassword,
} from "../../services/appAccessClient";

/* AppAccessGate (operator-directed, post-12.3) — the scoped replacement for
   Vercel's own Deployment Protection, which blocked the ENTIRE site
   (including the operator's own non-Vercel-authenticated access) rather
   than just the paid provider calls. This gate always lets the page's
   chrome render — the app never disappears behind a Vercel-branded wall —
   but withholds the real UI behind a password check that mirrors what
   every api/*.ts entry point independently enforces server-side
   (appAccess.ts): the server is the actual security boundary, this is only
   the UI's honest reflection of it. A network-level bypass of this
   component gains nothing — every provider call still 401s without the
   right header.

   FAILS CLOSED: any ambiguous outcome (network error, unexpected response
   shape) is treated as "still locked," never as "must be fine, let it
   through" — same posture as appAccess.ts's own server-side check. */

const ENDPOINT = "/api/verify-access";

type GateState = "checking" | "locked" | "unlocked";

interface VerifyResponse {
  requiresPassword?: boolean;
  ok?: boolean;
}

async function verify(fetchImpl: typeof fetch): Promise<boolean> {
  try {
    const res = await fetchImpl(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json", ...appAccessHeaders() },
      body: "{}",
    });
    if (!res.ok) return false;
    const body = (await res.json()) as VerifyResponse;
    // No password configured server-side (local dev, CI) — nothing to gate.
    if (body.requiresPassword === false) return true;
    return body.ok === true;
  } catch {
    return false;
  }
}

export interface AppAccessGateProps {
  children: ReactNode;
  /** Injectable for tests; defaults to the browser global. */
  fetchImpl?: typeof fetch;
}

export function AppAccessGate({ children, fetchImpl = fetch }: AppAccessGateProps) {
  const [state, setState] = useState<GateState>("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    verify(fetchImpl).then((unlocked) => {
      if (cancelled) return;
      setState(unlocked ? "unlocked" : "locked");
    });
    return () => {
      cancelled = true;
    };
    // Deliberately empty deps — this check runs once at mount, same as any
    // other "restore state before first paint" step (main.tsx's own
    // loadPersistedState). Re-verifying on every render would be wasteful
    // and pointless (the stored password doesn't change except through
    // handleSubmit below, which re-checks itself).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError(false);
    setStoredAppPassword(password);
    const unlocked = await verify(fetchImpl);
    setSubmitting(false);
    if (unlocked) {
      setState("unlocked");
      return;
    }
    clearStoredAppPassword();
    setError(true);
  }

  if (state === "unlocked") return <>{children}</>;

  if (state === "checking") {
    return <div className="app-access-gate" aria-hidden="true" />;
  }

  return (
    <div className="app-access-gate">
      <GlassCard className="app-access-gate__card">
        <form onSubmit={handleSubmit}>
          <p className="app-access-gate__title">This app is password protected</p>
          <label className="app-access-gate__label" htmlFor="app-access-password">
            Access password
          </label>
          <input
            id="app-access-password"
            type="password"
            className="app-access-gate__input"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
            autoComplete="current-password"
          />
          {error && (
            <p className="app-access-gate__error" role="alert">
              That password isn't correct.
            </p>
          )}
          <button
            type="submit"
            className="app-access-gate__submit"
            disabled={submitting || password.length === 0}
          >
            {submitting ? "Checking…" : "Unlock"}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
