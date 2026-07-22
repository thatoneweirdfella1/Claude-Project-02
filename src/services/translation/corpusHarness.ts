/* Translation corpus harness (Step 2.4). Runs all 50 corpus cases through the
   translation engine and reports pass rate PER CATEGORY (not averaged), against
   PIPELINE.md's target: 90% overall, no category below 80%.

   Scoring is pluggable via a CorpusJudge. The default gapDetectionJudge is an
   OBJECTIVE, offline proxy — it checks the engine detected the case's primary
   gap category — so the harness runs and reports without a network. True
   translation-quality scoring (does translatedPrompt satisfy "what was actually
   needed"?) is a semantic judgement best made by a model; makeSemanticJudge
   wires that for real accuracy runs once the proxy is deployed (BUILD-LOG.md). */

import {
  CORPUS_CATEGORIES,
  CORPUS_CATEGORY_LABELS,
  type CorpusCase,
  type CorpusCategory,
} from "./corpus";
import type { TranslationModelClient } from "./client";
import { translate, type TranslationOutcome } from "./translate";

export const CORPUS_TARGET_OVERALL = 90;
export const CORPUS_TARGET_PER_CATEGORY = 80;

export interface JudgeVerdict {
  passed: boolean;
  detail: string;
}

export type CorpusJudge = (
  testCase: CorpusCase,
  outcome: TranslationOutcome,
) => JudgeVerdict | Promise<JudgeVerdict>;

/** Default offline judge: pass iff translation succeeded AND the engine detected
    the case's expected gap category. Objective and category-aligned, but a
    proxy for real translation quality (see makeSemanticJudge). */
export const gapDetectionJudge: CorpusJudge = (testCase, outcome) => {
  if (outcome.status !== "ok") {
    return { passed: false, detail: `translation: ${outcome.status}` };
  }
  if (outcome.result.detectedGaps.includes(testCase.expectedGap)) {
    return { passed: true, detail: `detected ${testCase.expectedGap}` };
  }
  return {
    passed: false,
    detail: `expected ${testCase.expectedGap}; got [${
      outcome.result.detectedGaps.join(", ") || "none"
    }]`,
  };
};

export interface CaseResult {
  testCase: CorpusCase;
  passed: boolean;
  detail: string;
}

export interface CategoryTally {
  category: CorpusCategory;
  label: string;
  passed: number;
  total: number;
  rate: number;
}

export interface CorpusReport {
  results: CaseResult[];
  perCategory: Record<CorpusCategory, CategoryTally>;
  overall: { passed: number; total: number; rate: number };
  targetOverall: number;
  targetPerCategory: number;
  meetsOverall: boolean;
  meetsPerCategory: boolean;
  meetsTarget: boolean;
}

export interface RunCorpusOptions {
  client: TranslationModelClient;
  judge?: CorpusJudge;
  maxInputChars?: number;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export async function runCorpus(
  cases: CorpusCase[],
  options: RunCorpusOptions,
): Promise<CorpusReport> {
  const judge = options.judge ?? gapDetectionJudge;
  const results: CaseResult[] = [];

  for (const testCase of cases) {
    const outcome = await translate(testCase.raw, {
      client: options.client,
      maxInputChars: options.maxInputChars,
    });
    const verdict = await judge(testCase, outcome);
    results.push({ testCase, passed: verdict.passed, detail: verdict.detail });
  }

  const perCategory = {} as Record<CorpusCategory, CategoryTally>;
  for (const category of CORPUS_CATEGORIES) {
    const inCategory = results.filter((r) => r.testCase.category === category);
    const passed = inCategory.filter((r) => r.passed).length;
    const total = inCategory.length;
    perCategory[category] = {
      category,
      label: CORPUS_CATEGORY_LABELS[category],
      passed,
      total,
      rate: total ? round1((100 * passed) / total) : 0,
    };
  }

  const passedAll = results.filter((r) => r.passed).length;
  const overall = {
    passed: passedAll,
    total: results.length,
    rate: results.length ? round1((100 * passedAll) / results.length) : 0,
  };

  const meetsOverall = overall.rate >= CORPUS_TARGET_OVERALL;
  // "no category below 80" — checked per category, NOT via the overall average.
  const meetsPerCategory = CORPUS_CATEGORIES.every(
    (category) =>
      perCategory[category].total === 0 ||
      perCategory[category].rate >= CORPUS_TARGET_PER_CATEGORY,
  );

  return {
    results,
    perCategory,
    overall,
    targetOverall: CORPUS_TARGET_OVERALL,
    targetPerCategory: CORPUS_TARGET_PER_CATEGORY,
    meetsOverall,
    meetsPerCategory,
    meetsTarget: meetsOverall && meetsPerCategory,
  };
}

/** Render a CorpusReport as a per-category markdown report. */
export function formatCorpusReport(report: CorpusReport): string {
  const lines: string[] = [];
  lines.push(
    `Overall: ${report.overall.passed}/${report.overall.total} (${report.overall.rate}%) — target ${report.targetOverall}% → ${report.meetsOverall ? "PASS" : "FAIL"}`,
  );
  lines.push("");
  lines.push("| Category | Passed | Total | Rate | Target 80% |");
  lines.push("|----------|-------:|------:|-----:|:----------:|");
  for (const category of CORPUS_CATEGORIES) {
    const t = report.perCategory[category];
    lines.push(
      `| ${t.label} (${category}) | ${t.passed} | ${t.total} | ${t.rate}% | ${
        t.rate >= report.targetPerCategory ? "PASS" : "FAIL"
      } |`,
    );
  }
  lines.push("");
  lines.push(
    `Meets target (90% overall, no category below 80%): ${report.meetsTarget ? "YES" : "NO"}`,
  );
  return lines.join("\n");
}

/** Semantic judge for REAL accuracy runs: asks a model whether the engine's
    translatedPrompt captures "what was actually needed." Requires a live client
    (network) — parked until the proxy is deployed. Provided so the harness is
    complete; not exercised offline. */
export function makeSemanticJudge(client: TranslationModelClient): CorpusJudge {
  return async (testCase, outcome) => {
    if (outcome.status !== "ok") {
      return { passed: false, detail: `translation: ${outcome.status}` };
    }
    const verdict = await client({
      model: "claude-sonnet-5",
      system:
        "You grade whether a REWRITTEN request captures the SAME underlying need as a reference. Reply with exactly PASS or FAIL on the first line.",
      input: `NEEDED: ${testCase.needed}\nREWRITE: ${outcome.result.translatedPrompt}`,
    });
    const passed = /^\s*pass/i.test(verdict);
    return { passed, detail: passed ? "semantic match" : "semantic mismatch" };
  };
}
