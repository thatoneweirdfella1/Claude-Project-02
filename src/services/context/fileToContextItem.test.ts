/* Step 7.1 verification — turning a File into a ContextItem. Real File
   objects (happy-dom's File/Blob implementation) so file.text() actually
   exercises the real read path, not a stub. */

import { describe, expect, it } from "vitest";
import { readFileAsContextItem } from "./fileToContextItem";

describe("readFileAsContextItem — text-readable types", () => {
  it("reads a .txt file's real content", async () => {
    const file = new File(["hello from a text file"], "notes.txt", { type: "text/plain" });
    const item = await readFileAsContextItem(file);
    expect(item.kind).toBe("file");
    expect(item.label).toBe("notes.txt");
    expect(item.content).toBe("hello from a text file");
    expect(item.bytes).toBe(file.size);
    expect(item.id).toBeTruthy();
  });

  it("reads a .json file's real content", async () => {
    const json = JSON.stringify({ a: 1 });
    const file = new File([json], "data.json", { type: "application/json" });
    const item = await readFileAsContextItem(file);
    expect(item.content).toBe(json);
  });

  it("reads a .csv file's real content", async () => {
    const csv = "a,b\n1,2";
    const file = new File([csv], "table.csv", { type: "text/csv" });
    const item = await readFileAsContextItem(file);
    expect(item.content).toBe(csv);
  });

  it("gives each item a unique id, even for files with the same name", async () => {
    const a = await readFileAsContextItem(new File(["x"], "same.txt"));
    const b = await readFileAsContextItem(new File(["x"], "same.txt"));
    expect(a.id).not.toBe(b.id);
  });
});

describe("readFileAsContextItem — PDF (honest placeholder, no extraction library)", () => {
  it("accepts and tracks the file but flags content as unextracted, never garbled binary-as-text", async () => {
    const file = new File(["%PDF-1.4 binary garbage"], "report.pdf", { type: "application/pdf" });
    const item = await readFileAsContextItem(file);
    expect(item.label).toBe("report.pdf");
    expect(item.bytes).toBe(file.size);
    expect(item.content).toContain("report.pdf");
    expect(item.content).toMatch(/not available|extraction/i);
    expect(item.content).not.toContain("%PDF-1.4 binary garbage"); // never the raw bytes
  });
});

describe("readFileAsContextItem — images (Step 7.1 placeholder, Step 7.2 owns real OCR)", () => {
  it("accepts and tracks the file, flags content as awaiting OCR", async () => {
    const file = new File(["fake-png-bytes"], "photo.png", { type: "image/png" });
    const item = await readFileAsContextItem(file);
    expect(item.label).toBe("photo.png");
    expect(item.content).toMatch(/OCR|Step 7\.2/i);
  });
});
