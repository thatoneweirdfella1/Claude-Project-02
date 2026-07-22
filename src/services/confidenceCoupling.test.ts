/* Step 3.3 verification — the low-confidence escalation integration check.

   The coupling logic already lives in routing.js and is unit-covered by
   tests.js (ROUTING.md: "Do not rebuild"). This step is a VERIFY: it confirms
   the Translation Engine's confidence output actually flows into routing.js
   correctly, END TO END, across the three bands (CONFIDENCE_COUPLING.md):

     80+   trust    — route on the question's own complexity, no change
     60-79 escalate — effective complexity +1, with a visible note
     <60   floor    — effective complexity floored at 4 (Balanced minimum),
                      flagged as a contract violation (normally the <60 case
                      is caught earlier by the clarify gate, Step 2.3, and
                      never reaches routing — this is the safety net)

   The seam under test is real: translate() → TranslationResult.confidence →
   route({ confidence }). Nothing is stubbed except the model call itself. */

import { describe, expect, it } from "vitest";
import { route } from "./routingService";
import { translate, type TranslationModelClient } from "./translation";

/** A model stub that yields a translation with an exact confidence and
    translated prompt, so the test drives precise confidence bands (and known
    base complexities) into routing. */
function clientReturning(
  translatedPrompt: string,
  confidence: number,
): TranslationModelClient {
  return async () =>
    JSON.stringify({ translatedPrompt, confidence, detectedGaps: [], reasoning: "stub" });
}

/** The end-to-end pipeline seam: raw input → translate → route on the
    translation's own confidence and reframed prompt. */
async function translateThenRoute(
  rawInput: string,
  translatedPrompt: string,
  confidence: number,
  plan: "free" | "paid" = "paid",
) {
  const outcome = await translate(rawInput, {
    client: clientReturning(translatedPrompt, confidence),
  });
  if (outcome.status !== "ok") {
    throw new Error(`translate() did not succeed: ${outcome.status}`);
  }
  // Confidence and prompt are the TRANSLATION's real output, not test literals.
  expect(outcome.result.confidence).toBe(confidence);
  const routed = route({
    prompt: outcome.result.translatedPrompt,
    confidence: outcome.result.confidence,
    gaps: outcome.result.detectedGaps,
    plan,
  });
  return { translation: outcome.result, routed };
}

describe("translation confidence → routing coupling (end to end)", () => {
  it("80+ is trusted: effective complexity equals the question's own complexity", async () => {
    const { routed } = await translateThenRoute(
      "ok so anyway how do i... design a caching layer or something",
      "Design a fault-tolerant distributed caching strategy under a strict latency budget.",
      90,
    );
    expect(routed.effectiveComplexity).toBe(routed.complexity);
    expect(routed.notes.some((n) => /escalated|clarify gate/.test(n))).toBe(false);
  });

  it("60-79 escalates effective complexity by one, with a visible note", async () => {
    const { routed } = await translateThenRoute(
      "uhh explain the indexing thing maybe?",
      "Explain how B-tree indexing improves query performance in a relational database.",
      70,
    );
    expect(routed.effectiveComplexity).toBe(Math.min(10, routed.complexity + 1));
    expect(routed.notes.some((n) => /escalated one step/.test(n))).toBe(true);
  });

  it("<60 floors effective complexity at 4 (Balanced), flagged as a contract violation", async () => {
    const { routed } = await translateThenRoute(
      "wait what was the capital again lol",
      "What is the capital of France?", // base complexity ~1
      40,
    );
    expect(routed.complexity).toBeLessThan(4); // a trivial lookup on its own
    expect(routed.effectiveComplexity).toBe(4); // ...floored up to Balanced minimum
    expect(routed.model).toBe("sonnet"); // Balanced tier, per the floor
    expect(routed.notes.some((n) => /Balanced minimum|clarify gate/.test(n))).toBe(true);
  });

  it("coupling only escalates, never downgrades: low confidence never routes cheaper than the base", async () => {
    const prompt = "Explain how B-tree indexing improves query performance in a relational database.";
    const trusted = await translateThenRoute("x", prompt, 95);
    const moderate = await translateThenRoute("x", prompt, 70);
    const low = await translateThenRoute("x", prompt, 30);
    // Same question, decreasing confidence ⇒ non-decreasing effective complexity.
    expect(moderate.routed.effectiveComplexity).toBeGreaterThanOrEqual(
      trusted.routed.effectiveComplexity,
    );
    expect(low.routed.effectiveComplexity).toBeGreaterThanOrEqual(4);
  });
});
