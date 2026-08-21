import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Activity, BarChart3, CalendarDays, ChevronDown, ChevronRight, ClipboardList, Cpu, ShieldCheck } from "lucide-react";
import { ContextSnapshotContent } from "../context";
import { destinationLabel, TRANSLATOR_ENGINES } from "../../services/providerNeutral";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import { getSessionCost, type SessionCost } from "../../services/costTracking";
import type { RightRailPanelKey } from "../../stores/types";

type PanelKey = RightRailPanelKey;
interface PanelDefinition { key: PanelKey; label: string; icon: ReactNode; content: ReactNode; }

function RecentSessionsContent() {
  const sessions = useAccountStore((s) => s.sessions);
  const load = useSessionStore((s) => s.loadSessionRecord);
  const go = useSessionStore((s) => s.setCurrentScreen);
  if (!sessions.length) return <p className="accordion-panel__placeholder">No saved sessions yet.</p>;
  return <div className="accordion-panel__content">
    {[...sessions].reverse().slice(0, 3).map((session) => (
      <button key={session.id} type="button" className="accordion-session-link" onClick={() => { load(session); go("translate"); }}>
        <span>{session.tag || "Untitled session"}</span><small>{new Date(session.createdAt).toLocaleDateString()}</small>
      </button>
    ))}
    <button type="button" className="accordion-view-all" onClick={() => go("sessions")}>View All</button>
  </div>;
}

function RecentActivityContent() {
  const sessions = useAccountStore((s) => s.sessions);
  const trashed = useAccountStore((s) => s.trashed);
  const activity = [
    ...sessions.map((session) => ({ label: session.archived ? "Archived session" : "Saved session", detail: session.tag || "Untitled session", at: session.closedAt ?? session.createdAt })),
    ...trashed.map((session) => ({ label: "Moved to Trash", detail: session.tag || "Untitled session", at: session.closedAt ?? session.createdAt })),
  ].sort((a, b) => b.at - a.at).slice(0, 4);
  if (!activity.length) return <p className="accordion-panel__placeholder">No recent activity.</p>;
  return <div className="accordion-panel__content">{activity.map((item, index) => <div className="accordion-activity" key={`${item.at}-${index}`}><span><strong>{item.label}</strong><small>{item.detail}</small></span><time>{new Date(item.at).toLocaleDateString()}</time></div>)}</div>;
}

function TokenUsageContent() {
  const [cost, setCost] = useState<SessionCost>(getSessionCost());
  useEffect(() => {
    const update = (event: Event) => setCost((event as CustomEvent<SessionCost>).detail);
    window.addEventListener("costUpdated", update);
    return () => window.removeEventListener("costUpdated", update);
  }, []);
  return <div className="accordion-stats"><div><span>Reported tokens</span><strong>{cost.totalTokens.toLocaleString()}</strong></div><div><span>Input / output</span><strong>{cost.inputTokens.toLocaleString()} / {cost.outputTokens.toLocaleString()}</strong></div><div><span>Estimated API cost</span><strong>${cost.estimatedCost.toFixed(4)}</strong></div><small>Only provider-reported usage is counted.</small></div>;
}

function AiStatusContent() {
  const destination = useSessionStore((s) => s.destination);
  const engine = useSessionStore((s) => s.translatorEngine);
  return <div className="accordion-stats">
    <div><span>Destination</span><strong>{destinationLabel(destination)}</strong></div>
    <div><span>Translator</span><strong>{TRANSLATOR_ENGINES.find((option) => option.id === engine)?.label ?? "Managed translator"}</strong></div>
    <div><span>Cost route</span><strong>{engine === "local-rules" || engine === "auto-free-first" || engine === "local-ai" ? "No Divergence credits" : "Confirmation required"}</strong></div>
  </div>;
}

