import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScreenRouter } from "./ScreenRouter";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";
import { createInitialSessionState, useSessionStore } from "../../stores/sessionStore";
import type { SessionRecord } from "../../stores/types";

/* R08 regression (2nd repair attempt) — Session Import Selector.

   The first R08 attempt fixed src/components/session/ImportModal.tsx, which
   is dead code (never imported or rendered — see docs/checkpoints/
   CLAUDE-REPAIR-GROUP-1-R08.md Session 9). The real, live "import a session
   file" UI is SessionsScreen's <input type="file"> + handleImportSession in
   ScreenRouter.tsx (wired at PRIMARY_NAVIGATION "sessions" -> case
   "sessions" -> <SessionsScreen/>). A sibling copy of the same handler lives
   in RetiredArchiveScreen, which navigation.ts / the ScreenRouter switch
   never route to — confirmed dead, left untouched.

   Before this fix, handleImportSession applied a parsed file to the store
   immediately on selection (no preview, no confirm step) and rejected bad
   files with a blocking native alert(). This file drives the real rendered
   SessionsScreen through select -> preview -> confirm/cancel/reject. */

let root: Root | null = null;
let host: HTMLDivElement | null = null;

function mount(node: React.ReactNode) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(node));
  return host;
}

function button(label: string) {
  const match = [...(host?.querySelectorAll("button") ?? [])].find((item) => item.textContent?.trim() === label);
  if (!(match instanceof HTMLButtonElement)) throw new Error(`Missing button: ${label}`);
  return match;
}

function fileInput() {
  const el = host?.querySelector('input[type="file"]');
  if (!(el instanceof HTMLInputElement)) throw new Error("Missing file input");
  return el;
}

async function selectFile(file: File) {
  const input = fileInput();
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  await act(async () => {
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
  // FileReader.onload resolves asynchronously (happy-dom schedules it a
  // few ticks out); always give it a fixed number of ticks to settle
  // rather than breaking as soon as *a* dialog is present — a re-selection
  // must be allowed to replace an already-open preview.
  for (let i = 0; i < 10; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
  }
}

function goToSessions() {
  useSessionStore.getState().setScreenLocation("sessions", "active");
}

const VALID_SESSION = {
  id: "external-session-1",
  createdAt: 1000,
  archived: false,
  tag: "Imported chat",
  model: "auto",
  directness: 2,
  techniques: [],
  context: [{ id: "c1", kind: "text", label: "Notes", content: "hi", bytes: 2 }],
  variables: {},
  conversation: [
    { id: "m1", role: "user", content: "hello", timestamp: 1 },
    { id: "m2", role: "assistant", content: "hi there", timestamp: 2 },
  ],
};

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  useAccountStore.setState(createInitialAccountState());
  useSessionStore.setState(createInitialSessionState());
  vi.restoreAllMocks();
});

describe("SessionsScreen (live Sessions screen) — R08 file import", () => {
  it("shows a visible file chooser (Import button + file input) with no dialog open yet", () => {
    goToSessions();
    mount(<ScreenRouter />);
    expect(() => button("Import")).not.toThrow();
    const input = fileInput();
    expect(input.accept).toBe(".json");
    expect(host?.querySelector('[role="dialog"]')).toBeNull();
  });

  it("previews a valid file's contents and applies nothing until confirmed", async () => {
    goToSessions();
    mount(<ScreenRouter />);

    await selectFile(new File([JSON.stringify(VALID_SESSION)], "session.json", { type: "application/json" }));

    const dialog = host?.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.textContent).toContain("Imported chat");
    expect(dialog?.textContent).toContain("2 messages");
    expect(dialog?.textContent).toContain("1 context item");

    // Nothing applied yet — preview only.
    expect(useAccountStore.getState().sessions).toHaveLength(0);
  });

  it("Confirm import applies the previewed session and closes the dialog", async () => {
    goToSessions();
    mount(<ScreenRouter />);

    await selectFile(new File([JSON.stringify(VALID_SESSION)], "session.json", { type: "application/json" }));
    act(() => button("Confirm import").click());

    expect(host?.querySelector('[role="dialog"]')).toBeNull();
    const sessions = useAccountStore.getState().sessions;
    expect(sessions).toHaveLength(1);
    expect(sessions[0].tag).toBe("Imported chat");
    expect(sessions[0].conversation).toHaveLength(2);
    // The id is regenerated, never trusted from the file (avoids silently
    // overwriting an existing session that happens to share an id).
    expect(sessions[0].id).not.toBe("external-session-1");
  });

  it("Cancel discards the preview without applying anything", async () => {
    goToSessions();
    mount(<ScreenRouter />);

    await selectFile(new File([JSON.stringify(VALID_SESSION)], "session.json", { type: "application/json" }));
    act(() => button("Cancel").click());

    expect(host?.querySelector('[role="dialog"]')).toBeNull();
    expect(useAccountStore.getState().sessions).toHaveLength(0);
  });

  it("rejects invalid JSON with an actionable message and disables Confirm", async () => {
    goToSessions();
    mount(<ScreenRouter />);

    await selectFile(new File(["not json {{{"], "broken.json", { type: "application/json" }));

    const dialog = host?.querySelector('[role="dialog"]');
    expect(dialog?.textContent).toMatch(/valid JSON/i);
    const confirm = button("Confirm import");
    expect(confirm.disabled).toBe(true);
    expect(useAccountStore.getState().sessions).toHaveLength(0);
  });

  it("rejects a file missing required session fields with a specific, actionable message", async () => {
    goToSessions();
    mount(<ScreenRouter />);

    await selectFile(new File([JSON.stringify({ notes: "just some random json" })], "not-a-session.json", { type: "application/json" }));

    const dialog = host?.querySelector('[role="dialog"]');
    expect(dialog?.textContent).toContain("id");
    expect(dialog?.textContent).toContain("conversation");
    expect(dialog?.textContent).toContain("model");
    expect(button("Confirm import").disabled).toBe(true);
    expect(useAccountStore.getState().sessions).toHaveLength(0);
  });

  it("rejects an empty file with an actionable message", async () => {
    goToSessions();
    mount(<ScreenRouter />);

    await selectFile(new File([""], "empty.json", { type: "application/json" }));

    const dialog = host?.querySelector('[role="dialog"]');
    expect(dialog?.textContent).toMatch(/empty/i);
    expect(button("Confirm import").disabled).toBe(true);
  });

  it("no partial import: a rejected file leaves an existing session list completely untouched", async () => {
    useAccountStore.getState().addSessionRecord({
      ...VALID_SESSION,
      id: "pre-existing",
      tag: "Pre-existing session",
    } as unknown as SessionRecord);

    goToSessions();
    mount(<ScreenRouter />);

    await selectFile(new File(["{ broken"], "broken.json", { type: "application/json" }));
    // Even attempting Confirm on an invalid preview must not mutate the store.
    const confirm = button("Confirm import");
    act(() => confirm.click());

    const sessions = useAccountStore.getState().sessions;
    expect(sessions).toHaveLength(1);
    expect(sessions[0].id).toBe("pre-existing");
  });

  it("selecting a second (valid) file after a rejection replaces the preview, not the earlier rejection", async () => {
    goToSessions();
    mount(<ScreenRouter />);

    await selectFile(new File(["nope"], "bad.json", { type: "application/json" }));
    expect(button("Confirm import").disabled).toBe(true);

    await selectFile(new File([JSON.stringify(VALID_SESSION)], "session.json", { type: "application/json" }));
    expect(button("Confirm import").disabled).toBe(false);
    expect(host?.querySelector('[role="dialog"]')?.textContent).toContain("Imported chat");
  });
});
