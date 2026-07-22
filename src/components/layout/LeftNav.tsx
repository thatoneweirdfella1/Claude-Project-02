import {
  Code2,
  Folder,
  Home,
  LayoutGrid,
  Lightbulb,
  ListChecks,
  MessageSquare,
  Archive as ArchiveIcon,
  SlidersHorizontal,
  Trash2,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useSessionStore } from "../../stores/sessionStore";
import { GlassButton } from "../primitives";
import { BrainMark } from "./BrainMark";
import type { ScreenId } from "../../stores/types";

/* Left nav, 200px, per CANON.md "LAYOUT" and the LOCKED DECISIONS
   logout placement ("logout button bottom-left under System Status").
   Step 9.7 — wired for navigation: clicking items sets currentScreen.

   VISUAL-AUDIT V4, fixed this session: icons per item, matching
   Divergence_AI_App_Screenshot_V3.png — the icon-library decision this
   build deferred since Step 1.5 (TopBar.tsx's own comment named it "a stack
   decision this step doesn't make"). lucide-react chosen (ISC license,
   tree-shakeable, simple-outline style matching V3's monochrome nav icons
   exactly) — logged in BUILD-LOG.md DECISIONS per CONVENTIONS.md rule 3.

   Icon choices favor CANON's actual written LEFT NAVIGATION semantics over
   pixel-matching V3's exact glyphs where they'd conflict: V3's Projects icon
   looks like a padlock, but CANON describes Projects as "organizes
   conversations by project" — a Folder, not a lock. Customize uses
   SlidersHorizontal rather than a second gear (V3 shows a gear there too,
   matching the top-bar Settings gear) specifically because CANON's own text
   calls out that Customize and gear-icon Settings are deliberately distinct
   features ("theme itself already lives under the gear-icon Settings") —
   reusing the same icon for two different things risks exactly the
   confusion that sentence exists to prevent. Translate reuses BrainMark,
   same as V3 (a small version of the same brand mark, not a generic icon —
   Translate is "the composer, conversation area, and everything Features
   1-10 render into," CANON's own words for why it's the primary view). */

const NAV_ITEMS: Array<{ label: string; screen: ScreenId; Icon: LucideIcon | null }> = [
  { label: "Home", screen: "home", Icon: Home },
  { label: "Dashboard", screen: "dashboard", Icon: LayoutGrid },
  { label: "Messages", screen: "messages", Icon: MessageSquare },
  { label: "Archive", screen: "archive", Icon: ArchiveIcon },
  { label: "Resources", screen: "resources", Icon: Lightbulb },
  { label: "Projects", screen: "projects", Icon: Folder },
  { label: "Integrations", screen: "integrations", Icon: Code2 },
  { label: "Tasks", screen: "tasks", Icon: ListChecks },
  { label: "Customize", screen: "customize", Icon: SlidersHorizontal },
  { label: "Translate", screen: "translate", Icon: null }, // BrainMark, not a lucide icon — see comment above
];

export function LeftNav() {
  const currentScreen = useSessionStore((s) => s.currentScreen);
  const setCurrentScreen = useSessionStore((s) => s.setCurrentScreen);

  function handleLogout() {
    window.location.href = "/logout";
  }

  return (
    <div className="leftnav-content">
      <div className="leftnav-items">
        {NAV_ITEMS.map(({ label, screen, Icon }) => (
          <GlassButton
            key={screen}
            className={`leftnav-item ${currentScreen === screen ? "leftnav-item--active" : ""}`}
            onClick={() => setCurrentScreen(screen)}
          >
            {Icon ? <Icon size={16} aria-hidden="true" /> : <BrainMark size={16} />}
            {label}
          </GlassButton>
        ))}
      </div>
      <div className="leftnav-bottom">
        <GlassButton className="leftnav-item" title="Trash — coming soon">
          <Trash2 size={16} aria-hidden="true" />
          Trash
        </GlassButton>
        <div className="system-status" data-testid="system-status">
          <span className="system-status-dot" aria-hidden="true" />
          System Status
        </div>
        <GlassButton className="leftnav-item" onClick={handleLogout}>
          <LogOut size={16} aria-hidden="true" />
          Logout
        </GlassButton>
      </div>
    </div>
  );
}
