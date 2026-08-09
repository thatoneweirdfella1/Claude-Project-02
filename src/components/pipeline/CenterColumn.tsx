import { useCallback, useRef, useState } from "react";
import { buildTranslateAskRequest, type TranslateAskRequest } from "../../services/composer";
import { createProxyClient } from "../../services/proxyClient";
import type { PipelineDone } from "../../services/pipeline";
import { getTelemetryEntries, observePipeline } from "../../services/telemetry";
import {
  buildAdaptationNote,
  deriveStateFeeds,
  detectState,
  toStatePills,
  type StateDetectionResult,
} from "../../services/detection";
import { mergeVariables, substituteVariables } from "../../services/context";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import { Composer } from "../composer";
import type { PillDimension } from "../detection";
import { QuickActionsRow } from "../session";
import { ConversationArea, TranslationCard } from "../translation";
import { StreamingAnswer } from "../streaming";
import { usePipelineRun, type ActivePipelineRun } from "./usePipelineRun";
import { authorizeEstimatedCost } from "../../services/creditAuthorization";
import { addTokenUsage, getEstimatedCostForPipeline } from "../../services/costTracking";

/* CenterColumn (Step 5.2) — the live center column: the real ConversationArea
   over the real Composer, joined by the pipeline orchestrator. This replaces
   Step 5.0's ComposerSection (whose JSON-readout onSubmit existed only because
   no orchestrator did yet) and Step 5.1's StreamingAnswerDemo (same reason).

   TRANSLATE & ASK now does the real thing: the emitted TranslateAskRequest
   goes straight into observePipeline() (Step 5.4's transparent telemetry tee
   around runPipeline) against the Step 1.10 proxy client, the user's text is
   appended to the conversation, the stage indicator / gated translation /
   streamed answer render as the run progresses, and the finished answer is
   appended to the session store (so it persists via the Step 1.8 autosave)
   carrying confidence + routing's downgraded/notes.

   The <60 clarify path finally closes the Step 2.3 loop: TranslationCard
   renders the ClarifyPrompt, and onRefine re-runs the WHOLE pipeline with the
   user's added detail appended to their original message (translation needs
   both — the addition alone usually isn't self-contained).

   Step 6.3: State Detection fires ALONGSIDE the pipeline, not inside it —
   PIPELINE.md's RESOLVED note describes detection as its own single on-demand
   classification on the same input, not one of the five orchestrator stages,
   so it's a parallel side effect here rather than a change to orchestrator.ts
   (already fresh-context-audited at 5.2, error-boundary-hardened at 5.3).
   detectState()'s outcome feeds two places: the panel's local `detection`
   state (rich — confidence, summary, for display/correction) and the session
   store's `statePills` (Step 1.7's existing field — the durable, four-value
   "current state" a later step, 6.5, delivers to its consumers). A failed or
   absent detection just means no pills this turn; it never blocks or affects
   the answer running beside it. */

const client = createProxyClient();

