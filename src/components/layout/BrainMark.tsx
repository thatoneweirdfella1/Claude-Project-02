import { useAccountStore } from "../../stores/accountStore";
import "./Logo.css";

/* BrainMark — the same brand brain mark as the top-bar Logo, reused at
   small size wherever Divergence_AI_App_Screenshot_V3.png reuses it: the
   composer's "WHAT'S ON YOUR MIND?" label, the assistant message avatar,
   the TRANSLATE & ASK button, and the left-nav Translate item.

   REPLACED, operator-directed override, this session: now the same real
   asset as Logo.tsx (public/logo-mark.png), not a hand-rolled SVG copy of
   the old placeholder brain. A plain <img>, not an inline SVG, so there's
   no gradient-id-uniqueness concern to manage here (that was specific to
   the old inline-SVG-with-gradient approach — a raster <img> has no such
   issue no matter how many times it's rendered on one page).

   GOLD LAYOUT (CLAUDE.md "Design layouts"): swaps to the same
   logo-mark-gold.png recolor Logo.tsx uses, for every one of this mark's
   reuse spots — otherwise the composer label/avatar/TRANSLATE&ASK/nav
   item would stay the original palette while only the top-bar logo
   changed, reading as inconsistent rather than a real re-skin. */

export interface BrainMarkProps {
  /** Pixel height; width follows the asset's own aspect ratio. Default
      matches the smaller icon usages (composer label, nav item). */
  size?: number;
  className?: string;
}

export function BrainMark({ size = 18, className = "" }: BrainMarkProps) {
  const layout = useAccountStore((s) => s.layout);
  const markSrc = layout === "gold" ? "/logo-mark-gold.png" : "/logo-mark.png";

  return (
    <img
      className={`brain-mark ${className}`.trim()}
      src={markSrc}
      alt="Divergence.AI"
      style={{ height: size }}
    />
  );
}
