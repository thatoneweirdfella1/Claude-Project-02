import { useState } from "react";
import {
  Archive, BarChart3, Boxes, FolderKanban, Library, MessageCircle,
  Settings, Trash2, Wrench, X, type LucideIcon,
} from "lucide-react";
import { useSessionStore } from "../../stores/sessionStore";
import type { ScreenId } from "../../stores/types";

const NAV_ITEMS: Array<{ label: string; screen: ScreenId; Icon: LucideIcon }> = [
  { label: "Talk to AI", screen: "translate", Icon: MessageCircle },
  { label: "Sessions", screen: "sessions", Icon: Archive },
  { label: "Saved Tools", screen: "templates", Icon: Library },
  { label: "Projects", screen: "projects", Icon: FolderKanban },
  { label: "Insights", screen: "dashboard", Icon: BarChart3 },
  { label: "Settings", screen: "settings", Icon: Settings },
];

const ALL_TOOLS: Array<{ label: string; screen: ScreenId }> = [
  { label: "Templates", screen: "templates" },
  { label: "Saved Prompts", screen: "saved-prompts" },
  { label: "Techniques", screen: "resources" },
  { label: "Variables", screen: "customize" },
  { label: "Checkpoints", screen: "projects" },
  { label: "Integrations", screen: "integrations" },
];

export function LeftNav() {
  const currentScreen = useSessionStore((s) => s.currentScreen);
  const setCurrentScreen = useSessionStore((s) => s.setCurrentScreen);
  const [toolsOpen, setToolsOpen] = useState(false);

  function navigate(screen: ScreenId) {
    setCurrentScreen(screen);
    setToolsOpen(false);
  }

  return (
    <div className="leftnav-content">
      <div className="leftnav-items">
        {NAV_ITEMS.map(({ label, screen, Icon }) => (
          <button type="button" key={label} data-screen={screen} className={"leftnav-item " + (currentScreen === screen ? "leftnav-item--active" : "")} onClick={() => navigate(screen)}>
            <Icon size={23} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span>
          </button>
        ))}
        <div className="leftnav-tools">
          <button type="button" className="leftnav-item" aria-haspopup="dialog" aria-expanded={toolsOpen} onClick={() => setToolsOpen((value) => !value)}>
            <Boxes size={23} strokeWidth={1.8} aria-hidden="true" /><span>All Tools</span>
          </button>
          {toolsOpen && (
            <div className="leftnav-tools__popup surface-smoked-glass" role="dialog" aria-label="All tools">
              <header><strong>All Tools</strong><button type="button" aria-label="Close tools" onClick={() => setToolsOpen(false)}><X size={16} /></button></header>
              {ALL_TOOLS.map((tool) => <button type="button" key={tool.label} onClick={() => navigate(tool.screen)}><Wrench size={15} />{tool.label}</button>)}
            </div>
          )}
        </div>
      </div>
      <div className="leftnav-bottom">
        <button type="button" className={"leftnav-item leftnav-trash " + (currentScreen === "trash" ? "leftnav-item--active" : "")} onClick={() => navigate("trash")}>
          <Trash2 size={23} strokeWidth={1.8} aria-hidden="true" /><span>Trash</span>
        </button>
        <div className="system-status" data-testid="system-status">
          <span className="system-status-heading"><i aria-hidden="true" /> System Status</span>
          <span className="system-status-message">Local route ready</span>
        </div>
      </div>
    </div>
  );
}


