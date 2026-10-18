import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import type { SessionRecord } from "../../stores/types";
import { InteractivePersonalOptimization } from "./InteractivePersonalOptimization";
import { loadPersistedState, saveNow } from "../../services/persistence";

let root: Root;
let host: HTMLDivElement;

// Synthetic signal tokens only; no exported or real conversation is a fixture.
function sessions(count: number): SessionRecord[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `synthetic-session-${index}`, createdAt: index, archived: true,
    model: "auto", directness: 2, techniques: ["auto-detect"], context: [], variables: {},
    conversation: [{ id: `synthetic-message-${index}`, role: "user", content: "overwhelm", timestamp: index }],
  }));
}

function mount() {
  act(() => root.render(<InteractivePersonalOptimization />));
}

function button(text: string): HTMLButtonElement {
  const found = [...host.querySelectorAll("button")].find((node) => node.textContent?.includes(text));
  if (!found) throw new Error(`Missing button: ${text}`);
  return found;
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("fetch", vi.fn(() => { throw new Error("Unexpected network access"); }));
  useSessionStore.getState().resetSession();
  const state = createInitialAccountState();
  useAccountStore.setState({ ...state, sessions: sessions(3),
    optimizationProfile: { ...state.optimizationProfile, enabled: true, selectedGoals: ["reduce-overwhelm"] } });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
  useAccountStore.setState(createInitialAccountState());
  vi.unstubAllGlobals();
});

describe("stored-session personal optimization", () => {
  it("scans the actual stored sessions, explains proposals, and writes only on a separate apply click", async () => {
    mount();
    const before = useAccountStore.getState().learnedPreferences;
    act(() => button("Preview analysis state").click());
    expect(host.textContent).toContain("Scanned 3 saved sessions");
    expect(host.textContent).toContain("Prioritize lower cognitive load.");
    expect(host.textContent).toContain("3 examples");
    expect(host.textContent).toContain("0 → 1");
    expect(useAccountStore.getState().optimizationRuns).toEqual([]);
    expect(useAccountStore.getState().learnedPreferences).toBe(before);
    await act(async () => button("Apply previewed changes").click());
    const [run] = useAccountStore.getState().optimizationRuns;
    expect(run.status).toBe("applied");
    expect(run.scannedSessions).toBe(3);
    expect(run.changes.length).toBeGreaterThan(0);
    for (const change of run.changes) {
      expect(change.reason.length).toBeGreaterThan(0);
      expect(change.evidenceCount).toBeGreaterThanOrEqual(3);
    }
    expect(useAccountStore.getState().learnedPreferences).toEqual(run.afterPreferences);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("explains evidence below the minimum and offers no apply action", () => {
    useAccountStore.setState({ sessions: sessions(2) });
    mount();
    act(() => button("Preview analysis state").click());
    expect(host.textContent).toContain("at least 3 matching examples across more than one saved session");
    expect([...host.querySelectorAll("button")].some((node) => node.textContent?.includes("Apply previewed"))).toBe(false);
    expect(useAccountStore.getState().learnedPreferences.technique).toEqual({});
  });

  it("explains missing sessions and missing goals separately", () => {
    useAccountStore.setState({ sessions: [] });
    mount();
    act(() => button("Preview analysis state").click());
    expect(host.textContent).toContain("No saved sessions are available");
    act(() => useAccountStore.getState().setOptimizationGoals([]));
    expect(host.textContent).toContain("Choose at least one goal");
    expect(button("Preview analysis state").disabled).toBe(true);
  });

  it("requires a fresh preview when preferences change before apply", async () => {
    mount();
    act(() => button("Preview analysis state").click());
    act(() => useAccountStore.getState().setLearnedPreferences({ routing: {}, technique: {
      simplify: { weight: 2, totalAdjustments: 2, lastAdjustedAt: 1 },
    } }));
    await act(async () => button("Apply previewed changes").click());
    expect(useAccountStore.getState().optimizationRuns).toEqual([]);
    expect(host.textContent).toContain("Review the refreshed preview");
    expect(useAccountStore.getState().learnedPreferences.technique.simplify.weight).toBe(2);
  });
});

async function applyRun() {
  mount();
  act(() => button("Preview analysis state").click());
  await act(async () => {
    button("Apply previewed changes").click();
    // Wait for the actual serialized persistence queue before the next action.
    await saveNow({ snapshotActiveSession: false });
  });
}

describe("applied optimization history", () => {
  it("shows the newest applied changes first", async () => {
    await applyRun();
    await applyRun();
    const rows = host.querySelectorAll('[aria-label="Applied optimization changes"] li');
    expect(rows).toHaveLength(6);
    expect(rows[0].textContent).toContain("-1 → -2");
    expect(rows[rows.length - 1].textContent).toContain("0 → 1");
  });

  it("lists applied changes from the store with reason, evidence and time", async () => {
    await applyRun();
    act(() => root.render(<div />));
    mount();
    const history = host.querySelector('[aria-label="Applied optimization changes"]');
    expect(history?.textContent).toContain("Prioritize lower cognitive load.");
    expect(history?.textContent).toContain("3 examples");
    expect(history?.textContent).toContain("0 → 1");
    expect(history?.querySelector("time")?.getAttribute("datetime")).toBeTruthy();
  });

  it("undoes only the selected setting and preserves unrelated learned values", async () => {
    await applyRun();
    const applied = useAccountStore.getState().learnedPreferences;
    await act(async () => button("Undo simplify").click());
    const restored = useAccountStore.getState().learnedPreferences;
    expect(restored.technique.simplify?.weight ?? 0).toBe(0);
    expect(restored.technique["step-by-step"]).toEqual(applied.technique["step-by-step"]);
    expect(restored.technique.detailed).toEqual(applied.technique.detailed);
  });

  it("keeps the undone line with its evidence and marks it undone", async () => {
    await applyRun();
    await act(async () => button("Undo simplify").click());
    const row = host.querySelector('[data-optimization-target="simplify"]');
    expect(row?.textContent).toContain("Undone");
    expect(row?.textContent).toContain("Prioritize lower cognitive load.");
    expect(row?.textContent).toContain("3 examples");
    expect(useAccountStore.getState().optimizationRuns[0].changes[0]).toHaveProperty("undoneAt");
  });

  it("restores the value and undone history after a persistence reload", async () => {
    await applyRun();
    await act(async () => button("Undo simplify").click());
    await saveNow({ snapshotActiveSession: false });
    act(() => useAccountStore.setState(createInitialAccountState()));
    await act(async () => { await loadPersistedState(); });
    expect(useAccountStore.getState().learnedPreferences.technique.simplify?.weight ?? 0).toBe(0);
    expect(host.querySelector('[data-optimization-target="simplify"]')?.textContent).toContain("Undone");
    expect(useAccountStore.getState().optimizationRuns[0].changes[0]).toHaveProperty("undoneAt");
  });
});
