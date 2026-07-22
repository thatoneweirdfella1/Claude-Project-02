/* Step 2.4 verification — the corpus harness. Reads the real 50-case corpus,
   checks the parser recovers all cases and the category distribution, and
   confirms the runner's per-category aggregation and 90%/80% target logic on
   controlled clients/judges (a passing run, and the honest offline stub run
   that backs the committed sample report). */

import { describe, expect, it } from "vitest";
// Load the corpus markdown as a string via Vite's ?raw import (typed by
// vite/client) — no node fs, so tsc's browser config typechecks the test fine.
import CORPUS from "../../../31_0_translation_test_cases.md?raw";
import { parseCorpus } from "./corpus";
import {
  formatCorpusReport,
  gapDetectionJudge,
  runCorpus,
  type CorpusJudge,
} from "./corpusHarness";
import { stubTranslationClient } from "./harness";

const cases = parseCorpus(CORPUS);

describe("parseCorpus", () => {
  it("recovers all 50 cases with the documented category distribution", () => {
    expect(cases).toHaveLength(50);
    const counts = cases.reduce<Record<string, number>>((acc, c) => {
      acc[c.category] = (acc[c.category] ?? 0) + 1;
      return acc;
    }, {});
    expect(counts).toEqual({ TP: 13, EID: 12, CBR: 12, TPWC: 13 });
  });

  it("gives every case a non-empty raw input, needed, and mapped gap", () => {
    for (const c of cases) {
      expect(c.raw.length).toBeGreaterThan(0);
      expect(c.needed.length).toBeGreaterThan(0);
      expect(c.expectedGap.length).toBeGreaterThan(0);
    }
  });
});

describe("runCorpus — aggregation and targets", () => {
  it("reports 100% and meets target when every case passes", async () => {
    const alwaysPass: CorpusJudge = () => ({ passed: true, detail: "ok" });
    const report = await runCorpus(cases, {
      client: stubTranslationClient,
      judge: alwaysPass,
    });
    expect(report.overall).toMatchObject({ passed: 50, total: 50, rate: 100 });
    expect(report.meetsTarget).toBe(true);
  });

  it("flags a sub-80% category even when others are perfect (not averaged)", async () => {
    // Fail only the EID category; TP/CBR/TPWC all pass.
    const failEid: CorpusJudge = (c) => ({
      passed: c.category !== "EID",
      detail: c.category,
    });
    const report = await runCorpus(cases, { client: stubTranslationClient, judge: failEid });
    expect(report.perCategory.EID.rate).toBe(0);
    expect(report.perCategory.TP.rate).toBe(100);
    expect(report.meetsOverall).toBe(false); // 38/50 = 76%
    expect(report.meetsPerCategory).toBe(false);
    expect(report.meetsTarget).toBe(false);
  });

  it("matches the committed sample report (offline stub + gap-detection judge)", async () => {
    const report = await runCorpus(cases, {
      client: stubTranslationClient,
      judge: gapDetectionJudge,
    });
    // The 2.2 stub always emits tangential-preamble + typo/wrapper, so TP and
    // TPWC pass on gap-detection; EID and CBR do not.
    expect(report.perCategory.TP.rate).toBe(100);
    expect(report.perCategory.TPWC.rate).toBe(100);
    expect(report.perCategory.EID.rate).toBe(0);
    expect(report.perCategory.CBR.rate).toBe(0);
    expect(report.overall).toMatchObject({ passed: 26, total: 50, rate: 52 });
    expect(report.meetsTarget).toBe(false);

    const text = formatCorpusReport(report);
    expect(text).toContain("| Category | Passed | Total | Rate | Target 80% |");
    expect(text).toContain("Meets target (90% overall, no category below 80%): NO");
  });
});

describe("gapDetectionJudge", () => {
  it("passes when the expected gap is detected, fails otherwise and on non-ok", () => {
    const c = cases.find((x) => x.category === "EID")!;
    expect(
      gapDetectionJudge(c, {
        status: "ok",
        result: {
          translatedPrompt: "x",
          confidence: 80,
          detectedGaps: ["emotional-intensity-distortion"],
          reasoning: "r",
        },
      }),
    ).toMatchObject({ passed: true });
    expect(gapDetectionJudge(c, { status: "error", message: "boom" })).toMatchObject({
      passed: false,
    });
  });
});
