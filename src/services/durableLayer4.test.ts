import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import {
  _resetLayer4DatabaseForTests,
  checksum,
  clearDurableJob,
  getSyncConflict,
  listRecoveryPoints,
  loadDurableJob,
  saveDurableJob,
  saveRecoveryPoint,
  setSyncConflict,
  stableStringify,
} from "./durableLayer4";

describe("Layer 4 durable local records", () => {
  beforeEach(async () => {
    await _resetLayer4DatabaseForTests();
  });

  it("uses deterministic checksums independent of object key order", () => {
    expect(stableStringify({ b: 2, a: 1 })).toBe(stableStringify({ a: 1, b: 2 }));
    expect(checksum({ b: 2, a: 1 })).toBe(checksum({ a: 1, b: 2 }));
  });

  it("restores an interrupted large job from its exact checkpoint", async () => {
    const job = {
      id: "job-1",
      kind: "synthetic-local-job" as const,
      source: "one\ntwo",
      batchSize: 1,
      units: [
        { id: "1", source: "one", result: "done", status: "complete" as const },
        { id: "2", source: "two", result: null, status: "pending" as const },
      ],
      paused: true,
      createdAt: 1,
      updatedAt: 2,
      status: "paused" as const,
    };
    await saveDurableJob(job);
    expect(await loadDurableJob()).toEqual(job);
    await clearDurableJob();
    expect(await loadDurableJob()).toBeNull();
  });

  it("bounds recovery history and preserves sync conflicts", async () => {
    for (let index = 0; index < 25; index += 1) {
      await saveRecoveryPoint({ sessionId: `s-${index}` }, { sessions: [] }, "autosave");
    }
    expect(await listRecoveryPoints()).toHaveLength(20);
    const conflict = { id: "c1", accountId: "a1", detectedAt: 1, local: { value: "local" }, remote: { value: "remote" }, remoteRevision: 4 };
    await setSyncConflict(conflict);
    expect(await getSyncConflict()).toEqual(conflict);
  });
});
