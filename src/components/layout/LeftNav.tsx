import { useMemo, useState } from "react";
import {
  Archive, BarChart3, Boxes, FolderKanban, Library, MessageCircle,
  Pin, Search, Settings, Trash2, Wrench, X, type LucideIcon,
} from "lucide-react";
import { useAccountStore } from "../../stores/accountStore";
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
  const pinnedTool = useAccountStore((s) => s.pinnedTool);
  const setPinnedTool = useAccountStore((s) => s.setPinnedTool);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [query, setQuery] = useState("");
  const visibleTools = useMemo(
    () => ALL_TOOLS.filter((tool) => tool.label.toLowerCase().includes(query.trim().toLowerCase())),
    [query],
  );
  const pinnedDefinition = ALL_TOOLS.find((tool) => tool.screen === pinnedTool);

  function navigate(screen: ScreenId) {
    setCurrentScreen(screen);
    setToolsOpen(false);
    setStatusOpen(false);
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
              <label className="leftnav-tools__search"><Search size={15} aria-hidden="true" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tools" aria-label="Search tools" /></label>
              <div className="leftnav-tools__results">
                {visibleTools.map((tool) => <div className="leftnav-tools__row" key={tool.label}>
                  <button type="button" onClick={() => navigate(tool.screen)}><Wrench size={15} />{tool.label}</button>
                  <button type="button" className={pinnedTool === tool.screen ? "is-pinned" : ""} aria-label={`${pinnedTool === tool.screen ? "Unpin" : "Pin"} ${tool.label}`} onClick={() => setPinnedTool(pinnedTool === tool.screen ? null : tool.screen)}><Pin size={14} fill={pinnedTool === tool.screen ? "currentColor" : "none"} /></button>
                </div>)}
                {!visibleTools.length && <p className="leftnav-tools__empty">No matching tools.</p>}
              </div>
            </div>
          )}
        </div>
        {pinnedDefinition && <button type="button" className={"leftnav-item leftnav-item--pinned " + (currentScreen === pinnedDefinition.screen ? "leftnav-item--active" : "")} onClick={() => navigate(pinnedDefinition.screen)}><Pin size={20} aria-hidden="true" /><span>{pinnedDefinition.label}</span></button>}
      </div>
      <div className="leftnav-bottom">
        <button type="button" className={"leftnav-item leftnav-trash " + (currentScreen === "trash" ? "leftnav-item--active" : "")} onClick={() => navigate("trash")}>
          <Trash2 size={23} strokeWidth={1.8} aria-hidden="true" /><span>Trash</span>
        </button>
        <button type="button" className="system-status" data-testid="system-status" aria-expanded={statusOpen} onClick={() => setStatusOpen((value) => !value)}>
          <span className="system-status-heading"><i aria-hidden="true" /> System Status</span>
          <span className="system-status-message">Local route ready</span>
        </button>
        {statusOpen && <div className="system-status__popover surface-smoked-glass" role="status"><strong>Services</strong><span><i /> Local preparation: ready</span><span><i /> Browser storage: ready</span><span><i /> Paid providers: checked on use</span></div>}
      </div>
    </div>
  );
}


