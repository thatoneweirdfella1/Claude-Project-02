import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { QuickActionsRow } from "./QuickActionsRow";
import { createInitialSessionState, useSessionStore } from "../../stores/sessionStore";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";

/* R18: Active Session Lifecycle had real, correctly-wired Keep Active/Save/
   Archive/Discard/Undo/confirmation/persistence code (verified by reading
   QuickActionsRow.tsx), but ZERO test coverage — no test anywhere exercised
   the confirmation dialog or the undo-after-discard path, and none called
   moveSessionToTrash/restoreSessionFromTrash at all. This proves the real
   behavior through the actual mounted component, genuine .click() calls,
   and the real accountStore/sessionStore state (including a real saveNow()
   round-trip through fake-indexeddb, same as the app's own persistence
   layer — never a direct store mutation standing in for what a click did). */

let root: Root | null = null;
let host: HTMLDivElement | null = null;

function mount() {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(<QuickActionsRow />));
  return host;
}

/* saveNow() goes through a real fake-indexeddb transaction (persistence.ts),
   which schedules actual IDBRequest task-queue events — not plain
   microtasks — so a handful of Promise.resolve() ticks alone doesn't
   reliably let it settle before the next assertion runs. Several real
   setTimeout(0) turns give the queued IndexedDB work (and the state update
   chained after it) room to actually land. */
async function flush() {
  await act(async () => {
    for (let i = 0; i < 8; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  });
}

function seedRecoverableSession() {
  useSessionStore.setState({
    sessionId: "session-under-test",
    conversation: [
      { id: "m1", role: "user", content: "what temperature does water boil at", timestamp: Date.now() },
    ],
  });
}

async function openFinishDialog(container: HTMLElement) {
  act(() => container.querySelector<HTMLButtonElement>(".quick-actions__bar")?.click());
  await flush();
  const moreButton = [...container.querySelectorAll("button")].find((b) => b.textContent?.includes("More"));
  act(() => moreButton?.click());
  await flush();
  const finishButton = [...container.querySelectorAll("button")].find((b) => b.textContent?.includes("Finish Session"));
  await act(async () => {
    finishButton?.click();
    await flush();
  });
}

/** The Finish Session dialog's choice buttons each render a <strong> label
    plus a <span> description inside one <button> — an exact textContent
    match would include both and never match the plain label. Plain-text
    buttons elsewhere (Go back / Move to Trash / Undo) don't need this. */
function findChoice(container: HTMLElement, label: string): HTMLButtonElement | undefined {
  return [...container.querySelectorAll("button")].find((b) => b.querySelector("strong")?.textContent === label);
}

function findButton(container: HTMLElement, label: string): HTMLButtonElement | undefined {
  return [...container.querySelectorAll("button")].find((b) => b.textContent === label);
}

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  useSessionStore.setState(createInitialSessionState());
  useAccountStore.setState(createInitialAccountState());
});

