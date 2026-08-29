import type { HTMLAttributes } from "react";

/* Dark Grey Marble (was Smoked Glass), card-sized. Material comes from
   .surface-smoked-glass (marble.css, Step 1.3) — never opaque, never its
   own marble. Class name predates an operator-directed grey override,
   this session; see MATERIALS.md THE THREE SURFACES. */

export function GlassCard({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`surface-smoked-glass primitive-glass-card ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
