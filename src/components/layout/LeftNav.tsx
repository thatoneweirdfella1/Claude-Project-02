import { GlassButton } from "../primitives";

/* Left nav, 200px, per CANON.md "LAYOUT" and the LOCKED DECISIONS
   logout placement ("logout button bottom-left under System Status").
   Structure and spacing only (Step 1.5) — real navigation/active-state
   behavior is Step 9.7's job ("Left nav content"); these are inert
   placeholders in the right positions, not wired to anything yet. */

const NAV_ITEMS = [
  "Home",
  "Dashboard",
  "Messages",
  "Archive",
  "Resources",
  "Projects",
  "Integrations",
  "Tasks",
  "Customize",
  "Translate",
];

export function LeftNav() {
  return (
    <div className="leftnav-content">
      <div className="leftnav-items">
        {NAV_ITEMS.map((item) => (
          <GlassButton key={item} className="leftnav-item">
            {item}
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
