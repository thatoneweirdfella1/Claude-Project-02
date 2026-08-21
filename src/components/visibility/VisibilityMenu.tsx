import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Pin, Settings } from "lucide-react";
import { GlassButton } from "../primitives";
import { useDismissableLayer } from "../../keyboard";
import { DEFAULT_RIGHT_RAIL_ORDER, DEFAULT_VISIBILITY, useAccountStore } from "../../stores/accountStore";
import type { RightRailPanelKey, ThemePreference, VisibilitySettings } from "../../stores/types";

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
   TechniqueDropdown, QuickActionsRow's More menu).

   VISUAL-AUDIT V5 (fixed this session): icon-only now (lucide Settings, no
   visible "Settings" text) — matching V3, where the gear/bell/help trio in
   the top-bar right are all icon-only square buttons, unlike Search/
   Templates/Quick Reference which keep their text labels. aria-label
   already carries the accessible name either way.

   VISUAL-AUDIT V16 (fixed this session): CANON Feature 12's own text is
   explicit — "A gear dropdown (top right) with theme toggle (Light / Dark /
   Auto) and 7 visibility checkboxes" — ONE dropdown, both controls, not two
   separate menus. The theme store field/resolver hook/light-theme CSS all
   already existed (a prior follow-up session), but nothing in the UI ever
   called setTheme — this was the last missing piece, not a new surface to
   invent a location for. Same radiogroup/radio ARIA pattern as RatingRow's
   star picker (the one other place this build needed an exclusive-choice
   button group).

   Design layouts (CLAUDE.md "Design layouts"): a second radiogroup, same
   pattern as Theme above — layout and theme are independent, so this is
   its own group, not folded into the Theme one. LAYOUT_OPTIONS is the one
   place a new operator-uploaded layout gets registered; everything else
   (tokens.css/marble.css's :root[data-layout="..."] rules, Logo.tsx's
   asset swap) reads accountStore.layout, not this list directly. */

const VISIBILITY_ROWS: { key: keyof VisibilitySettings; label: string }[] = [
  { key: "recentSessions", label: "Recent Sessions" },
  { key: "contextSnapshot", label: "Context Snapshot" },
  { key: "recentActivity", label: "Recent Activity" },
  { key: "tokenUsage", label: "Token Usage" },
  { key: "modelStatus", label: "Model Status" },
  { key: "quickTools", label: "Quick Tools" },
  { key: "activeSession", label: "Active Session" },
];

const THEME_OPTIONS: { key: ThemePreference; label: string }[] = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "auto", label: "Auto" },
];

export function VisibilityMenu() {
  const visibility = useAccountStore((s) => s.visibility);
  const setVisibility = useAccountStore((s) => s.setVisibility);
  const theme = useAccountStore((s) => s.theme);
  const setTheme = useAccountStore((s) => s.setTheme);
  const rightRailOrder = useAccountStore((s) => s.rightRailOrder);
  const rightRailPinned = useAccountStore((s) => s.rightRailPinned);
  const setRightRailPreferences = useAccountStore((s) => s.setRightRailPreferences);

  const [open, setOpen] = useState(false);
  const [draftVisibility, setDraftVisibility] = useState(visibility);
  const [draftOrder, setDraftOrder] = useState<RightRailPanelKey[]>(rightRailOrder);
  const [draftPinned, setDraftPinned] = useState<RightRailPanelKey | null>(rightRailPinned);
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

  useEffect(() => {
    if (!open) return;
    setDraftVisibility(visibility);
    setDraftOrder(rightRailOrder);
    setDraftPinned(rightRailPinned);
  }, [open, visibility, rightRailOrder, rightRailPinned]);

  function toggle(key: keyof VisibilitySettings): void {
    // A generic single-key patch object doesn't narrow cleanly against
    // VisibilitySettings' fixed named fields (vs. an index-signature type
    // like SavedVariables, where this pattern needs no assertion elsewhere
    // in this codebase) — every field here is boolean and `key` is proven
    // to be one of VisibilitySettings' own keys, so this is a precise,
    // safe assertion, not an escape hatch.
    const patch = { [key]: !draftVisibility[key] } as Partial<VisibilitySettings>;
    setDraftVisibility((current) => ({ ...current, ...patch }));
  }

  function move(key: RightRailPanelKey, amount: -1 | 1) {
    setDraftOrder((current) => {
      const from = current.indexOf(key);
      const to = from + amount;
      if (from < 0 || to < 0 || to >= current.length) return current;
      const next = [...current];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });
  }

  function restoreRecommended() {
    setDraftVisibility({ ...DEFAULT_VISIBILITY });
    setDraftOrder([...DEFAULT_RIGHT_RAIL_ORDER]);
    setDraftPinned("contextSnapshot");
  }

  function apply() {
    setVisibility(draftVisibility);
    setRightRailPreferences(draftOrder, draftPinned);
    setOpen(false);
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
        <Settings size={16} aria-hidden="true" />
      </GlassButton>

      {open && (
        <div
          className="surface-smoked-glass visibility-menu__popover"
          role="menu"
          data-testid="visibility-popover"
        >
          <p className="visibility-menu__title">Theme</p>
          <div
            className="visibility-menu__theme-row"
            role="radiogroup"
            aria-label="Theme"
            data-testid="theme-toggle"
          >
            {THEME_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={theme === key}
                aria-label={label}
                className={`visibility-menu__theme-option ${theme === key ? "visibility-menu__theme-option--active" : ""}`}
                onClick={() => setTheme(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="visibility-menu__title">Right rail</p>
          {draftOrder.map((key, index) => {
            const label = VISIBILITY_ROWS.find((row) => row.key === key)?.label ?? key;
            return <div key={key} className="visibility-menu__rail-row">
              <label className="visibility-menu__row"><input type="checkbox" checked={draftVisibility[key]} onChange={() => toggle(key)} />{label}</label>
              <button type="button" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => move(key, -1)}><ChevronUp size={14} /></button>
              <button type="button" aria-label={`Move ${label} down`} disabled={index === draftOrder.length - 1} onClick={() => move(key, 1)}><ChevronDown size={14} /></button>
              <button type="button" className={draftPinned === key ? "is-pinned" : ""} aria-label={`${draftPinned === key ? "Unpin" : "Pin"} ${label}`} onClick={() => setDraftPinned(draftPinned === key ? null : key)}><Pin size={14} fill={draftPinned === key ? "currentColor" : "none"} /></button>
            </div>;
          })}
          <label className="visibility-menu__row visibility-menu__quick-tools"><input type="checkbox" checked={draftVisibility.quickTools} onChange={() => toggle("quickTools")} />Quick Tools</label>
          <button type="button" className="visibility-menu__reset" onClick={restoreRecommended}>Restore recommended</button>
          <div className="visibility-menu__actions"><button type="button" onClick={() => setOpen(false)}>Cancel</button><button type="button" className="is-primary" onClick={apply}>Apply</button></div>
        </div>
      )}
    </div>
  );
}
