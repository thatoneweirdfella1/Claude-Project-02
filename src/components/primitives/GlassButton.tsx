import type { ButtonHTMLAttributes } from "react";

/* Secondary button. Same Smoked Glass material as GlassCard — no
   marble, per MATERIALS.md ("Blue Marble ... primary buttons only"). */

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
