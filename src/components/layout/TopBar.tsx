import { GlassButton } from "../primitives";
import { Logo } from "./Logo";
import { Search, BookOpen, Settings, Bell, HelpCircle, ChevronDown } from "lucide-react";

/* Top bar, 60px, per CANON.md "LAYOUT": logo slot, Search/Templates/
   Quick Reference, gear/bell/help, user chip with avatar. */

export function TopBar() {
  return (
    <div className="topbar-content">
      <div className="topbar-logo" data-testid="logo-slot">
        <Logo />
      </div>
      <div className="topbar-center">
        <GlassButton className="topbar-button-with-icon">
          <Search size={18} />
          Search
        </GlassButton>
        <GlassButton className="topbar-button-with-icon">
          <BookOpen size={18} />
          Templates
        </GlassButton>
        <GlassButton className="topbar-button-with-icon">
          <BookOpen size={18} />
          Quick Reference
        </GlassButton>
      </div>
      <div className="topbar-right">
        <GlassButton
          aria-label="Settings"
          className="topbar-icon-button"
          data-testid="settings-button"
        >
          <Settings size={18} />
        </GlassButton>
        <GlassButton
          aria-label="Notifications"
          className="topbar-icon-button"
          data-testid="notifications-button"
        >
          <Bell size={18} />
        </GlassButton>
        <GlassButton
          aria-label="Help"
          className="topbar-icon-button"
          data-testid="help-button"
        >
          <HelpCircle size={18} />
        </GlassButton>
        <GlassButton className="topbar-user-chip" data-testid="user-chip">
          <div className="user-avatar">D</div>
          <span>Devan</span>
          <ChevronDown size={16} />
        </GlassButton>
      </div>
    </div>
  );
}
