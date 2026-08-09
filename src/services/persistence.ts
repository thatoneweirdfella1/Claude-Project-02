import { openDB, type IDBPDatabase } from "idb";
import { useAccountStore, ACCOUNT_PERSISTED_KEYS } from "../stores/accountStore";
import { useSessionStore, SESSION_PERSISTED_KEYS } from "../stores/sessionStore";
import type { AccountState, SessionState } from "../stores/types";
import { desktopBridge } from "./desktopBridge";

/* persistence.ts — autosave and restore (CANON "STORES AND PERSISTENCE":
   "Autosave writes both to IndexedDB every 5 seconds. On load, both
   rehydrate so the user returns exactly where they were."). Uses idb
   (STACK.md's chosen wrapper). Writes both stores in ONE IndexedDB
   transaction so each autosave tick is atomic: a refresh/crash mid-write
   aborts the transaction and the last COMPLETE write remains — no partial
   or corrupt state. Reads/writes are async and never block the UI. */

const DB_NAME = "divergence-ai";
const DB_VERSION = 1;
const STORE = "state";
const SESSION_KEY = "session";
const ACCOUNT_KEY = "account";

/** CANON locked decision 5: autosave every 5 seconds. */
export const AUTOSAVE_INTERVAL_MS = 5000;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      },
    });
  }
  return dbPromise;
}

function pick<T>(state: T, keys: (keyof T)[]): Partial<T> {
  const out: Partial<T> = {};
  for (const key of keys) out[key] = state[key];
  return out;
}

/** Write both stores to IndexedDB in a single atomic transaction. Safe to
    call concurrently with a refresh: the transaction commits fully or not
    at all, so the last complete write always wins. */
export async function saveNow(): Promise<void> {
  const sessionData = pick(useSessionStore.getState(), SESSION_PERSISTED_KEYS);
  const accountData = pick(useAccountStore.getState(), ACCOUNT_PERSISTED_KEYS);

  const desktop = desktopBridge();
  if (desktop) {
    await desktop.state.save({
      session: sessionData as Record<string, unknown>,
      account: accountData as Record<string, unknown>,
    });
    return;
  }

  const db = await getDB();

  const tx = db.transaction(STORE, "readwrite");
  tx.store.put(sessionData, SESSION_KEY);
  tx.store.put(accountData, ACCOUNT_KEY);
  await tx.done;
}

/** Read both persisted records and rehydrate the stores. Call once on
    startup, before or as the app mounts, so the user returns exactly
    where they were. Missing records leave the store at its defaults. */
export async function loadPersistedState(): Promise<{
  hadSession: boolean;
  hadAccount: boolean;
}> {
  const desktop = desktopBridge();
  if (desktop) {
    const desktopData = await desktop.state.load();
    if (desktopData?.session) {
      useSessionStore.getState().hydrate(desktopData.session as Partial<SessionState>);
    }
    if (desktopData?.account) {
      useAccountStore.getState().hydrate(desktopData.account as Partial<AccountState>);
    }
    if (desktopData) {
      return {
        hadSession: Boolean(desktopData.session),
        hadAccount: Boolean(desktopData.account),
      };
    }

    // One-time migration path: an existing browser profile opened inside the
    // desktop shell may still have its last IndexedDB snapshot. Import it
    // once, then future reads/writes use SQLite through the bridge.
    const db = await getDB();
    const [legacySession, legacyAccount] = await Promise.all([
      db.get(STORE, SESSION_KEY) as Promise<Partial<SessionState> | undefined>,
      db.get(STORE, ACCOUNT_KEY) as Promise<Partial<AccountState> | undefined>,
    ]);
    if (legacySession) useSessionStore.getState().hydrate(legacySession);
    if (legacyAccount) useAccountStore.getState().hydrate(legacyAccount);
    if (legacySession || legacyAccount) await saveNow();
    return { hadSession: Boolean(legacySession), hadAccount: Boolean(legacyAccount) };
  }

  const db = await getDB();
  const [sessionData, accountData] = await Promise.all([
    db.get(STORE, SESSION_KEY) as Promise<Partial<SessionState> | undefined>,
    db.get(STORE, ACCOUNT_KEY) as Promise<Partial<AccountState> | undefined>,
  ]);

  if (sessionData) useSessionStore.getState().hydrate(sessionData);
  if (accountData) useAccountStore.getState().hydrate(accountData);

  return { hadSession: Boolean(sessionData), hadAccount: Boolean(accountData) };
}

/** Start the 5-second autosave loop plus close-protection flushes (CANON
    "Crash and close protection"): also saves when the page is hidden or
    unloaded, so a close between ticks doesn't lose work. Returns a stop
    function that clears the interval and removes the listeners. */
export function startAutosave(): () => void {
  const intervalId = setInterval(() => {
    void saveNow();
  }, AUTOSAVE_INTERVAL_MS);

  const flush = () => {
    void saveNow();
  };
  const onVisibilityChange = () => {
    if (document.visibilityState === "hidden") flush();
  };

  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", onVisibilityChange);

  return function stopAutosave() {
    clearInterval(intervalId);
    window.removeEventListener("pagehide", flush);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
}

/** Test/diagnostic helper: reset the memoized DB handle so a fresh open
    happens next call. Not used by the app. */
export function _resetDbHandleForTests(): void {
  dbPromise = null;
}
