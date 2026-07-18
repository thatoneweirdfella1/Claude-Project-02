import { useCallback, useRef, useState } from "react";
import { buildTranslateAskRequest, type TranslateAskRequest } from "../../services/composer";
import { createProxyClient } from "../../services/proxyClient";
import { runPipeline, type PipelineDone } from "../../services/pipeline";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import { Composer } from "../composer";
import { ConversationArea, TranslationCard } from "../translation";
import { StreamingAnswer } from "../streaming";
import { usePipelineRun, type ActivePipelineRun } from "./usePipelineRun";

/* CenterColumn (Step 5.2) — the live center column: the real ConversationArea
   over the real Composer, joined by the pipeline orchestrator. This replaces
   Step 5.0's ComposerSection (whose JSON-readout onSubmit existed only because
   no orchestrator did yet) and Step 5.1's StreamingAnswerDemo (same reason).

   TRANSLATE & ASK now does the real thing: the emitted TranslateAskRequest
   goes straight into runPipeline() against the Step 1.10 proxy client, the
   user's text is appended to the conversation, the stage indicator / gated
   translation / streamed answer render as the run progresses, and the
   finished answer is appended to the session store (so it persists via the
   Step 1.8 autosave) carrying confidence + routing's downgraded/notes.

   The <60 clarify path finally closes the Step 2.3 loop: TranslationCard
   renders the ClarifyPrompt, and onRefine re-runs the WHOLE pipeline with the
   user's added detail appended to their original message (translation needs
   both — the addition alone usually isn't self-contained). */

const client = createProxyClient();

function newMessageId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `msg-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function CenterColumn() {
  const addMessage = useSessionStore((s) => s.addMessage);
  const plan = useAccountStore((s) => s.plan);

  const [run, setRun] = useState<ActivePipelineRun | null>(null);
  const runIdRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  /** The raw text behind the current run — the base a refinement extends. */
  const lastRawRef = useRef("");

  const startRun = useCallback(
    (request: TranslateAskRequest) => {
      controllerRef.current?.abort(); // a resubmit cancels the in-flight call
      const controller = new AbortController();
      controllerRef.current = controller;
      runIdRef.current += 1;
      lastRawRef.current = request.rawInput;
      setRun({
        id: runIdRef.current,
        start: () => runPipeline(request, { client, plan, signal: controller.signal }),
      });
    },
    [plan],
  );

  function handleSubmit(request: TranslateAskRequest) {
    // An empty submit still runs (translate() owns empty-handling, Step 5.0
    // decision) but adds no empty bubble to the conversation.
    if (request.rawInput.trim().length > 0) {
      addMessage({
        id: newMessageId(),
        role: "user",
        content: request.rawInput,
        timestamp: Date.now(),
      });
    }
    startRun(request);
  }

  function handleRefine(refinedInput: string) {
    addMessage({
      id: newMessageId(),
      role: "user",
      content: refinedInput,
      timestamp: Date.now(),
    });
    // Original + addition, so translation sees the whole thought; settings are
    // read fresh from the store (the user may have changed a dropdown since).
    const s = useSessionStore.getState();
    startRun(
      buildTranslateAskRequest(
        `${lastRawRef.current}\n\n${refinedInput}`,
        { model: s.model, directness: s.directness, techniques: s.techniques },
        s.context,
      ),
    );
  }

  const handleDone = useCallback(
    (done: PipelineDone) => {
      addMessage({
        id: newMessageId(),
        role: "assistant",
        content: done.text,
        timestamp: Date.now(),
        confidence: done.confidence,
        downgraded: done.downgraded,
        notes: done.notes,
      });
      setRun(null); // the stored message takes over rendering from here
    },
    [addMessage],
  );

  const { gated, display } = usePipelineRun(run, handleDone);

  return (
    <>
      <ConversationArea>
        {gated && <TranslationCard gated={gated} onRefine={handleRefine} />}
        {display && <StreamingAnswer state={display} />}
      </ConversationArea>
      <Composer onSubmit={handleSubmit} />
    </>
  );
}
