import { useEffect, useState } from "react";
import { QuickToolsGrid } from "../quicktools";
import { AccordionStack } from "./AccordionStack";
import { LeftNav } from "./LeftNav";
import { TopBar } from "./TopBar";
import { useThemeEffect } from "./useThemeEffect";
import { useDesignLayoutEffect } from "./useDesignLayoutEffect";
import { ScreenRouter } from "./ScreenRouter";
import { KeyboardShortcutsModal } from "../KeyboardShortcutsModal";
import { useKeyboardShortcuts } from "../../keyboard/useKeyboardShortcuts";
import { CostConfirm } from "../credits";
import { useAccountStore } from "../../stores/accountStore";
import { useSessionStore } from "../../stores/sessionStore";
import { destinationLabel } from "../../services/providerNeutral";
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

export function AppShell() {
  const currentScreen = useSessionStore((s) => s.currentScreen);
  const destination = useSessionStore((s) => s.destination);
  const quickTools = useAccountStore((s) => s.visibility.quickTools);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const canvasScaleForViewport = () => {
    if (typeof window === "undefined") return 0.72;
    const edgeGutter = 48;
    const widthScale = (window.innerWidth - edgeGutter * 2) / 1600;
    const heightScale = (window.innerHeight - edgeGutter * 2) / 1024;
    return Math.max(0.1, Math.min(0.72, widthScale, heightScale));
  };
  const [canvasScale, setCanvasScale] = useState(canvasScaleForViewport);
  useThemeEffect(); useDesignLayoutEffect(); useKeyboardShortcuts(() => setShowShortcuts(true));
  useEffect(() => {
    const resize = () => setCanvasScale(canvasScaleForViewport());
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, []);

  return <>
    <div className="fixed-canvas-stage">
    <div className="app-shell app-layer" style={{ transform: `scale(${canvasScale})` }} data-layout-authority="frozen-reference-1600x1024">
      <header className="topbar" aria-label="Top bar" data-testid="topbar"><TopBar /></header>
      <nav className="col-left" aria-label="Primary navigation" data-testid="col-left"><LeftNav /></nav>
      <main className="col-center" data-testid="col-center"><div className="frozen-center-stack"><AppErrorBoundary resetKey={currentScreen}><ScreenRouter /></AppErrorBoundary></div></main>
      <aside className="col-right" aria-label="Sidebar panels" data-testid="col-right">
        <div className="right-rail-helpful surface-smoked-glass"><strong>Ready for {destinationLabel(destination)}</strong><span>Local preparation uses no Divergence credits.</span></div>
        <VisibilityMenu />
        {quickTools && <QuickToolsGrid />}
        <AccordionStack />
      </aside>
      <FrozenReferenceConnectors />
    </div>
    </div>
    <KeyboardShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    <CostConfirm />
  </>;
}


