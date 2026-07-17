/* AppShell — the structural frame from CANON.md "LAYOUT".
   Empty by design (Step 1.1 = skeleton only).
   Later steps mount content INTO these regions; they do not restructure them:
     - TopBar (60px): logo, Search, Templates, Quick Reference, gear, bell, help, user chip
     - LeftNav (200px): nav items, Trash, System Status, logout
     - Center (flex): conversation, input, state pills, dropdowns, TRANSLATE & ASK
     - RightSidebar (300px): Quick Tools grid + accordion stack */

export function AppShell() {
  return (
    <div className="app-shell">
      <header className="topbar" aria-label="Top bar" data-testid="topbar" />
      <nav className="col-left" aria-label="Primary navigation" data-testid="col-left" />
      <main className="col-center" data-testid="col-center" />
      <aside className="col-right" aria-label="Sidebar panels" data-testid="col-right" />
    </div>
  );
}