function ActiveSessionContent() {
  const conversation = useSessionStore((s) => s.conversation);
  const messages = conversation.length;
  const context = useSessionStore((s) => s.context.length);
  const hasDraft = useSessionStore((s) => Boolean(s.draftInput.trim()));
  const startedAt = conversation[0]?.timestamp;
  const minutes = startedAt ? Math.max(1, Math.round((Date.now() - startedAt) / 60_000)) : 0;
  return <div className="accordion-panel__content accordion-stats">
    <div><span>Name</span><strong>{conversation[0]?.content.slice(0, 24) || "New session"}</strong></div>
    <div><span>Duration</span><strong>{minutes ? `${minutes} min` : "Not started"}</strong></div>
    <div><span>Messages</span><strong>{messages}</strong></div>
    <div><span>Context items</span><strong>{context}</strong></div>
    <div><span>Draft</span><strong>{hasDraft ? "Saved" : "Empty"}</strong></div>
  </div>;
}

function ContextContent() {
  const has = useSessionStore((s) => s.context.length > 0 || Object.keys(s.variables).length > 0);
  return has ? <ContextSnapshotContent /> : <p className="accordion-panel__placeholder">No context attached.</p>;
}

export function AccordionStack() {
  const rightRailPinned = useAccountStore((s) => s.rightRailPinned);
  const rightRailOrder = useAccountStore((s) => s.rightRailOrder);
  const [expanded, setExpanded] = useState<PanelKey | null>(() => rightRailPinned ?? "contextSnapshot");
  const visibility = useAccountStore((s) => s.visibility);
  const rootRef = useRef<HTMLDivElement>(null);
  const panels: PanelDefinition[] = [
    { key: "recentSessions", label: "Recent Sessions", icon: <ShieldCheck size={16} />, content: <RecentSessionsContent /> },
    { key: "contextSnapshot", label: "Context Snapshot", icon: <Activity size={16} />, content: <ContextContent /> },
    { key: "recentActivity", label: "Recent Activity", icon: <ClipboardList size={16} />, content: <RecentActivityContent /> },
    { key: "tokenUsage", label: "Usage & Cost", icon: <BarChart3 size={16} />, content: <TokenUsageContent /> },
    { key: "modelStatus", label: "AI Status", icon: <Cpu size={16} />, content: <AiStatusContent /> },
    { key: "activeSession", label: "Active Session", icon: <CalendarDays size={16} />, content: <ActiveSessionContent /> },
  ];

  const byKey = new Map(panels.map((panel) => [panel.key, panel]));
  const orderedKeys = rightRailPinned
    ? [rightRailPinned, ...rightRailOrder.filter((key) => key !== rightRailPinned)]
    : rightRailOrder;
  const visiblePanels = orderedKeys.map((key) => byKey.get(key)).filter((panel): panel is PanelDefinition => Boolean(panel && visibility[panel.key]));

  useEffect(() => {
    if (expanded && !visibility[expanded]) setExpanded(visiblePanels[0]?.key ?? null);
  }, [expanded, visibility, visiblePanels]);

  function onHeaderKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const headers = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>(".accordion-panel__header") ?? []);
    const current = headers.indexOf(event.currentTarget);
    const target = event.key === "Home" ? 0 : event.key === "End" ? headers.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + headers.length) % headers.length;
    headers[target]?.focus();
  }

  return <div ref={rootRef} className="accordion-stack" data-testid="accordion-stack">
    {visiblePanels.map((panel) => {
      const open = expanded === panel.key;
      return <section className={"accordion-panel " + (open ? "is-open" : "")} key={panel.key}>
        <button type="button" className="accordion-panel__header" aria-expanded={open} onKeyDown={onHeaderKeyDown} onClick={() => setExpanded(open ? null : panel.key)}>
          <span className="accordion-panel__icon">{panel.icon}</span><span className="accordion-panel__label">{panel.label}</span>
          {open ? <ChevronDown className="accordion-panel__chevron" size={16} /> : <ChevronRight className="accordion-panel__chevron" size={16} />}
        </button>
        {open && <div className="accordion-panel__body">{panel.content}</div>}
      </section>;
    })}
  </div>;
}


