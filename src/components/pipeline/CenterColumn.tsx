import { useCallback, useRef, useState } from "react";
import { buildTranslateAskRequest, type TranslateAskRequest } from "../../services/composer";
import { createProxyClient } from "../../services/proxyClient";
import type { PipelineDone } from "../../services/pipeline";
import { getTelemetryEntries, observePipeline } from "../../services/telemetry";
import {
  buildAdaptationNote,
  deriveStateFeeds,
  detectState,
  detectStateLocally,
  toStatePills,
  type StateDetectionResult,
} from "../../services/detection";
import { mergeVariables, substituteVariables } from "../../services/context";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import { Composer } from "../composer";
import { ReviewReadyRequest } from "../composer/ReviewReadyRequest";
import { StateReviewPanel } from "../composer/StateReviewPanel";
import { ImportResponseDialog } from "../composer/ImportResponseDialog";
import {
  buildAiReadyRequest,
  compileMeaningPacket,
  destinationLabel,
  isFreeTranslator,
  NO_CREDIT_BADGE,
} from "../../services/providerNeutral";
import type { PillDimension } from "../detection";
import { QuickActionsRow } from "../session";
import { ConversationArea, TranslationCard } from "../translation";
import { StreamingAnswer } from "../streaming";
import { usePipelineRun, type ActivePipelineRun } from "./usePipelineRun";
import { authorizeEstimatedCost } from "../../services/creditAuthorization";
import {
  addTokenUsage,
  getEstimatedCostForPipeline,
  getEstimatedCostForStateDetection,
} from "../../services/costTracking";

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

   State Detection is deliberately separate from translation. Manual modes run
   only when the person presses Check this message. Automatic — Paid runs on
   submit, but pauses for review before the request continues. No reading is
   silently applied and a failed/cancelled check never sends the request. */

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
  const [pendingReview, setPendingReview] = useState<{ request: TranslateAskRequest; text: string } | null>(null);
  const [pendingStateReview, setPendingStateReview] = useState<{
    request: TranslateAskRequest;
    result: StateDetectionResult;
    intent: "manual" | "send";
    paid: boolean;
  } | null>(null);
  const [importingResponse, setImportingResponse] = useState(false);
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
  const conversation = useSessionStore((s) => s.conversation);
  const updateMessage = useSessionStore((s) => s.updateMessage);
  const pendingHandoff = [...conversation].reverse().find((message) =>
    message.messageKind === "handoff" && message.handoffStatus === "handed-off",
  );

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

    },
    [plan],
  );

  function completeFreeHandoff(request: TranslateAskRequest, readyText: string) {
    const label = destinationLabel(request.destination);
    addMessage({ id: newMessageId(), role: "user", content: request.rawInput, timestamp: Date.now() });
    addMessage({
      id: newMessageId(),
      role: "assistant",
      content: `AI-ready request handed off to ${label}. Paste the destination AI's answer back with Import Response.`,
      timestamp: Date.now(),
      messageKind: "handoff",
      handoffStatus: "handed-off",
      sourceLabel: label,
      preparedRequest: readyText,
      notes: [NO_CREDIT_BADGE, "Handed off — not answered"],
    });
  }

  function continueFreeFlow(request: TranslateAskRequest, result: StateDetectionResult | null, commitReading: boolean) {
    if (result && commitReading) {
      setDetection(result);
      useSessionStore.getState().setStatePills(toStatePills(result));
    }
    const packet = compileMeaningPacket({
      ...request,
      statePills: result && commitReading ? toStatePills(result) : useSessionStore.getState().statePills,
    });
    const readyText = buildAiReadyRequest(packet);
    if (request.reviewBeforeSend) setPendingReview({ request, text: readyText });
    else completeFreeHandoff(request, readyText);
    setPendingStateReview(null);
  }

  async function executeRequest(request: TranslateAskRequest): Promise<boolean> {
    if (
      isFreeTranslator(request.translatorEngine) ||
      (request.translatorEngine === "destination-one-pass" && request.destination.providerId !== "anthropic")
    ) {
      continueFreeFlow(request, null, false);
      return true;
    }

    const selectedModel = request.model === "auto" ? "claude-haiku-4-5" : request.model;
    const estimate = getEstimatedCostForPipeline(request.rawInput, selectedModel);
    const authorization = await authorizeEstimatedCost(estimate, "Connected Claude translator");
    if (!authorization.authorized) return false;
    addMessage({ id: newMessageId(), role: "user", content: request.rawInput, timestamp: Date.now() });
    startRun(request);
    return true;
  }

  async function runPaidStateDetection(request: TranslateAskRequest): Promise<StateDetectionResult | null> {
    const estimate = getEstimatedCostForStateDetection(request.rawInput);
    const authorization = await authorizeEstimatedCost(estimate, "Paid State Detection");
    if (!authorization.authorized) return null;

    const controller = new AbortController();
    setDetecting(true);
    try {
      const adaptationNote = buildAdaptationNote(useAccountStore.getState().stateCorrections);
      const outcome = await detectState(request.rawInput, {
        client: (req) => client.complete({
          ...req,
          onUsage: (usage) => addTokenUsage(usage.inputTokens, usage.outputTokens, req.model),
        }),
        signal: controller.signal,
        adaptationNote,
      });
      if (outcome.status !== "ok") return null;
      setDetection(outcome.result);
      return outcome.result;
    } finally {
      setDetecting(false);
    }
  }

  async function handleCheckState(request: TranslateAskRequest, paid: boolean): Promise<void> {
    if (!request.rawInput.trim()) return;
    const result = paid
      ? await runPaidStateDetection(request)
      : detectStateLocally(request.rawInput);
    if (!result) return;
    setDetection(result);
    setPendingStateReview({ request, result, intent: "manual", paid });
  }

  async function handleSubmit(request: TranslateAskRequest): Promise<boolean> {
    if (!request.rawInput.trim()) return false;
    if (useSessionStore.getState().stateDetectionMode === "automatic-paid") {
      const result = await runPaidStateDetection(request);
      if (!result) return false;
      setPendingStateReview({ request, result, intent: "send", paid: true });
      return false;
    }
    return executeRequest(request);
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
    startRun(
      buildTranslateAskRequest(
        combinedInput,
        {
          model: s.model,
          destination: s.destination,
          translatorEngine: s.translatorEngine,
          reviewBeforeSend: s.reviewBeforeSend,
          directness: s.directness,
          techniques: s.techniques,
        },
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

  function confirmImportedResponse(response: string, sourceLabel: string) {
    if (!pendingHandoff) return;
    updateMessage(pendingHandoff.id, { handoffStatus: "imported" });
    addMessage({
      id: newMessageId(),
      role: "assistant",
      content: response,
      timestamp: Date.now(),
      messageKind: "imported",
      handoffStatus: "imported",
      sourceLabel,
      parentMessageId: pendingHandoff.id,
      notes: [`Imported from ${sourceLabel}`, "Reviewed and confirmed by you"],
    });
    setImportingResponse(false);
  }

  return (
    <>
      <header className="frozen-workspace-heading">
        <div><h1>Talk to AI</h1><p>Shape the request, review it, then hand it off.</p></div>
        <span>Conversation first</span>
      </header>
      <ConversationArea>
        {gated && <TranslationCard gated={gated} onRefine={(value) => void handleRefine(value)} />}
        {display && <StreamingAnswer state={display} />}
      </ConversationArea>
      <Composer
        onSubmit={handleSubmit}
        onCheckState={handleCheckState}
        detection={detection}
        detecting={detecting}
        stateChecking={detecting}
        onCorrectState={handleCorrectState}
        suggestedDirectness={suggestedDirectness}
        onApplyDirectness={() => setDirectness(suggestedDirectness!)}
      />
      <QuickActionsRow />
      {pendingHandoff && !importingResponse && (
        <div className="handoff-status surface-smoked-glass" role="status">
          <div><strong>Handed off — awaiting response</strong><span>{pendingHandoff.sourceLabel}</span></div>
          <button type="button" onClick={() => setImportingResponse(true)}>Import Response</button>
        </div>
      )}
      {pendingStateReview && (
        <StateReviewPanel
          initial={pendingStateReview.result}
          intent={pendingStateReview.intent}
          paid={pendingStateReview.paid}
          onCancel={() => setPendingStateReview(null)}
          onAccept={(result) => {
            (["emotion", "rsd", "interest", "cognitive"] as PillDimension[]).forEach((dimension) => {
              const from = pendingStateReview.result[dimension]?.value;
              const to = result[dimension]?.value;
              if (from && to && from !== to) {
                useAccountStore.getState().recordStateCorrection({ dimension, from, to, timestamp: Date.now() });
              }
            });
            setDetection(result);
            useSessionStore.getState().setStatePills(toStatePills(result));
            const shouldSend = pendingStateReview.intent === "send";
            const request = pendingStateReview.request;
            setPendingStateReview(null);
            if (shouldSend) {
              useSessionStore.getState().setDraftInput("");
              void executeRequest(request);
            }
          }}
          onKeepCurrent={() => {
            const shouldSend = pendingStateReview.intent === "send";
            const request = pendingStateReview.request;
            setPendingStateReview(null);
            if (shouldSend) {
              useSessionStore.getState().setDraftInput("");
              void executeRequest(request);
            }
          }}
          onDismiss={() => {
            setDetection(null);
            const shouldSend = pendingStateReview.intent === "send";
            const request = pendingStateReview.request;
            setPendingStateReview(null);
            if (shouldSend) {
              useSessionStore.getState().setDraftInput("");
              void executeRequest(request);
            }
          }}
        />
      )}
      {pendingReview && (
        <ReviewReadyRequest
          initialText={pendingReview.text}
          destination={pendingReview.request.destination}
          onCancel={() => setPendingReview(null)}
          onHandoff={(text, destination) => {
            completeFreeHandoff({ ...pendingReview.request, destination }, text);
            setPendingReview(null);
          }}
        />
      )}
      {importingResponse && pendingHandoff && (
        <ImportResponseDialog
          sourceLabel={pendingHandoff.sourceLabel ?? "Destination AI"}
          onCancel={() => setImportingResponse(false)}
          onConfirm={confirmImportedResponse}
        />
      )}
    </>
  );
}

