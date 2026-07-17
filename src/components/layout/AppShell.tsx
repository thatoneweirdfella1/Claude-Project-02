import { BlueMarbleButton, Dropdown, GlassButton, GlassCard, GlassPanel, Pill } from "../primitives";

/* AppShell — the structural frame from CANON.md "LAYOUT".
   Regions were empty by design at Step 1.1 (skeleton only). Later steps
   mount content INTO these regions; they do not restructure them:
     - TopBar (60px): logo, Search, Templates, Quick Reference, gear, bell, help, user chip
     - LeftNav (200px): nav items, Trash, System Status, logout
     - Center (flex): conversation, input, state pills, dropdowns, TRANSLATE & ASK
     - RightSidebar (300px): Quick Tools grid + accordion stack

   Content below is a demo shell, not real feature UI: Step 1.3 proved
   marble continuity with raw surface-* divs; Step 1.4 replaces those
   with the real primitive library (GlassCard, GlassPanel,
   BlueMarbleButton, GlassButton, Dropdown, Pill) so this doubles as
   "a page rendering every primitive over the slab" against the
   screenshot. Real feature components (Steps 1.5+) replace this demo
   content; they do not need to touch the app-layer wrapper or the
   grid itself. */

const DEMO_TECHNIQUES = [
  { value: "socratic", label: "Socratic" },
  { value: "step-by-step", label: "Step-by-step" },
  { value: "auto", label: "Auto-detect" },
];

export function AppShell() {
  return (
    <div className="app-shell app-layer">
      <header className="topbar" aria-label="Top bar" data-testid="topbar">
        <GlassCard style={{ margin: "12px 16px", padding: "8px 16px" }}>
          DIVERGENCE.AI — primitive library demo (Step 1.4)
        </GlassCard>
      </header>
      <nav className="col-left" aria-label="Primary navigation" data-testid="col-left">
        <GlassPanel style={{ margin: "16px" }}>
          <span>Left nav demo (GlassPanel)</span>
          <GlassButton>Secondary action</GlassButton>
        </GlassPanel>
      </nav>
      <main className="col-center" data-testid="col-center">
        <GlassCard style={{ margin: "16px" }}>
          Center demo card (GlassCard) — resize the window; veins should not stretch.
          <div style={{ display: "flex", gap: "12px", marginTop: "16px", flexWrap: "wrap" }}>
            <Pill color="var(--state-emotion)">Emotion: Overwhelmed</Pill>
            <Pill color="var(--state-rsd)">RSD: High</Pill>
            <Pill color="var(--state-interest)">Interest: High</Pill>
            <Pill color="var(--state-cognitive)">Cognitive Mode: Analytical</Pill>
          </div>
          <div style={{ marginTop: "16px", maxWidth: "220px" }}>
            <Dropdown options={DEMO_TECHNIQUES} defaultValue="socratic" aria-label="Technique (demo)" />
          </div>
        </GlassCard>
        <BlueMarbleButton style={{ margin: "0 16px" }}>TRANSLATE &amp; ASK (demo)</BlueMarbleButton>
      </main>
      <aside className="col-right" aria-label="Sidebar panels" data-testid="col-right">
        <GlassPanel style={{ margin: "16px" }}>Right sidebar demo (GlassPanel)</GlassPanel>
      </aside>
    </div>
  );
}
