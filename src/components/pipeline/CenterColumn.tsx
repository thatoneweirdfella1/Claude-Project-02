import { useCallback, useEffect, useRef, useState } from "react";
import { buildTranslateAskRequest, type TranslateAskRequest } from "../../services/composer";
import { createProxyClient, type TokenUsage } from "../../services/proxyClient";
import type { PipelineDone } from "../../services/pipeline";
import { getTelemetryEntries, observePipeline } from "../../services/telemetry";
import {
  gateTranslation,
  translate,
  type GatedTranslation,
  type TranslationResult,
} from "../../services/translation";
import {
  applyStateRecommendation,
  buildAdaptationNote,
  buildStateRecommendation,
  deriveStateFeeds,
  detectState,
  detectStateLocally,
  findRememberedStateChoice,
  stateChoiceSignature,
  toStatePills,
  type StateDetectionResult,
  type StateRecommendation,
} from "../../services/detection";
import { mergeVariables, substituteVariables } from "../../services/context";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import { Composer } from "../composer";
import { DetectionFailurePanel } from "../composer/DetectionFailurePanel";
import { ReviewReadyRequest } from "../composer/ReviewReadyRequest";
import { StateReviewPanel } from "../composer/StateReviewPanel";
import { ImportResponseDialog } from "../composer/ImportResponseDialog";
import {
  buildAiReadyRequest,
  compileMeaningPacket,
  destinationLabel,
  isFreeTranslator,
  NO_CREDIT_BADGE,
  resolvePaidAnswerModel,
} from "../../services/providerNeutral";
import type { StateDetectionUiStatus } from "../detection/StateDetectionStatusBar";
import { QuickActionsRow } from "../session";
import { ConversationArea, TranslationCard } from "../translation";
import { StreamingAnswer } from "../streaming";
import { usePipelineRun, type ActivePipelineRun } from "./usePipelineRun";
import { authorizeEstimatedCost } from "../../services/creditAuthorization";
import { addTokenUsage, getEstimatedCostForPipeline } from "../../services/costTracking";
import type { PaidRoutePolicy } from "../../services/paidRoutePolicy";
import { saveNow } from "../../services/persistence";

const client = createProxyClient();
const STATE_DIMENSIONS = ["emotion", "rsd", "interest", "cognitive"] as const;

type RouteContext = { kind: "free" } | { kind: "paid" };

interface PendingStateReview {
  request: TranslateAskRequest;
  result: StateDetectionResult;
  recommendation: StateRecommendation;
  route: RouteContext;
}

interface PendingDetectionFailure {
  request: TranslateAskRequest;
  route: RouteContext;
  message: string;
}

interface PendingHandoffReview {
  mode: "handoff";
  request: TranslateAskRequest;
  text: string;
  decisionNote: string;
}

interface PendingPaidReview {
  mode: "send";
  request: TranslateAskRequest;
  translation: TranslationResult;
  translationUsage?: TokenUsage;
  detection: StateDetectionResult | null;
  recommendationApplied: boolean;
  text: string;
  decisionNote: string;
}

type PendingReview = PendingHandoffReview | PendingPaidReview;

