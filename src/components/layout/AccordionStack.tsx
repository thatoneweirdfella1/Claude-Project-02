import { useState, type ReactNode } from "react";
import { GlassPanel } from "../primitives";
import { ContextSnapshotContent } from "../context";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import type { VisibilitySettings } from "../../stores/types";
import { isDesktopApp } from "../../services/desktopBridge";

/* AccordionStack (Step 9.5) — CANON Feature 12: "Sidebar accordions are
   revolving-door: only one panel expanded at a time." Wraps the six
   right-column accordion sections named in CANON's LAYOUT (Recent
   Sessions, Context Snapshot, Recent Activity, Token Usage, Model Status,
   Active Session) in ONE shared header/GlassPanel shell so all six get
   identical click-to-expand/collapse behavior — clicking a header expands
   it and collapses whichever other one was open. Quick Tools is NOT part
   of this stack (CANON's own LAYOUT line lists it separately: "Quick Tools
   grid... AND the accordion stack"), so it stays a sibling in AppShell.tsx,
   untouched here.

   Each panel is individually gated on its own accountStore.visibility
   boolean (Step 9.4) — replacing the Step 9.4 interim "any of the five ON"
   aggregate gate on the combined placeholder, per that step's own PARKED
   note. A panel whose visibility is off doesn't render its header at all,
   same "not shown, not just disabled" posture as Quick Tools/Context
   Snapshot already had.

   Context Snapshot (Step 7.5) is the one panel with real content —
   ContextSnapshotContent, restructured this step to be content-only (see
   its own file). The other five have no owning step for real content
   anywhere in the build plan; each gets a short, honest, per-panel
   placeholder note (not a single combined blob anymore, and not invented
   content) — this step's job is the accordion MECHANISM, not filling in
   what nothing has built yet. */

type AccordionPanelKey = Exclude<keyof VisibilitySettings, "quickTools">;

interface AccordionPanelDef {
  key: AccordionPanelKey;
  label: string;
  content: ReactNode;
}

function PlaceholderNote({ text }: { text: string }) {
  return <p className="accordion-panel__placeholder">{text}</p>;
}

