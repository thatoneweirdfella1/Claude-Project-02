import "./Logo.css";

/* Divergence.AI logo, top-left of the top bar.

   REPLACED, operator-directed override, this session: the hand-rolled
   brain-outline SVG + "DIVERGENCE"/"AI" (both uppercase) wordmark was a
   placeholder built at Step 1.6, before any real brand asset existed —
   CANON's "THE LOGO" text described it in words ("clean aurora-mix brain
   outline... 'DIVERGENCE' in white") because that's all there was to go on.
   DivergenceAILogo.png (added to the repo root this session) is the real
   asset: a detailed geometric/faceted brain mark in a blue-violet-magenta
   gradient, paired with "Divergence.AI" in mixed case, not all-caps. This
   also resolves VISUAL-AUDIT V6 ("logo mark is small and dim; wordmark
   case differs from V3") — V3 already showed mixed-case "Divergence.AI";
   this is the actual source asset that screenshot was drawn from.

   The icon (public/logo-mark.png) is a real PNG, extracted from the source
   file with true alpha transparency (see BUILD-LOG.md DECISIONS for the
   extraction method) — not redrawn as SVG paths, since the geometric
   line-art is too intricate to hand-author accurately. It renders
   correctly on any background, dark or light, unchanged by theme. The
   wordmark stays real text (not baked into the image), same reasoning as
   before: theme-aware color, no image scaling/accessibility loss. No
   synapse animation — the source asset doesn't have one (a static line
   mark, not the placeholder's animated dots), so there's nothing to port;
   also simplifies past CANON's "no excessive auto-animation" sensory rule
   with nothing to reduce-motion-guard in the first place. */

export function Logo() {
  return (
    <span className="logo" data-testid="logo">
      <img className="logo-mark" src="/logo-mark.png" alt="Divergence.AI" />

      <span className="logo-wordmark">
        <span className="logo-word-divergence">Divergence</span>
        <span className="logo-word-ai">.AI</span>
      </span>
    </span>
  );
}