function newMessageId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `msg-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function detectionFailureMessage(outcome: Exclude<Awaited<ReturnType<typeof detectState>>, { status: "ok" }>): string {
  switch (outcome.status) {
    case "error":
      return outcome.message;
    case "too-large":
      return `The message has ${outcome.chars.toLocaleString()} characters; State Detection accepts up to ${outcome.limit.toLocaleString()}.`;
    case "empty":
      return "The message was empty.";
  }
}

export function CenterColumn() {
  const addMessage = useSessionStore((s) => s.addMessage);
  const plan = useAccountStore((s) => s.plan);

  const [run, setRun] = useState<ActivePipelineRun | null>(null);
  const [pendingReview, setPendingReview] = useState<PendingReview | null>(null);
  const [preparationGate, setPreparationGate] = useState<GatedTranslation | null>(null);
  const [pendingStateReview, setPendingStateReview] = useState<PendingStateReview | null>(null);
  const [pendingDetectionFailure, setPendingDetectionFailure] = useState<PendingDetectionFailure | null>(null);
  const [correctingDetection, setCorrectingDetection] = useState(false);
  const [importingResponse, setImportingResponse] = useState(false);
  const [detection, setDetection] = useState<StateDetectionResult | null>(null);
  const [detectionStatus, setDetectionStatus] = useState<StateDetectionUiStatus>("idle");
  const [workflowMessage, setWorkflowMessage] = useState("");
  const runIdRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const lastRawRef = useRef("");
  const runDecisionNoteRef = useRef("");
  const runHadDetectionRef = useRef(false);
  const conversation = useSessionStore((s) => s.conversation);
  const updateMessage = useSessionStore((s) => s.updateMessage);
  const pendingHandoff = [...conversation].reverse().find((message) =>
    message.messageKind === "handoff" && message.handoffStatus === "handed-off",
  );

  const startRun = useCallback(
    (
      request: TranslateAskRequest,
      result: StateDetectionResult | null,
      recommendationApplied: boolean,
      decisionNote: string,
      pretranslated?: TranslationResult,
      pretranslationUsage?: TokenUsage,
    ) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      runIdRef.current += 1;
      lastRawRef.current = request.rawInput;
      runDecisionNoteRef.current = decisionNote;
      runHadDetectionRef.current = result !== null;

      if (result) {
        setDetection(result);
        useSessionStore.getState().setStatePills(toStatePills(result));
      }
      const feeds = result && recommendationApplied
        ? deriveStateFeeds(toStatePills(result))
        : { directnessSuggestion: null, techniqueCandidates: [], toneGuidance: null, transparency: [] };

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
            pretranslated,
            pretranslationUsage,
          }),
      });
    },
    [plan],
  );

  function completeFreeHandoff(request: TranslateAskRequest, readyText: string, decisionNote: string) {
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
      notes: [NO_CREDIT_BADGE, "Handed off — not answered", decisionNote].filter(Boolean),
    });
    useSessionStore.getState().setDraftInput("");
    setWorkflowMessage("Handed off — awaiting response.");
    void saveNow({ reason: "autosave" }).catch(() => {
      setWorkflowMessage("Handoff completed, but the recovery save failed. Your conversation remains on screen.");
    });
  }

  function continueFreeFlow(
    request: TranslateAskRequest,
    result: StateDetectionResult | null,
    recommendation: StateRecommendation | null,
    recommendationApplied: boolean,
    decisionNote: string,
  ) {
    if (result) {
      setDetection(result);
      useSessionStore.getState().setStatePills(toStatePills(result));
    }
    const packet = compileMeaningPacket({
      ...request,
      statePills: result ? toStatePills(result) : undefined,
      stateApplied: recommendationApplied,
      stateTechniques: recommendationApplied ? recommendation?.techniqueCandidates : undefined,
      toneGuidance: recommendationApplied ? recommendation?.toneGuidance : null,
    });
    const readyText = buildAiReadyRequest(packet);
    setPendingReview({ mode: "handoff", request, text: readyText, decisionNote });
    setWorkflowMessage(request.reviewBeforeSend
      ? "Review request before handoff."
      : "Copy & Open to complete the handoff.");
  }

  async function preparePaidReview(
    request: TranslateAskRequest,
    result: StateDetectionResult | null,
    recommendationApplied: boolean,
    decisionNote: string,
  ) {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    let translationUsage: TokenUsage | undefined;

    setPreparationGate(null);
    setWorkflowMessage("Preparing…");
    const outcome = await translate(request.rawInput, {
      client: (translationRequest) => client.complete({
        ...translationRequest,
        onUsage: (usage) => {
          translationUsage = usage;
          addTokenUsage(usage.inputTokens, usage.outputTokens, translationRequest.model);
        },
      }),
      signal: controller.signal,
    });
    if (controller.signal.aborted) return;

    const gated = gateTranslation(outcome);
    setPreparationGate(gated);
    if (gated.kind === "proceed" || gated.kind === "moderate") {
      setPendingReview({
        mode: "send",
        request,
        translation: gated.result,
        translationUsage,
        detection: result,
        recommendationApplied,
        text: gated.result.translatedPrompt,
        decisionNote,
      });
      setWorkflowMessage("Review request before sending.");
      return;
    }

    setWorkflowMessage(gated.kind === "clarify"
      ? "Please confirm what you meant before sending."
      : gated.kind === "too-large"
        ? "Request is too long to prepare. Your draft is unchanged."
        : gated.kind === "empty"
          ? "Nothing to send yet."
          : `Request preparation failed: ${gated.message}. Your draft is ready to retry.`);
  }

  function continueRoute(
    route: RouteContext,
    request: TranslateAskRequest,
    result: StateDetectionResult | null,
    recommendation: StateRecommendation | null,
    recommendationApplied: boolean,
    decisionNote: string,
    nextStatus: StateDetectionUiStatus,
  ) {
    const effectiveRequest = recommendationApplied && recommendation
      ? applyStateRecommendation(request, recommendation)
      : request;

    setPendingStateReview(null);
    setPendingDetectionFailure(null);
    setDetectionStatus(nextStatus);

    if (route.kind === "free") {
      continueFreeFlow(effectiveRequest, result, recommendation, recommendationApplied, decisionNote);
      return;
    }

    if (effectiveRequest.reviewBeforeSend) {
      void preparePaidReview(effectiveRequest, result, recommendationApplied, decisionNote);
      return;
    }

    addMessage({ id: newMessageId(), role: "user", content: request.rawInput, timestamp: Date.now() });
    lastRawRef.current = request.rawInput;
    useSessionStore.getState().setDraftInput("");
    startRun(effectiveRequest, result, recommendationApplied, decisionNote);
  }

  function rememberChoice(result: StateDetectionResult, action: "accept" | "keep-current" | "dismiss", remember: boolean) {
    if (!remember) return;
    useAccountStore.getState().rememberStateChoice({
      signature: stateChoiceSignature(result),
      action,
      timestamp: Date.now(),
    });
  }

  function rememberCorrections(
    original: StateDetectionResult,
    corrected: StateDetectionResult,
    remember: boolean,
  ) {
    if (!remember) return;
    for (const dimension of STATE_DIMENSIONS) {
      const from = original[dimension]?.value;
      const to = corrected[dimension]?.value;
      if (to && from !== to) {
        useAccountStore.getState().recordStateCorrection({
          dimension,
          from: from ?? "none",
          to,
          timestamp: Date.now(),
        });
      }
    }
  }

  function resolveDetection(
    request: TranslateAskRequest,
    result: StateDetectionResult,
    route: RouteContext,
  ) {
    setDetection(result);
    useSessionStore.getState().setStatePills(toStatePills(result));

    const recommendation = buildStateRecommendation(result, request);
    if (!recommendation) {
      setWorkflowMessage("State checked — no change suggested.");
      continueRoute(
        route,
        request,
        result,
        null,
        false,
        "State checked — no change suggested.",
        "no-change",
      );
      return;
    }

    const remembered = findRememberedStateChoice(
      useAccountStore.getState().rememberedStateChoices,
      result,
    );
    if (remembered) {
      const accept = remembered.action === "accept";
      const note = accept
        ? "Remembered State choice applied to this similar request."
        : "Remembered State choice kept the current request settings.";
      setWorkflowMessage(note);
      continueRoute(
        route,
        request,
        result,
        recommendation,
        accept,
        note,
        "used",
      );
      return;
    }

    setPendingStateReview({ request, result, recommendation, route });
    setDetectionStatus("recommendation");
    setWorkflowMessage("A response adjustment may help. Choose how to continue.");
  }

  function failDetection(request: TranslateAskRequest, route: RouteContext, message: string) {
    setPendingDetectionFailure({ request, route, message });
    setDetectionStatus("unavailable");
    setWorkflowMessage("State Detection could not run. Continue with current settings?");
  }

  function queueFreeFlow(request: TranslateAskRequest) {
    setDetectionStatus("checking");
    setWorkflowMessage("Checking state…");
    try {
      resolveDetection(request, detectStateLocally(request.rawInput), { kind: "free" });
    } catch (error) {
      failDetection(
        request,
        { kind: "free" },
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async function queuePaidFlow(request: TranslateAskRequest) {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setDetectionStatus("checking");
    setWorkflowMessage("Checking state…");

    const adaptationNote = buildAdaptationNote(useAccountStore.getState().stateCorrections);
    const outcome = await detectState(request.rawInput, {
      client: (req) =>
        client.complete({
          ...req,
          onUsage: (usage) => addTokenUsage(usage.inputTokens, usage.outputTokens, req.model),
        }),
      signal: controller.signal,
      adaptationNote,
    });
    if (controller.signal.aborted) return;
    if (outcome.status === "ok") {
      resolveDetection(request, outcome.result, { kind: "paid" });
    } else {
      failDetection(request, { kind: "paid" }, detectionFailureMessage(outcome));
    }
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

    setPreparationGate(null);
    setWorkflowMessage("Recovery-saving…");
    try {
      await saveNow({ reason: "autosave" });
    } catch {
      setWorkflowMessage("Recovery save failed. Request not sent; your draft is still here.");
      return false;
    }

    if (isFreeTranslator(request.translatorEngine)) {
      queueFreeFlow(request);
      return true;
    }

    const paidModel = resolvePaidAnswerModel(request);
    if (paidModel === null) {
      queueFreeFlow(request);
      return true;
    }
    const paidRequest = paidModel === request.model ? request : { ...request, model: paidModel };
    const selectedModel = paidModel === "auto" ? "claude-haiku-4-5" : paidModel;
    const estimate = getEstimatedCostForPipeline(paidRequest.rawInput, selectedModel);
    setWorkflowMessage("Confirm cost before sending.");
    const authorization = await authorizeEstimatedCost(
      estimate,
      "Connected Claude translator",
      paidRoutePolicy(
        paidRequest,
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

    await queuePaidFlow(paidRequest);
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
    startRun(rerunRequest, null, false, "Refine rerun used the current explicit settings.");
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
        notes: [...(done.notes ?? []), runDecisionNoteRef.current].filter(Boolean),
        telemetryId,
        statePills: useSessionStore.getState().statePills,
      });
      setWorkflowMessage("Response received.");
      if (runHadDetectionRef.current) setDetectionStatus("used");
      setRun(null);
      void saveNow({ reason: "autosave" }).catch(() => {
        setWorkflowMessage("Response received, but recovery save failed. Keep this page open until the next save succeeds.");
      });
    },
    [addMessage],
  );

  const { gated, display } = usePipelineRun(run, handleDone);

  useEffect(() => {
    if (display?.kind !== "error") return;
    setWorkflowMessage(`Request failed: ${display.message}. Your draft is ready to retry.`);
    const session = useSessionStore.getState();
    if (!session.draftInput.trim() && lastRawRef.current) session.setDraftInput(lastRawRef.current);
  }, [display]);

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
    setDetectionStatus(detection ? "used" : detectionStatus);
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
    ? "A response adjustment may help. Choose how to continue."
    : pendingDetectionFailure
      ? "State Detection could not run. Continue with current settings?"
      : pendingReview
        ? pendingReview.mode === "send"
          ? "Review request before sending."
          : pendingReview.request.reviewBeforeSend
            ? "Review request before handoff."
            : "Copy & Open to complete the handoff."
        : displayMessage || workflowMessage;
  const submitDisabled = Boolean(
    pendingStateReview ||
    pendingDetectionFailure ||
    pendingReview ||
    correctingDetection ||
    detectionStatus === "checking" ||
    (run && display?.kind !== "error"),
  );

  return (
    <>
      <ConversationArea>
        {preparationGate && <TranslationCard gated={preparationGate} onRefine={(value) => void handleRefine(value)} />}
        {!preparationGate && gated && <TranslationCard gated={gated} onRefine={(value) => void handleRefine(value)} />}
        {display && <StreamingAnswer state={display} />}
      </ConversationArea>
      <Composer
        onSubmit={handleSubmit}
        detection={detection}
        detectionStatus={detectionStatus}
        onOpenStateCorrection={detection ? () => setCorrectingDetection(true) : undefined}
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
          recommendationChanges={pendingStateReview.recommendation.changes}
          onAccept={(result, remember) => {
            rememberCorrections(pendingStateReview.result, result, remember);
            rememberChoice(pendingStateReview.result, "accept", remember);
            const correctedRecommendation = buildStateRecommendation(result, pendingStateReview.request);
            continueRoute(
              pendingStateReview.route,
              pendingStateReview.request,
              result,
              correctedRecommendation,
              correctedRecommendation !== null,
              correctedRecommendation
                ? `State adjustment accepted: ${correctedRecommendation.changes.join(" ")}`
                : "State corrected; no request adjustment was needed.",
              correctedRecommendation ? "used" : "no-change",
            );
          }}
          onKeepCurrent={(remember) => {
            rememberChoice(pendingStateReview.result, "keep-current", remember);
            continueRoute(
              pendingStateReview.route,
              pendingStateReview.request,
              pendingStateReview.result,
              pendingStateReview.recommendation,
              false,
              "State recommendation declined; current explicit settings kept.",
              "used",
            );
          }}
          onDismiss={(remember) => {
            rememberChoice(pendingStateReview.result, "dismiss", remember);
            continueRoute(
              pendingStateReview.route,
              pendingStateReview.request,
              pendingStateReview.result,
              pendingStateReview.recommendation,
              false,
              "State recommendation dismissed; current explicit settings kept.",
              "used",
            );
          }}
        />
      )}
      {pendingDetectionFailure && (
        <DetectionFailurePanel
          message={pendingDetectionFailure.message}
          onContinue={() => continueRoute(
            pendingDetectionFailure.route,
            pendingDetectionFailure.request,
            null,
            null,
            false,
            "State Detection unavailable; continued with current explicit settings.",
            "unavailable",
          )}
          onRetry={() => {
            const pending = pendingDetectionFailure;
            setPendingDetectionFailure(null);
            if (pending.route.kind === "free") queueFreeFlow(pending.request);
            else void queuePaidFlow(pending.request);
          }}
          onCancel={() => {
            setPendingDetectionFailure(null);
            setWorkflowMessage("Send cancelled. Your draft and settings are unchanged.");
          }}
        />
      )}
      {correctingDetection && detection && (
        <StateReviewPanel
          initial={detection}
          initialMode="correct"
          onAccept={(corrected, remember) => {
            rememberCorrections(detection, corrected, remember);
            setDetection(corrected);
            useSessionStore.getState().setStatePills(toStatePills(corrected));
            setCorrectingDetection(false);
            setDetectionStatus("used");
            setWorkflowMessage(remember
              ? "State correction saved and remembered."
              : "State correction saved for this request only.");
          }}
          onKeepCurrent={() => setCorrectingDetection(false)}
          onDismiss={() => setCorrectingDetection(false)}
          onCorrectionCancel={() => setCorrectingDetection(false)}
        />
      )}
      {pendingReview?.mode === "handoff" && (
        <ReviewReadyRequest
          initialText={pendingReview.text}
          originalText={pendingReview.request.rawInput}
          destination={pendingReview.request.destination}
          reviewRequired={pendingReview.request.reviewBeforeSend}
          onCancel={() => {
            setPendingReview(null);
            setWorkflowMessage("Review cancelled. Your draft is still here.");
          }}
          onHandoff={(text, destination) => {
            completeFreeHandoff({ ...pendingReview.request, destination }, text, pendingReview.decisionNote);
            setPendingReview(null);
          }}
        />
      )}
      {pendingReview?.mode === "send" && (
        <ReviewReadyRequest
          mode="send"
          initialText={pendingReview.text}
          originalText={pendingReview.request.rawInput}
          destination={pendingReview.request.destination}
          onCancel={() => {
            setPendingReview(null);
            setPreparationGate(null);
            setWorkflowMessage("Review cancelled. Your draft and settings are unchanged.");
          }}
          onSend={(text, sendAutomaticallyNextTime) => {
            const reviewed = pendingReview;
            const editedTranslation: TranslationResult = {
              ...reviewed.translation,
              translatedPrompt: text.trim(),
              reasoning: text.trim() === reviewed.translation.translatedPrompt.trim()
                ? reviewed.translation.reasoning
                : `${reviewed.translation.reasoning} The prepared request was edited and approved in Review first.`,
            };
            if (sendAutomaticallyNextTime) {
              useSessionStore.getState().setReviewBeforeSend(false);
            }
            addMessage({ id: newMessageId(), role: "user", content: reviewed.request.rawInput, timestamp: Date.now() });
            lastRawRef.current = reviewed.request.rawInput;
            useSessionStore.getState().setDraftInput("");
            setPendingReview(null);
            setPreparationGate(null);
            startRun(
              reviewed.request,
              reviewed.detection,
              reviewed.recommendationApplied,
              reviewed.decisionNote,
              editedTranslation,
              reviewed.translationUsage,
            );
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
