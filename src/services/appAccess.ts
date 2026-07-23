/* App-level access gate (operator-directed, post-12.3) — protects every
   paid-provider proxy endpoint from anonymous use. Vercel's own Deployment
   Protection was blocking the ENTIRE site (including the operator's own
   non-Vercel-authenticated access), which is why it looked "broken" rather
   than "protected" — this replaces that all-or-nothing page wall with a
   narrower one: the app's pages always render, but every api/*.ts entry
   point refuses to call out to a provider unless the request carries the
   correct shared password.

   FAILS CLOSED, deliberately, in every ambiguous case: no configured
   password, no header, or a wrong header all return false. A misconfigured
   server (env var never set) means the app is unusable rather than silently
   open — the safe direction to fail for something that gates real billed
   API spend. */

export const APP_PASSWORD_HEADER = "x-app-password";

/** Constant-time-ish comparison — this doesn't need to be cryptographically
    rigorous (it's a shared household/personal password, not a login system),
    but a naive `===` on attacker-controlled input costs nothing extra to
    avoid, so there's no reason to take the naive version. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** True only when a password IS configured server-side (via
    APP_ACCESS_PASSWORD) AND the request's `x-app-password` header matches it
    exactly. Called first, before any other work, by every api/*.ts entry
    point that reaches a provider. */
export function isAuthorized(request: Request, expectedPassword: string | undefined): boolean {
  if (!expectedPassword) return false;
  const provided = request.headers.get(APP_PASSWORD_HEADER);
  if (!provided) return false;
  return safeEqual(provided, expectedPassword);
}

export function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}

export interface AccessCheckResult {
  /** Whether APP_ACCESS_PASSWORD is configured server-side at all. When
      false, the app doesn't gate itself (matches this app's behavior before
      this feature existed — local dev and CI never set this var). */
  requiresPassword: boolean;
  /** True when no password is required, OR one is required and the request
      supplied the correct one. False only when a password is required and
      the request didn't supply a matching one. */
  ok: boolean;
}

/** The logic behind api/verify-access.ts — deliberately reachable with no
    password at all (the client calls this FIRST, before it has one, to find
    out whether it needs to ask), unlike every provider proxy endpoint below
    which refuse outright. Doesn't touch a provider, costs nothing to call. */
export function checkAccess(request: Request, expectedPassword: string | undefined): AccessCheckResult {
  if (!expectedPassword) return { requiresPassword: false, ok: true };
  return { requiresPassword: true, ok: isAuthorized(request, expectedPassword) };
}
