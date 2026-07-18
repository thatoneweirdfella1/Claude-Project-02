/* Step 7.1 verification — turning a File into a ContextItem. Real File
   objects (happy-dom's File/Blob implementation) so file.text() actually
   exercises the real read path, not a stub. Step 7.2 adds OCR — tested here
   via an injected OcrClient stub (the sandbox has no network for
   tesseract.js's real CDN-hosted WASM/language assets; see BUILD-LOG.md
   PARKED, same standing residual as every model call since Step 1.10). */

import { describe, expect, it, vi } from "vitest";
import { readFileAsContextItem } from "./fileToContextItem";
import type { OcrClient } from "./ocr";

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

describe("readFileAsContextItem — images, no ocrClient supplied (placeholder, unchanged from Step 7.1)", () => {
  it("accepts and tracks the file, flags content as awaiting OCR", async () => {
    const file = new File(["fake-png-bytes"], "photo.png", { type: "image/png" });
    const item = await readFileAsContextItem(file);
    expect(item.label).toBe("photo.png");
    expect(item.content).toMatch(/OCR/i);
  });
});

describe("readFileAsContextItem — images, Step 7.2 real OCR path", () => {
  it("uses the ocrClient's extracted text as the item's content", async () => {
    const ocrClient: OcrClient = vi.fn(async () => "Text found in the image.");
    const file = new File(["fake-png-bytes"], "photo.png", { type: "image/png" });
    const item = await readFileAsContextItem(file, { ocrClient });
    expect(item.content).toBe("Text found in the image.");
    expect(ocrClient).toHaveBeenCalledWith(file);
  });

  it("trims the extracted text", async () => {
    const ocrClient: OcrClient = vi.fn(async () => "  spaced out  \n");
    const item = await readFileAsContextItem(new File(["x"], "a.png"), { ocrClient });
    expect(item.content).toBe("spaced out");
  });

  it("falls back to a neutral 'no text found' note when OCR succeeds but finds nothing", async () => {
    const ocrClient: OcrClient = vi.fn(async () => "   ");
    const item = await readFileAsContextItem(new File(["x"], "blank.png"), { ocrClient });
    expect(item.content).toContain("blank.png");
    expect(item.content).toMatch(/no readable text/i);
  });

  it("never crashes when OCR itself fails — falls back to an honest placeholder", async () => {
    const ocrClient: OcrClient = vi.fn(async () => {
      throw new Error("worker init failed");
    });
    const item = await readFileAsContextItem(new File(["x"], "photo.jpg"), { ocrClient });
    expect(item.label).toBe("photo.jpg");
    expect(item.content).toContain("photo.jpg");
    expect(item.content).toMatch(/failed/i);
  });

  it("never applies ocrClient to non-image files (PDF, TXT)", async () => {
    const ocrClient: OcrClient = vi.fn(async () => "should never be called");
    const txt = await readFileAsContextItem(new File(["real text"], "notes.txt"), { ocrClient });
    expect(txt.content).toBe("real text");
    expect(ocrClient).not.toHaveBeenCalled();
  });
});
