import { GlassButton } from "../primitives";
import { Logo } from "./Logo";

/* Top bar, 60px, per CANON.md "LAYOUT": logo slot, Search/Templates/
   Quick Reference, gear/bell/help, user chip. The logo is the real
   animated SVG mark (Step 1.6); the icon buttons are still text-label
   placeholders, since no icon library exists in this build (adding
   one is a stack decision this step doesn't make — see BUILD-LOG.md
   DECISIONS). Click behavior belongs to whichever later step owns
   each control. */

export function TopBar() {
  return (
    <div className="topbar-content">
      <div className="topbar-logo" data-testid="logo-slot">
        <Logo />
      </div>
      <div className="topbar-center">
        <GlassButton>Search</GlassButton>
        <GlassButton>Templates</GlassButton>
        <GlassButton>Quick Reference</GlassButton>
      </div>
      <div className="topbar-right">
        <GlassButton aria-label="Settings">Settings</GlassButton>
        <GlassButton aria-label="Notifications">Notifications</GlassButton>
        <GlassButton aria-label="Help">Help</GlassButton>
        <GlassButton data-testid="user-chip">Devan</GlassButton>
      </div>
    </div>
  );
}
