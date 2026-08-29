import "./Logo.css";

export function Logo() {
  return (
    <span className="logo" data-testid="logo" aria-label="Divergence.AI — ADHD-to-AI Translator">
      <img className="logo-mark" src="/logo-mark-gold.png" alt="" aria-hidden="true" />
      <span className="logo-copy">
        <span className="logo-wordmark">
          <span className="logo-word-divergence">Divergence</span>
          <span className="logo-word-ai">.AI</span>
        </span>
        <span className="logo-tagline">ADHD-to-AI Translator</span>
      </span>
    </span>
  );
}
