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
    // Step 5.0's own VERIFY requirement: "reload mid-sentence and confirm the
    // text comes back" — draftInput is deliberately left mid-thought here,
    // exactly the crash-mid-thought scenario CANON's persistence rule targets.
    useSessionStore.getState().setDraftInput("okay so i was thinking about how");
    useSessionStore.getState().setDraftSelection(8, 18);
    useSessionStore.getState().setConversationScrollTop(144);
    const originalSessionId = useSessionStore.getState().sessionId;
    useSessionStore.getState().setDirectness(3);
    useSessionStore.getState().setModel("claude-opus-4-8");
    useSessionStore.getState().setTechniques(["step-by-step"]);
    // Step 7.4: a session-local variable must survive a reload too — it's
    // "cleared when a session closes," not "cleared on a page refresh."
    useSessionStore.getState().setSessionVariable("project_name", "Divergence.AI");
    useSessionStore.getState().addMessage({
      id: "m1",
      role: "user",
      content: "what is the project codename",
      timestamp: 111,
    });
    useAccountStore.getState().setPlan("pro");
    useAccountStore.getState().setVariable("codename", "Zarquith");
    useAccountStore.getState().setVisibility({ quickTools: true });
    // Step 6.4: a state-pill correction must survive a reload too — the
    // 15+ threshold logic needs corrections to accumulate across sessions.
    useAccountStore.getState().recordStateCorrection({
      dimension: "emotion",
      from: "overwhelmed",
      to: "frustrated",
      timestamp: 222,
    });

    // Autosave writes both stores.
    await saveNow();

    // Kill + reload: in-memory state is gone, back to cold defaults.
    coldStartStores();
    _resetDbHandleForTests();
    expect(useSessionStore.getState().directness).toBe(2); // confirm the reset really happened
    expect(useSessionStore.getState().draftInput).toBe(""); // the mid-sentence text is really gone
    expect(useAccountStore.getState().plan).toBe("free");

    // Reload restores.
    const result = await loadPersistedState();
    expect(result).toEqual({ hadSession: true, hadAccount: true });

    // Session store returned exactly where it was — including the mid-sentence
    // draft, which is the whole point of Step 5.0 binding it to store state.
    const session = useSessionStore.getState();
    expect(session.draftInput).toBe("okay so i was thinking about how");
    expect(session.sessionId).toBe(originalSessionId);
    expect(session.draftSelectionStart).toBe(8);
    expect(session.draftSelectionEnd).toBe(18);
    expect(session.conversationScrollTop).toBe(144);
    expect(session.directness).toBe(3);
    expect(session.model).toBe("claude-opus-4-8");
    expect(session.techniques).toEqual(["step-by-step"]);
    expect(session.variables).toEqual({ project_name: "Divergence.AI" });
    expect(session.conversation).toHaveLength(1);
    expect(session.conversation[0].content).toBe("what is the project codename");

    // Account store returned exactly where it was.
    const account = useAccountStore.getState();
    expect(account.plan).toBe("pro");
    expect(account.variables.codename).toBe("Zarquith");
    expect(account.visibility.quickTools).toBe(true);
    expect(account.visibility.recentSessions).toBe(false); // untouched default preserved
    expect(account.stateCorrections).toEqual([
      { dimension: "emotion", from: "overwhelmed", to: "frustrated", timestamp: 222 },
    ]);
    expect(account.sessions.some((record) => record.id === originalSessionId)).toBe(true);
  });

  it("leaves stores at defaults when nothing was ever saved", async () => {
    const result = await loadPersistedState();
    expect(result).toEqual({ hadSession: false, hadAccount: false });
    expect(useSessionStore.getState().directness).toBe(2);
    expect(useAccountStore.getState().plan).toBe("free");
  });

  it("last complete write wins across successive saves", async () => {
    useAccountStore.getState().setPlan("pro");
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

  it("autosaves 500ms after changes, flushes on pagehide, and stop() removes protection", async () => {
    expect(AUTOSAVE_INTERVAL_MS).toBe(500);

    const { openDB } = await import("idb");
    const rawAccountPlan = async () => {
      const db = await openDB("divergence-ai", 1);
      const rec = (await db.get("state", "account")) as { plan?: string } | undefined;
      return rec?.plan;
    };

    const stop = startAutosave();

    useAccountStore.getState().setPlan("pro");
    await vi.waitFor(async () => {
      expect(await rawAccountPlan()).toBe("pro");
    }, { timeout: 1_500 });

    // A page-hide flush must persist current state.
    useAccountStore.getState().setPlan("insane");
    window.dispatchEvent(new Event("pagehide"));
    await vi.waitFor(async () => {
      expect(await rawAccountPlan()).toBe("insane");
    });

    // After stop(), a page-hide must NOT persist further changes.
    stop();
    useAccountStore.getState().setPlan("free");
    window.dispatchEvent(new Event("pagehide"));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(await rawAccountPlan()).toBe("insane"); // unchanged since stop()
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
      ["sessionId", "sessionCreatedAt", "sessionTitle", "draftInput", "draftSelectionStart", "draftSelectionEnd", "conversationScrollTop", "context", "conversation", "currentScreen", "destination", "directness", "lockedProblemStatement", "maxRequestCost", "methodology", "methodologyPhase", "model", "paidFallbackEnabled", "reviewBeforeSend", "statePills", "techniques", "translatorEngine", "variables"].sort(),
    );
  });
});
