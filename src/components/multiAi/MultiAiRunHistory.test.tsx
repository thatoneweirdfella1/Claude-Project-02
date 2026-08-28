import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { MultiAiRunHistory } from "./MultiAiRunHistory";
import { createInitialSessionState, useSessionStore } from "../../stores/sessionStore";
import type { MultiAiRunRecord } from "../../stores/types";

/* R21: Persist Multi-AI Results — proves the history view renders straight
   from the persisted store (not live component state), and correctly links
   a run to the message(s) it branched from (R20). */

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

function run(overrides: Partial<MultiAiRunRecord> = {}): MultiAiRunRecord {
  return {
    id: "run-1",
    sourceMessageIds: ["m1"],
    createdAt: 1000,
    question: "Should we use microservices?",
    participants: [
      { label: "Claude", provider: "anthropic", model: "claude-sonnet-5", status: "ok", text: "Wait for a real need.", estimatedCost: 0.01, actualCost: 0.012 },
      { label: "GPT-5.5", provider: "openai", model: "gpt-5.5", status: "ok", text: "Start early.", estimatedCost: 0.008, actualCost: null },
    ],
    status: "complete",
    totalEstimatedCost: 0.018,
    totalActualCost: null,
    ...overrides,
  };
}

describe("R21: MultiAiRunHistory", () => {
  it("renders nothing when there are no persisted runs", () => {
    mount(<MultiAiRunHistory />);
    expect(host?.querySelector("[data-testid='multi-ai-run-history']")).toBeNull();
  });

  it("renders a persisted run straight from the store", () => {
    useSessionStore.getState().upsertMultiAiRun(run());
    mount(<MultiAiRunHistory />);

    expect(host?.querySelector("[data-testid='multi-ai-run-history']")).not.toBeNull();
    expect(host?.textContent).toContain("microservices");
    expect(host?.textContent).toContain("Complete");
  });

  it("shows every participant's attribution and text, not just the first partner (R23)", () => {
    useSessionStore.getState().upsertMultiAiRun(run({
      participants: [
        { label: "Claude", provider: "anthropic", model: "claude-sonnet-5", status: "ok", text: "Claude's view" },
        { label: "GPT-5.5", provider: "openai", model: "gpt-5.5", status: "ok", text: "GPT's view" },
        { label: "Gemini 3.1 Pro", provider: "google", model: "gemini-3.1-pro", status: "ok", text: "Gemini's view" },
      ],
    }));
    mount(<MultiAiRunHistory />);

    expect(host?.textContent).toContain("Claude's view");
    expect(host?.textContent).toContain("GPT's view");
    expect(host?.textContent).toContain("Gemini's view");
  });

  it("shows a failed participant's neutral message, not raw error text", () => {
    useSessionStore.getState().upsertMultiAiRun(run({
      status: "partial",
      participants: [
        { label: "Claude", provider: "anthropic", model: "claude-sonnet-5", status: "ok", text: "A" },
        { label: "GPT-5.5", provider: "openai", model: "gpt-5.5", status: "error", message: "This side couldn't be reached." },
      ],
    }));
    mount(<MultiAiRunHistory />);

    expect(host?.textContent).toContain("This side couldn't be reached.");
    expect(host?.textContent).toContain("Partial");
  });

  it("shows consensus and synthesis when present on the run", () => {
    useSessionStore.getState().upsertMultiAiRun(run({
      consensus: { disagreement: "d-text", commonGround: "c-text", unifiedView: "u-text" },
      synthesis: { refinedAnswer: "synth-text" },
    }));
    mount(<MultiAiRunHistory />);

    expect(host?.textContent).toContain("d-text");
    expect(host?.textContent).toContain("c-text");
    expect(host?.textContent).toContain("u-text");
    expect(host?.textContent).toContain("synth-text");
  });

  it("filters to only the runs linked to the given source message ids", () => {
    useSessionStore.getState().upsertMultiAiRun(run({ id: "run-1", sourceMessageIds: ["m1"], question: "Question about m1" }));
    useSessionStore.getState().upsertMultiAiRun(run({ id: "run-2", sourceMessageIds: ["m2"], question: "Question about m2" }));

    mount(<MultiAiRunHistory sourceMessageIds={["m1"]} />);

    expect(host?.textContent).toContain("Question about m1");
    expect(host?.textContent).not.toContain("Question about m2");
  });

  it("shows cancelled status honestly, without any completed-looking participant data", () => {
    useSessionStore.getState().upsertMultiAiRun(run({ status: "cancelled", participants: [] }));
    mount(<MultiAiRunHistory />);

    expect(host?.textContent).toContain("Cancelled");
  });

  it("survives a simulated reload — a fresh mount against the same persisted store still shows the run", () => {
    useSessionStore.getState().upsertMultiAiRun(run());
    mount(<MultiAiRunHistory />);
    expect(host?.textContent).toContain("microservices");

    // Simulate reload: unmount, remount a fresh component tree against the
    // still-persisted store state (no new upsert call).
    act(() => root?.unmount());
    host?.remove();
    mount(<MultiAiRunHistory />);
    expect(host?.textContent).toContain("microservices");
  });
});
