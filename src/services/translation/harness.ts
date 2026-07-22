/* Small manual test harness for the Translation Engine (Step 2.2 OUTPUT).

   Runs the service over a set of ADHD-style sample inputs and prints each
   TranslationOutcome, so a developer can eyeball how the pipeline behaves
   end-to-end. Because Step 1.10's proxy is absent (no-network sandbox), it
   defaults to an offline STUB client that returns canned JSON — this exercises
   the full input→service→validate→outcome path without a live model. To see
   REAL translations, pass the Step 1.10 proxy client:

     await runTranslationHarness(realProxyClient);

   Exercised automatically by harness.test.ts; also importable into a scratch
   script or the browser console once the proxy exists. */

import type { TranslationModelClient } from "./client";
import { translate, type TranslationOutcome } from "./translate";

/** Sample inputs, each foregrounding a different gap type from the taxonomy. */
export const SAMPLE_INPUTS: readonly string[] = [
  // tangential-preamble + typo/wrapper corruption
  "ok so i was up till 3am again reading about databases lol anyway sorry this is probably dumb but how do i actually make an index in postgres",
  // emotional-intensity-distortion + compound-buried-request
  "I am SO done with this bug!! nothing works. do i use useEffect or useMemo here, and also is my whole component structure wrong??",
  // scope-ambiguity + unstated-assumptions
  "can you explain the auth thing we talked about",
  // essentially empty / no request
  "   ",
];

/** Offline stand-in for the Step 1.10 proxy client. Returns a plausible,
    schema-shaped JSON reply so the harness and tests run without a network.
    NOT a real translation — swap in the proxy client for genuine output. */
export const stubTranslationClient: TranslationModelClient = async ({ input }) => {
  return JSON.stringify({
    translatedPrompt: `How do I ${input.slice(0, 60).trim()}? (stubbed)`,
    confidence: 78,
    detectedGaps: ["tangential-preamble", "typo-pronoun-wrapper-corruption"],
    reasoning: "Stub client — no model was actually called.",
  });
};

/** Run the service over SAMPLE_INPUTS and log each outcome. Returns the
    outcomes so a test can assert on them too. */
export async function runTranslationHarness(
  client: TranslationModelClient = stubTranslationClient,
): Promise<TranslationOutcome[]> {
  const outcomes: TranslationOutcome[] = [];
  for (const input of SAMPLE_INPUTS) {
    const outcome = await translate(input, { client });
    outcomes.push(outcome);
    // eslint-disable-next-line no-console -- harness is a dev tool
    console.log(
      `\nINPUT: ${JSON.stringify(input)}\nOUTCOME: ${JSON.stringify(outcome, null, 2)}`,
    );
  }
  return outcomes;
}
