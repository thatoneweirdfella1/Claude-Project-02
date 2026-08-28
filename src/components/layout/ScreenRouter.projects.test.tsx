import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { ScreenRouter } from "./ScreenRouter";
import { createInitialSessionState, useSessionStore } from "../../stores/sessionStore";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";
import { restoreLocalWorkspace, getLocalWorkspace } from "../../services/localWorkspace";

/* R17 second-pass correction: "create a project ... reload without loss"
   previously only held for a project with a session/task/resource already
   attached — an empty, freshly-named project was pure component state and
   vanished on remount. This proves the real fix through the actual rendered
   Projects screen: a genuine .click() on "Create project", then a full
   unmount/remount (the same restore path durableLayer4.ts's
   loadDurableWorkspace uses on a real page load) with nothing else
   assigned to the project, and the project is still there afterward. */

let root: Root | null = null;
let host: HTMLDivElement | null = null;

function mount() {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(<ScreenRouter />));
  return host;
}

function unmount() {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
}

afterEach(() => {
  if (root) unmount();
  useSessionStore.setState(createInitialSessionState());
  useAccountStore.setState(createInitialAccountState());
  restoreLocalWorkspace({ tasks: [], resources: [], syntheticJobs: [], projects: [] });
});

describe("R17: Projects screen — create a project and reload without loss", () => {
  it("a newly-created empty project (nothing assigned) survives a real unmount/remount", () => {
    useSessionStore.setState({ currentScreen: "projects", currentSection: "overview" });

    const container = mount();
    const input = container.querySelector<HTMLInputElement>("input[aria-label='Active local project']");
    expect(input).toBeTruthy();

    act(() => {
      // React tracks controlled-input value via its own overridden native
      // setter — assigning `.value` directly and dispatching a plain Event
      // bypasses that tracking, so onChange never fires. Going through the
      // real native setter (same mechanism React's own testing utilities
      // use) is what makes this a genuine simulated keystroke, not a
      // bypass of the component's own change handling.
      const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set!;
      setValue.call(input, "Kitchen Remodel");
      input!.dispatchEvent(new Event("input", { bubbles: true }));
    });

    const createButton = [...container.querySelectorAll("button")].find((b) => b.textContent === "Create project");
    expect(createButton).toBeTruthy();
    expect(createButton!.disabled).toBe(false);
    act(() => createButton!.click());

    // Real: nothing was assigned to it — no session, task, or resource.
    expect(getLocalWorkspace().projects).toContain("Kitchen Remodel");
    expect(container.textContent).toContain("Kitchen Remodel");

    // Simulate a genuine reload: unmount everything, restore the workspace
    // the same way loadDurableWorkspace() does from IndexedDB, remount.
    const persisted = getLocalWorkspace();
    unmount();
    restoreLocalWorkspace(persisted);
    useSessionStore.setState({ currentScreen: "projects", currentSection: "overview" });
    const reloaded = mount();

    expect(reloaded.textContent).toContain("Kitchen Remodel");
    expect(reloaded.textContent).not.toContain("No projects yet");
  });
});
