import { describe, expect, it } from "vitest";
import type { LocalDataset } from "./localDataset";
import { mergeDatasets } from "./durableSync";
import { checksum } from "./durableLayer4";

function dataset(sessionId: string, label: string): LocalDataset {
  const payload = {
    kind: "divergence-local-dataset" as const,
    schemaVersion: 2 as const,
    exportedAt: "2026-08-25T00:00:00.000Z",
    provenance: { producer: "Divergence.AI" as const, scope: "complete-user-owned-data" as const, excludes: ["credentials", "server-secrets"] as ["credentials", "server-secrets"] },
    account: {
      sessions: [{
        id: sessionId,
        createdAt: 1,
        archived: false,
        tag: label,
        model: "auto" as const,
        directness: 2 as const,
        techniques: [],
        context: [],
        variables: {},
        conversation: [],
      }],
    },
    session: {},
    workspace: { tasks: [], resources: [] },
    largeJob: null,
  };
  return { ...payload, checksum: checksum(payload) };
}

describe("Layer 4 conflict preservation", () => {
  it("keeps both different versions of the same session", () => {
    const merged = mergeDatasets(dataset("same", "Local"), dataset("same", "Remote"));
    expect(merged.account.sessions).toHaveLength(2);
    expect(merged.account.sessions?.map((record) => record.tag)).toEqual(expect.arrayContaining(["Local", "Remote"]));
  });
});
