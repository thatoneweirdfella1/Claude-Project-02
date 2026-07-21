import { CenterColumn } from "../pipeline";
import { QuickToolsGrid } from "../quicktools";
import { useAccountStore } from "../../stores/accountStore";
import { AccordionStack } from "./AccordionStack";
import { useDesignLayoutEffect } from "./useDesignLayoutEffect";
import { LeftNav } from "./LeftNav";
import { TopBar } from "./TopBar";
import { useThemeEffect } from "./useThemeEffect";

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

   Step 9.4: every right-column region was gated on accountStore.visibility
   (CANON Feature 12's 7 checkboxes) — Quick Tools and Context Snapshot as
   real, individually-visibility-gated regions; the still-combined
   "remaining five" placeholder couldn't be gated per-item yet, so it
   rendered whenever ANY of the five was ON (an honest interim gate, not
   exact per-item control).

   Step 9.6: QuickToolsGrid replaces the Quick Tools placeholder text with
   the real 2x3 tile grid.

   Step 9.5: AccordionStack replaces BOTH ContextSnapshotPanel and the
   "remaining five" interim block with one revolving-door accordion
   covering all six panels, each now individually visibility-gated for
   real (Step 9.4's interim aggregate gate is gone, per that step's own
   PARKED note). Quick Tools stays a separate sibling here, not part of
   the accordion — CANON's LAYOUT lists it separately from "the accordion
   stack." */

export function AppShell() {
  const visibility = useAccountStore((s) => s.visibility);
  useThemeEffect(); // CANON Feature 12 — resolves theme + Auto, writes documentElement's data-theme
  useDesignLayoutEffect(); // CLAUDE.md "Design layouts" — writes documentElement's data-layout

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
        <AccordionStack />
      </aside>
    </div>
  );
}
