import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSessionStore } from "../../stores/sessionStore";
import { buildMessageSelection, type MessageSelectionBundle } from "../../services/multiAi";

/* R20: Select Unresolved Conversation — lets the user pick one message or a
   range of messages from THIS conversation as the source for a Multi-AI
   action, review the exact context bundle that will be sent, and clears
   selection back to the default (most recent question) at any time.
   Selection is a list of checkboxes over the conversation's user turns in
   their real order — checking a contiguous run is a "range", checking one
   is a single message; both are the same mechanism, so there's no separate
   range-drag UI to get wrong. */

export interface MessageSourceSelectorProps {
  onSelectionChange: (selection: MessageSelectionBundle | null) => void;
  disabled?: boolean;
}

export function MessageSourceSelector({ onSelectionChange, disabled }: MessageSourceSelectorProps) {
  const conversation = useSessionStore((s) => s.conversation);
  const [expanded, setExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const userMessages = conversation.filter((m) => m.role === "user");
  if (userMessages.length === 0) return null;

  function toggle(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    setSelectedIds(next);
    onSelectionChange(buildMessageSelection(conversation, next));
  }

  function clearSelection() {
    setSelectedIds([]);
    onSelectionChange(null);
  }

  const selection = buildMessageSelection(conversation, selectedIds);

  return (
    <div className="multi-ai-source-selector" data-testid="multi-ai-source-selector">
      <button
        type="button"
        className="multi-ai-source-selector__toggle"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
        disabled={disabled}
      >
        <span>
          {selectedIds.length > 0
            ? `${selectedIds.length} message${selectedIds.length === 1 ? "" : "s"} selected as source`
            : "Select conversation source (default: your last question)"}
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="multi-ai-source-selector__list" role="group" aria-label="Select messages for Multi-AI">
          {userMessages.map((message) => (
            <label key={message.id} className="multi-ai-source-selector__item">
              <input
                type="checkbox"
                checked={selectedIds.includes(message.id)}
                onChange={() => toggle(message.id)}
                disabled={disabled}
                aria-label={`Select message: ${message.content.slice(0, 60)}`}
              />
              <span>{message.content.slice(0, 90)}{message.content.length > 90 ? "…" : ""}</span>
            </label>
          ))}
          {selectedIds.length > 0 && (
            <button type="button" className="multi-ai-source-selector__clear" onClick={clearSelection} disabled={disabled}>
              Clear selection
            </button>
          )}
        </div>
      )}

      {selection && (
        <details className="multi-ai-source-selector__preview">
          <summary>
            Review context bundle ({selection.sourceMessageIds.length} message{selection.sourceMessageIds.length === 1 ? "" : "s"})
          </summary>
          <pre data-testid="multi-ai-context-bundle">{selection.contextBundle}</pre>
        </details>
      )}
    </div>
  );
}
