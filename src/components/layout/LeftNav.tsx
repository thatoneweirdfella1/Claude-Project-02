import { GlassButton } from "../primitives";
import { useAccountStore } from "../../stores/accountStore";
import type { ScreenId } from "../../stores/types";
import {
  Home,
  LayoutGrid,
  MessageSquare,
  Archive,
  Lightbulb,
  Folder,
  Code2,
  ListChecks,
  SlidersHorizontal,
  BrainVertical,
  Trash2,
  LogOut,
} from "lucide-react";

/* Left nav, 240px, per CANON.md "LAYOUT". Navigates to 13 destination screens
   via setCurrentScreen. */

interface NavItem {
  label: string;
  screenId: ScreenId;
  Icon: React.ComponentType<{ size: number; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", screenId: "home", Icon: Home },
  { label: "Dashboard", screenId: "dashboard", Icon: LayoutGrid },
  { label: "Messages", screenId: "messages", Icon: MessageSquare },
  { label: "Archive", screenId: "archive", Icon: Archive },
  { label: "Resources", screenId: "resources", Icon: Lightbulb },
  { label: "Projects", screenId: "projects", Icon: Folder },
  { label: "Integrations", screenId: "integrations", Icon: Code2 },
  { label: "Tasks", screenId: "tasks", Icon: ListChecks },
  { label: "Templates", screenId: "templates", Icon: Archive },
  { label: "Customize", screenId: "customize", Icon: SlidersHorizontal },
  { label: "Settings", screenId: "settings", Icon: Lightbulb },
  { label: "Sessions", screenId: "sessions", Icon: MessageSquare },
  { label: "Translate", screenId: "translate", Icon: BrainVertical },
];

export function LeftNav() {
  const currentScreen = useAccountStore((s) => s.currentScreen);
  const setCurrentScreen = useAccountStore((s) => s.setCurrentScreen);

  return (
    <div className="leftnav-content">
      <div className="leftnav-items">
        {NAV_ITEMS.map((item) => (
          <GlassButton
            key={item.screenId}
            className={`leftnav-item ${currentScreen === item.screenId ? "active" : ""}`}
            onClick={() => setCurrentScreen(item.screenId)}
            data-testid={`nav-${item.screenId}`}
          >
            <item.Icon size={18} className="leftnav-icon" />
            <span>{item.label}</span>
          </GlassButton>
        ))}
      </div>
      <div className="leftnav-bottom">
        <GlassButton className="leftnav-item" data-testid="nav-trash">
          <Trash2 size={18} className="leftnav-icon" />
          <span>Trash</span>
        </GlassButton>
        <div className="system-status" data-testid="system-status">
          <span className="system-status-dot" aria-hidden="true" />
          System Status
        </div>
        <GlassButton className="leftnav-item" data-testid="logout-button">
          <LogOut size={18} className="leftnav-icon" />
          <span>Logout</span>
        </GlassButton>
      </div>
    </div>
  );
}
