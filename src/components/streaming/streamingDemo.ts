import { PIPELINE_STAGES, streamAnswer, type AnswerDisplayState } from "../../services/answerDisplay";

/* Offline demo source (Step 5.1) — no live proxy/orchestrator exists yet
   (Step 5.2), so this simulates the whole state machine: a delay per named
   stage, then word-by-word "token" arrival, then a done state with sample
   router-honesty fields. Module-level (not a component-local closure) so its
   reference is stable across renders — required by useAnswerDisplay's
   identity contract. Step 5.2 replaces this with a source built from the
   real translate()/route()/composeFinalPrompt()/proxyClient.stream() calls,
   using the exact same AnswerDisplayState vocabulary. */

const DEMO_ANSWER =
  "Quantum entanglement is a phenomenon where two particles become linked, so the state of one instantly influences the state of the other, no matter how far apart they are. It's one of the most fascinating and counterintuitive aspects of quantum mechanics.";

const STAGE_DELAY_MS = 350;
const TOKEN_DELAY_MS = 40;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function* demoTokens(text: string): AsyncGenerator<string> {
  for (const word of text.split(" ")) {
    await sleep(TOKEN_DELAY_MS);
    yield word + " ";
  }
}

export async function* demoAnswerSource(): AsyncGenerator<AnswerDisplayState> {
  for (const stage of PIPELINE_STAGES) {
    yield { kind: "stage", stage };
    await sleep(STAGE_DELAY_MS);
  }
  yield* streamAnswer(demoTokens(DEMO_ANSWER), {
    confidence: 92,
    downgraded: false,
    notes: [],
  });
}
