import { renderMarkdown } from "./renderMarkdown";
import { buildPdfBytes } from "./pdf";
import type { ExportData } from "./types";

/** PDF export — reuses renderMarkdown()'s text output as the page content
    rather than a second content-formatting implementation; "#"/"-" markdown
    syntax just prints literally, which reads fine as a plain document. */
export function renderPdf(data: ExportData): Uint8Array<ArrayBuffer> {
  return buildPdfBytes(renderMarkdown(data));
}
