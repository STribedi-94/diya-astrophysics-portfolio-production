/**
 * Multi-wavelength research flow: signature illustration for the home page hero area.
 * A layered SVG showing optical light curve, spectral bands and radio waves converging.
 */
export function MultiWavelengthFlow() {
  return (
    <svg
      viewBox="0 0 600 400"
      className="h-auto w-full"
      role="img"
      aria-label="Illustration of multi-wavelength observational astrophysics"
    >
      <defs>
        <linearGradient id="spec" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.42 0.18 295)" />
          <stop offset="25%" stopColor="oklch(0.68 0.19 245)" />
          <stop offset="50%" stopColor="oklch(0.78 0.15 210)" />
          <stop offset="75%" stopColor="oklch(0.82 0.16 85)" />
          <stop offset="100%" stopColor="oklch(0.72 0.18 45)" />
        </linearGradient>
        <linearGradient id="curve" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.78 0.15 210 / 0.1)" />
          <stop offset="50%" stopColor="oklch(0.78 0.15 210)" />
          <stop offset="100%" stopColor="oklch(0.78 0.15 210 / 0.1)" />
        </linearGradient>
      </defs>

      {/* soft glow behind */}
      <circle cx="500" cy="200" r="120" fill="oklch(0.42 0.18 295 / 0.35)" />
      <circle cx="500" cy="200" r="60" fill="oklch(0.78 0.15 210 / 0.6)" />
      <circle cx="500" cy="200" r="20" fill="oklch(0.96 0.01 250)" />

      {/* radio waves — concentric arcs */}
      {[80, 130, 180, 230, 280].map((r, i) => (
        <circle
          key={r}
          cx="500"
          cy="200"
          r={r}
          fill="none"
          stroke="oklch(0.78 0.15 210)"
          strokeOpacity={0.25 - i * 0.03}
          strokeWidth="1"
        />
      ))}

      {/* light curve */}
      <path
        d="M 20 300 Q 70 260, 120 300 T 220 300 Q 260 220, 300 300 T 400 300"
        fill="none"
        stroke="url(#curve)"
        strokeWidth="2"
        className="anim-draw"
      />

      {/* spectral band */}
      <rect x="20" y="100" width="380" height="14" rx="7" fill="url(#spec)" opacity="0.8" />
      {/* spectral absorption lines */}
      {[60, 110, 170, 230, 260, 320, 360].map((x) => (
        <rect key={x} x={x} y="100" width="2" height="14" fill="oklch(0.14 0.04 265)" opacity="0.6" />
      ))}

      {/* labels */}
      <text x="20" y="92" fill="oklch(0.96 0.01 250 / 0.7)" fontSize="10" style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}>Spectrum</text>
      <text x="20" y="330" fill="oklch(0.96 0.01 250 / 0.7)" fontSize="10" style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}>Light curve</text>
      <text x="440" y="360" fill="oklch(0.96 0.01 250 / 0.7)" fontSize="10" style={{ letterSpacing: "0.2em", textTransform: "uppercase" }}>Radio emission</text>
    </svg>
  );
}
