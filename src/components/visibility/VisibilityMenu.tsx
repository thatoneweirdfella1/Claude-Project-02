import { useEffect, useRef, useState } from "react";
import { GlassButton } from "../primitives";
import { useDismissableLayer } from "../../keyboard";
import { DEFAULT_VISIBILITY, useAccountStore } from "../../stores/accountStore";
import type { VisibilitySettings } from "../../stores/types";

/* Visibility Toggle (Step 9.4) — CANON Feature 12: the gear dropdown (top
   right) with 7 checkboxes (Recent Sessions/Context Snapshot/Recent
   Activity/Token Usage/Model Status ON; Quick Tools/Active Session OFF)
   plus Reset to defaults. Reads/writes accountStore.visibility — Step 1.7
   already built the field, DEFAULT_VISIBILITY, and setVisibility(patch);
   this step's whole job is the real UI plus actually gating AppShell's
   panels on it (see AppShell.tsx).

   TopBar's "Settings" button (Step 1.5, inert placeholder) IS the gear —
   this component replaces it with a real trigger + popover, same
   open/outside-click/Escape-dismiss mechanics every other popover in this
   build already duplicates independently (AttachContextControls,
   TechniqueDropdown, QuickActionsRow's More menu). */

const VISIBILITY_ROWS: { key: keyof VisibilitySettings; label: string }[] = [
  { key: "recentSessions", label: "Recent Sessions" },
  { key: "contextSnapshot", label: "Context Snapshot" },
  { key: "recentActivity", label: "Recent Activity" },
  { key: "tokenUsage", label: "Token Usage" },
  { key: "modelStatus", label: "Model Status" },
  { key: "quickTools", label: "Quick Tools" },
  { key: "activeSession", label: "Active Session" },
];

export function VisibilityMenu() {
  const visibility = useAccountStore((s) => s.visibility);
  const setVisibility = useAccountStore((s) => s.setVisibility);

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useDismissableLayer(open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function toggle(key: keyof VisibilitySettings): void {
    // A generic single-key patch object doesn't narrow cleanly against
    // VisibilitySettings' fixed named fields (vs. an index-signature type
    // like SavedVariables, where this pattern needs no assertion elsewhere
    // in this codebase) — every field here is boolean and `key` is proven
    // to be one of VisibilitySettings' own keys, so this is a precise,
    // safe assertion, not an escape hatch.
    const patch = { [key]: !visibility[key] } as Partial<VisibilitySettings>;
    setVisibility(patch);
  }

  return (
    <div ref={rootRef} className="visibility-menu">
      <GlassButton
        aria-label="Settings"
        aria-expanded={open}
        aria-haspopup="menu"
        data-testid="visibility-gear"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span aria-hidden="true">⚙</span> Settings
      </GlassButton>

      {open && (
        <div className="visibility-menu__popover" role="menu" data-testid="visibility-popover">
          <p className="visibility-menu__title">Sidebar Visibility</p>
          {VISIBILITY_ROWS.map(({ key, label }) => (
            <label key={key} className="visibility-menu__row">
              <input type="checkbox" checked={visibility[key]} onChange={() => toggle(key)} />
              {label}
            </label>
          ))}
          <button
            type="button"
            className="visibility-menu__reset"
            onClick={() => setVisibility(DEFAULT_VISIBILITY)}
          >
            Reset to defaults
          </button>
        </div>
      )}
    </div>
  );
}
