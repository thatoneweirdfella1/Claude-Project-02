import { useCallback, useEffect, useRef, useState } from "react";
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
import { addTokenUsage, getEstimatedCostForPipeline } from "../../services/costTracking";
import type { PaidRoutePolicy } from "../../services/paidRoutePolicy";
import { saveNow } from "../../services/persistence";

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
  const [pendingStateReview, setPendingStateReview] = useState<{ request: TranslateAskRequest; result: StateDetectionResult } | null>(null);
  const [importingResponse, setImportingResponse] = useState(false);
  const [detection, setDetection] = useState<StateDetectionResult | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [workflowMessage, setWorkflowMessage] = useState("");
  const runIdRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const lastRawRef = useRef("");
  const conversation = useSessionStore((s) => s.conversation);
  const updateMessage = useSessionStore((s) => s.updateMessage);
  const pendingHandoff = [...conversation].reverse().find((message) =>
    message.messageKind === "handoff" && message.handoffStatus === "handed-off",
  );

  const startRun = useCallback(
    (request: TranslateAskRequest) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      runIdRef.current += 1;
      lastRawRef.current = request.rawInput;
      const feeds = deriveStateFeeds(useSessionStore.getState().statePills);
      setWorkflowMessage("Sending…");
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

      setDetection(null);
      setDetecting(true);
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
        if (controller.signal.aborted) return;
        setDetecting(false);
        if (outcome.status === "ok") {
          setDetection(outcome.result);
          useSessionStore.getState().setStatePills(toStatePills(outcome.result));
        }
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
    useSessionStore.getState().setDraftInput("");
    setWorkflowMessage("Handed off — awaiting response.");
    void saveNow({ reason: "autosave" }).catch(() => {
      setWorkflowMessage("Handoff completed, but the recovery save failed. Your conversation remains on screen.");
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
    if (request.reviewBeforeSend) {
      setPendingReview({ request, text: readyText });
      setWorkflowMessage("Review request before handoff.");
    } else {
      completeFreeHandoff(request, readyText);
    }
    setPendingStateReview(null);
  }

  function queueFreeFlow(request: TranslateAskRequest) {
    setWorkflowMessage("Checking state…");
    const result = detectStateLocally(request.rawInput);
    setDetection(result);
    setPendingStateReview({ request, result });
    setWorkflowMessage("State recommendation ready. Review it to continue.");
  }

  function paidRoutePolicy(
    request: TranslateAskRequest,
    selectedModel: string,
    reasonLabel: string,
  ): PaidRoutePolicy {
    const session = useSessionStore.getState();
    const account = useAccountStore.getState();
    const routeLabel = request.translatorEngine === "destination-one-pass"
      ? `Connected ${destinationLabel(request.destination)} · ${selectedModel}`
      : request.translatorEngine === "managed-translator"
        ? `Managed translator · Anthropic · ${selectedModel}`
        : `Legacy or automatic Claude translator · Anthropic · ${selectedModel}`;

    return {
      maximum: session.maxRequestCost,
      paidFallbackEnabled: session.paidFallbackEnabled,
      requiresPaidFallback:
        request.translatorEngine === "auto-free-first" ||
        request.translatorEngine === "legacy-claude",
      routeLabel,
      payerLabel: account.appMode === "developer"
        ? "Divergence developer workspace"
        : "Your Divergence credits",
      reasonLabel,
      freeAlternativeLabel:
        `Prepare an AI-ready request for ${destinationLabel(request.destination)} without a new charge`,
    };
  }

  async function handleSubmit(request: TranslateAskRequest): Promise<boolean> {
    if (!request.rawInput.trim()) return false;

    setWorkflowMessage("Recovery-saving…");
    try {
      await saveNow({ reason: "autosave" });
    } catch {
      setWorkflowMessage("Recovery save failed. Request not sent; your draft is still here.");
      return false;
    }

    if (
      isFreeTranslator(request.translatorEngine) ||
      (request.translatorEngine === "destination-one-pass" && request.destination.providerId !== "anthropic")
    ) {
      queueFreeFlow(request);
      return true;
    }

    const selectedModel = request.model === "auto" ? "claude-haiku-4-5" : request.model;
    const estimate = getEstimatedCostForPipeline(request.rawInput, selectedModel);
    setWorkflowMessage("Confirm cost before sending.");
    const authorization = await authorizeEstimatedCost(
      estimate,
      "Connected Claude translator",
      paidRoutePolicy(
        request,
        selectedModel,
        "This request uses a connected paid AI instead of the no-new-charge handoff.",
      ),
    );
    if (!authorization.authorized) {
      if (authorization.reason === "free-route-selected") {
        queueFreeFlow(request);
        return true;
      }
      setWorkflowMessage("Not sent. Your draft is still here.");
      return false;
    }

    addMessage({ id: newMessageId(), role: "user", content: request.rawInput, timestamp: Date.now() });
    lastRawRef.current = request.rawInput;
    useSessionStore.getState().setDraftInput("");
    startRun(request);
    return true;
  }

  async function handleRefine(refinedInput: string): Promise<void> {
    const s = useSessionStore.getState();
    const substitutedAddition = substituteVariables(
      refinedInput,
      mergeVariables(useAccountStore.getState().variables, s.variables),
    );
    const combinedInput = `${lastRawRef.current}\n\n${substitutedAddition}`;
    const selectedModel = s.model === "auto" ? "claude-haiku-4-5" : s.model;
    const rerunRequest = buildTranslateAskRequest(
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
    );
    const estimate = getEstimatedCostForPipeline(combinedInput, selectedModel);
    const authorization = await authorizeEstimatedCost(
      estimate,
      "Refine and rerun the answer",
      paidRoutePolicy(
        rerunRequest,
        selectedModel,
        "Refining reruns the connected paid AI pipeline.",
      ),
    );
    if (!authorization.authorized) {
      if (authorization.reason === "free-route-selected") queueFreeFlow(rerunRequest);
      else setWorkflowMessage("Refine cancelled. Nothing was spent.");
      return;
    }
    addMessage({
      id: newMessageId(),
      role: "user",
      content: substitutedAddition,
      timestamp: Date.now(),
    });
    startRun(rerunRequest);
  }

  const handleDone = useCallback(
    (done: PipelineDone) => {
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
      setWorkflowMessage("Response received.");
      setRun(null);
      void saveNow({ reason: "autosave" }).catch(() => {
        setWorkflowMessage("Response received, but recovery save failed. Keep this page open until the next save succeeds.");
      });
    },
    [addMessage],
  );

  function handleCorrectState(dimension: PillDimension, value: string) {
    setDetection((prev) => {
      if (!prev) return prev;
      const previousReading = prev[dimension];
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

  useEffect(() => {
    if (display?.kind !== "error") return;
    setWorkflowMessage(`Request failed: ${display.message}. Your draft is ready to retry.`);
    const session = useSessionStore.getState();
    if (!session.draftInput.trim() && lastRawRef.current) session.setDraftInput(lastRawRef.current);
  }, [display]);

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
    setWorkflowMessage("Imported response added to the conversation.");
    void saveNow({ reason: "autosave" }).catch(() => {
      setWorkflowMessage("Response imported, but recovery save failed. Keep this page open until the next save succeeds.");
    });
  }

  const displayMessage = display?.kind === "stage"
    ? `${display.stage}…`
    : display?.kind === "streaming"
      ? "Waiting for response…"
      : display?.kind === "error"
        ? `Request failed: ${display.message}`
        : "";
  const composerStatus = pendingStateReview
    ? "State recommendation ready. Review it to continue."
    : pendingReview
      ? "Review request before handoff."
      : displayMessage || workflowMessage;
  const submitDisabled = Boolean(pendingStateReview || pendingReview || (run && display?.kind !== "error"));

  return (
    <>
      <ConversationArea>
        {gated && <TranslationCard gated={gated} onRefine={(value) => void handleRefine(value)} />}
        {display && <StreamingAnswer state={display} />}
      </ConversationArea>
      <Composer
        onSubmit={handleSubmit}
        detection={detection}
        detecting={detecting}
        onCorrectState={handleCorrectState}
        suggestedDirectness={suggestedDirectness}
        onApplyDirectness={() => setDirectness(suggestedDirectness!)}
        statusMessage={composerStatus}
        submitDisabled={submitDisabled}
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
          onCancel={() => {
            setPendingStateReview(null);
            setWorkflowMessage("State review cancelled. Your draft is still here.");
          }}
          onAccept={(result) => {
            (["emotion", "rsd", "interest", "cognitive"] as PillDimension[]).forEach((dimension) => {
              const from = pendingStateReview.result[dimension]?.value;
              const to = result[dimension]?.value;
              if (from && to && from !== to) {
                useAccountStore.getState().recordStateCorrection({ dimension, from, to, timestamp: Date.now() });
              }
            });
            continueFreeFlow(pendingStateReview.request, result, true);
          }}
          onKeepCurrent={() => continueFreeFlow(pendingStateReview.request, pendingStateReview.result, false)}
          onDismiss={() => {
            setDetection(null);
            continueFreeFlow(pendingStateReview.request, null, false);
          }}
        />
      )}
      {pendingReview && (
        <ReviewReadyRequest
          initialText={pendingReview.text}
          destination={pendingReview.request.destination}
          onCancel={() => {
            setPendingReview(null);
            setWorkflowMessage("Review cancelled. Your draft is still here.");
          }}
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
