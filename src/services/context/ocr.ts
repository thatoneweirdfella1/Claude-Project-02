/* OCR pipeline (Step 7.2) — extends Step 7.1's file upload: when an image is
   uploaded, extract its text WITHOUT blocking the UI. CANON's ADHD Time rule
   ("every visual interaction responds under 300ms") is exactly why this
   can't run synchronously on the main thread — OCR recognition genuinely
   takes seconds, and freezing input/scroll/clicks for that long would
   violate it outright.

   OcrClient is an injected seam (`(file) => Promise<string>`), the same
   pattern every model call in this app uses (TranslationModelClient,
   DetectionModelClient) — readFileAsContextItem/uploadFiles depend on this
   narrow interface, never on tesseract.js directly, so they stay testable
   with an offline stub. createTesseractOcrClient() is the one real
   implementation, built on tesseract.js's createWorker() API.

   "Run OCR in a web worker" is tesseract.js's OWN architecture, not
   something hand-rolled on top of it: createWorker() spins up a dedicated
   Web Worker (plus a WASM recognition engine) internally and the returned
   worker's recognize() call does its heavy lifting off the main thread —
   the async/await code here is lightweight orchestration only. Building a
   second, hand-rolled Worker wrapper around an API that already IS
   worker-based would duplicate what the library already does correctly. */

import { createWorker, type Worker } from "tesseract.js";

export type OcrClient = (file: File) => Promise<string>;

let workerPromise: Promise<Worker> | null = null;

/** Lazily creates ONE tesseract worker and reuses it across every OCR call —
    spinning up a fresh worker (which loads the WASM engine + language data)
    per image would be wasteful; a worker safely serializes concurrent
    recognize() calls on its own. Never created until the first image is
    actually uploaded, so a session that never uploads an image pays nothing. */
function getWorker(): Promise<Worker> {
  if (!workerPromise) {
    workerPromise = createWorker("eng");
  }
  return workerPromise;
}

/** The real OCR client (Step 7.2's OUTPUT). Fetches tesseract.js's WASM
    engine + English language data over the network on first use (its
    default CDN-hosted assets — see BUILD-LOG.md PARKED on self-hosting) and
    recognizes the image's text. Rejects on failure — readFileAsContextItem
    catches that and falls back to an honest placeholder, same defensive
    posture as every other client seam in this app. */
export function createTesseractOcrClient(): OcrClient {
  return async (file: File): Promise<string> => {
    const worker = await getWorker();
    const { data } = await worker.recognize(file);
    return data.text.trim();
  };
}

/** Releases the underlying tesseract worker (and its WASM engine). Not
    required for correctness — the browser tab closing cleans it up either
    way — but available for a future session-lifecycle step (e.g. Close
    Session) that wants to free the memory deliberately. */
export async function terminateOcrWorker(): Promise<void> {
  if (!workerPromise) return;
  const worker = await workerPromise;
  workerPromise = null;
  await worker.terminate();
}
