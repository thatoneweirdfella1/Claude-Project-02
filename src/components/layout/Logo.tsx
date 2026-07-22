import "./Logo.css";

/* DIVERGENCE.AI logo, CANON.md "THE LOGO": a clean aurora-mix brain
   outline with synapses, "DIVERGENCE" white and "AI" in the aurora mix,
   top-left of the top bar. Nothing else inside the brain.

   The synapse-firing animation is subtle by construction (slow, small
   opacity range, staggered) and — per CANON's "No excessive
   auto-animation" sensory hard rule — fully disabled under
   prefers-reduced-motion, where the logo renders static. See Logo.css. */

const SYNAPSES = [
  { cx: 14, cy: 15, delay: "0s" },
  { cx: 26, cy: 16, delay: "0.8s" },
  { cx: 16, cy: 23, delay: "1.6s" },
  { cx: 25, cy: 24, delay: "2.4s" },
  { cx: 20, cy: 19, delay: "1.2s" },
];

export function Logo() {
  return (
    <span className="logo" data-testid="logo">
      <svg
        className="logo-mark"
        viewBox="0 0 40 40"
        role="img"
        aria-label="DIVERGENCE.AI"
        focusable="false"
      >
        <defs>
          <linearGradient id="logo-aurora" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--logo-aurora-green)" />
            <stop offset="50%" stopColor="var(--logo-aurora-purple)" />
            <stop offset="100%" stopColor="var(--logo-aurora-pink)" />
          </linearGradient>
        </defs>

        {/* Brain outline */}
        <path
          className="logo-brain"
          d="M20 6 C15 5 11 7 10 11 C6 12 5 16 7 19 C5 22 8 26 12 26
             C13 29 18 29 20 27 C22 29 27 29 28 26 C32 26 35 22 33 19
             C35 16 34 12 30 11 C29 7 25 5 20 6 Z"
        />
        {/* Central fissure */}
        <path className="logo-brain" d="M20 6 C19 12 21 18 20 27" />

        {/* Synapse connections (thin, static) */}
        <g className="logo-synapse-links">
          <path d="M14 15 L20 19 L26 16" />
          <path d="M16 23 L20 19 L25 24" />
        </g>

        {/* Synapse nodes (pulsing) */}
        <g className="logo-synapses">
          {SYNAPSES.map((s) => (
            <circle
              key={`${s.cx}-${s.cy}`}
              className="logo-synapse"
              cx={s.cx}
              cy={s.cy}
              r="1.6"
              style={{ animationDelay: s.delay }}
            />
          ))}
        </g>
      </svg>

      <span className="logo-wordmark">
        <span className="logo-word-divergence">DIVERGENCE</span>
        <span className="logo-word-ai">AI</span>
      </span>
    </span>
  );
}
