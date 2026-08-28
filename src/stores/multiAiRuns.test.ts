/* R21: Persist Multi-AI Results — verifies multiAiRuns survive the same
   store lifecycle (add/update, loadSessionRecord, hydrate) every other
   persisted session field already does. */

import { beforeEach, describe, expect, it } from "vitest";
import { useSessionStore, createInitialSessionState } from "./sessionStore";
import type { MultiAiRunRecord } from "./types";

function resetStore() {
  useSessionStore.setState(createInitialSessionState());
}

beforeEach(resetStore);

function run(overrides: Partial<MultiAiRunRecord> = {}): MultiAiRunRecord {
  return {
    id: "run-1",
    sourceMessageIds: ["m1"],
    createdAt: 1000,
    question: "Should we use microservices?",
    participants: [
      { label: "Claude", provider: "anthropic", model: "claude-sonnet-5", status: "ok", text: "Answer A" },
      { label: "GPT-5.5", provider: "openai", model: "gpt-5.5", status: "ok", text: "Answer B" },
    ],
    status: "complete",
    totalEstimatedCost: 0.05,
    totalActualCost: null,
    ...overrides,
  };
}

describe("R21: multiAiRuns persistence", () => {
  it("upsertMultiAiRun adds a new run", () => {
    useSessionStore.getState().upsertMultiAiRun(run());
    expect(useSessionStore.getState().multiAiRuns).toHaveLength(1);
    expect(useSessionStore.getState().multiAiRuns[0].id).toBe("run-1");
  });

  it("upsertMultiAiRun replaces an existing run by id rather than duplicating it", () => {
    useSessionStore.getState().upsertMultiAiRun(run({ status: "partial" }));
    useSessionStore.getState().upsertMultiAiRun(run({ status: "complete", consensus: {
      disagreement: "d", commonGround: "c", unifiedView: "u",
    } }));

    const runs = useSessionStore.getState().multiAiRuns;
    expect(runs).toHaveLength(1);
    expect(runs[0].status).toBe("complete");
    expect(runs[0].consensus?.unifiedView).toBe("u");
  });

  it("keeps multiple distinct runs (different ids) separately", () => {
    useSessionStore.getState().upsertMultiAiRun(run({ id: "run-1" }));
    useSessionStore.getState().upsertMultiAiRun(run({ id: "run-2", sourceMessageIds: ["m3"] }));

    expect(useSessionStore.getState().multiAiRuns).toHaveLength(2);
  });

  it("loadSessionRecord restores persisted multiAiRuns", () => {
    useSessionStore.getState().loadSessionRecord({
      id: "session-1", createdAt: 1, archived: false, directness: 1,
      techniques: [], context: [], variables: {}, conversation: [],
      model: "auto", multiAiRuns: [run()],
    });

    expect(useSessionStore.getState().multiAiRuns).toHaveLength(1);
    expect(useSessionStore.getState().multiAiRuns[0].question).toContain("microservices");
  });

  it("loadSessionRecord defaults to an empty array when multiAiRuns is absent (legacy record)", () => {
    useSessionStore.getState().loadSessionRecord({
      id: "session-1", createdAt: 1, archived: false, directness: 1,
      techniques: [], context: [], variables: {}, conversation: [],
      model: "auto",
    });

    expect(useSessionStore.getState().multiAiRuns).toEqual([]);
  });

  it("hydrate restores multiAiRuns from a saved snapshot (autosave round-trip)", () => {
    useSessionStore.getState().upsertMultiAiRun(run());
    const saved = useSessionStore.getState().multiAiRuns;

    resetStore();
    expect(useSessionStore.getState().multiAiRuns).toEqual([]);

    useSessionStore.getState().hydrate({ multiAiRuns: saved });
    expect(useSessionStore.getState().multiAiRuns).toHaveLength(1);
    expect(useSessionStore.getState().multiAiRuns[0].id).toBe("run-1");
  });

  it("newSession clears multiAiRuns — they belong to the session that produced them", () => {
    useSessionStore.getState().upsertMultiAiRun(run());
    useSessionStore.getState().newSession();
    expect(useSessionStore.getState().multiAiRuns).toEqual([]);
  });

  it("preserves attribution (provider/model) and per-participant status through persistence", () => {
    useSessionStore.getState().upsertMultiAiRun(run({
      participants: [
        { label: "Claude", provider: "anthropic", model: "claude-sonnet-5", status: "ok", text: "A" },
        { label: "GPT-5.5", provider: "openai", model: "gpt-5.5", status: "error", message: "down" },
        { label: "Gemini 3.1 Pro", provider: "google", model: "gemini-3.1-pro", status: "ok", text: "C" },
      ],
      status: "partial",
    }));

    const [persisted] = useSessionStore.getState().multiAiRuns;
    expect(persisted.participants).toHaveLength(3);
    expect(persisted.participants[1].status).toBe("error");
    expect(persisted.participants[1].message).toBe("down");
    expect(persisted.participants[2].provider).toBe("google");
  });

  it("R20: run keeps a link to its stable source message ids", () => {
    useSessionStore.getState().upsertMultiAiRun(run({ sourceMessageIds: ["m1", "m2", "m3"] }));
    expect(useSessionStore.getState().multiAiRuns[0].sourceMessageIds).toEqual(["m1", "m2", "m3"]);
  });
});
