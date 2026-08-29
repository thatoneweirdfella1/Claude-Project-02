import type { ButtonHTMLAttributes } from "react";

/* Secondary button. Same Dark Grey Marble material as GlassCard — no
   marble texture, per MATERIALS.md ("Medium Gray Marble ... primary
   buttons only"). Class/component name predates an operator-directed
   grey override, this session; see MATERIALS.md THE THREE SURFACES. */

export function GlassButton({
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`surface-smoked-glass primitive-glass-button ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
