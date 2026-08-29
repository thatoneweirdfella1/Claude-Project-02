import { useEffect, useState, type ReactNode } from "react";
import { Activity, BarChart3, CalendarDays, ChevronDown, ChevronRight, ClipboardList, Cpu, ShieldCheck } from "lucide-react";
import { ContextSnapshotContent } from "../context";
import { destinationLabel, TRANSLATOR_ENGINES } from "../../services/providerNeutral";
import { computeRouteReadiness, type RouteReadiness } from "../../services/routeReadiness";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";

type PanelKey = "recentSessions" | "contextSnapshot" | "recentActivity" | "tokenUsage" | "modelStatus" | "activeSession";
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
  return <p className="accordion-panel__placeholder">{sessions.length ? sessions.length + " saved session" + (sessions.length === 1 ? "" : "s") : "No recent activity."}</p>;
}

function TokenUsageContent() {
  return <p className="accordion-panel__placeholder">Usage appears here only when a provider reports it. No values are estimated.</p>;
}

/* R25: Connected Execution Truth — "Route status" is derived from an actual
   health check (services/routeReadiness.ts -> providerStatus.ts), never
   assumed. While the check is in flight it says "Checking…"; it never
   defaults to a ready-looking label just because a check hasn't returned
   yet (fail closed). */
function AiStatusContent() {
  const destination = useSessionStore((s) => s.destination);
  const engine = useSessionStore((s) => s.translatorEngine);
  const [readiness, setReadiness] = useState<RouteReadiness | null>(null);

  useEffect(() => {
    let cancelled = false;
    setReadiness(null);
    computeRouteReadiness(destination).then((result) => {
      if (!cancelled) setReadiness(result);
    });
    return () => { cancelled = true; };
  }, [destination.providerId, destination.modelId]);

  return <div className="accordion-stats">
    <div><span>Destination</span><strong>{destinationLabel(destination)}</strong></div>
    <div><span>Translator</span><strong>{TRANSLATOR_ENGINES.find((option) => option.id === engine)?.label ?? "Managed translator"}</strong></div>
    <div><span>Cost route</span><strong>{engine === "local-rules" || engine === "auto-free-first" || engine === "local-ai" ? "No Divergence credits" : "Confirmation required"}</strong></div>
    <div>
      <span>Route status</span>
      <strong data-testid="ai-status-readiness" className={`accordion-stats__readiness accordion-stats__readiness--${readiness?.state ?? "checking"}`}>
        {readiness ? readiness.label : "Checking…"}
      </strong>
    </div>
  </div>;
}

function ActiveSessionContent() {
  const messages = useSessionStore((s) => s.conversation.length);
  const context = useSessionStore((s) => s.context.length);
  const hasDraft = useSessionStore((s) => Boolean(s.draftInput.trim()));
  return <div className="accordion-panel__content accordion-stats">
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
  const [expanded, setExpanded] = useState<PanelKey | null>(null);
  const visibility = useAccountStore((s) => s.visibility);
  const panels: PanelDefinition[] = [
    { key: "recentSessions", label: "Recent Sessions", icon: <ShieldCheck size={16} />, content: <RecentSessionsContent /> },
    { key: "contextSnapshot", label: "Context Snapshot", icon: <Activity size={16} />, content: <ContextContent /> },
    { key: "recentActivity", label: "Recent Activity", icon: <ClipboardList size={16} />, content: <RecentActivityContent /> },
    { key: "tokenUsage", label: "Usage & Cost", icon: <BarChart3 size={16} />, content: <TokenUsageContent /> },
    { key: "modelStatus", label: "AI Status", icon: <Cpu size={16} />, content: <AiStatusContent /> },
    { key: "activeSession", label: "Active Session", icon: <CalendarDays size={16} />, content: <ActiveSessionContent /> },
  ];

  return <div className="accordion-stack" data-testid="accordion-stack">
    {panels.filter((panel) => visibility[panel.key]).map((panel) => {
      const open = expanded === panel.key;
      return <section className={"accordion-panel " + (open ? "is-open" : "")} key={panel.key}>
        <button type="button" className="accordion-panel__header" aria-expanded={open} onClick={() => setExpanded(open ? null : panel.key)}>
          <span className="accordion-panel__icon">{panel.icon}</span><span className="accordion-panel__label">{panel.label}</span>
          {open ? <ChevronDown className="accordion-panel__chevron" size={16} /> : <ChevronRight className="accordion-panel__chevron" size={16} />}
        </button>
        {open && <div className="accordion-panel__body">{panel.content}</div>}
      </section>;
    })}
  </div>;
}
