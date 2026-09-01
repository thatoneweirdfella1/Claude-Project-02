import { useEffect, useState } from "react";
import { QuickToolsGrid } from "../quicktools";
import { AccordionStack } from "./AccordionStack";
import { LeftNav } from "./LeftNav";
import { TopBar } from "./TopBar";
import { useThemeEffect } from "./useThemeEffect";
import { useDesignLayoutEffect } from "./useDesignLayoutEffect";
import { ScreenRouter } from "./ScreenRouter";
import { ApprovedKeyboardShortcutsModal } from "../ApprovedKeyboardShortcutsModal";
import { useApprovedKeyboardShortcuts } from "../../keyboard/useApprovedKeyboardShortcuts";
import { CostConfirm } from "../credits";
import { OperatorWorkspaceBar } from "../credits/OperatorWorkspaceBar";
import { DevAdminPanel } from "../settings/DevAdminPanel";
import { LocalDryRunPanel } from "../settings/LocalDryRunPanel";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import { destinationLabel } from "../../services/providerNeutral";
import { computeRouteReadiness, type RouteReadiness } from "../../services/routeReadiness";
import { VisibilityMenu } from "../visibility/VisibilityMenu";
import { AppErrorBoundary } from "./AppErrorBoundary";

function FrozenReferenceConnectors() {
  return <svg className="frozen-connectors" viewBox="0 0 1600 1024" preserveAspectRatio="none" aria-hidden="true" data-testid="frozen-connectors">
    <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M1092 261 H1150 V188 H1212" /><path d="M1092 454 H1163 V374 H1212" />
      <path d="M1092 454 H1163 V589 H1212" /><path d="M1092 923 H1163 V589" /><path d="M1163 589 V809 H1212" />
    </g>
    <g fill="var(--frozen-node-fill)" stroke="currentColor" strokeWidth="2">
      <circle cx="1212" cy="188" r="4" /><circle cx="1212" cy="374" r="4" /><circle cx="1212" cy="589" r="4" /><circle cx="1212" cy="809" r="4" />
    </g>
  </svg>;
}

function RouteReadinessSummary() {
  const destination = useSessionStore((s) => s.destination);
  const [readiness, setReadiness] = useState<RouteReadiness | null>(null);
  useEffect(() => {
    let active = true;
    setReadiness(null);
    void computeRouteReadiness(destination).then((next) => { if (active) setReadiness(next); });
    return () => { active = false; };
  }, [destination.providerId, destination.modelId]);
  return <div className="right-rail-helpful surface-smoked-glass" data-testid="route-readiness-summary">
    <strong>{readiness ? readiness.label : `Checking ${destinationLabel(destination)}…`}</strong>
    <span>{readiness?.verified ? "Exact provider, model, route, authentication, and health verified." : "Local preparation and manual handoff remain available without a provider call."}</span>
  </div>;
}

export function AppShell() {
  const currentScreen = useSessionStore((s) => s.currentScreen);
  const quickTools = useAccountStore((s) => s.visibility.quickTools);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [rightRailPanel, setRightRailPanel] = useState<string | null>(null);
  const canvasScaleForViewport = () => {
    if (typeof window === "undefined") return 0.72;
    const edgeGutter = 48;
    const widthScale = (window.innerWidth - edgeGutter * 2) / 1600;
    const heightScale = (window.innerHeight - edgeGutter * 2) / 1024;
    return Math.max(0.1, Math.min(0.72, widthScale, heightScale));
  };
  const [canvasScale, setCanvasScale] = useState(canvasScaleForViewport);
  useThemeEffect(); useDesignLayoutEffect(); useApprovedKeyboardShortcuts();
  useEffect(() => {
    const resize = () => setCanvasScale(canvasScaleForViewport());
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, []);
  useEffect(() => {
    const updatePanel = (event: Event) => setRightRailPanel((event as CustomEvent<string | null>).detail ?? null);
    window.addEventListener("divergence:right-rail-panel", updatePanel);
    return () => window.removeEventListener("divergence:right-rail-panel", updatePanel);
  }, []);
  useEffect(() => {
    const openShortcuts = () => setShowShortcuts(true);
    window.addEventListener("divergence:open-shortcuts", openShortcuts);
    return () => window.removeEventListener("divergence:open-shortcuts", openShortcuts);
  }, []);

  return <>
    <div className="fixed-canvas-stage">
    <div className="app-shell app-layer" style={{ transform: `scale(${canvasScale})` }} data-layout-authority="frozen-reference-1600x1024">
      <header className="topbar" aria-label="Top bar" data-testid="topbar"><TopBar /></header>
      <nav className="col-left" aria-label="Primary navigation" data-testid="col-left"><LeftNav /></nav>
      <main className="col-center" data-testid="col-center"><div className="frozen-center-stack"><OperatorWorkspaceBar /><AppErrorBoundary resetKey={currentScreen}><ScreenRouter /></AppErrorBoundary><LocalDryRunPanel /><DevAdminPanel /></div></main>
      <aside className="col-right" aria-label="Sidebar panels" data-testid="col-right">
        {rightRailPanel && <section className="right-rail-reference surface-smoked-glass" aria-label={rightRailPanel.startsWith("help:") ? "Help" : "Quick Reference"}>
          <header><strong>{rightRailPanel.startsWith("help:") ? "Help" : "Quick Reference"}</strong><button type="button" aria-label="Close reference" onClick={() => setRightRailPanel(null)}>×</button></header>
          <p>{currentScreen === "translate" ? "Write naturally, then use Send. Ctrl/Cmd + Enter uses the same Send action. Add Context keeps source material attached to the request." : `You are in ${currentScreen.replaceAll("-", " ")}. Use the visible tabs and controls; unavailable external actions say so before doing anything.`}</p>
          <small>Ctrl/Cmd + K opens Search. Press ? outside a text field to reopen this reference.</small>
        </section>}
        <RouteReadinessSummary />
        <VisibilityMenu />
        {quickTools && <QuickToolsGrid />}
        <AccordionStack />
      </aside>
      <FrozenReferenceConnectors />
    </div>
    </div>
    <ApprovedKeyboardShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    <CostConfirm />
  </>;
}
