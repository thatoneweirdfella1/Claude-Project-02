import { useEffect, useRef, useState, type ReactNode } from "react";
import { useDismissableLayer } from "../../keyboard";
import { RoutingSubCard, TechniquesSubCard, useLatestTelemetry } from "../transparency";
import { LoadTemplateMenu } from "../session";
import { useSessionStore } from "../../stores/sessionStore";

/* QUICK TOOLS grid (Step 9.6) — CANON Feature 12: a 2x3 grid (Router,
   Techniques, Prompt Library, Variables, Checkpoints, Dashboard), hidden by
   default. AppShell.tsx already gates this whole region on
   accountStore.visibility.quickTools (Step 9.4); this component is only
   ever mounted when that's true.

   Each tile's click behavior is CANON's own inline text for it, read
   verbatim, not reinvented:
     - Router: view detailed routing decision
     - Techniques: view applied techniques in detail
     - Prompt Library: save/load prompt templates
     - Variables: manage context variables
     - Checkpoints: save/restore conversation states
     - Dashboard: view session statistics — same destination as the
       left-nav Dashboard item (LEFT NAVIGATION)

   Router/Techniques reuse the Step 8.2 Transparency sub-cards directly
   (RoutingSubCard/TechniquesSubCard, fed by the same useLatestTelemetry())
   — a second READ of the same data through a shortcut, not a second
   derivation of it. Prompt Library reuses LoadTemplateMenu (Step 9.2)
   wholesale via its renderTrigger prop — the exact "one screen not two"
   precedent CANON states explicitly for Dashboard, applied here since
   Prompt Library IS Load Template's own feature under Feature 12's name
   for it. Variables is a small new popover over session.variables (Step
   1.7/7.4's existing setSessionVariable/removeSessionVariable) — a second
   entry point to the same store data, not a second variables concept.

   Checkpoints has no built feature anywhere in the 60-step build plan
   (checked: no step, in any phase, ever mentions "checkpoint") and
   Dashboard has no built screen yet either (Step 9.7 — left-nav routing —
   hasn't run). Both are honest "not yet available" tiles, matching the
   Integrations precedent (LEFT NAVIGATION: "decorative placeholder... do
   not invent behavior for it") rather than fabricated functionality. */

function Tile({
  icon,
  iconClassName,
  label,
  children,
}: {
  icon: string;
  /** Step 11.5 (VISUAL-AUDIT V2): per-tile icon color, matching V3's
      screenshot instead of the previous uniform cyan. Defaults to the
      original cyan so a tile that doesn't specify one is unchanged. */
  iconClassName?: string;
  label: string;
  children: ReactNode;
}) {
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

  return (
    <div ref={rootRef} className="quick-tools-tile">
      <button
        type="button"
        className="surface-smoked-glass quick-tools-tile__button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span aria-hidden="true" className={`quick-tools-tile__icon ${iconClassName ?? ""}`.trim()}>
          {icon}
        </span>
        <span className="quick-tools-tile__label">{label}</span>
      </button>
      {open && (
        <div className="surface-smoked-glass quick-tools-tile__popover" role="dialog">
          {children}
        </div>
      )}
    </div>
  );
}

function RouterTile() {
  const entry = useLatestTelemetry();
  return (
    <Tile icon="⇢" iconClassName="quick-tools-tile__icon--router" label="Router">
      {entry ? <RoutingSubCard entry={entry} /> : <p className="quick-tools-tile__empty">Nothing to show yet.</p>}
    </Tile>
  );
}

function TechniquesTile() {
  const entry = useLatestTelemetry();
  return (
    <Tile icon="✳" iconClassName="quick-tools-tile__icon--techniques" label="Techniques">
      {entry ? (
        <TechniquesSubCard entry={entry} />
      ) : (
        <p className="quick-tools-tile__empty">Nothing to show yet.</p>
      )}
    </Tile>
  );
}

function PromptLibraryTile() {
  return (
    <div className="quick-tools-tile">
      <LoadTemplateMenu
        renderTrigger={({ open, onClick }) => (
          <button
            type="button"
            className="surface-smoked-glass quick-tools-tile__button"
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={onClick}
          >
            <span aria-hidden="true" className="quick-tools-tile__icon quick-tools-tile__icon--library">
              ▤
            </span>
            <span className="quick-tools-tile__label">Prompt Library</span>
          </button>
        )}
      />
    </div>
  );
}

function VariablesTile() {
  const variables = useSessionStore((s) => s.variables);
  const setSessionVariable = useSessionStore((s) => s.setSessionVariable);
  const removeSessionVariable = useSessionStore((s) => s.removeSessionVariable);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");

  function addVariable(): void {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return;
    setSessionVariable(trimmedName, value);
    setName("");
    setValue("");
  }

  const entries = Object.entries(variables);

  return (
    <Tile icon="{ }" label="Variables">
      <p className="quick-tools-tile__title">Variables</p>
      {entries.length === 0 && <p className="quick-tools-tile__empty">No variables yet.</p>}
      {entries.map(([varName, varValue]) => (
        <div key={varName} className="quick-tools-tile__row">
          <span className="quick-tools-tile__row-text">
            ${varName}: {varValue || "(empty)"}
          </span>
          <button
            type="button"
            className="quick-tools-tile__row-remove"
            aria-label={`Remove variable ${varName}`}
            onClick={() => removeSessionVariable(varName)}
          >
            ×
          </button>
        </div>
      ))}
      <div className="quick-tools-tile__add-form">
        <input
          type="text"
          className="quick-tools-tile__add-input"
          placeholder="name"
          aria-label="New variable name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          type="text"
          className="quick-tools-tile__add-input"
          placeholder="value"
          aria-label="New variable value"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <button
          type="button"
          className="quick-tools-tile__add-button"
          disabled={name.trim().length === 0}
          onClick={addVariable}
        >
          Add
        </button>
      </div>
    </Tile>
  );
}

function NotYetAvailableTile({
  icon,
  iconClassName,
  label,
  description,
}: {
  icon: string;
  iconClassName?: string;
  label: string;
  description: string;
}) {
  return (
    <Tile icon={icon} iconClassName={iconClassName} label={label}>
      <p className="quick-tools-tile__empty">{description}</p>
    </Tile>
  );
}

export function QuickToolsGrid() {
  return (
    <div className="quick-tools">
      {/* VISUAL-AUDIT V3 (Step 11.5): V3 shows a cyan "QUICK TOOLS" header
          above the grid; a gear glyph sits at the header's right in the
          screenshot but no step in the build plan gives it behavior, so it's
          rendered decorative-only — same "don't invent behavior" posture
          already used for Checkpoints/Dashboard/Integrations. */}
      <div className="quick-tools__header">
        <p className="quick-tools__header-label">QUICK TOOLS</p>
        <span aria-hidden="true" className="quick-tools__header-gear">
          ⚙
        </span>
      </div>
      <div className="quick-tools-grid" data-testid="quick-tools-grid">
        <RouterTile />
        <TechniquesTile />
        <PromptLibraryTile />
        <VariablesTile />
        <NotYetAvailableTile
          icon="⛃"
          iconClassName="quick-tools-tile__icon--checkpoints"
          label="Checkpoints"
          description="Checkpoints (save/restore conversation states) isn't built yet."
        />
        <NotYetAvailableTile
          icon="▦"
          iconClassName="quick-tools-tile__icon--dashboard"
          label="Dashboard"
          description="Dashboard (session statistics) isn't built yet — the left-nav Dashboard item will link here once it is."
        />
      </div>
    </div>
  );
}
