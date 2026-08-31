import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useSessionStore } from "../../stores/sessionStore";
import { buildMessageSelection, type MessageSelectionBundle } from "../../services/multiAi";
import { saveNow } from "../../services/persistence";

/* R20: Select Unresolved Conversation — lets the user pick one message or a
   range of messages from THIS conversation as the source for a Multi-AI
   action, review the exact context bundle that will be sent, and clears
   selection back to the default (most recent question) at any time.
   Selection uses visible boundaries over every conversation turn. Picking
   two boundaries includes the complete contiguous range, including assistant
   or imported handoff turns between them. */

export interface MessageSourceSelectorProps {
  onSelectionChange: (selection: MessageSelectionBundle | null) => void;
  disabled?: boolean;
}

export function MessageSourceSelector({ onSelectionChange, disabled }: MessageSourceSelectorProps) {
  const conversation = useSessionStore((s) => s.conversation);
  const upsertMultiAiRun = useSessionStore((s) => s.upsertMultiAiRun);
  const [expanded, setExpanded] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const [preparedMessage, setPreparedMessage] = useState("");
  const [preparing, setPreparing] = useState(false);

  if (!conversation.some((message) => message.role === "user")) return null;

  function toggle(id: string) {
    let next: string[];
    if (selectedIds.length === 0) {
      next = [id];
      setAnchorId(id);
    } else if (selectedIds.length === 1 && selectedIds[0] === id) {
      next = [];
      setAnchorId(null);
    } else if (selectedIds.includes(id)) {
      next = [id];
      setAnchorId(id);
    } else {
      next = buildMessageSelection(conversation, [anchorId ?? selectedIds[0], id])?.sourceMessageIds ?? [id];
    }
    setSelectedIds(next);
    setPreparedMessage("");
    onSelectionChange(buildMessageSelection(conversation, next));
  }

  function clearSelection() {
    setSelectedIds([]);
    setAnchorId(null);
    setPreparedMessage("");
    onSelectionChange(null);
  }

  const selection = buildMessageSelection(conversation, selectedIds);

  async function prepareHandoff() {
    if (!selection) return;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `source-handoff-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
    upsertMultiAiRun({
      id,
      sourceMessageIds: selection.sourceMessageIds,
      createdAt: Date.now(),
      question: selection.contextBundle,
      participants: [],
      status: "complete",
      workflowStage: "local-preparation",
      totalEstimatedCost: 0,
      totalActualCost: 0,
    });
    setPreparing(true);
    setPreparedMessage("Saving source handoff…");
    try {
      await saveNow({ reason: "autosave" });
      setPreparedMessage("Source handoff prepared and saved. No provider request was sent and no credits were used.");
    } catch {
      setPreparedMessage("Source handoff is prepared on screen, but its recovery save failed. No provider request was sent and no credits were used. Do not reload yet.");
    } finally {
      setPreparing(false);
    }
  }

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
          {selection
            ? `${selection.sourceMessageIds.length} message${selection.sourceMessageIds.length === 1 ? "" : "s"} selected as source`
            : "Select conversation source (default: your last question)"}
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="multi-ai-source-selector__list" role="group" aria-label="Select messages for Multi-AI">
          {conversation.map((message) => (
            <label key={message.id} className="multi-ai-source-selector__item">
              <input
                type="checkbox"
                checked={selectedIds.includes(message.id)}
                onChange={() => toggle(message.id)}
                disabled={disabled}
                aria-label={`Select range boundary: ${message.content.slice(0, 60)}`}
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
        <details className="multi-ai-source-selector__preview" open>
          <summary>
            Review context bundle ({selection.sourceMessageIds.length} message{selection.sourceMessageIds.length === 1 ? "" : "s"})
          </summary>
          <pre data-testid="multi-ai-context-bundle">{selection.contextBundle}</pre>
          <div className="multi-ai-source-selector__actions">
            <button type="button" onClick={() => void prepareHandoff()} disabled={disabled || preparing}>
              {preparing ? "Saving source handoff…" : "Prepare source handoff"}
            </button>
            {preparedMessage && <span role="status">{preparedMessage}</span>}
          </div>
        </details>
      )}
    </div>
  );
}
