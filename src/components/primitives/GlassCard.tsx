import type { HTMLAttributes } from "react";

/* Smoked Glass, card-sized. Material comes from .surface-smoked-glass
   (marble.css, Step 1.3) — never opaque, never its own marble. */

export function GlassCard({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`surface-smoked-glass primitive-glass-card ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
