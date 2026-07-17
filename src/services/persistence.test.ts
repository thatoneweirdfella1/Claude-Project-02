import { IDBFactory } from "fake-indexeddb";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createInitialAccountState,
  useAccountStore,
} from "../stores/accountStore";
import {
  createInitialSessionState,
  useSessionStore,
} from "../stores/sessionStore";
import {
  AUTOSAVE_INTERVAL_MS,
  _resetDbHandleForTests,
  loadPersistedState,
  saveNow,
  startAutosave,
} from "./persistence";

/* Step 1.8's required test: kill and reload the app, confirm state
   returns. "Kill and reload" is simulated by (a) saving to IndexedDB,
   (b) resetting the in-memory stores to their cold-start defaults — what
   a fresh page load starts with — then (c) loadPersistedState() and
   asserting the state came back. fake-indexeddb persists across the
   simulated reload within the test process, exactly as real IndexedDB
   persists across a real reload. */

/** Reset the in-memory stores to cold-start defaults, as a fresh page load
    would have them before rehydration. */
function coldStartStores() {
  useSessionStore.setState(createInitialSessionState());
  useAccountStore.setState(createInitialAccountState());
}

beforeEach(() => {
  // Fresh IndexedDB per test — no state bleeding between tests.
  globalThis.indexedDB = new IDBFactory();
  _resetDbHandleForTests();
  coldStartStores();
});

afterEach(() => {
  coldStartStores();
});

describe("persistence: kill and reload", () => {
  it("restores both stores' state after a simulated reload", async () => {
    // Arrange: user does work in this session.
    useSessionStore.getState().setDirectness(3);
    useSessionStore.getState().setModel("claude-opus-4-8");
    useSessionStore.getState().setTechniques(["step-by-step"]);
    useSessionStore.getState().addMessage({
      id: "m1",
      role: "user",
      content: "what is the project codename",
      timestamp: 111,
    });
    useAccountStore.getState().setPlan("paid");
    useAccountStore.getState().setVariable("codename", "Zarquith");
    useAccountStore.getState().setVisibility({ quickTools: true });

    // Autosave writes both stores.
    await saveNow();

    // Kill + reload: in-memory state is gone, back to cold defaults.
    coldStartStores();
    _resetDbHandleForTests();
    expect(useSessionStore.getState().directness).toBe(2); // confirm the reset really happened
    expect(useAccountStore.getState().plan).toBe("free");

    // Reload restores.
    const result = await loadPersistedState();
    expect(result).toEqual({ hadSession: true, hadAccount: true });

    // Session store returned exactly where it was.
    const session = useSessionStore.getState();
    expect(session.directness).toBe(3);
    expect(session.model).toBe("claude-opus-4-8");
    expect(session.techniques).toEqual(["step-by-step"]);
    expect(session.conversation).toHaveLength(1);
    expect(session.conversation[0].content).toBe("what is the project codename");

    // Account store returned exactly where it was.
    const account = useAccountStore.getState();
    expect(account.plan).toBe("paid");
    expect(account.variables.codename).toBe("Zarquith");
    expect(account.visibility.quickTools).toBe(true);
    expect(account.visibility.recentSessions).toBe(true); // untouched default preserved
  });

  it("leaves stores at defaults when nothing was ever saved", async () => {
    const result = await loadPersistedState();
    expect(result).toEqual({ hadSession: false, hadAccount: false });
    expect(useSessionStore.getState().directness).toBe(2);
    expect(useAccountStore.getState().plan).toBe("free");
  });

  it("last complete write wins across successive saves", async () => {
    useAccountStore.getState().setPlan("paid");
    await saveNow();

    useAccountStore.getState().setPlan("free");
    useAccountStore.getState().setVariable("x", "y");
    await saveNow();

    coldStartStores();
    await loadPersistedState();
    // The second (latest) complete write is what restores.
    expect(useAccountStore.getState().plan).toBe("free");
    expect(useAccountStore.getState().variables.x).toBe("y");
  });

  it("autosave interval is 5s and startAutosave flushes on pagehide; stop() removes the listener", async () => {
    // CANON's interval value.
    expect(AUTOSAVE_INTERVAL_MS).toBe(5000);

    // (Fake timers are deliberately NOT used here: they deadlock against
    // fake-indexeddb's async scheduler. The 5s setInterval is a trivial
    // wrapper over saveNow(), which is exercised directly by the other
    // tests; here we verify the close-protection flush + listener cleanup,
    // which is the part with real logic.)
    const { openDB } = await import("idb");
    const rawAccountPlan = async () => {
      const db = await openDB("divergence-ai", 1);
      const rec = (await db.get("state", "account")) as { plan?: string } | undefined;
      return rec?.plan;
    };

    const stop = startAutosave();

    // A page-hide flush must persist current state.
    useAccountStore.getState().setPlan("paid");
    window.dispatchEvent(new Event("pagehide"));
    await vi.waitFor(async () => {
      expect(await rawAccountPlan()).toBe("paid");
    });

    // After stop(), a page-hide must NOT persist further changes.
    stop();
    useAccountStore.getState().setPlan("free");
    window.dispatchEvent(new Event("pagehide"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(await rawAccountPlan()).toBe("paid"); // unchanged since stop()
  });

  it("persisted session state contains only data, no action functions", async () => {
    await saveNow();
    _resetDbHandleForTests();
    // Read raw record straight from IndexedDB and confirm no functions.
    const { openDB } = await import("idb");
    const db = await openDB("divergence-ai", 1);
    const raw = (await db.get("state", "session")) as Record<string, unknown>;
    const hasFunction = Object.values(raw).some((v) => typeof v === "function");
    expect(hasFunction).toBe(false);
    expect(Object.keys(raw).sort()).toEqual(
      ["context", "conversation", "directness", "model", "statePills", "techniques"].sort(),
    );
  });
});
