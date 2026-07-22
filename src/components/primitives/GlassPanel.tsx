import type { HTMLAttributes } from "react";

/* Same Smoked Glass material as GlassCard, panel-sized: fills its
   container (sidebars, modals) instead of sitting inline. */

export function GlassPanel({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`surface-smoked-glass primitive-glass-panel ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
