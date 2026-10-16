import "./Logo.css";

/* Frozen gold brain mark reused by the composer, assistant avatar, Send
   button and navigation. Saved layout preferences do not change this asset. */

export interface BrainMarkProps {
  /** Pixel height; width follows the asset's own aspect ratio. Default
      matches the smaller icon usages (composer label, nav item). */
  size?: number;
  className?: string;
}

export function BrainMark({ size = 18, className = "" }: BrainMarkProps) {
  return (
    <img
      className={`brain-mark ${className}`.trim()}
      src="/logo-mark-gold.png"
      alt="Divergence.AI"
      style={{ height: size }}
    />
  );
}
