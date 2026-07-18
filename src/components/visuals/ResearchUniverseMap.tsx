/**
 * Research Universe map — a lightweight SVG constellation of connected research nodes.
 * Signature scientific animation for the /research-universe and home pages.
 */
import { Link } from "@tanstack/react-router";
import { researchAreas } from "@/data/research";

const accentMap: Record<string, string> = {
  aurora: "var(--aurora)",
  electric: "var(--electric)",
  nebula: "var(--nebula)",
  magenta: "var(--magenta)",
  solar: "var(--solar)",
  flare: "var(--flare)",
  teal: "var(--teal)",
};

export function ResearchUniverseMap({ compact = false }: { compact?: boolean }) {
  // Position nodes on a circle around Diya Ram
  const cx = 400;
  const cy = 300;
  const r = compact ? 180 : 220;
  const nodes = researchAreas.map((a, i) => {
    const angle = (i / researchAreas.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...a,
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
    };
  });

  // Scientific cross-links between related research areas
  const linkPairs: Array<[string, string]> = [
    ["mdwarf-magnetic-activity", "stellar-flares"],
    ["mdwarf-magnetic-activity", "stellar-rotation-spots"],
    ["stellar-flares", "radio-astronomy"],
    ["stellar-rotation-spots", "spectroscopy"],
    ["radio-astronomy", "habitability"],
    ["spectroscopy", "habitability"],
    ["mdwarf-magnetic-activity", "habitability"],
  ];
  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 800 600"
        className="h-auto w-full"
        role="img"
        aria-label="Research universe map: Diya Ram at the centre with connected research areas"
      >
        <defs>
          <radialGradient id="core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.78 0.15 210)" stopOpacity="0.9" />
            <stop offset="60%" stopColor="oklch(0.42 0.18 295)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="oklch(0.14 0.04 265)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.78 0.15 210)" stopOpacity="0.7" />
            <stop offset="100%" stopColor="oklch(0.96 0.01 250)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {/* faint orbit rings */}
        {[80, 140, 200, 260].map((rr) => (
          <circle
            key={rr}
            cx={cx}
            cy={cy}
            r={rr}
            fill="none"
            stroke="oklch(0.96 0.01 250 / 0.06)"
            strokeDasharray="2 6"
          />
        ))}

        {/* connections */}
        {nodes.map((n) => (
          <line
            key={"l-" + n.id}
            x1={cx}
            y1={cy}
            x2={n.x}
            y2={n.y}
            stroke="url(#line)"
            strokeWidth="1"
            className="anim-draw"
            style={{ animationDelay: `${Math.random() * 0.6}s` }}
          />
        ))}

        {/* central glow */}
        <circle cx={cx} cy={cy} r="140" fill="url(#core)" />

        {/* center label */}
        <g>
          <circle
            cx={cx}
            cy={cy}
            r="8"
            fill="oklch(0.96 0.01 250)"
            className="anim-pulse-slow"
          />
          <text
            x={cx}
            y={cy - 24}
            textAnchor="middle"
            className="fill-white font-display"
            fontSize="16"
            fontWeight="600"
          >
            Diya Ram
          </text>
          <text
            x={cx}
            y={cy + 32}
            textAnchor="middle"
            className="fill-white/60"
            fontSize="10"
            style={{ letterSpacing: "0.24em", textTransform: "uppercase" }}
          >
            Observational Astrophysics
          </text>
        </g>

        {/* nodes */}
        {nodes.map((n) => {
          const color = accentMap[n.accent];
          const anchor = n.x < cx - 40 ? "end" : n.x > cx + 40 ? "start" : "middle";
          const dx = n.x < cx - 40 ? -14 : n.x > cx + 40 ? 14 : 0;
          const dy = n.y < cy ? -14 : 22;
          return (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r="14"
                fill={color}
                opacity="0.15"
              />
              <circle
                cx={n.x}
                cy={n.y}
                r="5"
                fill={color}
              />
              <text
                x={n.x + dx}
                y={n.y + dy}
                textAnchor={anchor}
                className="fill-white/90 font-display"
                fontSize="12"
              >
                {n.shortTitle}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Accessible card list overlay for mobile & SEO */}
      <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:hidden">
        {researchAreas.map((a) => (
          <li key={a.id}>
            <Link
              to="/research/$slug"
              params={{ slug: a.slug }}
              className="glass block rounded-lg px-3 py-2 text-sm hover:bg-white/5"
            >
              {a.shortTitle}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
