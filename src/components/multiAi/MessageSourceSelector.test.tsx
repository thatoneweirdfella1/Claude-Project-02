import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MessageSourceSelector } from "./MessageSourceSelector";
import { createInitialSessionState, useSessionStore } from "../../stores/sessionStore";

/* R20: Select Unresolved Conversation — the user can select one message or
   a range, review the exact resulting context bundle, and clear back to no
   selection (the default "most recent question" behavior). */

let root: Root | null = null;
let host: HTMLDivElement | null = null;

function mount(node: React.ReactNode) {
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  act(() => root?.render(node));
  return host;
}

afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  root = null;
  host = null;
  useSessionStore.setState(createInitialSessionState());
});

function seedConversation() {
  useSessionStore.getState().addMessage({ id: "m1", role: "user", content: "What is event sourcing?", timestamp: 1, messageState: "sent" });
  useSessionStore.getState().addMessage({ id: "m2", role: "assistant", content: "A pattern storing state as events.", timestamp: 2, messageState: "answered" });
  useSessionStore.getState().addMessage({ id: "m3", role: "user", content: "Should we migrate to it?", timestamp: 3, messageState: "sent" });
}

function checkbox(text: string) {
  const labels = [...(host?.querySelectorAll("label.multi-ai-source-selector__item") ?? [])];
  const label = labels.find((el) => el.textContent?.includes(text));
  if (!label) throw new Error(`Missing checkbox for: ${text}`);
  const input = label.querySelector("input[type=checkbox]");
  if (!(input instanceof HTMLInputElement)) throw new Error("Missing checkbox input");
  return input;
}

describe("R20: MessageSourceSelector", () => {
  it("renders nothing when the conversation has no user messages", () => {
    const onSelectionChange = vi.fn();
    mount(<MessageSourceSelector onSelectionChange={onSelectionChange} />);
    expect(host?.querySelector("[data-testid='multi-ai-source-selector']")).toBeNull();
  });

  it("lists every user message as a selectable option", () => {
    seedConversation();
    const onSelectionChange = vi.fn();
    mount(<MessageSourceSelector onSelectionChange={onSelectionChange} />);

    const toggle = host?.querySelector("button.multi-ai-source-selector__toggle");
    act(() => toggle?.dispatchEvent(new MouseEvent("click", { bubbles: true })));

    expect(host?.textContent).toContain("What is event sourcing?");
    expect(host?.textContent).toContain("Should we migrate to it?");
  });

  it("selecting a single message reports exactly that message's stable id", () => {
    seedConversation();
    const onSelectionChange = vi.fn();
    mount(<MessageSourceSelector onSelectionChange={onSelectionChange} />);

    const toggle = host?.querySelector("button.multi-ai-source-selector__toggle");
    act(() => toggle?.dispatchEvent(new MouseEvent("click", { bubbles: true })));

    const box = checkbox("What is event sourcing?");
    act(() => box.click());

    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.objectContaining({ sourceMessageIds: ["m1"] }),
    );
  });

  it("selecting a range of messages reports every selected id", () => {
    seedConversation();
    const onSelectionChange = vi.fn();
    mount(<MessageSourceSelector onSelectionChange={onSelectionChange} />);

    const toggle = host?.querySelector("button.multi-ai-source-selector__toggle");
    act(() => toggle?.dispatchEvent(new MouseEvent("click", { bubbles: true })));

    act(() => checkbox("What is event sourcing?").click());
    act(() => checkbox("Should we migrate to it?").click());

    const lastCall = onSelectionChange.mock.calls.at(-1)?.[0];
    expect(lastCall.sourceMessageIds).toEqual(["m1", "m3"]);
  });

  it("shows a reviewable preview of the exact context bundle for the current selection", () => {
    seedConversation();
    const onSelectionChange = vi.fn();
    mount(<MessageSourceSelector onSelectionChange={onSelectionChange} />);

    const toggle = host?.querySelector("button.multi-ai-source-selector__toggle");
    act(() => toggle?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    act(() => checkbox("What is event sourcing?").click());

    const preview = host?.querySelector("[data-testid='multi-ai-context-bundle']");
    expect(preview).not.toBeNull();
    expect(preview?.textContent).toContain("What is event sourcing?");
  });

  it("Clear selection resets to no selection and notifies the caller with null", () => {
    seedConversation();
    const onSelectionChange = vi.fn();
    mount(<MessageSourceSelector onSelectionChange={onSelectionChange} />);

    const toggle = host?.querySelector("button.multi-ai-source-selector__toggle");
    act(() => toggle?.dispatchEvent(new MouseEvent("click", { bubbles: true })));
    act(() => checkbox("What is event sourcing?").click());

    const clearButton = [...(host?.querySelectorAll("button.multi-ai-source-selector__clear") ?? [])][0];
    act(() => clearButton?.dispatchEvent(new MouseEvent("click", { bubbles: true })));

    expect(onSelectionChange).toHaveBeenLastCalledWith(null);
    expect(host?.querySelector("[data-testid='multi-ai-context-bundle']")).toBeNull();
  });
});
