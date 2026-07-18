import { ContextSnapshotPanel } from "../context";
import { CenterColumn } from "../pipeline";
import { GlassPanel } from "../primitives";
import { QuickToolsGrid } from "../quicktools";
import { useAccountStore } from "../../stores/accountStore";
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
     - RightSidebar (300px): placeholders for Quick Tools and most of the
       accordion stack — real content is Steps 9.4-9.6. Context Snapshot
       (Step 7.5) is the one accordion section built for real ahead of the
       others; see below.

   Structure and spacing only, per Step 1.5's own scope. Later feature
   steps mount real content into center/right; they do not need to
   touch the app-layer wrapper or the grid itself.

   Step 5.2: the center region is now the live product — CenterColumn joins
   the real ConversationArea and the real Composer through the pipeline
   orchestrator (services/pipeline). The Step 5.0 ComposerSection (JSON
   readout) and Step 5.1 StreamingAnswerDemo existed only because no
   orchestrator did yet; both are superseded and removed.

   Step 7.5: ContextSnapshotPanel replaces the "accordion stack placeholder"
   GlassPanel's Context Snapshot portion with real content reading
   session.context/session.variables; the other five accordion names
   (Recent Sessions, Recent Activity, Token Usage, Model Status, Active
   Session) stay as placeholder text, still Steps 9.5/9.6's job.

   Step 9.4: every right-column region is now gated on
   accountStore.visibility (CANON Feature 12's 7 checkboxes) — Quick Tools
   and Context Snapshot are real, individually-visibility-gated regions;
   the still-combined "remaining five" placeholder can't be gated per-item
   until Step 9.5 splits it into five real panels, so it renders whenever
   ANY of the five is ON (an honest interim gate, not exact per-item
   control — flagged in BUILD-LOG PARKED).

   Step 9.6: QuickToolsGrid replaces the Quick Tools placeholder text with
   the real 2x3 tile grid. */

export function AppShell() {
  const visibility = useAccountStore((s) => s.visibility);
  const showRemainingAccordion =
    visibility.recentSessions ||
    visibility.recentActivity ||
    visibility.tokenUsage ||
    visibility.modelStatus ||
    visibility.activeSession;

  return (
    <div className="app-shell app-layer">
      <header className="topbar" aria-label="Top bar" data-testid="topbar">
        <TopBar />
      </header>
      <nav className="col-left" aria-label="Primary navigation" data-testid="col-left">
        <LeftNav />
      </nav>
      <main className="col-center" data-testid="col-center">
        <CenterColumn />
      </main>
      <aside className="col-right" aria-label="Sidebar panels" data-testid="col-right">
        {visibility.quickTools && <QuickToolsGrid />}
        {visibility.contextSnapshot && <ContextSnapshotPanel />}
        {showRemainingAccordion && (
          <GlassPanel className="sidebar-placeholder">
            Remaining accordion placeholders (Recent Sessions, Recent Activity, Token Usage, Model
            Status, Active Session) — built in Step 9.5.
          </GlassPanel>
        )}
      </aside>
    </div>
  );
}
