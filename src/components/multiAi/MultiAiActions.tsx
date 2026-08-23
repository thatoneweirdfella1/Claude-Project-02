import { useCallback, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { GlassButton, GlassCard } from "../primitives";
import { createProxyClient } from "../../services/proxyClient";
import { useSessionStore } from "../../stores/sessionStore";
import { useAccountStore } from "../../stores/accountStore";
import {
  createPartnerClient,
  runDebate,
  type DebateOutcome,
  type DebatePartnerId,
} from "../../services/debate";
import { autoSelectPartners } from "../../services/debate/autoSelect";
import {
  runConsensus,
  runSynthesis,
  type ConsensusResult,
  type DebateTranscript,
  type SynthesisResult,
} from "../../services/multiAi";
import { DebateView } from "./DebateView";
import { PartnerPicker } from "./PartnerPicker";
import { AutoSelectButton } from "./AutoSelectButton";
import { ConsensusView } from "./ConsensusView";
import { SynthesisView } from "./SynthesisView";
import { ProTierSelector } from "./ProTierSelector";
import { authorizeEstimatedCost } from "../../services/creditAuthorization";
import { addTokenUsage, getEstimatedCostForCall } from "../../services/costTracking";
import type { PaidRoutePolicy } from "../../services/paidRoutePolicy";

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

   Debate runs on the last question asked this session, read from the session
   store — CANON Feature 9 frames all three actions as "After an answer". */

const claudeClient = createProxyClient();
const partnerClient = createPartnerClient();

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

type Phase = "idle" | "debating" | "consensus" | "synthesis";

export function MultiAiActions() {
  const conversation = useSessionStore((s) => s.conversation);
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
  const controllerRef = useRef<AbortController | null>(null);

  const lastQuestion =
    [...conversation].reverse().find((m) => m.role === "user")?.content ?? "";

  const transcript: DebateTranscript | null =
    outcome?.status === "complete" ? outcome.transcript : null;

  const selectedPartnerIds = useAutoSelect ? autoSelectPartners(lastQuestion) : partnerIds;

  const startDebate = useCallback(async () => {
    if (selectedPartnerIds.length === 0) {
      setActionError("Select at least one debate partner or use Auto-select.");
      return;
    }
    const inputTokens = Math.ceil(lastQuestion.length / 4) + 600;
    const perSide = getEstimatedCostForCall({ model: "claude-opus-4-8", inputTokens, maxOutputTokens: 1_200 });
    const authorization = await authorizeEstimatedCost(
      perSide * (selectedPartnerIds.length + 1),
      `Multi-AI debate with ${selectedPartnerIds.length + 1} participants`,
      explicitMultiAiPolicy(
        `Multi-AI debate · Claude Opus + ${selectedPartnerIds.length} connected partner${selectedPartnerIds.length === 1 ? "" : "s"}`,
        "Starting this debate sends one paid request per participant.",
      ),
    );
    if (!authorization.authorized) return;

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

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
        estimatedCost: 0.01, // Placeholder — actual cost calculated server-side
      });
    }

    const result = await runDebate(lastQuestion, {
      claudeClient: (req) => completeTracked(req),
      partnerClient,
      partnerIds: selectedPartnerIds,
      signal: controller.signal,
    });

    if (controller.signal.aborted) return;
    setOutcome(result);
    setPhase("idle");
  }, [lastQuestion, selectedPartnerIds, useAutoSelectFeature, useAutoSelect, sessionId, logAutoSelectUsage]);

  /* Re-runs ONE side by index. The other sides' existing text is kept as-is
     rather than re-fetched: they already succeeded, and re-asking would spend
     calls to replace good arguments with different good arguments the user
     didn't ask to change. */
  const retrySide = useCallback(
    async (sideIndex: number) => {
      if (!outcome || outcome.status === "empty-question") return;
      const estimate = getEstimatedCostForCall({
        model: "claude-opus-4-8",
        inputTokens: Math.ceil(lastQuestion.length / 4) + 600,
        maxOutputTokens: 1_200,
      }) * (selectedPartnerIds.length + 1);
      const authorization = await authorizeEstimatedCost(
        estimate,
        "Retry debate participant",
        explicitMultiAiPolicy(
          "Multi-AI debate retry · Claude Opus + connected partners",
          "Retrying sends the debate requests again.",
        ),
      );
      if (!authorization.authorized) return;
      setRetrying(sideIndex);
      setActionError(null);

      const rerun = await runDebate(lastQuestion, {
        claudeClient: (req) => completeTracked(req),
        partnerClient,
        partnerIds: selectedPartnerIds,
        // Keep Claude on the stance it already had, so a retry doesn't
        // silently flip sides mid-debate.
        claudeStance: outcome.sides[0].stance,
      });

      setRetrying(null);
      if (rerun.status === "empty-question") return;

      // Merge rerun.sides[sideIndex] into the existing sides array
      const newSides = [...outcome.sides];
      newSides[sideIndex] = rerun.sides[sideIndex];

      const allOk = newSides.every((s) => s.status === "ok");
      if (allOk) {
        // Create a transcript from the first non-Claude side
        const firstPartnerSide = newSides.find((s) => s.partnerId);
        if (firstPartnerSide) {
          setOutcome({
            status: "complete",
            sides: newSides,
            transcript: {
              question: lastQuestion.trim(),
              claudeText: newSides[0].text!,
              partnerLabel: firstPartnerSide.label,
              partnerText: firstPartnerSide.text!,
            },
          });
        }
      } else if (newSides.some((s) => s.status === "ok")) {
        setOutcome({ status: "partial", sides: newSides });
      } else {
        setOutcome({ status: "failed", sides: newSides });
      }
    },
    [outcome, lastQuestion, selectedPartnerIds],
  );

  const doConsensus = useCallback(async () => {
    if (!transcript) return;
    const estimate = getEstimatedCostForCall({
      model: "claude-opus-4-8",
      inputTokens: Math.ceil((transcript.claudeText.length + transcript.partnerText.length) / 4) + 700,
      maxOutputTokens: 1_300,
    });
    const authorization = await authorizeEstimatedCost(
      estimate,
      "Multi-AI consensus",
      explicitMultiAiPolicy(
        "Multi-AI consensus · Anthropic · Claude Opus",
        "Consensus uses a new paid AI call to compare the completed debate.",
      ),
    );
    if (!authorization.authorized) return;
    setPhase("consensus");
    setActionError(null);
    const result = await runConsensus(transcript, {
      client: (req) => completeTracked(req),
    });
    setPhase("idle");
    if (result.status === "ok") setConsensus(result.result);
    else setActionError("Consensus couldn't be produced from this debate. You can try again.");
  }, [transcript]);

  const doSynthesis = useCallback(async () => {
    if (!transcript) return;
    const estimate = getEstimatedCostForCall({
      model: "claude-opus-4-8",
      inputTokens: Math.ceil((transcript.claudeText.length + transcript.partnerText.length) / 4) + 700,
      maxOutputTokens: 1_600,
    });
    const authorization = await authorizeEstimatedCost(
      estimate,
      "Multi-AI synthesis",
      explicitMultiAiPolicy(
        "Multi-AI synthesis · Anthropic · Claude Opus",
        "Synthesis uses a new paid AI call to combine the completed debate.",
      ),
    );
    if (!authorization.authorized) return;
    setPhase("synthesis");
    setActionError(null);
    const result = await runSynthesis(transcript, {
      client: (req) => completeTracked(req),
    });
    setPhase("idle");
    if (result.status === "ok") setSynthesis(result.result);
    else setActionError("Synthesis couldn't be produced from this debate. You can try again.");
  }, [transcript]);

  const busy = phase !== "idle" || retrying !== null;
  const canDebate = lastQuestion.trim().length > 0;

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
                  question={lastQuestion}
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
            </>
          )}
        </GlassCard>
      )}
    </div>
  );
}
