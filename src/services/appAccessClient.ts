/* Client-side half of the app access gate (see appAccess.ts for the
   server-side check this pairs with). Stores the user's entered password in
   localStorage — never sent anywhere except this app's own /api/* endpoints,
   as the one extra header every provider-call client already attaches. */

import { APP_PASSWORD_HEADER } from "./appAccess";

const STORAGE_KEY = "divergence-app-access-password";

/** localStorage can throw (private browsing, storage disabled, quota) —
    every call here is wrapped so a storage failure degrades to "not
    remembered" rather than crashing the app. */
export function getStoredAppPassword(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setStoredAppPassword(password: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, password);
  } catch {
    // Not remembered across reloads, but the in-memory gate state still
    // unlocks for the rest of this session — see AppAccessGate.tsx.
  }
}

export function clearStoredAppPassword(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do — see getStoredAppPassword's own comment.
  }
}

/** Every client that calls this app's own /api/* endpoints (proxyClient.ts,
    debate/client.ts, urlContext.ts) spreads this into its request headers.
    Empty when nothing's stored yet — the server's isAuthorized() rejects an
    empty/missing header the same as a wrong one, so this never needs its own
    "do I have a password" branch at the call site. */
export function appAccessHeaders(): Record<string, string> {
  const password = getStoredAppPassword();
  return password ? { [APP_PASSWORD_HEADER]: password } : {};
}
