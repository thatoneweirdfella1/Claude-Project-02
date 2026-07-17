/* AppShell — the structural frame from CANON.md "LAYOUT".
   Regions were empty by design at Step 1.1 (skeleton only). Later steps
   mount content INTO these regions; they do not restructure them:
     - TopBar (60px): logo, Search, Templates, Quick Reference, gear, bell, help, user chip
     - LeftNav (200px): nav items, Trash, System Status, logout
     - Center (flex): conversation, input, state pills, dropdowns, TRANSLATE & ASK
     - RightSidebar (300px): Quick Tools grid + accordion stack

   Step 1.3 mounts placeholder Smoked Glass / Blue Marble demo content —
   the "demo shell" deliverable proving marble continuity across every
   gutter and behind every card. Real feature components (Steps 1.5+)
   replace this demo content; they do not need to touch the app-layer
   wrapper or the grid itself. */

export function AppShell() {
  return (
    <div className="app-shell app-layer">
      <header className="topbar" aria-label="Top bar" data-testid="topbar">
        <div className="surface-smoked-glass" style={{ padding: "8px 16px", margin: "12px 16px" }}>
          DIVERGENCE.AI — marble demo (Step 1.3)
        </div>
      </header>
      <nav className="col-left" aria-label="Primary navigation" data-testid="col-left">
        <div className="surface-smoked-glass" style={{ padding: "var(--space-card-padding)", margin: "16px" }}>
          Left nav demo card
        </div>
      </nav>
      <main className="col-center" data-testid="col-center">
        <div className="surface-smoked-glass" style={{ padding: "var(--space-card-padding)", margin: "16px" }}>
          Center demo card — resize the window; veins should not stretch.
        </div>
        <button type="button" className="surface-blue-marble" style={{ margin: "0 16px" }}>
          TRANSLATE &amp; ASK (demo)
        </button>
      </main>
      <aside className="col-right" aria-label="Sidebar panels" data-testid="col-right">
        <div className="surface-smoked-glass" style={{ padding: "var(--space-card-padding)", margin: "16px" }}>
          Right sidebar demo card
        </div>
      </aside>
    </div>
  );
}
