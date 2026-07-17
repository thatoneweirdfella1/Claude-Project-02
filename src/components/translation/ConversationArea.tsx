import { MessageBubble, StreamingAnswerDemo } from "../streaming";
import { useSessionStore } from "../../stores/sessionStore";

/* ConversationArea — the center-column conversation surface. Step 1.5 left
   this a placeholder; Step 2.3 seeded it with sample confidence-gate cards;
   Step 5.1 replaces those with the real thing: REAL messages from the session
   store's `conversation` array (empty until Step 5.2's orchestrator starts
   appending to it) rendered via MessageBubble, plus the Step 5.1 streaming
   demo proving the stage/streaming/done display works end to end. The
   Step 2.3 gate/clarify machinery (gateTranslation, TranslationCard,
   ClarifyPrompt) is untouched and still fully tested — it becomes relevant
   again once Step 5.2's orchestrator decides to show a clarifying question
   instead of streaming an answer; this component just doesn't demo it as
   three static sample cards anymore. */

export function ConversationArea() {
  const conversation = useSessionStore((s) => s.conversation);

  return (
    <div className="conversation-area" data-testid="conversation-area">
      {conversation.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <StreamingAnswerDemo />
    </div>
  );
}
