import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes } from "react";

interface PillOwnProps {
  /** A CSS color value — pass a semantic token, e.g. "var(--state-emotion)". */
  color: string;
}

type PillProps = PillOwnProps &
  (
    | ({ onClick: NonNullable<ButtonHTMLAttributes<HTMLButtonElement>["onClick"]> } & Omit<
        ButtonHTMLAttributes<HTMLButtonElement>,
        "color" | "style"
      >)
    | ({ onClick?: undefined } & Omit<HTMLAttributes<HTMLSpanElement>, "color" | "style">)
  );

/* Generic colored-outline badge. Color is caller-supplied (a semantic
   token, not hardcoded here) so this stays reusable beyond state pills
   — Step 6.3 (State pills UI) is what gives it emotion/RSD/interest/
   cognitive-mode meaning. Renders as a real <button> (focusable, in
   the tab order) only when interactive (onClick supplied); otherwise a
   plain <span> so decorative pills don't steal keyboard focus. */

export function Pill({ color, className = "", children, onClick, ...rest }: PillProps) {
  const style = { "--pill-color": color } as CSSProperties;
  const classes = `primitive-pill ${className}`.trim();

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        style={style}
        onClick={onClick}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    );
  }

  return (
    <span className={classes} style={style} {...(rest as HTMLAttributes<HTMLSpanElement>)}>
      {children}
    </span>
  );
}
