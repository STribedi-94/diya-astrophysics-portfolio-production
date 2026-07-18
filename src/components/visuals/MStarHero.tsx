/**
 * M-Star Hero Visual — signature scientific illustration for Diya Ram's research.
 * A stylised, scientifically-motivated M-dwarf: red photosphere, cool starspots,
 * animated corona, magnetic dipole loops, a chromospheric flare bloom, and a
 * small companion exoplanet drifting in the habitable zone.
 *
 * Pure SVG + CSS — no external dependencies, respects prefers-reduced-motion.
 */
export function MStarHero({ className = "" }: { className?: string }) {
  const cx = 300;
  const cy = 300;
  const r = 110; // stellar radius

  // Magnetic dipole loops — symmetric pairs
  const loops = [
    { rx: 55, ry: 150, rotate: -18, opacity: 0.7 },
    { rx: 40, ry: 190, rotate: 12, opacity: 0.55 },
    { rx: 80, ry: 130, rotate: 42, opacity: 0.5 },
    { rx: 30, ry: 210, rotate: -48, opacity: 0.4 },
  ];

  // Starspot positions (in stellar disc coords)
  const spots = [
    { x: cx - 40, y: cy - 30, r: 14 },
    { x: cx + 25, y: cy + 20, r: 10 },
    { x: cx - 15, y: cy + 45, r: 8 },
    { x: cx + 55, y: cy - 15, r: 7 },
  ];

  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 600 600"
        className="h-auto w-full"
        role="img"
        aria-label="Illustration of an M-dwarf star: red photosphere with dark starspots, magnetic dipole loops arcing outward, a chromospheric flare, and a small exoplanet in the habitable zone."
      >
        <defs>
          <radialGradient id="star-body" cx="42%" cy="40%" r="60%">
            <stop offset="0%" stopColor="oklch(0.92 0.14 60)" />
            <stop offset="45%" stopColor="oklch(0.72 0.20 30)" />
            <stop offset="85%" stopColor="oklch(0.48 0.18 22)" />
            <stop offset="100%" stopColor="oklch(0.28 0.14 20)" />
          </radialGradient>
          <radialGradient id="corona" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.85 0.17 40 / 0.6)" />
            <stop offset="55%" stopColor="oklch(0.65 0.22 30 / 0.25)" />
            <stop offset="100%" stopColor="oklch(0.55 0.20 25 / 0)" />
          </radialGradient>
          <radialGradient id="flare" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.98 0.14 88 / 0.95)" />
            <stop offset="40%" stopColor="oklch(0.85 0.17 60 / 0.55)" />
            <stop offset="100%" stopColor="oklch(0.65 0.22 30 / 0)" />
          </radialGradient>
          <linearGradient id="loop" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.85 0.17 60 / 0.9)" />
            <stop offset="100%" stopColor="oklch(0.55 0.20 25 / 0.2)" />
          </linearGradient>
          <radialGradient id="hz" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="oklch(0.70 0.12 175 / 0)" />
            <stop offset="88%" stopColor="oklch(0.70 0.12 175 / 0.35)" />
            <stop offset="100%" stopColor="oklch(0.70 0.12 175 / 0)" />
          </radialGradient>
          <radialGradient id="planet" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="oklch(0.72 0.10 220)" />
            <stop offset="70%" stopColor="oklch(0.40 0.08 240)" />
            <stop offset="100%" stopColor="oklch(0.20 0.06 250)" />
          </radialGradient>
          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Habitable zone ring */}
        <circle cx={cx} cy={cy} r="230" fill="url(#hz)" />
        <circle
          cx={cx}
          cy={cy}
          r="230"
          fill="none"
          stroke="oklch(0.70 0.13 175 / 0.25)"
          strokeDasharray="2 8"
        />

        {/* Outer corona */}
        <g className="anim-corona">
          <circle cx={cx} cy={cy} r="200" fill="url(#corona)" />
        </g>

        {/* Magnetic dipole loops — behind star */}
        <g style={{ transformOrigin: `${cx}px ${cy}px` }} className="anim-rotate-slow">
          {loops.map((l, i) => (
            <ellipse
              key={i}
              cx={cx}
              cy={cy}
              rx={l.rx}
              ry={l.ry}
              transform={`rotate(${l.rotate} ${cx} ${cy})`}
              fill="none"
              stroke="url(#loop)"
              strokeWidth="1.5"
              opacity={l.opacity}
              className="anim-draw"
              style={{ animationDelay: `${i * 0.25}s` }}
            />
          ))}
        </g>

        {/* Stellar photosphere */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="url(#star-body)"
          style={{ filter: "drop-shadow(0 0 40px oklch(0.65 0.22 30 / 0.55))" }}
        />

        {/* Limb darkening */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="oklch(0.25 0.14 22 / 0.6)"
          strokeWidth="6"
        />

        {/* Starspots */}
        <g opacity="0.75">
          {spots.map((s, i) => (
            <ellipse
              key={i}
              cx={s.x}
              cy={s.y}
              rx={s.r}
              ry={s.r * 0.75}
              fill="oklch(0.22 0.10 22)"
            />
          ))}
        </g>

        {/* Chromospheric flare on limb */}
        <g transform={`translate(${cx + r - 6}, ${cy - r + 20})`}>
          <circle r="42" fill="url(#flare)" filter="url(#soft-glow)" className="anim-pulse-slow" />
          <circle r="6" fill="oklch(0.98 0.10 88)" className="anim-twinkle" />
        </g>

        {/* Exoplanet in habitable zone */}
        <g style={{ transformOrigin: `${cx}px ${cy}px` }} className="anim-rotate-slow">
          <g transform={`translate(${cx + 230}, ${cy})`}>
            <circle r="14" fill="url(#planet)" />
            <circle r="14" fill="none" stroke="oklch(0.70 0.12 175 / 0.5)" strokeWidth="0.6" />
          </g>
        </g>

        {/* Scale label */}
        <g fontFamily="var(--font-mono), monospace" fontSize="10" fill="oklch(0.96 0.01 250 / 0.55)">
          <text x="20" y="580" letterSpacing="0.18em">M-DWARF · SPECTRAL TYPE M · ~0.3 M☉</text>
          <text x="520" y="580" textAnchor="end" letterSpacing="0.18em">HABITABLE ZONE</text>
        </g>
      </svg>
    </div>
  );
}
