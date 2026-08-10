import { CenterColumn } from "../pipeline";
import { LeftNav } from "./LeftNav";
import { TopBar } from "./TopBar";
import { RightSidebar } from "./RightSidebar";

/* AppShell — the structural frame from CANON.md "LAYOUT".
   - TopBar (60px): logo, Search, Templates, Quick Reference, gear, bell, help, user chip
   - LeftNav (240px): nav items with icons, Trash, System Status, logout
   - Center (flex): conversation workspace with input composer and messages
   - RightSidebar (300px): state detection pills, quick actions, quick tools grid, accordion stack */

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
        <CenterColumn />
      </main>
      <aside className="col-right" aria-label="Sidebar panels" data-testid="col-right">
        <RightSidebar />
      </aside>
    </div>
  );
}
