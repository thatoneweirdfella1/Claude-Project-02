import { useState } from "react";
import {
  Archive, BarChart3, Boxes, FolderKanban, Library, MessageCircle, Pin,
  PinOff, Settings, Trash2, Wrench, X, type LucideIcon,
} from "lucide-react";
import { useSessionStore } from "../../stores/sessionStore";
import type { ScreenId, ScreenSectionId } from "../../stores/types";
import { isSameLocation, PRIMARY_NAVIGATION, TOOL_NAVIGATION, type NavigationEntry } from "./navigation";

const ICONS: Record<string, LucideIcon> = {
  "talk-to-ai": MessageCircle,
  sessions: Archive,
  "saved-tools": Library,
  projects: FolderKanban,
  insights: BarChart3,
  settings: Settings,
};

export function LeftNav() {
  const currentScreen = useSessionStore((s) => s.currentScreen);
  const currentSection = useSessionStore((s) => s.currentSection);
  const setScreenLocation = useSessionStore((s) => s.setScreenLocation);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [toolQuery, setToolQuery] = useState("");
  const pinnedIds = useSessionStore((s) => s.sidebarPinnedTools);
  const hiddenPrimary = useSessionStore((s) => s.sidebarHiddenPrimary);
  const setPinnedIds = useSessionStore((s) => s.setSidebarPinnedTools);
  const setHiddenPrimary = useSessionStore((s) => s.setSidebarHiddenPrimary);
  // Conversation and Settings remain permanent, as required by the owner.
  const protectedIds = ["talk-to-ai", "settings"];
  const pinnedTools = pinnedIds.flatMap((id) => TOOL_NAVIGATION.find((tool) => tool.id === id) ?? []);
  const primaryIsVisible = (id: string) => protectedIds.includes(id) || !hiddenPrimary.includes(id);
  const removePrimary = (id: string) => setHiddenPrimary([...hiddenPrimary, id]);
  const toggleTool = (tool: NavigationEntry) => {
    if (PRIMARY_NAVIGATION.some((entry) => entry.id === tool.id)) {
      setHiddenPrimary(primaryIsVisible(tool.id) ? [...hiddenPrimary, tool.id] : hiddenPrimary.filter((id) => id !== tool.id));
    } else {
      setPinnedIds(pinnedIds.includes(tool.id) ? pinnedIds.filter((id) => id !== tool.id) : [...pinnedIds, tool.id]);
    }
  };
  const [statusOpen, setStatusOpen] = useState(false);
  const visibleTools = [...TOOL_NAVIGATION, ...PRIMARY_NAVIGATION.filter((tool) => !protectedIds.includes(tool.id))].filter((tool) => tool.label.toLowerCase().includes(toolQuery.toLowerCase()));

  function navigate(screen: ScreenId, section?: ScreenSectionId) {
    setScreenLocation(screen, section);
    setToolsOpen(false);
    setStatusOpen(false);
  }

  return (
    <div className="leftnav-content">
      <div className="leftnav-items">
        {PRIMARY_NAVIGATION.filter((tool) => primaryIsVisible(tool.id)).map(({ id, label, screen, section }) => {
          const Icon = ICONS[id];
          return <div className="leftnav-primary" key={id}><button type="button" data-screen={screen} data-section={section} className={"leftnav-item " + (isSameLocation(currentScreen, currentSection, { screen, section }) ? "leftnav-item--active" : "")} onClick={() => navigate(screen, section)}>
            <Icon size={23} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span>
          </button>
            {!protectedIds.includes(id) && <button type="button" className="leftnav-remove" aria-label={`Remove ${label}`} title={`Remove ${label}`} onClick={() => removePrimary(id)}><PinOff size={15} /></button>}
          </div>;
        })}
        <div className="leftnav-tools">
          <button type="button" className="leftnav-item" aria-haspopup="dialog" aria-expanded={toolsOpen} onClick={() => { setToolsOpen((value) => !value); setStatusOpen(false); }}>
            <Boxes size={23} strokeWidth={1.8} aria-hidden="true" /><span>All Tools</span>
          </button>
          {toolsOpen && (
            <div className="leftnav-tools__popup surface-smoked-glass" role="dialog" aria-label="All tools">
              <header><strong>All Tools</strong><button type="button" aria-label="Close tools" onClick={() => setToolsOpen(false)}><X size={16} /></button></header>
              <input
                aria-label="Search All Tools"
                placeholder="Search tools"
                value={toolQuery}
                onChange={(event) => setToolQuery(event.target.value)}
                style={{ width: "100%", padding: "8px 9px", border: "1px solid var(--frozen-border)", borderRadius: 5, background: "var(--frozen-overlay-solid)", color: "var(--frozen-text)" }}
              />
              {visibleTools.map((tool) => <div className="leftnav-tools__row" key={tool.id}>
                <button type="button" onClick={() => navigate(tool.screen, tool.section)}><Wrench size={15} />{tool.label}</button>
                <button type="button" aria-label={`${PRIMARY_NAVIGATION.some((entry) => entry.id === tool.id) ? (primaryIsVisible(tool.id) ? "Remove" : "Pin") : (pinnedIds.includes(tool.id) ? "Unpin" : "Pin")} ${tool.label}`} onClick={() => toggleTool(tool)}><Pin size={14} /></button>
              </div>)}
              {visibleTools.length === 0 && <p>No matching tools.</p>}
            </div>
          )}
        </div>
        <div className="leftnav-pins">
          {pinnedTools.map((tool) => <div className="leftnav-pinned" key={tool.id}>
            <button type="button" className={"leftnav-item " + (isSameLocation(currentScreen, currentSection, tool) ? "leftnav-item--active" : "")} onClick={() => navigate(tool.screen, tool.section)}><Pin size={20} /><span>{tool.label}</span></button>
            <button type="button" className="leftnav-remove" aria-label={`Unpin ${tool.label}`} title={`Unpin ${tool.label}`} onClick={() => setPinnedIds(pinnedIds.filter((id) => id !== tool.id))}><PinOff size={15} /></button>
          </div>)}
        </div>
      </div>
      <div className="leftnav-bottom">
        <button type="button" className={"leftnav-item leftnav-trash " + (currentScreen === "trash" ? "leftnav-item--active" : "")} onClick={() => navigate("trash")}>
          <Trash2 size={23} strokeWidth={1.8} aria-hidden="true" /><span>Trash</span>
        </button>
        <div className="system-status-wrapper">
          <button type="button" className="system-status system-status--interactive" data-testid="system-status" aria-expanded={statusOpen} onClick={() => { setStatusOpen((open) => !open); setToolsOpen(false); }}>
            <span className="system-status-heading"><i aria-hidden="true" /> System Status</span>
            <span className="system-status-message">Local systems ready · providers unconfigured</span>
          </button>
          {statusOpen && <div className="system-status-popover surface-smoked-glass" role="status">
            <div className="system-status-popover__item"><span className="system-status-dot system-status-dot--operational" />Local preparation and storage available</div>
            <p className="system-status-popover__note">No external AI provider is connected. No remote call or payment will be claimed.</p>
            <button type="button" onClick={() => navigate("settings", "connections")}>Open connection settings</button>
          </div>}
        </div>
      </div>
    </div>
  );
}