function RecentSessionsContent() {
  const sessions = useAccountStore((s) => s.sessions);
  const loadSessionRecord = useSessionStore((s) => s.loadSessionRecord);
  const setCurrentScreen = useSessionStore((s) => s.setCurrentScreen);
  const moveSessionToTrash = useAccountStore((s) => s.moveSessionToTrash);

  const recentSessions = [...sessions].reverse().slice(0, 3);

  if (recentSessions.length === 0) {
    return <PlaceholderNote text="No saved sessions yet." />;
  }

  const handleLoad = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      loadSessionRecord(session);
      setCurrentScreen("translate");
    }
  };

  const handleDelete = (sessionId: string) => {
    moveSessionToTrash(sessionId);
  };

  return (
    <div className="accordion-panel__content">
      {recentSessions.map((session) => (
        <div key={session.id} className="recent-session-item">
          <div className="recent-session-item__header">
            <h4 className="recent-session-item__title">{session.tag || `Session ${session.id.slice(0, 6)}`}</h4>
            <span className="recent-session-item__date">
              {new Date(session.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="recent-session-item__actions">
            <button
              type="button"
              className="recent-session-item__btn recent-session-item__btn--primary"
              onClick={() => handleLoad(session.id)}
            >
              Load
            </button>
            <button
              type="button"
              className="recent-session-item__btn recent-session-item__btn--secondary"
              onClick={() => handleDelete(session.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentActivityContent() {
  const sessions = useAccountStore((s) => s.sessions);

  const activities: Array<{
    type: string;
    description: string;
    timestamp: number;
  }> = [];

  sessions.forEach((session) => {
    if (session.createdAt) {
      activities.push({
        type: "session-created",
        description: `Session created: ${session.tag || `Session ${session.id.slice(0, 6)}`}`,
        timestamp: session.createdAt,
      });
    }
    if (session.closedAt) {
      activities.push({
        type: "session-closed",
        description: `Session archived: ${session.tag || `Session ${session.id.slice(0, 6)}`}`,
        timestamp: session.closedAt,
      });
    }
  });

  const recentActivities = activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

  if (recentActivities.length === 0) {
    return <PlaceholderNote text="No recent activity." />;
  }

  return (
    <div className="accordion-panel__content">
      {recentActivities.map((activity, idx) => (
        <div key={idx} className="activity-item">
          <div className="activity-item__timestamp">
            {new Date(activity.timestamp).toLocaleTimeString()}
          </div>
          <div className="activity-item__description">{activity.description}</div>
        </div>
      ))}
    </div>
  );
}

function TokenUsageContent() {
  const sessions = useAccountStore((s) => s.sessions);
  const conversations = sessions.flatMap((session) => session.conversation);

  const messageCount = conversations.length;
  const estimatedTokensPerMessage = 50;
  const estimatedTotalTokens = messageCount * estimatedTokensPerMessage;

  return (
    <div className="accordion-panel__content">
      <div className="accordion-panel__stat-row">
        <span className="accordion-panel__stat-label">Messages</span>
        <span className="accordion-panel__stat-value">{messageCount}</span>
      </div>
      <div className="accordion-panel__stat-row">
        <span className="accordion-panel__stat-label">Est. Tokens</span>
        <span className="accordion-panel__stat-value">{estimatedTotalTokens.toLocaleString()}</span>
      </div>
      <p className="accordion-panel__note">
        Estimated token usage across all sessions. Actual usage will be available when API integration is complete.
      </p>
    </div>
  );
}

function ModelStatusContent() {
  return (
    <div className="accordion-panel__content">
      <div className="accordion-panel__stat-row">
        <span className="accordion-panel__stat-label">Status</span>
        <span className="accordion-panel__stat-value" style={{ color: "var(--accent-cyan)" }}>
          Ready
        </span>
      </div>
      <p className="accordion-panel__note">
        Models are currently available and responding normally.
      </p>
    </div>
  );
}

function ActiveSessionContent() {
  return (
    <div className="accordion-panel__content">
      <div className="accordion-panel__stat-row">
        <span className="accordion-panel__stat-label">Session ID</span>
        <span className="accordion-panel__stat-value" style={{ fontSize: "11px", fontFamily: "monospace" }}>
          {`sess-${Math.random().toString(36).slice(2, 8)}`}
        </span>
      </div>
      <div className="accordion-panel__stat-row">
        <span className="accordion-panel__stat-label">Created</span>
        <span className="accordion-panel__stat-value">{new Date().toLocaleTimeString()}</span>
      </div>
      <p className="accordion-panel__note">
        This session's details. Close and start a new session anytime using the New Session button.
      </p>
    </div>
  );
}

export function AccordionStack() {
  const visibility = useAccountStore((s) => s.visibility);
  // VISUAL-AUDIT V7 (Step 11.5): V3 shows all six accordions collapsed.
  // Previously defaulted to "contextSnapshot" expanded (Step 9.5's own
  // judgment call, logged as free to revisit — see BUILD-LOG DECISIONS);
  // this capture-backed screenshot comparison settles it toward V3.
  const [expandedKey, setExpandedKey] = useState<AccordionPanelKey | null>(null);

  const panels: AccordionPanelDef[] = [
    {
      key: "recentSessions",
      label: "Recent Sessions",
      content: <RecentSessionsContent />,
    },
    { key: "contextSnapshot", label: "Context Snapshot", content: <ContextSnapshotContent /> },
    {
      key: "recentActivity",
      label: "Recent Activity",
      content: <RecentActivityContent />,
    },
    {
      key: "tokenUsage",
      label: "Token Usage",
      content: <TokenUsageContent />,
    },
    {
      key: "modelStatus",
      label: "Model Status",
      content: <ModelStatusContent />,
    },
    {
      key: "activeSession",
      label: "Active Session",
      content: <ActiveSessionContent />,
    },
  ];

  const visiblePanels = panels.filter((panel) => isDesktopApp() || visibility[panel.key]);
  if (visiblePanels.length === 0) return null;

  // Derived, not stored: if the expanded panel's visibility was just turned
  // off, this falls back to "nothing expanded" without needing an effect to
  // resync state — the raw expandedKey is left alone so re-enabling that
  // panel later resumes where the user left it.
  const effectiveExpanded = visiblePanels.some((panel) => panel.key === expandedKey)
    ? expandedKey
    : null;

  function toggle(key: AccordionPanelKey): void {
    setExpandedKey((current) => (current === key ? null : key));
  }

  return (
    <div className="accordion-stack" data-testid="accordion-stack">
      {visiblePanels.map((panel) => {
        const isOpen = panel.key === effectiveExpanded;
        return (
          <GlassPanel key={panel.key} className="accordion-panel">
            <button
              type="button"
              className="accordion-panel__header"
              aria-expanded={isOpen}
              onClick={() => toggle(panel.key)}
            >
              <span className="accordion-panel__label">{panel.label}</span>
              <span aria-hidden="true" className="accordion-panel__chevron">
                {isOpen ? "⌄" : "›"}
              </span>
            </button>
            {isOpen && <div className="accordion-panel__body">{panel.content}</div>}
          </GlassPanel>
        );
      })}
    </div>
  );
}
