import { useCallback, useRef, useState } from "react";
import { GlassButton, GlassCard } from "../primitives";
import { createProxyClient } from "../../services/proxyClient";
import { useSessionStore } from "../../stores/sessionStore";
import {
  DEFAULT_DEBATE_PARTNER,
  createPartnerClient,
  runDebate,
  type DebateOutcome,
  type DebatePartnerId,
  type DebateSide,
} from "../../services/debate";
import {
  runConsensus,
  runSynthesis,
  type ConsensusResult,
  type DebateTranscript,
  type SynthesisResult,
} from "../../services/multiAi";
import { DebateView } from "./DebateView";
import { PartnerPicker } from "./PartnerPicker";
import { ConsensusView } from "./ConsensusView";
import { SynthesisView } from "./SynthesisView";

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

type Phase = "idle" | "debating" | "consensus" | "synthesis";

export function MultiAiActions() {
  const conversation = useSessionStore((s) => s.conversation);

  const [expanded, setExpanded] = useState(false);
  const [partnerId, setPartnerId] = useState<DebatePartnerId>(DEFAULT_DEBATE_PARTNER);
  const [phase, setPhase] = useState<Phase>("idle");
  const [outcome, setOutcome] = useState<DebateOutcome | null>(null);
  const [retrying, setRetrying] = useState<"claude" | "partner" | null>(null);
  const [consensus, setConsensus] = useState<ConsensusResult | null>(null);
  const [synthesis, setSynthesis] = useState<SynthesisResult | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const lastQuestion =
    [...conversation].reverse().find((m) => m.role === "user")?.content ?? "";

  const transcript: DebateTranscript | null =
    outcome?.status === "complete" ? outcome.transcript : null;

  const startDebate = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setPhase("debating");
    setOutcome(null);
    setConsensus(null);
    setSynthesis(null);
    setActionError(null);

    const result = await runDebate(lastQuestion, {
      claudeClient: (req) => claudeClient.complete(req),
      partnerClient,
      partnerId,
      signal: controller.signal,
    });

    if (controller.signal.aborted) return;
    setOutcome(result);
    setPhase("idle");
  }, [lastQuestion, partnerId]);

  /* Re-runs ONE side. The other side's existing text is kept as-is rather
     than re-fetched: it already succeeded, and re-asking would spend a call
     to replace a good argument with a different good argument the user
     didn't ask to change. */
  const retrySide = useCallback(
    async (which: "claude" | "partner") => {
      if (!outcome || outcome.status === "empty-question") return;
      setRetrying(which);
      setActionError(null);

      const rerun = await runDebate(lastQuestion, {
        claudeClient: (req) => claudeClient.complete(req),
        partnerClient,
        partnerId,
        // Keep each side on the stance it already had, so a retry doesn't
        // silently flip which side is arguing what mid-debate.
        claudeStance: outcome.claude.stance,
      });

      setRetrying(null);
      if (rerun.status === "empty-question") return;

      const fresh: DebateSide = which === "claude" ? rerun.claude : rerun.partner;
      const kept: DebateSide = which === "claude" ? outcome.partner : outcome.claude;
      const claude = which === "claude" ? fresh : kept;
      const partner = which === "claude" ? kept : fresh;

      if (claude.status === "ok" && partner.status === "ok") {
        setOutcome({
          status: "complete",
          claude,
          partner,
          transcript: {
            question: lastQuestion.trim(),
            claudeText: claude.text!,
            partnerLabel: partner.label,
            partnerText: partner.text!,
          },
        });
      } else if (claude.status === "ok" || partner.status === "ok") {
        setOutcome({ status: "partial", claude, partner });
      } else {
        setOutcome({ status: "failed", claude, partner });
      }
    },
    [outcome, lastQuestion, partnerId],
  );

  const doConsensus = useCallback(async () => {
    if (!transcript) return;
    setPhase("consensus");
    setActionError(null);
    const result = await runConsensus(transcript, {
      client: (req) => claudeClient.complete(req),
    });
    setPhase("idle");
    if (result.status === "ok") setConsensus(result.result);
    else setActionError("Consensus couldn't be produced from this debate. You can try again.");
  }, [transcript]);

  const doSynthesis = useCallback(async () => {
    if (!transcript) return;
    setPhase("synthesis");
    setActionError(null);
    const result = await runSynthesis(transcript, {
      client: (req) => claudeClient.complete(req),
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
          <span aria-hidden="true">⊙</span> MULTI-AI ACTIONS
        </span>
        <span aria-hidden="true" className="multi-ai-actions__chevron">
          {expanded ? "︿" : "⌄"}
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
              <PartnerPicker value={partnerId} onChange={setPartnerId} disabled={busy} />

              <div className="multi-ai-actions__row">
                <GlassButton onClick={() => void startDebate()} disabled={busy}>
                  {phase === "debating" ? "Debating…" : outcome ? "Run debate again" : "Start debate"}
                </GlassButton>
                <GlassButton onClick={() => void doConsensus()} disabled={busy || !transcript}>
                  {phase === "consensus" ? "Finding consensus…" : "Consensus"}
                </GlassButton>
                <GlassButton onClick={() => void doSynthesis()} disabled={busy || !transcript}>
                  {phase === "synthesis" ? "Synthesizing…" : "Synthesis"}
                </GlassButton>
              </div>

              {outcome && outcome.status !== "empty-question" && (
                <DebateView
                  claude={outcome.claude}
                  partner={outcome.partner}
                  onRetrySide={(side) => void retrySide(side)}
                  retrying={retrying}
                />
              )}

              {outcome && outcome.status === "partial" && (
                <p className="multi-ai-actions__note" role="status">
                  One side didn't come back. Consensus and Synthesis need both sides — retry the
                  missing one to enable them.
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
