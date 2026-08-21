import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Copy, Download, Sparkles } from "lucide-react";
import type { ConversationMessage } from "../../stores/types";
import { BrainMark } from "../layout/BrainMark";
import { AnswerMeta } from "./AnswerMeta";
import { RatingRow } from "./RatingRow";

export interface MessageBubbleProps {
  message: ConversationMessage;
  userInitial?: string;
  onRate?: (rating: number) => void;
  onRatingComment?: (comment: string) => void;
  onDownload?: () => void;
  onRefine?: (instruction: string) => void;
  onBranchChange?: (index: number) => void;
}

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.round(diffMs / 60_000);
  if (minutes <= 0) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.round(minutes / 60)}h ago`;
}

export function MessageBubble({ message, userInitial = "U", onRate, onRatingComment, onDownload, onRefine, onBranchChange }: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";
  const isAnswer = isAssistant && message.messageKind !== "handoff";
  const [copied, setCopied] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try { await navigator.clipboard.writeText(message.content); setCopied(true); }
    catch { setCopied(false); }
  }

  return <div className={`message-bubble message-bubble--${message.role} ${message.messageKind ? `message-bubble--${message.messageKind}` : ""}`} data-testid="message-bubble">
    <div className="message-bubble__header">
      <span className={`message-bubble__avatar ${isAssistant ? "message-bubble__avatar--assistant" : ""}`}>{isAssistant ? <BrainMark size={18} /> : userInitial}</span>
      <span className="message-bubble__name">{isAssistant ? (message.sourceLabel || "Divergence.AI") : "You"}</span>
      {message.handoffStatus && <span className={`message-status message-status--${message.handoffStatus}`}>{message.handoffStatus.replace("-", " ")}</span>}
      <span className="message-bubble__time">{formatRelativeTime(message.timestamp)}</span>
    </div>
    {isAssistant && typeof message.confidence === "number" && <AnswerMeta confidence={message.confidence} downgraded={message.downgraded} notes={message.notes} />}
    {isAssistant && message.notes && typeof message.confidence !== "number" && <div className="answer-meta">{message.notes.join(" · ")}</div>}
    <p className="message-bubble__content">{message.content}</p>
    {message.messageKind === "handoff" && message.preparedRequest && <details className="prepared-request"><summary>View prepared request</summary><pre>{message.preparedRequest}</pre></details>}
    {isAnswer && <div className="response-actions">
      <button type="button" onClick={() => void copy()}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy"}</button>
      <div className="response-actions__menu"><button type="button" aria-expanded={refineOpen} onClick={() => setRefineOpen((v) => !v)}><Sparkles size={14} />Refine<ChevronDown size={13} /></button>
        {refineOpen && <div className="response-actions__popover surface-smoked-glass">{["Clearer", "Shorter", "More detailed", "More supportive", "More direct"].map((label) => <button key={label} type="button" onClick={() => { onRefine?.(label); setRefineOpen(false); }}>{label}</button>)}</div>}
      </div>
      <button type="button" onClick={() => setWhyOpen((v) => !v)}>Why this worked</button>
      <button type="button" onClick={onDownload}><Download size={14} />Export</button>
      {(message.branchCount ?? 1) > 1 && <span className="branch-switcher"><button type="button" aria-label="Previous response branch" onClick={() => onBranchChange?.(Math.max(1, (message.branchIndex ?? 1) - 1))}><ChevronLeft size={13} /></button>{message.branchIndex ?? 1}/{message.branchCount}<button type="button" aria-label="Next response branch" onClick={() => onBranchChange?.(Math.min(message.branchCount ?? 1, (message.branchIndex ?? 1) + 1))}><ChevronRight size={13} /></button></span>}
    </div>}
    {whyOpen && <div className="why-this-worked"><strong>Why this worked</strong><p>{message.notes?.join(" · ") || "The response preserved your request, selected the active tone and techniques, and kept the next action visible."}</p></div>}
    {isAnswer && <RatingRow stars={message.ratingStars} comment={message.ratingComment} onRate={onRate} onCommentChange={onRatingComment} onDownload={onDownload} />}
  </div>;
}



