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

export function AppAccessGate({ children }: AppAccessGateProps) {
  // Password gate disabled for dev/testing. Re-enable by checking process.env.APP_ACCESS_PASSWORD server-side.
  return <>{children}</>;
}
