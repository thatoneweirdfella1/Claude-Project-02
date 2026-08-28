import { useEffect, useRef, useState } from "react";
import type { AnswerDisplayState } from "../../services/answerDisplay";
import type { PipelineDone, PipelineEvent } from "../../services/pipeline";
import type { GatedTranslation } from "../../services/translation";
import { categorizeCaughtError } from "../../services/providerErrorCategorization";

/* Drives one runPipeline() generator into React state (Step 5.2) — the
   pipeline-shaped sibling of Step 5.1's useAnswerDisplay, consuming the richer
   PipelineEvent vocabulary (which includes the gated translation the clarify
   flow needs, not just display states).

   Same identity contract as useAnswerDisplay: `run` must be a stable object
   per attempt (CenterColumn creates one per submit, keyed by id) — a fresh
   object every render would restart the pipeline every render.

   Every event is logged via console.info as it arrives — PIPELINE.md Stage 5's
   "log telemetry" in its current, honest form (real telemetry infrastructure
   is a later step; the console line carries each stage's full typed output). */

export interface ActivePipelineRun {
  /** Monotonic per-submit id; a new id = a genuinely new attempt. */
  id: number;
  start: () => AsyncGenerator<PipelineEvent>;
}

export interface PipelineRunView {
  /** The translation stage's outcome — TranslationCard renders every kind,
      including the <60 clarifying question. Null until Stage 1 completes. */
  gated: GatedTranslation | null;
  /** What the streaming display should show right now (stage indicator,
      growing text, or an error). Null when idle or after done. */
  display: AnswerDisplayState | null;
}

export function usePipelineRun(
  run: ActivePipelineRun | null,
  onDone: (done: PipelineDone) => void,
): PipelineRunView {
  const [gated, setGated] = useState<GatedTranslation | null>(null);
  const [display, setDisplay] = useState<AnswerDisplayState | null>(null);

  /* Ref'd so a new onDone closure each render doesn't restart the effect —
     only a genuinely new run (or clearing it) should. */
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (!run) {
      setGated(null);
      setDisplay(null);
      return;
    }
    let cancelled = false;
    setGated(null);
    setDisplay(null);

    (async () => {
      try {
        for await (const event of run.start()) {
          if (cancelled) break;
          console.info(`[pipeline] ${event.kind}`, event);
          switch (event.kind) {
            case "stage":
              setDisplay({ kind: "stage", stage: event.stage });
              break;
            case "translation":
              setGated(event.gated);
              // Terminal outcomes (clarify/empty/too-large/error) end the run;
              // drop the stage indicator so only the gated card shows.
              if (event.gated.kind !== "proceed" && event.gated.kind !== "moderate") {
                setDisplay(null);
              }
              break;
            case "streaming":
              setDisplay({ kind: "streaming", text: event.text });
              break;
            case "done":
              // The finished answer becomes a stored conversation message
              // (CenterColumn appends it and clears the run) — nothing left
              // to display transiently here.
              onDoneRef.current(event.done);
              break;
            case "error":
              setDisplay({ kind: "error", message: event.message, nextAction: event.nextAction });
              break;
            default:
              // route/techniques/composed: logged above; consumed from the
              // store/contract by later steps (transparency card, Step 8.2).
              break;
          }
        }
      } catch (error) {
        if (!cancelled) {
          const categorized = categorizeCaughtError(error);
          setDisplay({ kind: "error", message: categorized.message, nextAction: categorized.nextAction });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [run]);

  return { gated, display };
}
