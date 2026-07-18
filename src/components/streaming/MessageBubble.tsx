import type { ConversationMessage } from "../../stores/types";
import { AnswerMeta } from "./AnswerMeta";
import { RatingRow } from "./RatingRow";

/* One conversation turn (Step 5.1), matching the screenshot's layout: an
   avatar-initial circle, a name, a right-aligned relative timestamp, then the
   message content. Assistant turns additionally show the confidence line +
   router honesty note (AnswerMeta) and the 5-star/download row (RatingRow)
   once the answer is finished — never while still streaming. */

export interface MessageBubbleProps {
  message: ConversationMessage;
  /** User's avatar initial (screenshot shows "D" for the signed-in user). No
      account/profile system exists yet, so this is passed in rather than
      read from anywhere real. */
  userInitial?: string;
  onRate?: (rating: number) => void;
  onRatingComment?: (comment: string) => void;
  onDownload?: () => void;
}

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.round(diffMs / 60_000);
  if (minutes <= 0) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

export function MessageBubble({
  message,
  userInitial = "U",
  onRate,
  onRatingComment,
  onDownload,
}: MessageBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`message-bubble message-bubble--${message.role}`} data-testid="message-bubble">
      <div className="message-bubble__header">
        <span className={`message-bubble__avatar ${isAssistant ? "message-bubble__avatar--assistant" : ""}`}>
          {isAssistant ? "AI" : userInitial}
        </span>
        <span className="message-bubble__name">{isAssistant ? "Divergence.AI" : "You"}</span>
        <span className="message-bubble__time">{formatRelativeTime(message.timestamp)}</span>
      </div>

      {isAssistant && typeof message.confidence === "number" && (
        <AnswerMeta confidence={message.confidence} downgraded={message.downgraded} notes={message.notes} />
      )}

      <p className="message-bubble__content">{message.content}</p>

      {isAssistant && typeof message.confidence === "number" && (
        <RatingRow
          stars={message.ratingStars}
          comment={message.ratingComment}
          onRate={onRate}
          onCommentChange={onRatingComment}
          onDownload={onDownload}
        />
      )}
    </div>
  );
}
