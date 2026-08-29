import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { ScreenRouter } from "./ScreenRouter";
import { createInitialAccountState, useAccountStore } from "../../stores/accountStore";
import { createInitialSessionState, useSessionStore } from "../../stores/sessionStore";
import type { ContextItem } from "../../stores/types";

/* R07 regression (2nd repair attempt) — TemplatesScreen (the LIVE
   Saved Tools -> Templates component, ScreenRouter.tsx) previously had no
   way to capture or edit a template's starterQuestion/context: formData
   was missing the field entirely, and neither the create nor edit form
   rendered an input for it. handleLoadTemplate already read both fields
   correctly, so a user-created template's starter question and context
   were silently always empty. This file drives the real rendered component
   (not the dead LoadTemplateMenu.tsx) through create/edit/cancel and
   asserts against the store, the same way layer2Interactions.test.tsx
   drives real settings components. */

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

function input(labelText: string) {
  const labels = [...(host?.querySelectorAll("label") ?? [])];
  const label = labels.find((el) => el.textContent?.includes(labelText));
  if (!label) throw new Error(`Missing label: ${labelText}`);
  const group = label.parentElement;
  const field = group?.querySelector("input.form-group__input, textarea.form-group__input");
  if (!(field instanceof HTMLInputElement) && !(field instanceof HTMLTextAreaElement)) {
    throw new Error(`Missing field for label: ${labelText}`);
  }
  return field;
}

function setValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
  setter?.call(el, value);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

/* Navigate to Saved Tools -> Templates BEFORE the initial mount so
   ScreenRouter never has to render the "translate" (CenterColumn) route in
   this jsdom test environment — this test is scoped to TemplatesScreen. */
function goToTemplates() {
  useSessionStore.getState().setScreenLocation("saved-tools", "templates");
}

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  useAccountStore.setState(createInitialAccountState());
  useSessionStore.setState(createInitialSessionState());
});

describe("TemplatesScreen (live Saved Tools -> Templates) — R07 create/edit/cancel", () => {
  it("create form captures starterQuestion and the current session's context", () => {
    const ctxItem: ContextItem = { id: "c1", kind: "text", label: "Notes", content: "background info", bytes: 16 };
    act(() => useSessionStore.getState().addContextItem(ctxItem));

    goToTemplates();
    mount(<ScreenRouter />);

    act(() => button("Create Template").click());
    setValue(input("Template Name") as HTMLInputElement, "My Custom Template");
    setValue(input("Starter Question (optional)") as HTMLTextAreaElement, "What should I know first?");
    act(() => button("Create").click());

    const custom = useAccountStore.getState().templates.find((t) => t.title === "My Custom Template");
    expect(custom).toBeDefined();
    expect(custom?.starterQuestion).toBe("What should I know first?");
    expect(custom?.context).toEqual([ctxItem]);
  });

  it("create form omits starterQuestion/context entirely when left blank/empty", () => {
    goToTemplates();
    mount(<ScreenRouter />);

    act(() => button("Create Template").click());
    setValue(input("Template Name") as HTMLInputElement, "Bare Template");
    act(() => button("Create").click());

    const bare = useAccountStore.getState().templates.find((t) => t.title === "Bare Template");
    expect(bare).toBeDefined();
    expect(bare?.starterQuestion).toBeUndefined();
    expect(bare?.context).toBeUndefined();
  });

  it("edit form: Save persists the new starter question and preserves context", () => {
    useAccountStore.getState().addTemplate({
      id: "custom-edit-2",
      title: "Editable Two",
      model: "auto",
      directness: 2,
      techniques: [],
      context: [{ id: "c1", kind: "text", label: "Notes", content: "kept", bytes: 4 }],
      starterQuestion: "Original question",
    });

    goToTemplates();
    mount(<ScreenRouter />);

    const editBtn = [...(host?.querySelectorAll('button[title="Edit template"]') ?? [])][0];
    if (!(editBtn instanceof HTMLButtonElement)) throw new Error("Missing Edit template button");
    act(() => editBtn.click());

    const starterField = input("Starter Question (optional)") as HTMLTextAreaElement;
    expect(starterField.value).toBe("Original question");
    setValue(starterField, "Updated question");
    act(() => button("Save").click());

    const updated = useAccountStore.getState().templates.find((t) => t.id === "custom-edit-2");
    expect(updated?.starterQuestion).toBe("Updated question");
    expect(updated?.context).toEqual([{ id: "c1", kind: "text", label: "Notes", content: "kept", bytes: 4 }]);
  });

  it("edit form: Cancel discards in-progress changes without touching the store", () => {
    useAccountStore.getState().addTemplate({
      id: "custom-edit-3",
      title: "Editable Three",
      model: "auto",
      directness: 2,
      techniques: [],
      starterQuestion: "Untouched question",
    });

    goToTemplates();
    mount(<ScreenRouter />);

    const editBtn = [...(host?.querySelectorAll('button[title="Edit template"]') ?? [])][0];
    if (!(editBtn instanceof HTMLButtonElement)) throw new Error("Missing Edit template button");
    act(() => editBtn.click());

    setValue(input("Starter Question (optional)") as HTMLTextAreaElement, "This should never be saved");
    act(() => button("Cancel").click());

    const untouched = useAccountStore.getState().templates.find((t) => t.id === "custom-edit-3");
    expect(untouched?.starterQuestion).toBe("Untouched question");
  });
});
