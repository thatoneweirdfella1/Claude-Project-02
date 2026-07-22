import { GlassButton } from "../primitives";
import { useAccountStore } from "../../stores/accountStore";
import type { ScreenId } from "../../stores/types";

/* Left nav, 200px, per CANON.md "LAYOUT". Navigates to 13 destination screens
   via setCurrentScreen. */

const NAV_ITEMS: Array<{ label: string; screenId: ScreenId }> = [
  { label: "Home", screenId: "home" },
  { label: "Dashboard", screenId: "dashboard" },
  { label: "Messages", screenId: "messages" },
  { label: "Archive", screenId: "archive" },
  { label: "Resources", screenId: "resources" },
  { label: "Projects", screenId: "projects" },
  { label: "Integrations", screenId: "integrations" },
  { label: "Tasks", screenId: "tasks" },
  { label: "Templates", screenId: "templates" },
  { label: "Customize", screenId: "customize" },
  { label: "Settings", screenId: "settings" },
  { label: "Sessions", screenId: "sessions" },
  { label: "Translate", screenId: "translate" },
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
            {item.label}
          </GlassButton>
        ))}
      </div>
      <div className="leftnav-bottom">
        <GlassButton className="leftnav-item" data-testid="nav-trash">
          Trash
        </GlassButton>
        <div className="system-status" data-testid="system-status">
          <span className="system-status-dot" aria-hidden="true" />
          System Status
        </div>
        <GlassButton className="leftnav-item" data-testid="logout-button">
          Logout
        </GlassButton>
      </div>
    </div>
  );
}
