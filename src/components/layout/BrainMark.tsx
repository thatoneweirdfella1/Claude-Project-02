import "./Logo.css";

/* Always render the frozen gold brain asset, including when saved account
   data still selects the retired original layout. */

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
