import { useSessionStore } from "../../stores/sessionStore";
import { GlassButton } from "../primitives";
import type { ScreenId } from "../../stores/types";

/* Left nav, 200px, per CANON.md "LAYOUT" and the LOCKED DECISIONS
   logout placement ("logout button bottom-left under System Status").
   Step 9.7 — wired for navigation: clicking items sets currentScreen. */

const NAV_ITEMS: Array<{ label: string; screen: ScreenId }> = [
  { label: "Home", screen: "home" },
  { label: "Dashboard", screen: "dashboard" },
  { label: "Messages", screen: "messages" },
  { label: "Archive", screen: "archive" },
  { label: "Resources", screen: "resources" },
  { label: "Projects", screen: "projects" },
  { label: "Integrations", screen: "integrations" },
  { label: "Tasks", screen: "tasks" },
  { label: "Customize", screen: "customize" },
  { label: "Translate", screen: "translate" },
];

export function LeftNav() {
  const currentScreen = useSessionStore((s) => s.currentScreen);
  const setCurrentScreen = useSessionStore((s) => s.setCurrentScreen);

  return (
    <div className="leftnav-content">
      <div className="leftnav-items">
        {NAV_ITEMS.map(({ label, screen }) => (
          <GlassButton
            key={screen}
            className={`leftnav-item ${currentScreen === screen ? "leftnav-item--active" : ""}`}
            onClick={() => setCurrentScreen(screen)}
          >
            {label}
          </GlassButton>
        ))}
      </div>
      <div className="leftnav-bottom">
        <GlassButton className="leftnav-item">Trash</GlassButton>
        <div className="system-status" data-testid="system-status">
          <span className="system-status-dot" aria-hidden="true" />
          System Status
        </div>
        <GlassButton className="leftnav-item">Logout</GlassButton>
      </div>
    </div>
  );
}
