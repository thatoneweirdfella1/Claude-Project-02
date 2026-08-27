/* Step 7.5 verification — the Context Snapshot data helper (pure). Same
   repo-wide no-RTL choice as every other component: pure logic is tested
   here, the component is typecheck+build verified only (see BUILD-LOG.md
   PARKED). */

import { describe, expect, it } from "vitest";
import {
  SNAPSHOT_KIND_LABELS,
  buildSnapshotItems,
  variableNameFromSnapshotId,
} from "./contextSnapshotItems";
import type { ContextItem } from "../../stores/types";

const FILE_ITEM: ContextItem = {
  id: "ctx-1",
  kind: "file",
  label: "notes.txt",
  content: "hello",
  bytes: 2048,
  provenance: "Uploaded",
};

const URL_ITEM: ContextItem = {
  id: "ctx-2",
  kind: "url",
  label: "https://example.com/article",
  content: "article text",
  bytes: 1_048_576, // 1MB
  provenance: "Loaded from URL",
};

describe("buildSnapshotItems — combines session.context and session.variables", () => {
  it("returns an empty list when nothing is loaded", () => {
    expect(buildSnapshotItems([], {})).toEqual([]);
  });

  it("includes every session.context item, keyed by its own id", () => {
    const items = buildSnapshotItems([FILE_ITEM, URL_ITEM], {});
    expect(items.map((i) => i.id)).toEqual(["ctx-1", "ctx-2"]);
    expect(items[0]).toEqual({ id: "ctx-1", kind: "file", label: "notes.txt", detail: "2.0 KB", provenance: "Uploaded" });
    expect(items[1]).toEqual({
      id: "ctx-2",
      kind: "url",
      label: "https://example.com/article",
      detail: "1.0 MB",
      provenance: "Loaded from URL",
    });
  });

  it("includes every variable, labeled with a $ prefix and a value preview", () => {
    const items = buildSnapshotItems([], { project: "Divergence.AI" });
    expect(items).toEqual([
      { id: "variable:project", kind: "variable", label: "$project", detail: "Divergence.AI" },
    ]);
  });

  it("shows '(empty)' for a variable with an empty-string value, not a blank detail", () => {
    const items = buildSnapshotItems([], { x: "" });
    expect(items[0].detail).toBe("(empty)");
  });

  it("truncates a long variable value preview", () => {
    const long = "x".repeat(80);
    const items = buildSnapshotItems([], { big: long });
    expect(items[0].detail.length).toBeLessThan(long.length);
    expect(items[0].detail.endsWith("…")).toBe(true);
  });

  it("combines both sources into one flat list, context items first", () => {
    const items = buildSnapshotItems([FILE_ITEM], { name: "Sam" });
    expect(items.map((i) => i.kind)).toEqual(["file", "variable"]);
  });

  it("a variable's synthetic id never collides with a real ContextItem id", () => {
    const items = buildSnapshotItems([FILE_ITEM], { "1": "x" });
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length); // no duplicate keys
  });
});

describe("variableNameFromSnapshotId", () => {
  it("extracts the bare name from a variable snapshot id", () => {
    expect(variableNameFromSnapshotId("variable:project")).toBe("project");
  });

  it("returns null for a non-variable (ContextItem) id", () => {
    expect(variableNameFromSnapshotId("ctx-1")).toBeNull();
  });

  it("round-trips with buildSnapshotItems' own id construction", () => {
    const [item] = buildSnapshotItems([], { my_var: "value" });
    expect(variableNameFromSnapshotId(item.id)).toBe("my_var");
  });
});

describe("SNAPSHOT_KIND_LABELS", () => {
  it("has a label for every ContextItemKind", () => {
    expect(SNAPSHOT_KIND_LABELS.file).toBe("File");
    expect(SNAPSHOT_KIND_LABELS.url).toBe("URL");
    expect(SNAPSHOT_KIND_LABELS.text).toBe("Text");
    expect(SNAPSHOT_KIND_LABELS.variable).toBe("Variable");
  });
});

describe("R09 — File Attachment provenance", () => {
  it("preserves provenance from context items", () => {
    const items = buildSnapshotItems([FILE_ITEM], {});
    expect(items[0].provenance).toBe("Uploaded");
  });

  it("includes provenance in the snapshot item when present", () => {
    const pasted: ContextItem = {
      id: "ctx-pasted",
      kind: "text",
      label: "My Notes",
      content: "Some text",
      bytes: 100,
      provenance: "Pasted",
    };
    const items = buildSnapshotItems([pasted], {});
    expect(items[0].provenance).toBe("Pasted");
  });

  it("handles items without provenance gracefully", () => {
    const noProv: ContextItem = {
      id: "ctx-no-prov",
      kind: "text",
      label: "Old Item",
      content: "text",
      bytes: 50,
    };
    const items = buildSnapshotItems([noProv], {});
    expect(items[0].provenance).toBeUndefined();
  });

  it("does not add provenance to variables", () => {
    const items = buildSnapshotItems([], { x: "value" });
    expect(items[0].provenance).toBeUndefined();
  });
});
