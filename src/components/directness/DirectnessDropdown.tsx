import { useEffect, useRef, useState } from "react";
import { isDirectnessLevel } from "../../services/directness";
import { useDismissableLayer } from "../../keyboard";
import { useSessionStore } from "../../stores/sessionStore";
import { DIRECTNESS_DROPDOWN_OPTIONS } from "./directnessOptions";

export function DirectnessDropdown() {
  const directness = useSessionStore((s) => s.directness);
  const setDirectness = useSessionStore((s) => s.setDirectness);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const selected = DIRECTNESS_DROPDOWN_OPTIONS.find((option) => Number(option.value) === directness)
    ?? DIRECTNESS_DROPDOWN_OPTIONS[1];

  useDismissableLayer(open, () => setOpen(false));

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function choose(value: string) {
    const next = Number(value);
    if (!isDirectnessLevel(next)) return;
    setDirectness(next);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function moveFocus(direction: 1 | -1) {
    const options = [...(panelRef.current?.querySelectorAll<HTMLButtonElement>("[role=radio]") ?? [])];
    if (!options.length) return;
    const current = options.indexOf(document.activeElement as HTMLButtonElement);
    options[(current + direction + options.length) % options.length]?.focus();
  }

  return (
    <div className="directness-field">
      <span id="directness-dropdown-label" className="directness-field__label">
        Directness
      </span>
      <button
        ref={triggerRef}
        type="button"
        className="surface-smoked-glass directness-field__trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby="directness-dropdown-label"
        title={selected.preview}
        onClick={() => setOpen((current) => !current)}
      >
        {selected.label}
      </button>
      {open && <div
        ref={panelRef}
        className="surface-smoked-glass directness-popover"
        role="radiogroup"
        aria-label="Directness"
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); moveFocus(1); }
          if (event.key === "ArrowUp") { event.preventDefault(); moveFocus(-1); }
        }}
      >
        {DIRECTNESS_DROPDOWN_OPTIONS.map((option) => {
          const checked = Number(option.value) === directness;
          return <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            className={`directness-popover__option ${checked ? "is-selected" : ""}`}
            onClick={() => choose(option.value)}
          >
            <span aria-hidden="true">{checked ? "●" : "○"}</span>
            <span><strong>{option.label}</strong><small>{option.preview}</small></span>
          </button>;
        })}
      </div>}
    </div>
  );
}
