/* Step 7.1 verification — batch upload: accumulates the running session
   total ACROSS a multi-file batch (so the 50MB cap is enforced correctly
   even when no single file exceeds 10MB), never throws on a bad file, and
   keeps processing the rest of the batch. */

import { describe, expect, it } from "vitest";
import { MAX_SESSION_BYTES } from "./fileValidation";
import { uploadFiles } from "./uploadFiles";

function textFile(name: string, sizeBytes: number): File {
  return new File([new Uint8Array(sizeBytes)], name, { type: "text/plain" });
}

describe("uploadFiles — accepted files", () => {
  it("reads and returns a ContextItem for every accepted file", async () => {
    const files = [
      new File(["hello"], "a.txt", { type: "text/plain" }),
      new File(["world"], "b.txt", { type: "text/plain" }),
    ];
    const { accepted, rejected } = await uploadFiles(files, 0);
    expect(rejected).toEqual([]);
    expect(accepted).toHaveLength(2);
    expect(accepted.map((i) => i.label)).toEqual(["a.txt", "b.txt"]);
  });
});

describe("uploadFiles — the running session total accumulates across the batch", () => {
  it("rejects a later file once earlier ACCEPTED files in the same batch fill the session cap, even though each alone is under the 10MB per-file limit", async () => {
    // Six 9MB files = 54MB total; each is well under the 10MB/file cap, but
    // the sixth pushes the cumulative session total (45MB so far) to 54MB,
    // over the 50MB session cap.
    const files = Array.from({ length: 6 }, (_, i) => textFile(`file-${i}.txt`, 9 * 1024 * 1024));
    const { accepted, rejected } = await uploadFiles(files, 0);
    expect(accepted).toHaveLength(5);
    expect(accepted.map((i) => i.label)).toEqual(["file-0.txt", "file-1.txt", "file-2.txt", "file-3.txt", "file-4.txt"]);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].file.name).toBe("file-5.txt");
    expect(rejected[0].result.reason).toBe("session-too-large");
  });

  it("starts accumulating from the caller-supplied currentSessionBytes, not from zero", async () => {
    const files = [textFile("new.txt", 5 * 1024 * 1024)];
    const almostFull = MAX_SESSION_BYTES - 4 * 1024 * 1024; // only 4MB of headroom left
    const { accepted, rejected } = await uploadFiles(files, almostFull);
    expect(accepted).toHaveLength(0);
    expect(rejected).toHaveLength(1);
  });
});

describe("uploadFiles — mixed batch (bad file doesn't abort the rest)", () => {
  it("skips a rejected file and still processes the others", async () => {
    const files = [
      new File(["ok"], "good.txt", { type: "text/plain" }),
      new File(["nope"], "bad.zip", { type: "application/zip" }),
      new File(["also ok"], "also-good.txt", { type: "text/plain" }),
    ];
    const { accepted, rejected } = await uploadFiles(files, 0);
    expect(accepted.map((i) => i.label)).toEqual(["good.txt", "also-good.txt"]);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].file.name).toBe("bad.zip");
    expect(rejected[0].result.reason).toBe("type");
  });
});

describe("uploadFiles — empty batch", () => {
  it("returns empty accepted/rejected for no files, without throwing", async () => {
    const { accepted, rejected } = await uploadFiles([], 0);
    expect(accepted).toEqual([]);
    expect(rejected).toEqual([]);
  });
});
