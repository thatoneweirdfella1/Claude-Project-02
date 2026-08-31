import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MessageSourceSelector } from "./MessageSourceSelector";
import { createInitialSessionState, useSessionStore } from "../../stores/sessionStore";

vi.mock("../../services/persistence", () => ({
  saveNow: vi.fn().mockResolvedValue(undefined),
}));

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

function button(selector: string) {
  const element = host?.querySelector(selector);
  if (!(element instanceof HTMLButtonElement)) throw new Error(`Missing button: ${selector}`);
  return element;
}

describe("R20: MessageSourceSelector", () => {
  it("renders nothing when the conversation has no user messages", () => {
    const onSelectionChange = vi.fn();
    mount(<MessageSourceSelector onSelectionChange={onSelectionChange} />);
    expect(host?.querySelector("[data-testid='multi-ai-source-selector']")).toBeNull();
  });

  it("lists every turn so a source range cannot silently omit assistant context", () => {
    seedConversation();
    const onSelectionChange = vi.fn();
    mount(<MessageSourceSelector onSelectionChange={onSelectionChange} />);

    act(() => button("button.multi-ai-source-selector__toggle").click());

    expect(host?.textContent).toContain("What is event sourcing?");
    expect(host?.textContent).toContain("A pattern storing state as events.");
    expect(host?.textContent).toContain("Should we migrate to it?");
  });

  it("selecting a single message reports exactly that message's stable id", () => {
    seedConversation();
    const onSelectionChange = vi.fn();
    mount(<MessageSourceSelector onSelectionChange={onSelectionChange} />);

    act(() => button("button.multi-ai-source-selector__toggle").click());

    const box = checkbox("What is event sourcing?");
    act(() => box.click());

    expect(onSelectionChange).toHaveBeenCalledWith(
      expect.objectContaining({ sourceMessageIds: ["m1"] }),
    );
  });

  it("selecting two boundaries reports every stable id in the contiguous range", () => {
    seedConversation();
    const onSelectionChange = vi.fn();
    mount(<MessageSourceSelector onSelectionChange={onSelectionChange} />);

    act(() => button("button.multi-ai-source-selector__toggle").click());

    act(() => checkbox("What is event sourcing?").click());
    act(() => checkbox("Should we migrate to it?").click());

    const lastCall = onSelectionChange.mock.calls.at(-1)?.[0];
    expect(lastCall.sourceMessageIds).toEqual(["m1", "m2", "m3"]);
    expect(checkbox("A pattern storing state as events.").checked).toBe(true);
  });

  it("shows a reviewable preview of the exact context bundle for the current selection", () => {
    seedConversation();
    const onSelectionChange = vi.fn();
    mount(<MessageSourceSelector onSelectionChange={onSelectionChange} />);

    act(() => button("button.multi-ai-source-selector__toggle").click());
    act(() => checkbox("What is event sourcing?").click());

    const preview = host?.querySelector("[data-testid='multi-ai-context-bundle']");
    expect(preview).not.toBeNull();
    expect(preview?.textContent).toContain("What is event sourcing?");
  });

  it("Clear selection resets to no selection and notifies the caller with null", () => {
    seedConversation();
    const onSelectionChange = vi.fn();
    mount(<MessageSourceSelector onSelectionChange={onSelectionChange} />);

    act(() => button("button.multi-ai-source-selector__toggle").click());
    act(() => checkbox("What is event sourcing?").click());

    act(() => button("button.multi-ai-source-selector__clear").click());

    expect(onSelectionChange).toHaveBeenLastCalledWith(null);
    expect(host?.querySelector("[data-testid='multi-ai-context-bundle']")).toBeNull();
  });

  it("prepares a persisted, zero-cost handoff linked to the exact source ids", async () => {
    seedConversation();
    const onSelectionChange = vi.fn();
    mount(<MessageSourceSelector onSelectionChange={onSelectionChange} />);

    act(() => button("button.multi-ai-source-selector__toggle").click());
    act(() => checkbox("What is event sourcing?").click());
    act(() => checkbox("Should we migrate to it?").click());
    const prepare = [...(host?.querySelectorAll("button") ?? [])]
      .find((candidate) => candidate.textContent === "Prepare source handoff");
    if (!(prepare instanceof HTMLButtonElement)) throw new Error("Missing Prepare source handoff button");
    await act(async () => {
      prepare.click();
      await Promise.resolve();
    });

    const run = useSessionStore.getState().multiAiRuns[0];
    expect(run).toMatchObject({
      sourceMessageIds: ["m1", "m2", "m3"],
      participants: [],
      status: "complete",
      workflowStage: "local-preparation",
      totalEstimatedCost: 0,
      totalActualCost: 0,
    });
    expect(run.question).toContain("You: What is event sourcing?");
    expect(run.question).toContain("Assistant: A pattern storing state as events.");
    expect(run.question).toContain("You: Should we migrate to it?");
    expect(host?.querySelector("[role='status']")?.textContent).toContain("No provider request was sent");
    expect(host?.querySelector("[role='status']")?.textContent).toContain("no credits were used");
  });
});
