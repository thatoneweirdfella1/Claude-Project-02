import { useEffect, useState } from "react";
import { GlassPanel } from "../components/primitives";
import { saveNow } from "../services/persistence";
import { sessionRecordStatus, sessionRecordUpdatedAt } from "../services/sessionLifecycle";
import { useAccountStore } from "../stores/accountStore";
import { useSessionStore } from "../stores/sessionStore";
import type { SessionRecord } from "../stores/types";

export function SessionsScreen() {
  const sessions = useAccountStore((state) => state.sessions);
  const currentSessionId = useSessionStore((state) => state.sessionId);
  const [error, setError] = useState("");

  useEffect(() => {
    void saveNow({ reason: "navigation" }).catch(() => {
      setError("Recovery save failed. Your live session is still open.");
    });
  }, []);

  const activeSessions = [...sessions]
    .filter((record) => sessionRecordStatus(record) === "active")
    .sort((a, b) => sessionRecordUpdatedAt(b) - sessionRecordUpdatedAt(a));

  async function load(record: SessionRecord) {
    try {
      setError("");
      await saveNow({ reason: "resume" });
      useSessionStore.getState().loadSessionRecord(record);
      useSessionStore.getState().setCurrentScreen("translate");
      await saveNow();
    } catch {
      setError("The current work could not be recovery-saved, so nothing was switched.");
    }
  }

  return (
    <GlassPanel>
      <h1>Sessions</h1>
      <p>Active work is recovery-saved automatically.</p>
      {error ? <p role="alert">{error}</p> : null}
      <section aria-labelledby="active-sessions-title">
        <h2 id="active-sessions-title">Active</h2>
        {activeSessions.length === 0 ? (
          <p>No recoverable active work yet.</p>
        ) : (
          <div className="session-picker">
            {activeSessions.map((record) => (
              <button
                key={record.id}
                type="button"
                aria-current={record.id === currentSessionId ? "true" : undefined}
                onClick={() => void load(record)}
              >
                <strong>{record.tag || "Untitled session"}</strong>
                <small>
                  {record.id === currentSessionId ? "Current · " : ""}
                  {record.conversation.length} messages · {record.context.length} context items
                </small>
              </button>
            ))}
          </div>
        )}
      </section>
    </GlassPanel>
  );
}
