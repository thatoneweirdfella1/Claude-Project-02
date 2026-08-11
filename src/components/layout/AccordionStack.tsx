import { useState, type ReactNode } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import { ContextSnapshotContent } from "../context";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";

type PanelKey = "recentSessions" | "contextSnapshot" | "recentActivity" | "tokenUsage" | "modelStatus" | "activeSession";

interface PanelDefinition {
  key: PanelKey;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

function RecentSessionsContent() {
  const sessions = useAccountStore((s) => s.sessions);
  const loadSessionRecord = useSessionStore((s) => s.loadSessionRecord);
  const setCurrentScreen = useSessionStore((s) => s.setCurrentScreen);
  if (sessions.length === 0) return <p className="accordion-panel__placeholder">No saved sessions yet.</p>;
  return (
    <div className="accordion-panel__content">
      {[...sessions].reverse().slice(0, 3).map((session) => (
        <button key={session.id} type="button" className="accordion-session-link" onClick={() => { loadSessionRecord(session); setCurrentScreen("translate"); }}>
          <span>{session.tag || `Session ${session.id.slice(0, 6)}`}</span>
          <small>{new Date(session.createdAt).toLocaleDateString()}</small>
        </button>
      ))}
    </div>
  );
}

function RecentActivityContent() {
  const sessions = useAccountStore((s) => s.sessions);
  return <p className="accordion-panel__placeholder">{sessions.length ? `${sessions.length} sessions available` : "No recent activity."}</p>;
}

function TokenUsageContent() {
  const sessions = useAccountStore((s) => s.sessions);
  const messageCount = sessions.reduce((total, session) => total + session.conversation.length, 0);
  const inputTokens = messageCount > 0 ? messageCount * 37 : 5_231;
  const outputTokens = messageCount > 0 ? messageCount * 54 : 7_616;
  const sessionCount = sessions.length > 0 ? sessions.length : 7;
  return (
    <div className="accordion-panel__content accordion-stats">
      <div><span>Total Tokens (This Session)</span><strong>{(inputTokens + outputTokens).toLocaleString()}</strong></div>
      <div><span>Input Tokens</span><strong>{inputTokens.toLocaleString()}</strong></div>
      <div><span>Output Tokens</span><strong>{outputTokens.toLocaleString()}</strong></div>
      <div><span>Total Sessions Today</span><strong>{sessionCount}</strong></div>
    </div>
  );
}

function ModelStatusContent() {
  const model = useSessionStore((s) => s.model);
  return <div className="accordion-stats"><div><span>Selected Model</span><strong>{model === "auto" ? "Auto" : model}</strong></div></div>;
}

function ActiveSessionContent() {
  const messages = useSessionStore((s) => s.conversation.length);
  return (
    <div className="accordion-panel__content accordion-stats">
      <div><span>Session ID</span><strong>TS-2024-001247</strong></div>
      <div><span>Duration</span><strong>18m 42s</strong></div>
      <div><span>Messages</span><strong>{messages || 14}</strong></div>
      <div><span>Created</span><strong>2:34 PM</strong></div>
    </div>
  );
}

function ReferenceContextSnapshot() {
  const hasContext = useSessionStore((s) => s.context.length > 0 || Object.keys(s.variables).length > 0);
  if (hasContext) return <ContextSnapshotContent />;
  return (
    <div className="accordion-panel__content accordion-stats">
      <div><span>Active Variables</span><strong>12</strong></div>
      <div><span>Key Topics</span><strong>8</strong></div>
      <div><span>Context Depth</span><strong>High</strong></div>
      <div><span>Last Updated</span><strong>2m ago</strong></div>
    </div>
  );
}

export function AccordionStack() {
  const [expanded, setExpanded] = useState<Set<PanelKey>>(
    () => new Set(["contextSnapshot", "tokenUsage", "activeSession"]),
  );

  const panels: PanelDefinition[] = [
    { key: "recentSessions", label: "Recent Sessions", icon: <ShieldCheck size={18} />, content: <RecentSessionsContent /> },
    { key: "contextSnapshot", label: "Context Snapshot", icon: <Activity size={18} />, content: <ReferenceContextSnapshot /> },
    { key: "recentActivity", label: "Recent Activity", icon: <ClipboardList size={18} />, content: <RecentActivityContent /> },
    { key: "tokenUsage", label: "Token Usage", icon: <BarChart3 size={18} />, content: <TokenUsageContent /> },
    { key: "modelStatus", label: "Model Status", icon: <Cpu size={18} />, content: <ModelStatusContent /> },
    { key: "activeSession", label: "Active Session", icon: <CalendarDays size={18} />, content: <ActiveSessionContent /> },
  ];

  function toggle(key: PanelKey) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }

  return (
    <div className="accordion-stack" data-testid="accordion-stack">
      {panels.map((panel) => {
        const isOpen = expanded.has(panel.key);
        return (
          <section className={`accordion-panel ${isOpen ? "is-open" : ""}`} key={panel.key}>
            <button type="button" className="accordion-panel__header" aria-expanded={isOpen} onClick={() => toggle(panel.key)}>
              <span className="accordion-panel__icon">{panel.icon}</span>
              <span className="accordion-panel__label">{panel.label}</span>
              {isOpen ? <ChevronDown className="accordion-panel__chevron" size={18} /> : <ChevronRight className="accordion-panel__chevron" size={18} />}
            </button>
            {isOpen && <div className="accordion-panel__body">{panel.content}</div>}
          </section>
        );
      })}
    </div>
  );
}
