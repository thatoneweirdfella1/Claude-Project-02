import type { ExportData } from "./types";

/** JSON — the machine-readable format. Pretty-printed for a human opening
    the downloaded file directly, same as every other JSON this app writes
    (persistence.ts's IndexedDB blobs are the exception, since those are
    never hand-read). */
export function renderJson(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}