function newMessageId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `msg-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function CenterColumn() {
  const addMessage = useSessionStore((s) => s.addMessage);
  const plan = useAccountStore((s) => s.plan);
  const currentDirectness = useSessionStore((s) => s.directness);
  const setDirectness = useSessionStore((s) => s.setDirectness);

  const [run, setRun] = useState<ActivePipelineRun | null>(null);
  const [detection, setDetection] = useState<StateDetectionResult | null>(null);
  // Step 11.2 (latency): true while this turn's classification call is in
  // flight. The pill panel is cleared on submit and the classification is a
  // network round-trip that routinely exceeds 1s, so without this the panel
  // would blank and silently reappear with no indicator — a CANON 1-second-rule
  // miss. Drives a quiet inline "reading" status in the panel's own slot.
  const [detecting, setDetecting] = useState(false);
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
      // Step 6.5 state bus: read from whatever session.statePills CURRENTLY
      // holds (the last completed detection — usually the prior turn's,
      // since this turn's own detection runs in parallel and isn't in yet).
      // One source (statePills), fed to two of its four consumers here —
      // technique selection and answer tone; the other two (directness
      // suggestion, transparency data) are consumed directly below/elsewhere.
      const feeds = deriveStateFeeds(useSessionStore.getState().statePills);
      setRun({
        id: runIdRef.current,
        start: () =>
          observePipeline(request, {
            client,
            plan,
            signal: controller.signal,
            stateTechniques: feeds.techniqueCandidates,
            stateTone: feeds.toneGuidance,
          }),
      });

      // State Detection — fires alongside translation, on the SAME raw input,
      // sharing this submission's AbortController so a resubmit cancels both.
      // Step 6.4: the adaptation note is built fresh from this user's current
      // corrections every call (never stale — a correction made moments ago
      // on THIS session already counts toward the next classification).
      setDetection(null); // clear the panel immediately; this turn's read isn't in yet
      setDetecting(true); // show the in-flight indicator until this call resolves (or is superseded)
      const adaptationNote = buildAdaptationNote(useAccountStore.getState().stateCorrections);
      void detectState(request.rawInput, {
        client: (req) =>
          client.complete({
            ...req,
            onUsage: (usage) => addTokenUsage(usage.inputTokens, usage.outputTokens, req.model),
          }),
        signal: controller.signal,
        adaptationNote,
      }).then((outcome) => {
        if (controller.signal.aborted) return; // superseded by a resubmit — the newer run now owns `detecting`
        setDetecting(false); // detectState never throws, so this .then always runs for the live call
        if (outcome.status === "ok") {
          setDetection(outcome.result);
          useSessionStore.getState().setStatePills(toStatePills(outcome.result));
        }
      });
    },
    [plan],
  );

  async function handleSubmit(request: TranslateAskRequest): Promise<boolean> {
    const selectedModel = request.model === "auto" ? "claude-haiku-4-5" : request.model;
    const estimate = getEstimatedCostForPipeline(request.rawInput, selectedModel);
    const authorization = await authorizeEstimatedCost(
      estimate,
      "Translate, personalize, and answer",
    );
    if (!authorization.authorized) return false;
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
    return true;
  }

  async function handleRefine(refinedInput: string): Promise<void> {
    // Step 7.4: substitute the NEWLY typed addition only — lastRawRef.current
    // is the original submission's text, which Composer already substituted
    // before this run ever started, so re-running substitution on it would
    // be redundant (and, if a variable's own value happened to contain a
    // "$name" pattern, could re-substitute unexpectedly). Only fresh user
    // input gets substitution applied.
    const s = useSessionStore.getState();
    const substitutedAddition = substituteVariables(
      refinedInput,
      mergeVariables(useAccountStore.getState().variables, s.variables),
    );
    const combinedInput = `${lastRawRef.current}\n\n${substitutedAddition}`;
    const selectedModel = s.model === "auto" ? "claude-haiku-4-5" : s.model;
    const estimate = getEstimatedCostForPipeline(combinedInput, selectedModel);
    const authorization = await authorizeEstimatedCost(
      estimate,
      "Refine and rerun the answer",
    );
    if (!authorization.authorized) return;
    addMessage({
      id: newMessageId(),
      role: "user",
      content: substitutedAddition,
      timestamp: Date.now(),
    });
    // Original + addition, so translation sees the whole thought; settings are
    // read fresh from the store (the user may have changed a dropdown since).
    // startRun also re-fires detection on this same combined text.
    startRun(
      buildTranslateAskRequest(
        combinedInput,
        { model: s.model, directness: s.directness, techniques: s.techniques },
        s.context,
      ),
    );
  }

  const handleDone = useCallback(
    (done: PipelineDone) => {
      // Step 8.5: snapshot this turn's telemetry-log id + current state pills
      // onto the message, so the download modal can look up transparency/
      // state-pills content for THIS specific answer later, not just "the
      // most recent one." observePipeline (Step 5.4) has already recorded
      // this run's entry via recordTelemetryEntry by the time its "done"
      // event reaches here (usePipelineRun -> this callback), so the last
      // entry in the log IS this run's — same timing this component already
      // relies on nowhere else, first read here.
      const entries = getTelemetryEntries();
      const telemetryId = entries.length > 0 ? entries[entries.length - 1].id : undefined;
      addMessage({
        id: newMessageId(),
        role: "assistant",
        content: done.text,
        timestamp: Date.now(),
        confidence: done.confidence,
        downgraded: done.downgraded,
        notes: done.notes,
        telemetryId,
        statePills: useSessionStore.getState().statePills,
      });
      setRun(null); // the stored message takes over rendering from here
    },
    [addMessage],
  );

  // Step 6.3: makes a correction visible immediately (updates the displayed
  // pill + the committed session.statePills). Step 6.4: ALSO records it to
  // the account store (persists across sessions) so countCorrectionsTo/
  // adaptedValueFor can see it — this is the single call site both steps'
  // BUILD-LOG PARKED notes named as where the correction store should hook in.
  function handleCorrectState(dimension: PillDimension, value: string) {
    setDetection((prev) => {
      if (!prev) return prev;
      const previousReading = prev[dimension];
      // `value` is always one of this exact dimension's own valid values
      // (PillCorrector only ever offers config.values for its own config) —
      // safe by construction, though TS can't prove it through the generic
      // PillDimension key here.
      const corrected = { ...prev, [dimension]: { value, confidence: 100 } } as StateDetectionResult;
      useSessionStore.getState().setStatePills(toStatePills(corrected));
      if (previousReading && previousReading.value !== value) {
        useAccountStore.getState().recordStateCorrection({
          dimension,
          from: previousReading.value,
          to: value,
          timestamp: Date.now(),
        });
      }
      return corrected;
    });
  }

  const { gated, display } = usePipelineRun(run, handleDone);

  // Step 6.5, directness consumer: a visible, never-silent suggestion — only
  // shown when it actually differs from what's currently selected, and only
  // applied on an explicit click (CenterColumn never calls setDirectness on
  // its own). Derived from the SAME deriveStateFeeds() every other consumer
  // reads, via this turn's detection result once it's in.
  const directnessSuggestion = detection
    ? deriveStateFeeds(toStatePills(detection)).directnessSuggestion
    : null;
  const suggestedDirectness =
    directnessSuggestion !== null && directnessSuggestion !== currentDirectness
      ? directnessSuggestion
      : null;

  return (
    <>
      <Composer
        onSubmit={handleSubmit}
        detection={detection}
        detecting={detecting}
        onCorrectState={handleCorrectState}
        suggestedDirectness={suggestedDirectness}
        onApplyDirectness={() => setDirectness(suggestedDirectness!)}
      />
      <QuickActionsRow />
      <ConversationArea>
        {gated && (
          <TranslationCard gated={gated} onRefine={(value) => void handleRefine(value)} />
        )}
        {display && <StreamingAnswer state={display} />}
      </ConversationArea>
    </>
  );
}
