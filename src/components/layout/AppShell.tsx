import { ComposerSection } from "../composer";
import { GlassPanel } from "../primitives";
import { ConversationArea } from "../translation";
import { LeftNav } from "./LeftNav";
import { TopBar } from "./TopBar";

/* AppShell — the structural frame from CANON.md "LAYOUT".
   Regions were empty by design at Step 1.1 (skeleton only), then held
   Step 1.3/1.4 demo content proving marble continuity and exercising
   the primitive library. Step 1.5 replaces that demo content with the
   real shell:
     - TopBar (60px): logo, Search, Templates, Quick Reference, gear, bell, help, user chip
     - LeftNav (200px): nav items, Trash, System Status, logout
     - Center (flex): empty conversation placeholder — real content is
       Steps 5.0+ (input composer, streaming display, state pills, etc.)
     - RightSidebar (300px): placeholders for Quick Tools and the
       accordion stack — real content is Steps 9.4-9.6

   Structure and spacing only, per Step 1.5's own scope. Later feature
   steps mount real content into center/right; they do not need to
   touch the app-layer wrapper or the grid itself.

   Step 5.0: ComposerSection (the real input box + control row + TRANSLATE &
   ASK) replaces the Steps 3.2/4.4/4.5 ModelRoutingDemo/DirectnessDemo/
   TechniqueSelectionDemo — those demo cards existed only to prove each
   dropdown's wiring before a real control row existed; the control row now
   hosts the same (real, unchanged) dropdown components, so the standalone
   demos would just be confusing duplicates. ConversationArea (Step 2.3) is
   untouched — the conversation/history area is Step 5.1's job, not this
   one's. */

export function AppShell() {
  return (
    <div className="app-shell app-layer">
      <header className="topbar" aria-label="Top bar" data-testid="topbar">
        <TopBar />
      </header>
      <nav className="col-left" aria-label="Primary navigation" data-testid="col-left">
        <LeftNav />
      </nav>
      <main className="col-center" data-testid="col-center">
        <ConversationArea />
        <ComposerSection />
      </main>
      <aside className="col-right" aria-label="Sidebar panels" data-testid="col-right">
        <GlassPanel className="sidebar-placeholder">
          Quick Tools placeholder — hidden by default per CANON.md, built in Steps 9.4/9.6.
        </GlassPanel>
        <GlassPanel className="sidebar-placeholder">
          Accordion stack placeholder (Recent Sessions, Context Snapshot, Recent Activity, Token
          Usage, Model Status, Active Session) — built in Step 9.5.
        </GlassPanel>
      </aside>
    </div>
  );
}
