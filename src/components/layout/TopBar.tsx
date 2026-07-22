import { useEffect, useRef, useState } from "react";
import { Bell, BookOpen, ChevronDown, HelpCircle, Search, LogOut } from "lucide-react";
import { GlassButton } from "../primitives";
import { VisibilityMenu } from "../visibility";
import { LoadTemplateMenu } from "../session";
import { useDismissableLayer } from "../../keyboard";
import { Logo } from "./Logo";
import "./TopBar.css";

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

function SearchPopover({ open, setOpen, rootRef }: { open: boolean; setOpen: (v: boolean) => void; rootRef: React.RefObject<HTMLDivElement | null> }) {
  const [query, setQuery] = useState("");

  return (
    <div ref={rootRef} className="topbar-popover-wrapper">
      <GlassButton aria-label="Search" onClick={() => setOpen(!open)}>
        <Search size={16} aria-hidden="true" />
        Search
      </GlassButton>
      {open && (
        <div className="surface-smoked-glass topbar-popover" role="region" aria-label="Search">
          <input
            type="text"
            className="topbar-popover__input"
            placeholder="Search sessions, templates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <div className="topbar-popover__results">
            {query.length === 0 ? (
              <p className="topbar-popover__empty">Type to search sessions and templates</p>
            ) : (
              <p className="topbar-popover__empty">No results for "{query}"</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickReferencePopover({ open, setOpen, rootRef }: { open: boolean; setOpen: (v: boolean) => void; rootRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={rootRef} className="topbar-popover-wrapper">
      <GlassButton aria-label="Quick Reference" onClick={() => setOpen(!open)}>
        <BookOpen size={16} aria-hidden="true" />
        Quick Reference
      </GlassButton>
      {open && (
        <div className="surface-smoked-glass topbar-popover" role="region" aria-label="Quick Reference">
          <p className="topbar-popover__title">Keyboard Shortcuts</p>
          <div className="topbar-popover__shortcuts">
            <div className="topbar-popover__shortcut">
              <kbd>Ctrl</kbd> + <kbd>Enter</kbd> — Translate &amp; Ask
            </div>
            <div className="topbar-popover__shortcut">
              <kbd>Esc</kbd> — Close popovers
            </div>
          </div>
          <p className="topbar-popover__title" style={{ marginTop: "12px" }}>App Overview</p>
          <p className="topbar-popover__text">
            Divergence.AI transforms your thoughts into clear, effective communication with AI-assisted translation and multi-model consensus.
          </p>
        </div>
      )}
    </div>
  );
}

function NotificationsPopover({ open, setOpen, rootRef }: { open: boolean; setOpen: (v: boolean) => void; rootRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={rootRef} className="topbar-popover-wrapper">
      <GlassButton aria-label="Notifications" onClick={() => setOpen(!open)}>
        <Bell size={16} aria-hidden="true" />
      </GlassButton>
      {open && (
        <div className="surface-smoked-glass topbar-popover" role="region" aria-label="Notifications">
          <p className="topbar-popover__empty">No notifications</p>
        </div>
      )}
    </div>
  );
}

function HelpPopover({ open, setOpen, rootRef }: { open: boolean; setOpen: (v: boolean) => void; rootRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={rootRef} className="topbar-popover-wrapper">
      <GlassButton aria-label="Help" onClick={() => setOpen(!open)}>
        <HelpCircle size={16} aria-hidden="true" />
      </GlassButton>
      {open && (
        <div className="surface-smoked-glass topbar-popover" role="region" aria-label="Help">
          <p className="topbar-popover__title">Getting Started</p>
          <div className="topbar-popover__text">
            <p>1. Type your thoughts in the composer</p>
            <p>2. Click "Translate &amp; Ask" to get AI feedback</p>
            <p>3. Use the sidebar panels to explore routing and techniques</p>
          </div>
        </div>
      )}
    </div>
  );
}

function UserMenu({ open, setOpen, rootRef }: { open: boolean; setOpen: (v: boolean) => void; rootRef: React.RefObject<HTMLDivElement | null> }) {
  function handleLogout() {
    window.location.href = "/logout";
  }

  return (
    <div ref={rootRef} className="topbar-popover-wrapper">
      <GlassButton className="user-chip" onClick={() => setOpen(!open)}>
        <span className="user-chip__avatar" aria-hidden="true">
          D
        </span>
        Devan
        <ChevronDown size={14} aria-hidden="true" />
      </GlassButton>
      {open && (
        <div className="surface-smoked-glass topbar-popover topbar-popover--right" role="menu" aria-label="User menu">
          <button
            type="button"
            className="topbar-popover__menu-item"
            onClick={handleLogout}
          >
            <LogOut size={14} aria-hidden="true" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [refOpen, setRefOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const refRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useDismissableLayer(searchOpen, () => setSearchOpen(false));
  useDismissableLayer(refOpen, () => setRefOpen(false));
  useDismissableLayer(notifOpen, () => setNotifOpen(false));
  useDismissableLayer(helpOpen, () => setHelpOpen(false));
  useDismissableLayer(userOpen, () => setUserOpen(false));

  useEffect(() => {
    if (!searchOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (searchRef.current?.contains(event.target as Node)) return;
      setSearchOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [searchOpen]);

  useEffect(() => {
    if (!refOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (refRef.current?.contains(event.target as Node)) return;
      setRefOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [refOpen]);

  useEffect(() => {
    if (!notifOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (notifRef.current?.contains(event.target as Node)) return;
      setNotifOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [notifOpen]);

  useEffect(() => {
    if (!helpOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (helpRef.current?.contains(event.target as Node)) return;
      setHelpOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [helpOpen]);

  useEffect(() => {
    if (!userOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (userRef.current?.contains(event.target as Node)) return;
      setUserOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [userOpen]);

  return (
    <div className="topbar-content">
      <div className="topbar-logo" data-testid="logo-slot">
        <Logo />
      </div>
      <div className="topbar-center">
        <SearchPopover open={searchOpen} setOpen={setSearchOpen} rootRef={searchRef} />
        <LoadTemplateMenu
          renderTrigger={({ open, onClick }) => (
            <GlassButton onClick={onClick} aria-expanded={open}>
              <BookOpen size={16} aria-hidden="true" />
              Templates
            </GlassButton>
          )}
        />
        <QuickReferencePopover open={refOpen} setOpen={setRefOpen} rootRef={refRef} />
      </div>
      <div className="topbar-right">
        <VisibilityMenu />
        <NotificationsPopover open={notifOpen} setOpen={setNotifOpen} rootRef={notifRef} />
        <HelpPopover open={helpOpen} setOpen={setHelpOpen} rootRef={helpRef} />
        <UserMenu open={userOpen} setOpen={setUserOpen} rootRef={userRef} />
      </div>
    </div>
  );
}
