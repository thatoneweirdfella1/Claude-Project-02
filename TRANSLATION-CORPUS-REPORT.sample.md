# Translation corpus — SAMPLE report (Step 2.4)

> **This is a FORMAT sample, not a real accuracy measurement.** It was generated
> **offline** by running the harness over all 50 corpus cases with the **stub
> translation client** (no live model — the proxy is not deployed in this build,
> see BUILD-LOG.md) and the objective **gap-detection judge**. The stub emits a
> fixed pair of gaps, so it "passes" the two categories whose gap it happens to
> emit (TP, TPWC) and fails the other two (EID, CBR). The numbers below are real
> for that stub and demonstrate the report format and the 90%/80% target check —
> they are **not** the engine's real accuracy. A true run needs the deployed
> proxy plus the semantic judge (`makeSemanticJudge`), which grades the
> translation against "what was actually needed."
>
> Reproduced by `src/services/translation/corpus.test.ts` (asserts these exact
> tallies). Regenerate with `runCorpus(cases, { client, judge })` +
> `formatCorpusReport`.

```
Overall: 26/50 (52%) — target 90% → FAIL

| Category | Passed | Total | Rate | Target 80% |
|----------|-------:|------:|-----:|:----------:|
| Tangential Preamble (TP) | 13 | 13 | 100% | PASS |
| Emotional Intensity Distortion (EID) | 0 | 12 | 0% | FAIL |
| Compound-Buried Request (CBR) | 0 | 12 | 0% | FAIL |
| Typo-Pronoun-Wrapper Corruption (TPWC) | 13 | 13 | 100% | PASS |

Meets target (90% overall, no category below 80%): NO
```

## How to run it for real

1. Deploy the proxy (Step 1.10 residual) and set `ANTHROPIC_API_KEY`.
2. Build a live client: `const client = createProxyClient({ endpoint }).complete`.
3. Judge on meaning, not gap detection:
   `const judge = makeSemanticJudge(createProxyClient({ endpoint }).complete)`.
4. `const report = await runCorpus(parseCorpus(corpusMarkdown), { client, judge });`
5. `console.log(formatCorpusReport(report))` and check `report.meetsTarget`
   against the PIPELINE.md target (90% overall, no category below 80%,
   reported per category — not averaged).
