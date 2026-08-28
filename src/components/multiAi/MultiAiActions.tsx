import { useCallback, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { GlassButton, GlassCard } from "../primitives";
import { createProxyClient } from "../../services/proxyClient";
import { useSessionStore } from "../../stores/sessionStore";
import { useAccountStore } from "../../stores/accountStore";
import {
  createPartnerClient,
  retryDebateSide,
  runDebate,
  withDebateUsage,
  type DebateOutcome,
  type DebatePartnerId,
  type DebateSide,
} from "../../services/debate";
import { autoSelectPartners } from "../../services/debate/autoSelect";
import {
  runConsensus,
  runSynthesis,
  type ConsensusResult,
  type DebateTranscript,
  type MessageSelectionBundle,
  type SynthesisResult,
} from "../../services/multiAi";
import { DebateView } from "./DebateView";
import { PartnerPicker } from "./PartnerPicker";
import { AutoSelectButton } from "./AutoSelectButton";
import { ConsensusView } from "./ConsensusView";
import { SynthesisView } from "./SynthesisView";
import { ProTierSelector } from "./ProTierSelector";
import { MessageSourceSelector } from "./MessageSourceSelector";
import { MultiAiRunHistory } from "./MultiAiRunHistory";
import { authorizeEstimatedCost } from "../../services/creditAuthorization";
import { addTokenUsage, getEstimatedCostForCall } from "../../services/costTracking";
import type { PaidRoutePolicy } from "../../services/paidRoutePolicy";
import { reportProviderEvent, type ConnectedProviderId } from "../../services/providerStatus";
import { isProviderConnected } from "../../services/routeReadiness";
import { categorizeCaughtError } from "../../services/providerErrorCategorization";
import type { MultiAiParticipantResult, MultiAiRunRecord } from "../../stores/types";

/* MULTI-AI ACTIONS (Step 8.3) — the composer-footer control from the
   screenshot, sitting beside TRANSPARENCY DETAILS in the `.composer__footer-row`
   wrapper Step 8.2 created for exactly this. Same collapsed shape as that
   control (icon + label + chevron), so the two read as a pair.

   This is the entry point Step 8.4 was explicitly built to wait for: it runs
   the debate (Step 8.3), and when both sides land it hands the resulting
   DebateTranscript to the already-built runConsensus/runSynthesis and mounts
   their already-built views. Consensus and Synthesis stay disabled until a
   complete transcript exists — PIPELINE.md defines both as what happens
   "after a debate", so offering them before one would be offering an action
   that cannot work.

   Debate runs on the last question asked this session by default; R20 lets
   the user instead select one message or a range via MessageSourceSelector,
   and that selection is what gets persisted as the run's sourceMessageIds
   (R21) — never the display text alone. */

const claudeClient = createProxyClient();
const partnerClient = createPartnerClient();
const DEBATE_MODEL_ID = "claude-sonnet-5"; // DEBATE_CLAUDE_MODEL — see services/debate/client.ts

function completeTracked(request: Parameters<typeof claudeClient.complete>[0]): Promise<string> {
  return claudeClient.complete({
    ...request,
    onUsage: (usage) => addTokenUsage(usage.inputTokens, usage.outputTokens, request.model),
  });
}

function explicitMultiAiPolicy(
  routeLabel: string,
  reasonLabel: string,
): PaidRoutePolicy {
  const session = useSessionStore.getState();
  const account = useAccountStore.getState();
  return {
    maximum: session.maxRequestCost,
    paidFallbackEnabled: session.paidFallbackEnabled,
    requiresPaidFallback: false,
    routeLabel,
    payerLabel: account.appMode === "developer"
      ? "Divergence developer workspace"
      : "Your Divergence credits",
    reasonLabel,
    freeAlternativeLabel: "Keep the current answer without running another paid AI call",
  };
}

function providerForPartner(id: DebatePartnerId): ConnectedProviderId {
  return id === "gpt-5.5" ? "openai"
    : id === "gemini-3.1-pro" ? "google"
      : id === "grok-4.3" ? "xai"
        : "deepseek";
}

/* R11: Refresh exact provider status after a failed execution — a debate
   side failing (auth revoked mid-session, quota exhausted, outage) must
   invalidate the cached availability immediately, so the NEXT authorization
   check (this retry, or a fresh debate) re-verifies every provider instead
   of trusting a stale "available" reading for up to providerStatus.ts's
   60-second TTL. reportProviderEvent invalidates the whole cache (it isn't
   scoped per-provider), so one call is enough once any side failed. */
function reportFailedSides(sides: DebateSide[]): void {
  if (sides.some((side) => side.status === "error")) {
    void reportProviderEvent("error");
  }
}

/* R13: every user-visible "X failed" string in this component goes through
   categorizeCaughtError — never a caught error's own `.message` directly,
   which for a proxy/network failure can carry raw HTTP internals (see
   proxyClient.ts's ProxyClientError). */
function safeFailureMessage(prefix: string, error: unknown): string {
  const categorized = categorizeCaughtError(error);
  return `${prefix}: ${categorized.message} ${categorized.nextAction}`;
}

async function configuredForDebate(partnerIds: DebatePartnerId[]): Promise<boolean> {
  // R26: respects a client-side disconnect, not just server-reported status.
  const checks = await Promise.all([
    isProviderConnected("anthropic"),
    ...partnerIds.map((id) => isProviderConnected(providerForPartner(id))),
  ]);
  return checks.every(Boolean);
}

/* R27: estimate every participant using its ACTUAL provider/model — never
   one flat Opus number borrowed for every side regardless of who's really
   answering. Claude debates on DEBATE_MODEL_ID (Sonnet, not Opus — Opus is
   reserved for the Consensus/Synthesis runtime model); each partner is
   estimated on its own roster model id, now individually priced in
   costTracking's MODEL_PRICES (R14/R27). */
interface ParticipantEstimate {
  label: "Claude" | DebatePartnerId;
  model: string;
  cost: number;
}

function estimateDebateCost(question: string, partnerIds: DebatePartnerId[]): {
  perParticipant: ParticipantEstimate[];
  total: number;
} {
  const inputTokens = Math.ceil(question.length / 4) + 600;
  const maxOutputTokens = 1_200;
  const perParticipant: ParticipantEstimate[] = [
    { label: "Claude", model: DEBATE_MODEL_ID, cost: getEstimatedCostForCall({ model: DEBATE_MODEL_ID, inputTokens, maxOutputTokens }) },
    ...partnerIds.map((id) => ({
      label: id,
      model: id,
      cost: getEstimatedCostForCall({ model: id, inputTokens, maxOutputTokens }),
    })),
  ];
  const total = perParticipant.reduce((sum, p) => sum + p.cost, 0);
  return { perParticipant, total };
}

/* R15: ParticipantUsage.estimatedCost is always null at the client seam
   (client.ts only ever sees a call's ACTUAL result, never what was
   estimated before it ran) — the real pre-call, per-participant estimate
   already exists at this point (estimateDebateCost's perParticipant, or
   retrySide's own single estimate) and is threaded in here so it survives
   into the persisted record instead of being silently dropped. */
function sideToParticipantResult(side: DebateSide, estimatedCost: number | null = null): MultiAiParticipantResult {
  return {
    label: side.label,
    provider: side.usage?.provider ?? null,
    model: side.usage?.model ?? null,
    status: side.status,
    text: side.text,
    message: side.message,
    inputTokens: side.usage?.inputTokens ?? null,
    outputTokens: side.usage?.outputTokens ?? null,
    estimatedCost: side.usage?.estimatedCost ?? estimatedCost,
    actualCost: side.usage?.actualCost ?? null,
  };
}

/** Key a DebateSide by the same identity ParticipantEstimate.label uses:
    the partner id, or "claude" for Claude's own side. */
function participantKey(side: { partnerId?: DebatePartnerId }): string {
  return side.partnerId ?? "claude";
}

function estimateKey(estimate: ParticipantEstimate): string {
  return estimate.label === "Claude" ? "claude" : estimate.label;
}

/** Total actual cost across every participant — null (never a partial sum
    passed off as the total) unless every participant's actual cost is
    known. */
function totalActualCostOf(participants: MultiAiParticipantResult[]): number | null {
  if (participants.length === 0) return null;
  const costs = participants.map((p) => p.actualCost);
  if (costs.some((c) => c === null)) return null;
  return roundCost((costs as number[]).reduce((sum, c) => sum + c, 0));
}

function roundCost(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function outcomeToRunStatus(outcome: DebateOutcome): MultiAiRunRecord["status"] {
  if (outcome.status === "complete") return "complete";
  if (outcome.status === "partial") return "partial";
  return "failed";
}

function newRunId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `multi-ai-run-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

type Phase = "idle" | "debating" | "consensus" | "synthesis";

export function MultiAiActions() {
  const conversation = useSessionStore((s) => s.conversation);
  const upsertMultiAiRun = useSessionStore((s) => s.upsertMultiAiRun);
  const logAutoSelectUsage = useAccountStore((s) => s.logAutoSelectUsage);
  const paidAiEnabled = useAccountStore((s) => s.plan !== "free" || s.appMode === "developer");
  // Use conversation length as a session identifier for auto-select logging
  const sessionId = `session-${conversation.length}`;

  const [expanded, setExpanded] = useState(false);
  const [partnerIds, setPartnerIds] = useState<DebatePartnerId[]>([]);
  const [useAutoSelect, setUseAutoSelect] = useState(true);
  const [useAutoSelectFeature, setUseAutoSelectFeature] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [outcome, setOutcome] = useState<DebateOutcome | null>(null);
  const [retrying, setRetrying] = useState<number | null>(null);
  const [consensus, setConsensus] = useState<ConsensusResult | null>(null);
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selection, setSelection] = useState<MessageSelectionBundle | null>(null);
  // R21: the id of the persisted run this session's debate/consensus/synthesis
  // is writing into — stable across the debating -> consensus -> synthesis
  // lifecycle so later stages update the same record instead of forking one.
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const lastUserMessage = [...conversation].reverse().find((m) => m.role === "user") ?? null;
  const lastQuestion = lastUserMessage?.content ?? "";

  // R20: an explicit selection overrides the implicit "last question"
  // default; both are real conversation content, never fabricated.
  const effectiveQuestion = selection?.contextBundle || lastQuestion;
  const sourceMessageIds = selection?.sourceMessageIds
    ?? (lastUserMessage ? [lastUserMessage.id] : []);

  const transcript: DebateTranscript | null =
    outcome?.status === "complete" ? outcome.transcript : null;

  const selectedPartnerIds = useAutoSelect ? autoSelectPartners(effectiveQuestion) : partnerIds;

  const persistRun = useCallback(
    (patch: Partial<MultiAiRunRecord> & { id: string }) => {
      const existing = useSessionStore.getState().multiAiRuns.find((r) => r.id === patch.id);
      const base: MultiAiRunRecord = existing ?? {
        id: patch.id,
        sourceMessageIds,
        createdAt: Date.now(),
        question: effectiveQuestion.trim(),
        participants: [],
        status: "failed",
        totalEstimatedCost: 0,
        totalActualCost: null,
      };
      upsertMultiAiRun({ ...base, ...patch });
    },
    [sourceMessageIds, effectiveQuestion, upsertMultiAiRun],
  );

  const startDebate = useCallback(async () => {
    if (selectedPartnerIds.length === 0) {
      setActionError("Select at least one debate partner or use Auto-select.");
      return;
    }
    if (!(await configuredForDebate(selectedPartnerIds))) {
      setActionError("One or more selected providers are not configured. No credits were reserved; choose another provider or use the manual alternative.");
      return;
    }
    const { perParticipant, total } = estimateDebateCost(effectiveQuestion, selectedPartnerIds);
    const authorization = await authorizeEstimatedCost(
      total,
      `Multi-AI debate with ${selectedPartnerIds.length + 1} participants`,
      explicitMultiAiPolicy(
        `Multi-AI debate · Claude Sonnet + ${selectedPartnerIds.length} connected partner${selectedPartnerIds.length === 1 ? "" : "s"}`,
        `Starting this debate sends one paid request per participant (${perParticipant.map((p) => `${p.label}: $${p.cost.toFixed(4)}`).join(", ")}).`,
      ),
    );
    if (!authorization.authorized) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const runId = newRunId();
    setActiveRunId(runId);
    setPhase("debating");
    setOutcome(null);
    setConsensus(null);
    setSynthesis(null);
    setActionError(null);

    // Log auto-select usage if the feature is enabled and we're using auto-select
    if (useAutoSelectFeature && useAutoSelect) {
      logAutoSelectUsage({
        timestamp: Date.now(),
        type: "discussion_type",
        sessionId: sessionId || "",
        // R28: no more hardcoded $0.01 placeholder — this is the real,
        // already-computed pre-authorization estimate for this exact call.
        estimatedCost: total,
      });
    }

    try {
      const result = await runDebate(effectiveQuestion, {
        claudeClient: withDebateUsage((req) => completeTracked(req)),
        partnerClient,
        partnerIds: selectedPartnerIds,
        signal: controller.signal,
      });

      if (controller.signal.aborted) {
        // R24: preserve nothing fabricated — a cancelled run is persisted
        // as cancelled, with no sides recorded as having landed.
        persistRun({ id: runId, status: "cancelled", totalEstimatedCost: total, totalActualCost: null, participants: [] });
        return;
      }
      setOutcome(result);
      if (result.status !== "empty-question") {
        reportFailedSides(result.sides);
        const estimateByKey = new Map(perParticipant.map((p) => [estimateKey(p), p.cost]));
        const participants = result.sides.map((side) =>
          sideToParticipantResult(side, estimateByKey.get(participantKey(side)) ?? null),
        );
        persistRun({
          id: runId,
          status: outcomeToRunStatus(result),
          participants,
          totalEstimatedCost: total,
          totalActualCost: totalActualCostOf(participants),
        });
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setActionError(safeFailureMessage("Debate failed", error));
        setOutcome({ status: "failed", sides: [] });
        persistRun({ id: runId, status: "failed", participants: [], totalEstimatedCost: total, totalActualCost: null });
      } else {
        persistRun({ id: runId, status: "cancelled", totalEstimatedCost: total, totalActualCost: null, participants: [] });
      }
    } finally {
      setPhase("idle");
    }
  }, [effectiveQuestion, selectedPartnerIds, useAutoSelectFeature, useAutoSelect, sessionId, logAutoSelectUsage, persistRun]);

  /* R24: abort whatever is currently in flight (debate, consensus, or
     synthesis) — every phase's own call is given the same controller's
     signal, so one Cancel click stops the actual network request, not just
     the UI's busy spinner. */
  const cancelActive = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  /* R22: retries EXACTLY ONE participant — one authorized call, for the one
     side that failed. The other sides' existing text is kept as-is rather
     than re-fetched: they already succeeded, and re-asking would spend
     calls to replace good arguments with different good arguments the user
     didn't ask to change. */
  const retrySide = useCallback(
    async (sideIndex: number) => {
      if (!outcome || outcome.status === "empty-question") return;
      const target = outcome.sides[sideIndex];
      if (!target) return;

      const targetProviderId = target.partnerId;
      if (targetProviderId) {
        if (!(await isProviderConnected(providerForPartner(targetProviderId)))) {
          setActionError(`${target.label} is not configured. No retry charge was reserved.`);
          return;
        }
      } else if (!(await isProviderConnected("anthropic"))) {
        setActionError("Claude is not configured. No retry charge was reserved.");
        return;
      }

      const retryModel = targetProviderId ?? DEBATE_MODEL_ID;
      const estimate = getEstimatedCostForCall({
        model: retryModel,
        inputTokens: Math.ceil(effectiveQuestion.length / 4) + 600,
        maxOutputTokens: 1_200,
      });
      const authorization = await authorizeEstimatedCost(
        estimate,
        `Retry ${target.label}`,
        explicitMultiAiPolicy(
          `Multi-AI debate retry · ${target.label} only`,
          `Retrying sends exactly one new request, to ${target.label} only ($${estimate.toFixed(4)}).`,
        ),
      );
      if (!authorization.authorized) return;

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setRetrying(sideIndex);
      setActionError(null);

      /* R12: this whole block previously had no try/finally at all — an
         unexpected throw (e.g. a bad partner id reaching getDebatePartner
         before runSide's own try/catch, in runDebate.ts, even gets a
         chance to wrap it) would leave `retrying` stuck non-null forever,
         permanently disabling that side's retry control with no visible
         recovery. The `controllerRef.current === controller` guard also
         fixes a real race: starting a retry on a DIFFERENT side aborts
         this one via controllerRef.current?.abort() above, but the
         first retry's own promise still eventually settles and, without
         this guard, would clear `retrying` out from under the second
         (still in-flight) retry's own busy indicator. */
      try {
        const retried = await retryDebateSide(effectiveQuestion, {
          claudeClient: withDebateUsage((req) => completeTracked(req)),
          partnerClient,
          stance: target.stance,
          partnerId: targetProviderId,
          signal: controller.signal,
        });

        if (controllerRef.current !== controller) return;
        if (controller.signal.aborted) return;

        reportFailedSides([retried]);

        const newSides = [...outcome.sides];
        newSides[sideIndex] = retried;

        const allOk = newSides.every((s) => s.status === "ok");
        let nextOutcome: DebateOutcome;
        if (allOk) {
          nextOutcome = {
            status: "complete",
            sides: newSides,
            transcript: {
              question: effectiveQuestion.trim(),
              participants: newSides.map((s) => ({ label: s.label, text: s.text! })),
            },
          };
        } else if (newSides.some((s) => s.status === "ok")) {
          nextOutcome = { status: "partial", sides: newSides };
        } else {
          nextOutcome = { status: "failed", sides: newSides };
        }
        setOutcome(nextOutcome);

        if (activeRunId) {
          // R15: preserve every OTHER participant's already-persisted
          // estimatedCost (this retry only re-estimated the one side being
          // retried) rather than dropping it back to null by replacing the
          // whole participants array.
          const existingParticipants = useSessionStore.getState()
            .multiAiRuns.find((r) => r.id === activeRunId)?.participants ?? [];
          const priorEstimateByLabel = new Map(existingParticipants.map((p) => [p.label, p.estimatedCost]));
          const participants = newSides.map((s, i) =>
            sideToParticipantResult(s, i === sideIndex ? estimate : priorEstimateByLabel.get(s.label) ?? null),
          );
          persistRun({
            id: activeRunId,
            status: outcomeToRunStatus(nextOutcome),
            participants,
            totalActualCost: totalActualCostOf(participants),
          });
        }
      } catch (error) {
        if (controllerRef.current === controller && !controller.signal.aborted) {
          setActionError(safeFailureMessage("Retry failed", error));
        }
      } finally {
        if (controllerRef.current === controller) setRetrying(null);
      }
    },
    [outcome, effectiveQuestion, activeRunId, persistRun],
  );

  const doConsensus = useCallback(async () => {
    if (!transcript) return;
    if (!(await isProviderConnected("anthropic"))) {
      setActionError("Claude is not configured. No consensus charge was reserved.");
      return;
    }
    const inputTokens = Math.ceil(
      transcript.participants.reduce((sum, p) => sum + p.text.length, 0) / 4,
    ) + 700;
    const estimate = getEstimatedCostForCall({ model: "claude-opus-4-8", inputTokens, maxOutputTokens: 1_300 });
    const authorization = await authorizeEstimatedCost(
      estimate,
      "Multi-AI consensus",
      explicitMultiAiPolicy(
        "Multi-AI consensus · Anthropic · Claude Opus",
        "Consensus uses a new paid AI call to compare the completed debate.",
      ),
    );
    if (!authorization.authorized) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setPhase("consensus");
    setActionError(null);
    try {
      const result = await runConsensus(transcript, {
        client: (req) => completeTracked(req),
        signal: controller.signal,
      });
      if (controller.signal.aborted) {
        setActionError("Consensus was cancelled. No charge beyond what already completed.");
        if (activeRunId) persistRun({ id: activeRunId, status: "cancelled" });
        return;
      }
      if (result.status === "ok") {
        setConsensus(result.result);
        if (activeRunId) persistRun({ id: activeRunId, consensus: result.result });
      } else {
        setActionError("Consensus couldn't be produced from this debate. You can try again.");
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        // R11: a transport failure here means Claude's own connection just
        // failed a real call — never keep authorizing further calls on a
        // stale "available" reading for the rest of the cache's TTL.
        void reportProviderEvent("error");
        setActionError(safeFailureMessage("Consensus failed", error));
      }
    } finally {
      setPhase("idle");
    }
  }, [transcript, activeRunId, persistRun]);

  const doSynthesis = useCallback(async () => {
    if (!transcript) return;
    if (!(await isProviderConnected("anthropic"))) {
      setActionError("Claude is not configured. No synthesis charge was reserved.");
      return;
    }
    const inputTokens = Math.ceil(
      transcript.participants.reduce((sum, p) => sum + p.text.length, 0) / 4,
    ) + 700;
    const estimate = getEstimatedCostForCall({ model: "claude-opus-4-8", inputTokens, maxOutputTokens: 1_600 });
    const authorization = await authorizeEstimatedCost(
      estimate,
      "Multi-AI synthesis",
      explicitMultiAiPolicy(
        "Multi-AI synthesis · Anthropic · Claude Opus",
        "Synthesis uses a new paid AI call to combine the completed debate.",
      ),
    );
    if (!authorization.authorized) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setPhase("synthesis");
    setActionError(null);
    try {
      const result = await runSynthesis(transcript, {
        client: (req) => completeTracked(req),
        signal: controller.signal,
      });
      if (controller.signal.aborted) {
        setActionError("Synthesis was cancelled. No charge beyond what already completed.");
        if (activeRunId) persistRun({ id: activeRunId, status: "cancelled" });
        return;
      }
      if (result.status === "ok") {
        setSynthesis(result.result);
        if (activeRunId) persistRun({ id: activeRunId, synthesis: result.result });
      } else {
        setActionError("Synthesis couldn't be produced from this debate. You can try again.");
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        void reportProviderEvent("error");
        setActionError(safeFailureMessage("Synthesis failed", error));
      }
    } finally {
      setPhase("idle");
    }
  }, [transcript, activeRunId, persistRun]);

  const busy = phase !== "idle" || retrying !== null;
  const canDebate = effectiveQuestion.trim().length > 0;

  return (
    <div className="multi-ai-actions" data-testid="multi-ai-actions">
      <GlassButton
        className="multi-ai-actions__toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <span className="multi-ai-actions__toggle-label">
          <Info size={16} aria-hidden="true" />
          MULTI-AI ACTIONS
        </span>
        <span aria-hidden="true" className="multi-ai-actions__chevron">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </GlassButton>

      {expanded && (
        <GlassCard className="multi-ai-actions__body" data-testid="multi-ai-actions-body">
          {!canDebate ? (
            <p className="multi-ai-actions__empty">
              Ask a question first — these actions work on an answer you've already got.
            </p>
          ) : (
            <>
              <MessageSourceSelector onSelectionChange={setSelection} disabled={busy} />

              <ProTierSelector
                useAutoSelect={useAutoSelectFeature}
                onToggleAutoSelect={setUseAutoSelectFeature}
                featureType="discussion_type"
              />

              {!paidAiEnabled && (
                <p className="multi-ai-actions__note" role="status">
                  Paid multi-AI routes are unavailable on the free-first route. Connect and authorize a paid provider in Settings.
                </p>
              )}

              <div className="multi-ai-actions__selection">
                <AutoSelectButton
                  question={effectiveQuestion}
                  onSelect={(ids) => {
                    setPartnerIds(ids);
                    setUseAutoSelect(false);
                  }}
                  disabled={busy || !useAutoSelectFeature || !paidAiEnabled}
                />
                <button
                  type="button"
                  className="multi-ai-actions__toggle-manual"
                  onClick={() => setUseAutoSelect(!useAutoSelect)}
                  disabled={busy || !useAutoSelectFeature || !paidAiEnabled}
                >
                  {useAutoSelect && useAutoSelectFeature ? "Manual selection" : "Auto-select"}
                </button>
              </div>

              {!useAutoSelect && (
                <PartnerPicker value={partnerIds} onChange={setPartnerIds} disabled={busy} />
              )}

              <div className="multi-ai-actions__row">
                <GlassButton onClick={() => void startDebate()} disabled={busy || selectedPartnerIds.length === 0 || !paidAiEnabled}>
                  {phase === "debating" ? "Debating…" : outcome ? "Run debate again" : "Start debate"}
                </GlassButton>
                <GlassButton onClick={() => void doConsensus()} disabled={busy || !transcript || !paidAiEnabled}>
                  {phase === "consensus" ? "Finding consensus…" : "Consensus"}
                </GlassButton>
                <GlassButton onClick={() => void doSynthesis()} disabled={busy || !transcript}>
                  {phase === "synthesis" ? "Synthesizing…" : "Synthesis"}
                </GlassButton>
                {phase !== "idle" && (
                  <GlassButton
                    className="multi-ai-actions__cancel"
                    onClick={cancelActive}
                    data-testid="multi-ai-cancel"
                  >
                    Cancel
                  </GlassButton>
                )}
              </div>

              {outcome && outcome.status !== "empty-question" && (
                <DebateView
                  sides={outcome.sides}
                  onRetrySide={(index) => void retrySide(index)}
                  retrying={retrying}
                />
              )}

              {outcome && outcome.status === "partial" && (
                <p className="multi-ai-actions__note" role="status">
                  Not all sides came back. Consensus and Synthesis need all participants — retry the
                  missing one(s) to enable them.
                </p>
              )}

              {actionError && (
                <p className="multi-ai-actions__note" role="status">
                  {actionError}
                </p>
              )}

              {consensus && <ConsensusView result={consensus} />}
              {synthesis && <SynthesisView result={synthesis} />}

              <MultiAiRunHistory sourceMessageIds={sourceMessageIds} />
            </>
          )}
        </GlassCard>
      )}
    </div>
  );
}
