/* Step 7.2 verification — the tesseract.js-backed OCR client: lazy, reused
   worker (created once, not once per image), text extraction/trimming, and
   clean teardown. tesseract.js's createWorker() is mocked — it would
   otherwise fetch its WASM engine + language data over the network on first
   use, and this sandbox has no network (same standing residual as every
   real model/proxy call since Step 1.10; the genuine tesseract.js CDN fetch
   is unverified here, see BUILD-LOG.md PARKED). */

import { afterEach, describe, expect, it, vi } from "vitest";

const recognize = vi.fn();
const terminate = vi.fn(async () => {});
const createWorker = vi.fn(async (..._args: unknown[]) => ({ recognize, terminate }));

vi.mock("tesseract.js", () => ({
  createWorker: (...args: unknown[]) => createWorker(...args),
}));

describe("createTesseractOcrClient", () => {
  afterEach(async () => {
    vi.resetModules();
    createWorker.mockClear();
    recognize.mockClear();
    terminate.mockClear();
  });

  it("creates the worker with English, and reuses it across multiple calls (not once per image)", async () => {
    recognize.mockResolvedValue({ data: { text: "first" } });
    const { createTesseractOcrClient } = await import("./ocr");
    const client = createTesseractOcrClient();

    await client(new File(["a"], "a.png"));
    await client(new File(["b"], "b.png"));

    expect(createWorker).toHaveBeenCalledTimes(1);
    expect(createWorker).toHaveBeenCalledWith("eng");
    expect(recognize).toHaveBeenCalledTimes(2);
  });

  it("returns the recognized text, trimmed", async () => {
    recognize.mockResolvedValue({ data: { text: "  hello world  \n" } });
    const { createTesseractOcrClient } = await import("./ocr");
    const client = createTesseractOcrClient();

    const text = await client(new File(["x"], "x.png"));
    expect(text).toBe("hello world");
  });

  it("passes the file straight through to worker.recognize()", async () => {
    recognize.mockResolvedValue({ data: { text: "ok" } });
    const { createTesseractOcrClient } = await import("./ocr");
    const client = createTesseractOcrClient();
    const file = new File(["x"], "x.png");

    await client(file);
    expect(recognize).toHaveBeenCalledWith(file);
  });

  it("propagates a recognize() failure — the caller (fileToContextItem) is what falls back gracefully", async () => {
    recognize.mockRejectedValue(new Error("recognition failed"));
    const { createTesseractOcrClient } = await import("./ocr");
    const client = createTesseractOcrClient();

    await expect(client(new File(["x"], "x.png"))).rejects.toThrow("recognition failed");
  });
});

describe("terminateOcrWorker", () => {
  afterEach(() => {
    vi.resetModules();
    createWorker.mockClear();
    terminate.mockClear();
  });

  it("terminates the worker and a subsequent call creates a fresh one", async () => {
    recognize.mockResolvedValue({ data: { text: "x" } });
    const { createTesseractOcrClient, terminateOcrWorker } = await import("./ocr");
    const client = createTesseractOcrClient();

    await client(new File(["x"], "x.png"));
    expect(createWorker).toHaveBeenCalledTimes(1);

    await terminateOcrWorker();
    expect(terminate).toHaveBeenCalledTimes(1);

    await client(new File(["y"], "y.png"));
    expect(createWorker).toHaveBeenCalledTimes(2); // a fresh worker was created
  });

  it("is a no-op when no worker was ever created", async () => {
    const { terminateOcrWorker } = await import("./ocr");
    await expect(terminateOcrWorker()).resolves.toBeUndefined();
    expect(terminate).not.toHaveBeenCalled();
  });
});
