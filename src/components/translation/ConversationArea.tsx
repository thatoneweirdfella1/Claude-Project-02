import { Children, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { MessageBubble } from "../streaming";
import { DownloadModal } from "../export";
import { getTelemetryEntries } from "../../services/telemetry";
import { useSessionStore } from "../../stores/sessionStore";
import { useAccountStore } from "../../stores/accountStore";

export interface ConversationAreaProps { children?: ReactNode; }

export function ConversationArea({ children }: ConversationAreaProps) {
  const conversation = useSessionStore((s) => s.conversation);
  const sessionId = useSessionStore((s) => s.sessionId);
  const setMessageRating = useSessionStore((s) => s.setMessageRating);
  const setDraftInput = useSessionStore((s) => s.setDraftInput);
  const updateMessage = useSessionStore((s) => s.updateMessage);
  const setRating = useAccountStore((s) => s.setRating);
  const [downloadMessageId, setDownloadMessageId] = useState<string | null>(null);
  const areaRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (areaRef.current) {
      areaRef.current.scrollTop = useSessionStore.getState().conversationScrollTop;
    }
  }, [sessionId]);

  function saveRating(messageId: string, stars: number, comment: string | undefined) {
    setMessageRating(messageId, stars, comment);
    setRating({ messageId, stars, comment, timestamp: Date.now() });
  }

  const downloadMessage = conversation.find((message) => message.id === downloadMessageId) ?? null;
  const downloadTelemetryEntry = downloadMessage
    ? getTelemetryEntries().find((entry) => entry.id === downloadMessage.telemetryId) ?? null
    : null;
  const isEmpty = conversation.length === 0 && Children.toArray(children).length === 0;

  return (
    <section
      ref={areaRef}
      className="conversation-area surface-smoked-glass"
      data-testid="conversation-area"
      aria-label="Conversation"
      onScroll={(event) => useSessionStore.getState().setConversationScrollTop(event.currentTarget.scrollTop)}
    >
      <div className="conversation-area__heading"><h2>Conversation</h2></div>
      {isEmpty && <div className="conversation-empty"><h3>Start with what is in your head.</h3><p>Divergence.AI will turn it into an AI-ready request without spending credits.</p></div>}
      {conversation.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          userInitial="D"
          onRate={(stars) => saveRating(message.id, stars, message.ratingComment)}
          onRatingComment={(comment) => message.ratingStars !== undefined && saveRating(message.id, message.ratingStars, comment)}
          onDownload={() => setDownloadMessageId(message.id)}
          onRefine={(instruction) => {
            const nextBranch = (message.branchCount ?? 1) + 1;
            updateMessage(message.id, { branchCount: nextBranch, branchIndex: nextBranch });
            setDraftInput(`${instruction}: ${message.content}`);
            queueMicrotask(() => document.querySelector<HTMLTextAreaElement>(".input-box__textarea")?.focus());
          }}
          onBranchChange={(branchIndex) => updateMessage(message.id, { branchIndex })}
        />
      ))}
      {children}
      {downloadMessage && <DownloadModal message={downloadMessage} telemetryEntry={downloadTelemetryEntry} onClose={() => setDownloadMessageId(null)} />}
    </section>
  );
}
