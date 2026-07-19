import { useId } from "react";
import "./Logo.css";

/* BrainMark — the same aurora-gradient brain glyph as the top-bar Logo
   (Logo.tsx), extracted so it can be reused at small size wherever
   Divergence_AI_App_Screenshot_V3.png reuses it: the composer's "WHAT'S ON
   YOUR MIND?" label, the assistant message avatar, the TRANSLATE & ASK
   button, and the left-nav Translate item all show this exact icon in V3,
   not a generic brain glyph — the brand mark doubles as "AI is doing the
   thinking here," consistently, everywhere that's true.

   Own gradient id via useId(), not a hardcoded "logo-aurora" — this renders
   many times per page (one per assistant message), and SVG element ids
   must be unique in the document; reusing Logo.tsx's literal id would only
   work for the first instance and silently break every other one. */

export interface BrainMarkProps {
  /** Pixel size, both width and height (square viewBox). Default matches
      the smaller icon usages (composer label, nav item); the top-bar Logo
      itself stays on its own literal 32px markup, unchanged. */
  size?: number;
  className?: string;
}

export function BrainMark({ size = 18, className = "" }: BrainMarkProps) {
  const gradientId = useId();

  return (
    <svg
      className={`brain-mark ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label="Divergence.AI"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--logo-aurora-green)" />
          <stop offset="50%" stopColor="var(--logo-aurora-purple)" />
          <stop offset="100%" stopColor="var(--logo-aurora-pink)" />
        </linearGradient>
      </defs>

      <path
        className="brain-mark__path"
        style={{ stroke: `url(#${gradientId})` }}
        d="M20 6 C15 5 11 7 10 11 C6 12 5 16 7 19 C5 22 8 26 12 26
           C13 29 18 29 20 27 C22 29 27 29 28 26 C32 26 35 22 33 19
           C35 16 34 12 30 11 C29 7 25 5 20 6 Z"
      />
      <path
        className="brain-mark__path"
        style={{ stroke: `url(#${gradientId})` }}
        d="M20 6 C19 12 21 18 20 27"
      />
    </svg>
  );
}
