import type { ButtonHTMLAttributes } from "react";

/* Primary button. Material comes from .surface-blue-marble (marble.css,
   Step 1.3) — the one surface that samples marble texture directly,
   from the same slab coordinates as the background. Do not add a
   second marble-sampling surface; see MARBLE-CONTRACT.md. */

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
