import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import type { SessionRecord } from "../../stores/types";
import { InteractivePersonalOptimization } from "./InteractivePersonalOptimization";

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
