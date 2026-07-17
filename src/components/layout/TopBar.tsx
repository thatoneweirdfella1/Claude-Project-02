import { GlassButton } from "../primitives";

/* Top bar, 60px, per CANON.md "LAYOUT": logo slot, Search/Templates/
   Quick Reference, gear/bell/help, user chip. Structure and spacing
   only (Step 1.5) — the logo is a text placeholder until Step 1.6
   builds the real animated SVG; the icon buttons are text-label
   placeholders, since no icon library exists in this build (adding
   one is a stack decision this step doesn't make — see BUILD-LOG.md
   DECISIONS). Click behavior belongs to whichever later step owns
   each control. */

export function TopBar() {
  return (
    <div className="topbar-content">
      <div className="topbar-logo" data-testid="logo-slot">
        DIVERGENCE.AI
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
