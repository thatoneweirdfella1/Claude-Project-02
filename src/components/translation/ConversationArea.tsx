import type { ReactNode } from "react";
import { MessageBubble } from "../streaming";
import { useSessionStore } from "../../stores/sessionStore";
import { useAccountStore } from "../../stores/accountStore";

/* ConversationArea — the center-column conversation surface. Step 1.5 left
   this a placeholder; Step 2.3 seeded it with sample confidence-gate cards;
   Step 5.1 replaced those with real session.conversation rendering plus an
   offline streaming demo; Step 5.2 removes the demo — the live pipeline
   (components/pipeline/CenterColumn) now appends real messages here and
   passes the in-flight run's UI (gated translation card, stage indicator,
   streaming text) as children, rendered after the history. Step 8.1 wires
   RatingRow's star/comment events to BOTH stores together (denormalized
   ConversationMessage fields for display + the durable accountStore.ratings
   upsert for the learning loop — see types.ts's ConversationMessage doc). */

export interface ConversationAreaProps {
  /** The active pipeline run's transient UI (Step 5.2), if one is running. */
  children?: ReactNode;
}

export function ConversationArea({ children }: ConversationAreaProps) {
  const conversation = useSessionStore((s) => s.conversation);
  const setMessageRating = useSessionStore((s) => s.setMessageRating);
  const setRating = useAccountStore((s) => s.setRating);

  function saveRating(messageId: string, stars: number, comment: string | undefined) {
    setMessageRating(messageId, stars, comment);
    setRating({ messageId, stars, comment, timestamp: Date.now() });
  }

  return (
    <div className="conversation-area" data-testid="conversation-area">
      {conversation.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          userInitial="D"
          onRate={(stars) => saveRating(message.id, stars, message.ratingComment)}
          onRatingComment={(comment) => {
            if (message.ratingStars === undefined) return;
            saveRating(message.id, message.ratingStars, comment);
          }}
        />
      ))}
      {children}
    </div>
  );
}
