/* Translation test corpus parser (Step 2.4). Parses the 50-case corpus
   (31_0_translation_test_cases.md) into structured cases the harness runs
   through the translation engine. Pure (markdown string in, cases out) so it's
   testable without file I/O; the harness/test reads the file and passes the
   text in.

   The corpus groups cases under four gap CATEGORIES (PIPELINE.md's per-category
   target is measured on these): TP / EID / CBR / TPWC — a subset of the six-gap
   taxonomy, each corpus case tagged with its single primary gap. */

import type { GapType } from "./schema";

export type CorpusCategory = "TP" | "EID" | "CBR" | "TPWC";

export const CORPUS_CATEGORIES: readonly CorpusCategory[] = [
  "TP",
  "EID",
  "CBR",
  "TPWC",
];

/** Corpus category code → the gap-taxonomy id the engine emits for it. */
export const CORPUS_CATEGORY_TO_GAP: Record<CorpusCategory, GapType> = {
  TP: "tangential-preamble",
  EID: "emotional-intensity-distortion",
  CBR: "compound-buried-request",
  TPWC: "typo-pronoun-wrapper-corruption",
};

export const CORPUS_CATEGORY_LABELS: Record<CorpusCategory, string> = {
  TP: "Tangential Preamble",
  EID: "Emotional Intensity Distortion",
  CBR: "Compound-Buried Request",
  TPWC: "Typo-Pronoun-Wrapper Corruption",
};

export interface CorpusCase {
  index: number;
  title: string;
  filename: string;
  category: CorpusCategory;
  /** The gap the engine should detect for this case's category. */
  expectedGap: GapType;
  /** "What was actually needed" — the reference intent (for semantic judging). */
  needed: string;
  /** The verbatim raw opening message fed to the translation engine. */
  raw: string;
}

function firstMatch(text: string, re: RegExp): string | undefined {
  return re.exec(text)?.[1];
}

/** Parse the corpus markdown into its 50 cases. Robust to the section headers
    (## ) interleaved between cases: it splits on the per-case "### N." headers
    and reads each case's fields from the top of its chunk. */
export function parseCorpus(markdown: string): CorpusCase[] {
  const chunks = markdown.split(/\n### /).slice(1); // drop the pre-first-case preamble
  const cases: CorpusCase[] = [];

  for (const chunk of chunks) {
    const head = /^(\d+)\.\s+(.+)/.exec(chunk);
    if (!head) continue;

    const code = firstMatch(chunk, /- \*\*Gap category:\*\*[^\n]*\(([A-Z]+)\)/) as
      | CorpusCategory
      | undefined;
    if (!code || !(code in CORPUS_CATEGORY_TO_GAP)) continue;

    const rawBlock = /```text\r?\n([\s\S]*?)```/.exec(chunk);

    cases.push({
      index: Number(head[1]),
      title: head[2].trim(),
      filename: firstMatch(chunk, /- \*\*Filename:\*\*\s*`([^`]+)`/) ?? "",
      category: code,
      expectedGap: CORPUS_CATEGORY_TO_GAP[code],
      needed:
        firstMatch(chunk, /- \*\*What was actually needed:\*\*\s*([^\n]+)/)?.trim() ??
        "",
      raw: rawBlock ? rawBlock[1].replace(/\s+$/, "") : "",
    });
  }

  return cases;
}
