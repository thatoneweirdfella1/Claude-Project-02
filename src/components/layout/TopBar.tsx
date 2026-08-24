import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ClipboardList,
  ChevronDown,
  CircleHelp,
  LogOut,
  Search,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import { GlassButton } from "../primitives";
import { useDismissableLayer } from "../../keyboard";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import { logOutCurrentAccount } from "../../services/accountSession";
import { desktopBridge, type DesktopUser } from "../../services/desktopBridge";
import { Logo } from "./Logo";
import "./TopBar.css";

interface PopoverProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  rootRef: React.RefObject<HTMLDivElement | null>;
}

function QuickReferencePopover({ open, setOpen, rootRef }: PopoverProps) {
  const openReference = () => {
    const next = !open;
    setOpen(next);
    window.dispatchEvent(new CustomEvent("divergence:right-rail-panel", { detail: next ? "reference" : null }));
  };
  return (
    <div ref={rootRef} className="topbar-popover-wrapper">
      <GlassButton aria-label="Quick Reference" aria-expanded={open} onClick={openReference}>
        <Sparkles size={19} aria-hidden="true" />
        Quick Reference
      </GlassButton>
    </div>
  );
}

function SearchPopover({ open, setOpen, rootRef }: PopoverProps) {
  const [query, setQuery] = useState("");
  const sessions = useAccountStore((s) => s.sessions);
  const templates = useAccountStore((s) => s.templates);
  const savedPrompts = useAccountStore((s) => s.savedPrompts);
  const loadSessionRecord = useSessionStore((s) => s.loadSessionRecord);
  const setScreenLocation = useSessionStore((s) => s.setScreenLocation);

  const matches = [
    ...sessions
      .filter((session) => (session.tag || `Session ${session.id.slice(0, 6)}`).toLowerCase().includes(query.toLowerCase()))
      .slice(0, 4)
      .map((session) => ({ id: session.id, label: session.tag || `Session ${session.id.slice(0, 6)}`, type: "session" as const })),
    ...templates
      .filter((template) => template.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 4)
      .map((template) => ({ id: template.id, label: template.title, type: "template" as const })),
    ...savedPrompts
      .filter((prompt) => prompt.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 4)
      .map((prompt) => ({ id: prompt.id, label: prompt.title, type: "saved-prompt" as const })),
    ...([
      { id: "projects", label: "Projects", type: "projects" as const },
      { id: "settings", label: "Settings", type: "settings" as const },
      { id: "insights", label: "Insights", type: "insights" as const },
      { id: "variables", label: "Variables", type: "variables" as const },
    ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))),
  ];

  return (
    <div ref={rootRef} className="topbar-popover-wrapper topbar-search">
      <GlassButton aria-label="Search" onClick={() => setOpen(!open)}>
        <Search size={20} aria-hidden="true" />
        <span>Search</span>
      </GlassButton>
      {open && (
        <div className="surface-smoked-glass topbar-popover topbar-popover--search" role="search">
          <input
            className="topbar-popover__input"
            placeholder="Search sessions, Saved Tools, Projects, and Settings"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoFocus
          />
          <div className="topbar-popover__results">
            {query.length === 0 && <p className="topbar-popover__empty">Type to search</p>}
            {query.length > 0 && matches.length === 0 && <p className="topbar-popover__empty">No results</p>}
            {matches.map((match) => (
              <button
                key={`${match.type}-${match.id}`}
                type="button"
                className="search-result-item"
                onClick={() => {
                  if (match.type === "session") {
                    const session = sessions.find((item) => item.id === match.id);
                    if (session) loadSessionRecord(session);
                    setScreenLocation("translate");
                  } else if (match.type === "template") {
                    setScreenLocation("saved-tools", "templates");
                  } else if (match.type === "saved-prompt") {
                    setScreenLocation("saved-tools", "saved-prompts");
                  } else if (match.type === "projects") {
                    setScreenLocation("projects", "overview");
                  } else if (match.type === "settings") {
                    setScreenLocation("settings");
                  } else if (match.type === "insights") {
                    setScreenLocation("insights", "overview");
                  } else {
                    setScreenLocation("variables");
                  }
                  window.dispatchEvent(new CustomEvent("divergence:focus-search-result", { detail: match }));
                  setOpen(false);
                }}
              >
                {match.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SimplePopover({ open, setOpen, rootRef, kind }: PopoverProps & { kind: "notifications" | "help" }) {
  const isHelp = kind === "help";
  const currentScreen = useSessionStore((s) => s.currentScreen);
  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (isHelp) window.dispatchEvent(new CustomEvent("divergence:right-rail-panel", { detail: next ? `help:${currentScreen}` : null }));
  };
  return (
    <div ref={rootRef} className="topbar-popover-wrapper">
      <GlassButton aria-label={isHelp ? "Help" : "Notifications"} aria-expanded={open} onClick={toggle}>
        {isHelp ? <CircleHelp size={20} /> : <Bell size={20} />}
        {isHelp ? "Help" : "Notifications"}
      </GlassButton>
      {open && !isHelp && (
        <div className="surface-smoked-glass topbar-popover topbar-popover--right" role="region">
          <p className="topbar-popover__title">Notifications</p>
          <p className="topbar-popover__text">No notifications. New notices will link to their exact destination here.</p>
        </div>
      )}
    </div>
  );
}

function UserMenu({ open, setOpen, rootRef }: PopoverProps) {
  const setScreenLocation = useSessionStore((s) => s.setScreenLocation);
  const [desktopUser, setDesktopUser] = useState<DesktopUser | null>(null);
  useEffect(() => {
    const desktop = desktopBridge();
    if (desktop) void desktop.auth.current().then(setDesktopUser);
  }, []);
  return (
    <div ref={rootRef} className="topbar-popover-wrapper topbar-user-menu">
      <GlassButton className="user-chip" onClick={() => setOpen(!open)}>
        <UserRound size={20} aria-hidden="true" />
        <span className="user-chip__label">Profile</span>
        <ChevronDown size={15} aria-hidden="true" />
      </GlassButton>
      {open && (
        <div className="surface-smoked-glass topbar-popover topbar-popover--right" role="menu" aria-label="Profile menu">
          {desktopUser && <p className="topbar-popover__text">{desktopUser.email}</p>}
          <button type="button" className="topbar-popover__menu-item" onClick={() => { setScreenLocation("settings", "account"); setOpen(false); }}>Profile</button>
          <button type="button" className="topbar-popover__menu-item" onClick={() => { setScreenLocation("settings", "plan"); setOpen(false); }}>Account and plan</button>
          <button type="button" className="topbar-popover__menu-item" onClick={() => { window.dispatchEvent(new CustomEvent("divergence:open-shortcuts")); setOpen(false); }}>Keyboard shortcuts</button>
          <button type="button" className="topbar-popover__menu-item" onClick={() => void logOutCurrentAccount()}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

export function TopBar() {
  const setScreenLocation = useSessionStore((s) => s.setScreenLocation);
  const [searchOpen, setSearchOpen] = useState(false);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const referenceRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useDismissableLayer(searchOpen, () => setSearchOpen(false));
  useDismissableLayer(referenceOpen, () => setReferenceOpen(false));
  useDismissableLayer(notificationsOpen, () => setNotificationsOpen(false));
  useDismissableLayer(helpOpen, () => setHelpOpen(false));
  useDismissableLayer(userOpen, () => setUserOpen(false));
  useEffect(() => {
    const openSearch = () => setSearchOpen(true);
    const openReference = () => { setReferenceOpen(true); window.dispatchEvent(new CustomEvent("divergence:right-rail-panel", { detail: "reference" })); };
    window.addEventListener("divergence:open-search", openSearch);
    window.addEventListener("divergence:open-reference", openReference);
    return () => {
      window.removeEventListener("divergence:open-search", openSearch);
      window.removeEventListener("divergence:open-reference", openReference);
    };
  }, []);

  return (
    <div className="topbar-content">
      <button type="button" className="topbar-logo" data-testid="logo-slot" aria-label="Go to Talk to AI" onClick={() => setScreenLocation("translate")} style={{ border: 0, background: "transparent", padding: 0 }}><Logo /></button>
      <div className="topbar-center">
        <QuickReferencePopover open={referenceOpen} setOpen={setReferenceOpen} rootRef={referenceRef} />
        <SearchPopover open={searchOpen} setOpen={setSearchOpen} rootRef={searchRef} />
        <GlassButton onClick={() => setScreenLocation("saved-tools", "templates")}><ClipboardList size={20} /> Templates</GlassButton>
      </div>
      <div className="topbar-right">
        <SimplePopover kind="notifications" open={notificationsOpen} setOpen={setNotificationsOpen} rootRef={notificationsRef} />
        <SimplePopover kind="help" open={helpOpen} setOpen={setHelpOpen} rootRef={helpRef} />
        <GlassButton aria-label="Settings" onClick={() => setScreenLocation("settings")}>
          <Settings size={20} /> Settings
        </GlassButton>
        <UserMenu open={userOpen} setOpen={setUserOpen} rootRef={userRef} />
      </div>
    </div>
  );
}
