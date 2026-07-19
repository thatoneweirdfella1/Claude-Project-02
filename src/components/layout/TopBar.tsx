import { Bell, BookOpen, ChevronDown, HelpCircle, Search } from "lucide-react";
import { GlassButton } from "../primitives";
import { VisibilityMenu } from "../visibility";
import { Logo } from "./Logo";

/* Top bar, 60px, per CANON.md "LAYOUT": logo slot, Search/Templates/
   Quick Reference, gear/bell/help, user chip. The logo is the real
   animated SVG mark (Step 1.6).

   VISUAL-AUDIT V5 (fixed this session): icon buttons were text-label
   placeholders pending the icon-library decision (LeftNav.tsx makes and
   explains that call — lucide-react — this file just consumes it) plus an
   avatar circle + chevron on the user chip, both matching
   Divergence_AI_App_Screenshot_V3.png. Templates and Quick Reference share
   BookOpen — V3 draws the identical glyph for both, not two different
   icons.

   Step 9.4: the gear ("Settings") is CANON Feature 12's gear dropdown —
   VisibilityMenu replaces the inert placeholder button with a real
   trigger + the 7-checkbox popover, reading/writing accountStore.visibility. */

export function TopBar() {
  return (
    <div className="topbar-content">
      <div className="topbar-logo" data-testid="logo-slot">
        <Logo />
      </div>
      <div className="topbar-center">
        <GlassButton>
          <Search size={16} aria-hidden="true" />
          Search
        </GlassButton>
        <GlassButton>
          <BookOpen size={16} aria-hidden="true" />
          Templates
        </GlassButton>
        <GlassButton>
          <BookOpen size={16} aria-hidden="true" />
          Quick Reference
        </GlassButton>
      </div>
      <div className="topbar-right">
        <VisibilityMenu />
        <GlassButton aria-label="Notifications">
          <Bell size={16} aria-hidden="true" />
        </GlassButton>
        <GlassButton aria-label="Help">
          <HelpCircle size={16} aria-hidden="true" />
        </GlassButton>
        <GlassButton className="user-chip" data-testid="user-chip">
          <span className="user-chip__avatar" aria-hidden="true">
            D
          </span>
          Devan
          <ChevronDown size={14} aria-hidden="true" />
        </GlassButton>
      </div>
    </div>
  );
}
