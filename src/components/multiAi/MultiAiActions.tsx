import { useCallback, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { GlassButton, GlassCard } from "../primitives";
import { createProxyClient } from "../../services/proxyClient";
import { useSessionStore } from "../../stores/sessionStore";
import { useAccountStore } from "../../stores/accountStore";
import {
  DEBATE_CLAUDE_MODEL,
  createPartnerClient,
  getDebatePartner,
  runDebate,
  runDebateParticipant,
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
  type SynthesisResult,
} from "../../services/multiAi";
import { DebateView } from "./DebateView";
import { PartnerPicker } from "./PartnerPicker";
import { AutoSelectButton } from "./AutoSelectButton";
import { ConsensusView } from "./ConsensusView";
import { SynthesisView } from "./SynthesisView";
import { ProTierSelector } from "./ProTierSelector";
import { authorizeEstimatedCost } from "../../services/creditAuthorization";
import {
  addTokenUsage,
  getEstimatedCostForCall,
  hasExplicitModelPricing,
} from "../../services/costTracking";
import type { PaidRoutePolicy } from "../../services/paidRoutePolicy";
import { getProviderAvailability, type ConnectedProviderId } from "../../services/providerStatus";
import { saveNow } from "../../services/persistence";
import type { ConversationMessage } from "../../stores/types";

const claudeClient = createProxyClient();
const partnerClient = createPartnerClient();

type Phase = "idle" | "debating" | "consensus" | "synthesis";

function newId(prefix: string): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

function completeTracked(request: Parameters<typeof claudeClient.complete>[0]): Promise<string> {
  return claudeClient.complete({
    ...request,
    onUsage: (usage) => addTokenUsage(usage.inputTokens, usage.outputTokens, request.model),
  });
}

function explicitMultiAiPolicy(routeLabel: string, reasonLabel: string): PaidRoutePolicy {
  const session = useSessionStore.getState();
  const account = useAccountStore.getState();
  return {
    maximum: session.maxRequestCost,
    paidFallbackEnabled: session.paidFallbackEnabled,
    requiresPaidFallback: false,
    routeLabel,
    payerLabel: account.appMode === "developer" ? "Divergence developer workspace" : "Your Divergence credits",
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

async function configuredForDebate(partnerIds: DebatePartnerId[]): Promise<boolean> {
  const status = await getProviderAvailability();
  return status.anthropic && partnerIds.every((id) => status[providerForPartner(id)]);
}

function selectedContextBundle(messages: ConversationMessage[]): string {
  return messages.map((message) =>
    `[source-message-id=${message.id}] ${message.role.toUpperCase()}:\n${message.content.trim()}`,
  ).join("\n\n");
}

function completedTranscript(question: string, sides: DebateSide[]): DebateTranscript | null {
  if (sides.length < 2 || sides.some((side) => side.status !== "ok" || !side.text)) return null;
  const firstPartner = sides.find((side) => side.partnerId);
  if (!firstPartner?.text || !sides[0]?.text) return null;
  return {
    question,
    participants: sides.map((side) => {
      if (!side.partnerId) return { label: side.label, providerId: "anthropic", modelId: DEBATE_CLAUDE_MODEL, text: side.text! };
      const partner = getDebatePartner(side.partnerId);
      return { label: side.label, providerId: partner.provider, modelId: partner.id, text: side.text! };
    }),
    claudeText: sides[0].text,
    partnerLabel: firstPartner.label,
    partnerText: firstPartner.text,
  };
}

function estimateModels(models: string[], inputCharacters: number, maxOutputTokens: number): { total: number; missing: string[] } {
  const missing = models.filter((model) => !hasExplicitModelPricing(model));
  if (missing.length > 0) return { total: 0, missing };
  const inputTokens = Math.ceil(inputCharacters / 4) + 600;
  return {
    total: models.reduce((sum, model) => sum + getEstimatedCostForCall({ model, inputTokens, maxOutputTokens }), 0),
    missing: [],
  };
}

export function MultiAiActions() {
  const conversation = useSessionStore((s) => s.conversation);
  const addMessage = useSessionStore((s) => s.addMessage);
  const updateMessage = useSessionStore((s) => s.updateMessage);
  const logAutoSelectUsage = useAccountStore((s) => s.logAutoSelectUsage);
  const paidAiEnabled = useAccountStore((s) => s.plan !== "free" || s.appMode === "developer");

  const eligibleMessages = useMemo(
    () => conversation.filter((message) => message.sourceLabel !== "Multi-AI"),
    [conversation],
  );
  const persistedHandoff = useMemo(
    () => [...conversation].reverse().find((message) =>
      message.sourceLabel === "Multi-AI" && message.messageKind === "handoff" && Boolean(message.preparedRequest),
    ),
    [conversation],
  );

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
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [reviewingContext, setReviewingContext] = useState(false);
  const [activeHandoffId, setActiveHandoffId] = useState<string | null>(persistedHandoff?.id ?? null);
  const controllerRef = useRef<AbortController | null>(null);

  const activeHandoff = conversation.find((message) => message.id === activeHandoffId) ?? persistedHandoff;
  const selectedMessages = eligibleMessages.filter((message) => selectedMessageIds.includes(message.id));
  const contextPreview = selectedContextBundle(selectedMessages);
  const lastQuestion = [...eligibleMessages].reverse().find((message) => message.role === "user")?.content ?? "";
  const multiAiInput = activeHandoff?.preparedRequest?.trim() || lastQuestion;
  const selectedPartnerIds = useAutoSelect ? autoSelectPartners(multiAiInput) : partnerIds;
  const transcript = outcome?.status === "complete" ? outcome.transcript : null;
  const busy = phase !== "idle" || retrying !== null;
  const canDebate = multiAiInput.trim().length > 0;

  function persistBranchResult(content: string, notes: string[]) {
    if (!activeHandoff) return;
    addMessage({
      id: newId("multi-ai-result"),
      role: "assistant",
      content,
      timestamp: Date.now(),
      messageKind: "answer",
      sourceLabel: "Multi-AI",
      parentMessageId: activeHandoff.id,
      branchId: activeHandoff.branchId ?? activeHandoff.id,
      notes,
    });
    void saveNow({ reason: "autosave" });
  }

  function selectLastExchange() {
    const lastUserIndex = eligibleMessages.map((message) => message.role).lastIndexOf("user");
    if (lastUserIndex < 0) return;
    const ids = eligibleMessages.slice(lastUserIndex).map((message) => message.id);
    setSelectedMessageIds(ids.length > 0 ? ids : [eligibleMessages[lastUserIndex].id]);
    setReviewingContext(true);
  }

  function toggleMessage(id: string) {
    setSelectedMessageIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  }

  function confirmContextHandoff() {
    if (!contextPreview.trim() || selectedMessages.length === 0) return;
    const id = newId("multi-ai-handoff");
    const sourceIds = selectedMessages.map((message) => message.id);
    addMessage({
      id,
      role: "assistant",
      content: `Multi-AI context prepared from ${sourceIds.length} selected conversation message${sourceIds.length === 1 ? "" : "s"}.`,
      timestamp: Date.now(),
      messageKind: "handoff",
      handoffStatus: "prepared",
      sourceLabel: "Multi-AI",
      preparedRequest: contextPreview,
      parentMessageId: sourceIds[0],
      branchId: `multi-ai:${sourceIds.join("+")}`,
      notes: [`Source message IDs: ${sourceIds.join(", ")}`, "Prepared locally — not sent"],
    });
    setActiveHandoffId(id);
    setReviewingContext(false);
    setActionError("Selected conversation context is prepared for Multi-AI. Nothing has been sent yet.");
    void saveNow({ reason: "autosave" });
  }

  const startDebate = useCallback(async () => {
    if (selectedPartnerIds.length === 0) { setActionError("Select at least one debate partner or use Auto-select."); return; }
    try {
      if (!(await configuredForDebate(selectedPartnerIds))) {
        setActionError("One or more selected providers are not configured or verified. No credits were reserved.");
        return;
      }
      const models = [DEBATE_CLAUDE_MODEL, ...selectedPartnerIds];
      const estimate = estimateModels(models, multiAiInput.length, 1_200);
      if (estimate.missing.length > 0) {
        setActionError(`Cost unavailable for: ${estimate.missing.join(", ")}. The debate was not sent.`);
        return;
      }
      const authorization = await authorizeEstimatedCost(
        estimate.total,
        `Multi-AI debate with ${models.length} participants`,
        explicitMultiAiPolicy(`Multi-AI debate · ${models.join(" + ")}`, "Starting this debate sends one paid request per participant."),
      );
      if (!authorization.authorized) return;

      if (useAutoSelectFeature && useAutoSelect) {
        logAutoSelectUsage({ timestamp: Date.now(), type: "discussion_type", sessionId: useSessionStore.getState().sessionId, estimatedCost: estimate.total });
      }
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      setPhase("debating"); setOutcome(null); setConsensus(null); setSynthesis(null); setActionError(null);
      try {
        if (activeHandoff) updateMessage(activeHandoff.id, { handoffStatus: "handed-off", notes: [...(activeHandoff.notes ?? []), "Sending to Multi-AI"] });
        const result = await runDebate(multiAiInput, { claudeClient: (req) => completeTracked(req), partnerClient, partnerIds: selectedPartnerIds, signal: controller.signal });
        if (controller.signal.aborted) return;
        setOutcome(result);
        if (activeHandoff) updateMessage(activeHandoff.id, { handoffStatus: "imported", notes: [...(activeHandoff.notes ?? []), `Debate ${result.status}`] });
        if (result.status !== "empty-question") {
          const landed = result.sides.filter((side) => side.status === "ok").map((side) => `${side.label}: ${side.text}`).join("\n\n");
          persistBranchResult(landed || "No debate participant returned a usable result.", [`Debate status: ${result.status}`, `Participants: ${result.sides.map((side) => `${side.label}=${side.status}`).join(", ")}`]);
        }
      } finally {
        setPhase("idle");
      }
    } catch {
      setActionError("The debate could not start safely. No unverified success is being claimed; you can retry after checking provider status and cost availability.");
      setPhase("idle");
    }
  }, [activeHandoff, logAutoSelectUsage, multiAiInput, selectedPartnerIds, updateMessage, useAutoSelect, useAutoSelectFeature]);

  const retrySide = useCallback(async (sideIndex: number) => {
    if (!outcome || outcome.status === "empty-question") return;
    const side = outcome.sides[sideIndex];
    if (!side) return;
    const model = side.partnerId ?? DEBATE_CLAUDE_MODEL;
    if (!hasExplicitModelPricing(model)) { setActionError(`Cost unavailable for ${model}. That participant was not retried.`); return; }
    try {
      const requiredPartnerIds = side.partnerId ? [side.partnerId] : selectedPartnerIds;
      if (!(await configuredForDebate(requiredPartnerIds))) { setActionError("That participant is not currently configured and verified. No retry charge was reserved."); return; }
      const estimate = estimateModels([model], multiAiInput.length, 1_200);
      const authorization = await authorizeEstimatedCost(estimate.total, `Retry ${side.label}`, explicitMultiAiPolicy(`Multi-AI retry · ${model}`, "Retrying sends exactly one new paid request to this participant."));
      if (!authorization.authorized) return;
      const controller = new AbortController(); controllerRef.current = controller; setRetrying(sideIndex); setActionError(null);
      try {
        const rerunSide = await runDebateParticipant(multiAiInput, { claudeClient: (req) => completeTracked(req), partnerClient, side: { stance: side.stance, partnerId: side.partnerId }, signal: controller.signal });
        if (controller.signal.aborted) return;
        const newSides = [...outcome.sides]; newSides[sideIndex] = rerunSide;
        const rebuilt = completedTranscript(multiAiInput, newSides);
        const next: DebateOutcome = rebuilt ? { status: "complete", sides: newSides, transcript: rebuilt } : newSides.some((item) => item.status === "ok") ? { status: "partial", sides: newSides } : { status: "failed", sides: newSides };
        setOutcome(next);
        persistBranchResult(`${rerunSide.label}: ${rerunSide.text ?? rerunSide.message ?? "No result"}`, [`Single-participant retry: ${rerunSide.label}`, `Status: ${rerunSide.status}`]);
      } finally { setRetrying(null); }
    } catch { setRetrying(null); setActionError("That participant retry failed safely. Other completed sides were preserved."); }
  }, [multiAiInput, outcome, selectedPartnerIds]);

  const doConsensus = useCallback(async () => {
    if (!transcript) return;
    try {
      if (!(await getProviderAvailability()).anthropic) { setActionError("Claude is not configured and verified. No consensus charge was reserved."); return; }
      const estimate = estimateModels([DEBATE_CLAUDE_MODEL], JSON.stringify(transcript).length, 1_300);
      const authorization = await authorizeEstimatedCost(estimate.total, "Multi-AI consensus", explicitMultiAiPolicy("Multi-AI consensus · Anthropic · Claude Opus", "Consensus uses one new paid call over every completed debate side."));
      if (!authorization.authorized) return;
      const controller = new AbortController(); controllerRef.current = controller; setPhase("consensus"); setActionError(null);
      try {
        const result = await runConsensus(transcript, { client: (req) => completeTracked(req), signal: controller.signal });
        if (controller.signal.aborted) return;
        if (result.status === "ok") { setConsensus(result.result); persistBranchResult(result.result.unifiedView, ["Multi-AI consensus", `Participants considered: ${transcript.participants?.length ?? 2}`]); }
        else setActionError("Consensus couldn't be produced from this debate. You can retry without losing the debate sides.");
      } finally { setPhase("idle"); }
    } catch { setPhase("idle"); setActionError("Consensus failed safely. The completed debate remains available."); }
  }, [transcript]);

  const doSynthesis = useCallback(async () => {
    if (!transcript) return;
    try {
      if (!(await getProviderAvailability()).anthropic) { setActionError("Claude is not configured and verified. No synthesis charge was reserved."); return; }
      const estimate = estimateModels([DEBATE_CLAUDE_MODEL], JSON.stringify(transcript).length, 1_600);
      const authorization = await authorizeEstimatedCost(estimate.total, "Multi-AI synthesis", explicitMultiAiPolicy("Multi-AI synthesis · Anthropic · Claude Opus", "Synthesis uses one new paid call over every completed debate side."));
      if (!authorization.authorized) return;
      const controller = new AbortController(); controllerRef.current = controller; setPhase("synthesis"); setActionError(null);
      try {
        const result = await runSynthesis(transcript, { client: (req) => completeTracked(req), signal: controller.signal });
        if (controller.signal.aborted) return;
        if (result.status === "ok") { setSynthesis(result.result); persistBranchResult(result.result.refinedAnswer, ["Multi-AI synthesis", `Participants considered: ${transcript.participants?.length ?? 2}`]); }
        else setActionError("Synthesis couldn't be produced from this debate. You can retry without losing the debate sides.");
      } finally { setPhase("idle"); }
    } catch { setPhase("idle"); setActionError("Synthesis failed safely. The completed debate remains available."); }
  }, [transcript]);

  function cancelActive() {
    controllerRef.current?.abort(); controllerRef.current = null; setPhase("idle"); setRetrying(null);
    setActionError("Multi-AI action cancelled. Completed sides and prepared context were preserved.");
    persistBranchResult("Multi-AI action cancelled by the user.", ["Cancelled", "No unanswered call is represented as completed"]);
  }

  return (
    <div className="multi-ai-actions" data-testid="multi-ai-actions">
      <GlassButton className="multi-ai-actions__toggle" aria-expanded={expanded} onClick={() => setExpanded((prev) => !prev)}>
        <span className="multi-ai-actions__toggle-label"><Info size={16} aria-hidden="true" />MULTI-AI ACTIONS</span>
        <span aria-hidden="true" className="multi-ai-actions__chevron">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
      </GlassButton>

      {expanded && <GlassCard className="multi-ai-actions__body" data-testid="multi-ai-actions-body">
        <section aria-label="Conversation context for Multi-AI" className="multi-ai-actions__context">
          <strong>Conversation context</strong>
          <p className="multi-ai-actions__note">Select the unresolved message or range Multi-AI should receive. Review the exact bundle before anything is sent.</p>
          <div className="multi-ai-actions__selection"><button type="button" onClick={selectLastExchange} disabled={busy || eligibleMessages.length === 0}>Select last exchange</button><button type="button" onClick={() => { setSelectedMessageIds([]); setReviewingContext(false); }} disabled={busy || selectedMessageIds.length === 0}>Clear selection</button></div>
          <div className="multi-ai-actions__context-list">
            {eligibleMessages.map((message) => <label key={message.id}><input type="checkbox" checked={selectedMessageIds.includes(message.id)} disabled={busy} onChange={() => toggleMessage(message.id)} /> <span>{message.role === "user" ? "You" : "AI"}: {message.content.slice(0, 120)}{message.content.length > 120 ? "…" : ""}</span></label>)}
          </div>
          <button type="button" onClick={() => setReviewingContext(true)} disabled={busy || selectedMessages.length === 0}>Review selected context</button>
          {reviewingContext && <div className="workflow-dialog__summary" role="region" aria-label="Exact Multi-AI context preview"><strong>Exact context bundle</strong><pre>{contextPreview}</pre><button type="button" className="primary" onClick={confirmContextHandoff} disabled={!contextPreview.trim()}>Use this context in Multi-AI</button><button type="button" onClick={() => setReviewingContext(false)}>Cancel</button></div>}
          {activeHandoff?.preparedRequest && <p className="multi-ai-actions__note" role="status">Prepared context loaded: {activeHandoff.preparedRequest.split("[source-message-id=").length - 1} source message(s). This selection persists with the conversation.</p>}
        </section>

        {!canDebate ? <p className="multi-ai-actions__empty">Select conversation context or ask a question first.</p> : <>
          <ProTierSelector useAutoSelect={useAutoSelectFeature} onToggleAutoSelect={setUseAutoSelectFeature} featureType="discussion_type" />
          {!paidAiEnabled && <p className="multi-ai-actions__note" role="status">Paid Multi-AI routes are unavailable on the free plan. Prepared context remains usable and nothing is sent.</p>}
          <div className="multi-ai-actions__selection">
            <AutoSelectButton question={multiAiInput} onSelect={(ids) => { setPartnerIds(ids); setUseAutoSelect(false); }} disabled={busy || !useAutoSelectFeature || !paidAiEnabled} />
            <button type="button" className="multi-ai-actions__toggle-manual" onClick={() => setUseAutoSelect(!useAutoSelect)} disabled={busy || !useAutoSelectFeature || !paidAiEnabled}>{useAutoSelect && useAutoSelectFeature ? "Manual selection" : "Auto-select"}</button>
          </div>
          {!useAutoSelect && <PartnerPicker value={partnerIds} onChange={setPartnerIds} disabled={busy} />}
          <div className="multi-ai-actions__row">
            <GlassButton onClick={() => void startDebate()} disabled={busy || selectedPartnerIds.length === 0 || !paidAiEnabled}>{phase === "debating" ? "Debating…" : outcome ? "Run debate again" : "Start debate"}</GlassButton>
            <GlassButton onClick={() => void doConsensus()} disabled={busy || !transcript || !paidAiEnabled}>{phase === "consensus" ? "Finding consensus…" : "Consensus"}</GlassButton>
            <GlassButton onClick={() => void doSynthesis()} disabled={busy || !transcript || !paidAiEnabled}>{phase === "synthesis" ? "Synthesizing…" : "Synthesis"}</GlassButton>
            {busy && <GlassButton onClick={cancelActive}>Cancel</GlassButton>}
          </div>
          {outcome && outcome.status !== "empty-question" && <DebateView sides={outcome.sides} onRetrySide={(index) => void retrySide(index)} retrying={retrying} />}
          {outcome?.status === "partial" && <p className="multi-ai-actions__note" role="status">Completed sides are preserved. Retry only the missing participant(s) to enable Consensus and Synthesis.</p>}
          {actionError && <p className="multi-ai-actions__note" role="status">{actionError}</p>}
          {consensus && <ConsensusView result={consensus} />}
          {synthesis && <SynthesisView result={synthesis} />}
        </>}
      </GlassCard>}
    </div>
  );
}
