import { Children, useState, type ReactNode } from "react";
import { Copy, ExternalLink, MessageCircle, SlidersHorizontal, Sparkles, Upload } from "lucide-react";
import { MessageBubble } from "../streaming";
import { DownloadModal } from "../export";
import { getTelemetryEntries } from "../../services/telemetry";
import { useSessionStore } from "../../stores/sessionStore";
import { useAccountStore } from "../../stores/accountStore";

export interface ConversationAreaProps { children?: ReactNode; }

const METRICS = [
  { label: "Clarity Score", value: 95, color: "#24b95f" },
  { label: "Specificity", value: 88, color: "#168df1" },
  { label: "Context Richness", value: 91, color: "#9636e9" },
  { label: "Actionability", value: 94, color: "#f0a11c" },
];

function ReferenceEmptyResponse() {
  const setCurrentScreen = useSessionStore((s) => s.setCurrentScreen);
  return (
    <div className="reference-response">
      <div className="reference-response__summary">
        <div className="reference-response__orb"><Sparkles size={31} /></div>
        <div>
          <h3>AI-Optimized Response</h3>
          <p>Based on your input, I&apos;ve structured this to be clear, specific, and actionable<br />for the AI to provide you with the most accurate and helpful response.</p>
        </div>
      </div>
      <div className="reference-quality">
        <h4>Translation Quality</h4>
        <div className="reference-quality__grid">
          {METRICS.map((metric) => (
            <div className="reference-metric" key={metric.label}>
              <div><span>{metric.label}</span><strong>{metric.value}%</strong></div>
              <i><b style={{ width: `${metric.value}%`, background: metric.color }} /></i>
            </div>
          ))}
        </div>
      </div>
      <div className="reference-response__actions">
        <button type="button" onClick={() => void navigator.clipboard?.writeText("AI-optimized response")}><Copy size={17} /> Copy Response</button>
        <button type="button" onClick={() => setCurrentScreen("translate")}><MessageCircle size={17} /> Use in AI Chat</button>
        <button type="button"><SlidersHorizontal size={17} /> Refine Further</button>
        <button type="button" className="reference-export"><Upload size={17} /> Export <ExternalLink size={14} /></button>
      </div>
    </div>
  );
}

export function ConversationArea({ children }: ConversationAreaProps) {
  const conversation = useSessionStore((s) => s.conversation);
  const setMessageRating = useSessionStore((s) => s.setMessageRating);
  const setRating = useAccountStore((s) => s.setRating);
  const [downloadMessageId, setDownloadMessageId] = useState<string | null>(null);

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
    <section className="conversation-area surface-smoked-glass" data-testid="conversation-area">
      <div className="conversation-area__heading">
        <h2>AI Translation</h2>
        <p><strong>92%</strong> confident this is what you meant.</p>
      </div>
      {isEmpty && <ReferenceEmptyResponse />}
      {conversation.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          userInitial="D"
          onRate={(stars) => saveRating(message.id, stars, message.ratingComment)}
          onRatingComment={(comment) => message.ratingStars !== undefined && saveRating(message.id, message.ratingStars, comment)}
          onDownload={() => setDownloadMessageId(message.id)}
        />
      ))}
      {children}
      {downloadMessage && (
        <DownloadModal message={downloadMessage} telemetryEntry={downloadTelemetryEntry} onClose={() => setDownloadMessageId(null)} />
      )}
    </section>
  );
}
