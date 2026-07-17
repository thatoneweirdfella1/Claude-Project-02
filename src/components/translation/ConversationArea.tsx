import {
  gateTranslation,
  type GapType,
  type TranslationResult,
} from "../../services/translation";
import { TranslationCard } from "./TranslationCard";

/* ConversationArea (Step 2.3) — the center-column conversation surface. Step 1.5
   left this a placeholder pending the real conversation UI (Steps 5.0+). Step
   2.3 seeds it with the confidence-gate output: the clarifying-question UI and
   the proceed/moderate cards, "in the conversation area" per the step.

   There is no live pipeline yet (composer = 5.0, orchestrator = 5.2), so the
   three gate states below are SAMPLE translations run through the REAL
   gateTranslation logic — a demo, replaced by the live flow in Steps 5.0+. */

function sample(
  translatedPrompt: string,
  confidence: number,
  detectedGaps: GapType[],
  reasoning: string,
): TranslationResult {
  return { translatedPrompt, confidence, detectedGaps, reasoning };
}

export function ConversationArea() {
  const demos = [
    gateTranslation({
      status: "ok",
      result: sample(
        "How do I create an index on a Postgres table?",
        88,
        ["tangential-preamble"],
        "Read past the late-night backstory to the indexing question.",
      ),
    }),
    gateTranslation({
      status: "ok",
      result: sample(
        "Should I use useEffect or useMemo for this derived value?",
        70,
        ["emotional-intensity-distortion", "compound-buried-request"],
        "Set the frustration aside and took the primary hooks question.",
      ),
    }),
    gateTranslation({
      status: "ok",
      result: sample(
        "Explain the authentication approach we discussed earlier.",
        42,
        ["scope-ambiguity", "unstated-assumptions"],
        "Not sure which auth topic is meant — a few readings fit.",
      ),
    }),
  ];

  return (
    <div className="conversation-area" data-testid="conversation-area">
      <p className="conversation-area__demo-label">
        Step 2.3 demo — confidence gates. Live conversation flow arrives in Steps 5.0+.
      </p>
      {demos.map((gated, i) => (
        <TranslationCard key={`${gated.kind}-${i}`} gated={gated} />
      ))}
    </div>
  );
}