describe("R18: QuickActionsRow — Discard requires confirmation before it takes effect", () => {
  it("clicking Discard opens a confirmation dialog and does NOT discard yet", async () => {
    seedRecoverableSession();
    const container = mount();
    await openFinishDialog(container);

    expect(container.textContent).toContain("Finish Session");
    const discardButton = findChoice(container, "Discard");
    expect(discardButton).toBeTruthy();
    act(() => discardButton?.click());
    await flush();

    const confirmDialog = container.querySelector("[role='alertdialog']");
    expect(confirmDialog).toBeTruthy();
    expect(confirmDialog?.textContent).toContain("Move this session to Trash?");

    // Not discarded yet — still in accountStore.sessions, nothing in trashed.
    expect(useAccountStore.getState().trashed).toHaveLength(0);
  });

  it("'Go back' on the confirmation dialog cancels — the session is never discarded", async () => {
    seedRecoverableSession();
    const container = mount();
    await openFinishDialog(container);

    act(() => findChoice(container, "Discard")?.click());
    await flush();
    act(() => findButton(container, "Go back")?.click());
    await flush();

    expect(container.querySelector("[role='alertdialog']")).toBeNull();
    expect(useAccountStore.getState().trashed).toHaveLength(0);
    // Back at the Finish Session dialog, not silently closed.
    expect(container.textContent).toContain("Finish Session");
  });

  it("confirming 'Move to Trash' genuinely moves the session to trashed and clears the active conversation", async () => {
    seedRecoverableSession();
    const container = mount();
    await openFinishDialog(container);

    act(() => findChoice(container, "Discard")?.click());
    await flush();
    await act(async () => {
      findButton(container, "Move to Trash")?.click();
      await flush();
    });

    expect(useAccountStore.getState().trashed).toHaveLength(1);
    expect(useAccountStore.getState().sessions.some((s) => s.id === "session-under-test")).toBe(false);
    expect(useSessionStore.getState().conversation).toHaveLength(0);

    const undoToast = container.querySelector("[role='status']");
    expect(undoToast?.textContent).toContain("Session moved to Trash");
  });

  it("Undo genuinely restores the discarded session — real data back, not a cosmetic toast", async () => {
    seedRecoverableSession();
    const container = mount();
    await openFinishDialog(container);

    act(() => findChoice(container, "Discard")?.click());
    await flush();
    await act(async () => {
      findButton(container, "Move to Trash")?.click();
      await flush();
    });

    const undoButton = findButton(container, "Undo");
    expect(undoButton).toBeTruthy();
    await act(async () => {
      undoButton?.click();
      await flush();
    });

    expect(useAccountStore.getState().trashed).toHaveLength(0);
    expect(useAccountStore.getState().sessions.some((s) => s.id === "session-under-test")).toBe(true);
    expect(useSessionStore.getState().sessionId).toBe("session-under-test");
    expect(useSessionStore.getState().conversation).toHaveLength(1);
    expect(useSessionStore.getState().conversation[0].content).toBe("what temperature does water boil at");
  });
});

describe("R18: QuickActionsRow — Save and Archive persist with the correct status", () => {
  it("Save records the session with status 'saved' and clears the active work", async () => {
    seedRecoverableSession();
    const container = mount();
    await openFinishDialog(container);

    await act(async () => {
      findChoice(container, "Save")?.click();
      await flush();
    });

    const saved = useAccountStore.getState().sessions.find((s) => s.id === "session-under-test");
    expect(saved?.status).toBe("saved");
    expect(useSessionStore.getState().conversation).toHaveLength(0);
    expect(container.querySelector("[role='dialog']")).toBeNull();
  });

  it("Archive records the session with status 'archived'", async () => {
    seedRecoverableSession();
    const container = mount();
    await openFinishDialog(container);

    await act(async () => {
      findChoice(container, "Archive")?.click();
      await flush();
    });

    const archived = useAccountStore.getState().sessions.find((s) => s.id === "session-under-test");
    expect(archived?.status).toBe("archived");
  });

  it("Keep Active closes the dialog and leaves the session genuinely active — never saved/archived/discarded", async () => {
    seedRecoverableSession();
    const container = mount();
    // Opening "Finish Session" itself does a recovery saveNow() first (the
    // dialog's own "Current work is recovery-saved." footer describes this)
    // — that snapshot lands with status "active", same as before the dialog
    // was ever opened. Keep Active must leave it exactly there.
    await openFinishDialog(container);

    act(() => findChoice(container, "Keep Active")?.click());
    await flush();

    expect(container.querySelector("[role='dialog']")).toBeNull();
    const record = useAccountStore.getState().sessions.find((s) => s.id === "session-under-test");
    expect(record?.status).toBe("active");
    expect(useAccountStore.getState().trashed).toHaveLength(0);
    expect(useSessionStore.getState().conversation).toHaveLength(1);
    expect(useSessionStore.getState().sessionId).toBe("session-under-test");
  });
});
