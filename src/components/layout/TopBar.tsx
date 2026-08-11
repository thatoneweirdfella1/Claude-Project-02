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
import { LoadTemplateMenu } from "../session";
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
  return (
    <div ref={rootRef} className="topbar-popover-wrapper">
      <GlassButton aria-label="Quick Reference" onClick={() => setOpen(!open)}>
        <Sparkles size={19} aria-hidden="true" />
        Quick Reference
      </GlassButton>
      {open && (
        <div className="surface-smoked-glass topbar-popover" role="region" aria-label="Quick Reference">
          <p className="topbar-popover__title">Quick Reference</p>
          <p className="topbar-popover__text">Ctrl + Enter translates your message. Escape closes the current menu.</p>
        </div>
      )}
    </div>
  );
}

function SearchPopover({ open, setOpen, rootRef }: PopoverProps) {
  const [query, setQuery] = useState("");
  const sessions = useAccountStore((s) => s.sessions);
  const templates = useAccountStore((s) => s.templates);
  const loadSessionRecord = useSessionStore((s) => s.loadSessionRecord);
  const setCurrentScreen = useSessionStore((s) => s.setCurrentScreen);

  const matches = [
    ...sessions
      .filter((session) => (session.tag || `Session ${session.id.slice(0, 6)}`).toLowerCase().includes(query.toLowerCase()))
      .slice(0, 4)
      .map((session) => ({ id: session.id, label: session.tag || `Session ${session.id.slice(0, 6)}`, type: "session" as const })),
    ...templates
      .filter((template) => template.title.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 4)
      .map((template) => ({ id: template.id, label: template.title, type: "template" as const })),
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
            placeholder="Search sessions and templates"
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
                    setCurrentScreen("translate");
                  } else {
                    setCurrentScreen("templates");
                  }
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
  return (
    <div ref={rootRef} className="topbar-popover-wrapper">
      <GlassButton aria-label={isHelp ? "Help" : "Notifications"} onClick={() => setOpen(!open)}>
        {isHelp ? <CircleHelp size={20} /> : <Bell size={20} />}
        {isHelp ? "Help" : "Notifications"}
      </GlassButton>
      {open && (
        <div className="surface-smoked-glass topbar-popover topbar-popover--right" role="region">
          <p className="topbar-popover__title">{isHelp ? "Help" : "Notifications"}</p>
          <p className="topbar-popover__text">{isHelp ? "Type what you are thinking, then press Translate." : "No notifications"}</p>
        </div>
      )}
    </div>
  );
}

function UserMenu({ open, setOpen, rootRef }: PopoverProps) {
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
          <button type="button" className="topbar-popover__menu-item" onClick={() => void logOutCurrentAccount()}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

export function TopBar() {
  const setCurrentScreen = useSessionStore((s) => s.setCurrentScreen);
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

  return (
    <div className="topbar-content">
      <div className="topbar-logo" data-testid="logo-slot"><Logo /></div>
      <div className="topbar-center">
        <QuickReferencePopover open={referenceOpen} setOpen={setReferenceOpen} rootRef={referenceRef} />
        <SearchPopover open={searchOpen} setOpen={setSearchOpen} rootRef={searchRef} />
        <LoadTemplateMenu renderTrigger={({ open, onClick }) => (
          <GlassButton onClick={onClick} aria-expanded={open}><ClipboardList size={20} /> Templates</GlassButton>
        )} />
      </div>
      <div className="topbar-right">
        <SimplePopover kind="notifications" open={notificationsOpen} setOpen={setNotificationsOpen} rootRef={notificationsRef} />
        <SimplePopover kind="help" open={helpOpen} setOpen={setHelpOpen} rootRef={helpRef} />
        <GlassButton aria-label="Settings" onClick={() => setCurrentScreen("settings")}>
          <Settings size={20} /> Settings
        </GlassButton>
        <UserMenu open={userOpen} setOpen={setUserOpen} rootRef={userRef} />
      </div>
    </div>
  );
}
