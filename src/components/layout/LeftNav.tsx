import {
  AudioWaveform,
  Archive,
  BarChart3,
  Braces,
  ClipboardList,
  LayoutGrid,
  Settings,
  ShieldCheck,
  Trash2,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { useSessionStore } from "../../stores/sessionStore";
import type { ScreenId } from "../../stores/types";

const NAV_ITEMS: Array<{ label: string; screen: ScreenId; Icon: LucideIcon }> = [
  { label: "Dashboard", screen: "dashboard", Icon: LayoutGrid },
  { label: "Translate", screen: "translate", Icon: AudioWaveform },
  { label: "Sessions", screen: "sessions", Icon: Archive },
  { label: "Templates", screen: "templates", Icon: ClipboardList },
  { label: "Techniques", screen: "resources", Icon: Workflow },
  { label: "Variables", screen: "customize", Icon: Braces },
  { label: "Checkpoints", screen: "projects", Icon: ShieldCheck },
  { label: "Analytics", screen: "tasks", Icon: BarChart3 },
  { label: "Settings", screen: "settings", Icon: Settings },
];

export function LeftNav() {
  const currentScreen = useSessionStore((s) => s.currentScreen);
  const setCurrentScreen = useSessionStore((s) => s.setCurrentScreen);

  return (
    <div className="leftnav-content">
      <div className="leftnav-items">
        {NAV_ITEMS.map(({ label, screen, Icon }) => (
          <button
            type="button"
            key={screen}
            data-screen={screen}
            className={`leftnav-item ${currentScreen === screen ? "leftnav-item--active" : ""}`}
            onClick={() => setCurrentScreen(screen)}
          >
            <Icon size={25} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="leftnav-bottom">
        <button type="button" className="leftnav-item leftnav-trash" onClick={() => setCurrentScreen("trash")}>
          <Trash2 size={26} strokeWidth={1.8} aria-hidden="true" />
          <span>Trash</span>
        </button>
        <div className="system-status" data-testid="system-status">
          <span className="system-status-heading"><i aria-hidden="true" /> System Status</span>
          <span className="system-status-message">All Systems Operational</span>
        </div>
      </div>
    </div>
  );
}
