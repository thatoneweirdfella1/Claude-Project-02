import type { ButtonHTMLAttributes } from "react";

/* Primary button. Material comes from .surface-blue-marble (marble.css,
   Step 1.3) — the one surface that samples marble texture directly,
   from the same slab coordinates as the background. Do not add a
   second marble-sampling surface; see MARBLE-CONTRACT.md.
   Note: despite the class/component name, the base color is Medium Gray
   Marble as of an operator-directed override, this session — see
   MATERIALS.md THE THREE SURFACES and tokens.css. Name kept to avoid a
   large mechanical rename across every consumer in the same change;
   logged as PARKED in BUILD-LOG.md. */

export function BlueMarbleButton({
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={`surface-blue-marble ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
