/* Answer display state (Step 5.1) — the shared vocabulary between however the
   pipeline actually runs (Step 5.2's real orchestrator, or a demo/harness
   stub) and the streaming display component that renders it. Nothing here
   calls a proxy or runs a pipeline stage; it only defines the shape of what a
   caller reports as stages complete, and a small pure helper for the
   token-arrival phase.

   PIPELINE_STAGES are the four named stages verbatim from this step's own
   spec: translating, routing, composing, answering. "answering" covers both
   "the model is now producing tokens" and the streaming phase itself — once
   tokens start arriving, the display moves from a stage indicator to showing
   partial text; there is no separate fifth name. */

export type PipelineStageName = "translating" | "routing" | "composing" | "answering";

export const PIPELINE_STAGES: PipelineStageName[] = [
  "translating",
  "routing",
  "composing",
  "answering",
];

export const STAGE_LABELS: Record<PipelineStageName, string> = {
  translating: "Translating your message…",
  routing: "Choosing the right model…",
  composing: "Composing the prompt…",
  answering: "Answering…",
};

export interface AnswerDisplayDone {
  kind: "done";
  text: string;
  /** Translation confidence 0-100 — the "N% confident this is what you
      meant" line (PIPELINE.md / Step 2.x). */
  confidence: number;
  /** ROUTING.md's honesty guarantee made visible: true when a Deep-tier
      route was downgraded to Sonnet on the free plan. */
  downgraded: boolean;
  /** routing.js's own notes (escalation, downgrade, override, health floor)
      — rendered verbatim, quiet monochrome, alongside the confidence line. */
  notes: string[];
}

/** Everything the streaming display can be showing at one instant. */
export type AnswerDisplayState =
  | { kind: "stage"; stage: PipelineStageName }
  | { kind: "streaming"; text: string }
  | AnswerDisplayDone
  /* R13: `message` is always a safe, categorized string (never a raw
     provider/HTTP internal — see services/providerErrorCategorization.ts).
     `nextAction` is the matching concrete next step, when known. */
  | { kind: "error"; message: string; nextAction?: string };

/** Turn an async iterable of text deltas (e.g. createProxyClient().stream(),
    Step 1.10) into a sequence of growing-text "streaming" states, then a final
    "done" state with the given metadata. Pure orchestration of the token
    phase only — stage states before it are the caller's responsibility, since
    only the caller (real orchestrator or demo) knows how long translating/
    routing/composing actually take. */
export async function* streamAnswer(
  tokens: AsyncIterable<string>,
  meta: { confidence: number; downgraded: boolean; notes: string[] },
): AsyncGenerator<AnswerDisplayState> {
  let text = "";
  for await (const chunk of tokens) {
    text += chunk;
    yield { kind: "streaming", text };
  }
  yield { kind: "done", text, confidence: meta.confidence, downgraded: meta.downgraded, notes: meta.notes };
}
