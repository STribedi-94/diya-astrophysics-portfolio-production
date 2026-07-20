/**
 * ChapterScene — cinematic SVG scenes for each Academic Journey chapter.
 * Every scene is unique. No third-party assets required.
 * All motion is CSS/SVG; prefers-reduced-motion neutralises animation globally.
 */
import type { CSSProperties } from "react";

type SceneName =
  | "nursery"
  | "spectroscopy"
  | "gateway"
  | "mdwarf"
  | "thesis"
  | "horizon";

export function ChapterScene({
  name,
  className,
  style,
}: {
  name: SceneName;
  className?: string;
  style?: CSSProperties;
}) {
  const common =
    "absolute inset-0 h-full w-full overflow-hidden rounded-3xl";
  return (
    <div className={`${common} ${className ?? ""}`} style={style} aria-hidden>
      {name === "nursery" && <NurseryScene />}
      {name === "spectroscopy" && <SpectroscopyScene />}
      {name === "gateway" && <GatewayScene />}
      {name === "mdwarf" && <MDwarfScene />}
      {name === "thesis" && <ThesisScene />}
      {name === "horizon" && <HorizonScene />}
    </div>
  );
}

/* ── Chapter 1 — Stellar nursery: indigo cloud, forming star, equations ── */
function NurseryScene() {
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <defs>
        <radialGradient id="nurs-cloud" cx="35%" cy="55%" r="70%">
          <stop offset="0%" stopColor="oklch(0.55 0.20 275)" stopOpacity="0.75" />
          <stop offset="45%" stopColor="oklch(0.32 0.16 280)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="oklch(0.08 0.04 265)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nurs-cloud2" cx="80%" cy="35%" r="55%">
          <stop offset="0%" stopColor="oklch(0.60 0.22 300)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="oklch(0.08 0.04 265)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nurs-proto" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.98 0.02 250)" />
          <stop offset="35%" stopColor="oklch(0.82 0.14 65)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="oklch(0.55 0.18 30)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="oklch(0.08 0.04 265)" />
      <rect width="800" height="500" fill="url(#nurs-cloud)" />
      <rect width="800" height="500" fill="url(#nurs-cloud2)" />
      {/* forming star */}
      <g className="anim-corona">
        <circle cx="290" cy="270" r="120" fill="url(#nurs-proto)" />
        <circle cx="290" cy="270" r="10" fill="oklch(0.99 0.02 250)" />
      </g>
      {/* faint equations */}
      <g
        fill="oklch(0.85 0.02 250)"
        opacity="0.14"
        fontFamily="ui-monospace, monospace"
        fontSize="14"
      >
        <text x="520" y="90">∇·E = ρ/ε₀</text>
        <text x="560" y="130">iħ ∂ψ/∂t = Ĥψ</text>
        <text x="500" y="180">F = ma</text>
        <text x="580" y="230">L = T − V</text>
        <text x="530" y="410">∮ B·dl = μ₀I</text>
        <text x="600" y="450">E = mc²</text>
      </g>
      {/* scattered stars */}
      {[
        [80, 60], [720, 80], [640, 200], [40, 380], [760, 350], [420, 40],
        [180, 440], [500, 470], [700, 460], [120, 200],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 3 === 0 ? 1.6 : 1}
          fill="oklch(0.98 0.01 250)"
          opacity={0.4 + (i % 5) * 0.1}
        >
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur={`${4 + (i % 4)}s`}
            begin={`${i * 0.3}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

/* ── Chapter 2 — Star with dispersed spectrum & spectral lines ── */
function SpectroscopyScene() {
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <defs>
        <radialGradient id="spec-star" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.98 0.03 90)" />
          <stop offset="45%" stopColor="oklch(0.82 0.17 68)" />
          <stop offset="100%" stopColor="oklch(0.35 0.15 40)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="spec-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.45 0.22 300)" />
          <stop offset="20%" stopColor="oklch(0.55 0.22 260)" />
          <stop offset="40%" stopColor="oklch(0.78 0.15 210)" />
          <stop offset="60%" stopColor="oklch(0.82 0.16 130)" />
          <stop offset="80%" stopColor="oklch(0.82 0.17 68)" />
          <stop offset="100%" stopColor="oklch(0.65 0.20 30)" />
        </linearGradient>
        <radialGradient id="spec-bg" cx="30%" cy="50%" r="80%">
          <stop offset="0%" stopColor="oklch(0.25 0.10 60)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="oklch(0.08 0.04 265)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="oklch(0.08 0.04 265)" />
      <rect width="800" height="500" fill="url(#spec-bg)" />

      {/* star */}
      <g className="anim-corona">
        <circle cx="200" cy="250" r="110" fill="url(#spec-star)" />
        <circle cx="200" cy="250" r="55" fill="oklch(0.95 0.06 80)" />
      </g>

      {/* dispersion band */}
      <rect
        x="290"
        y="235"
        width="470"
        height="30"
        fill="url(#spec-band)"
        opacity="0.9"
      />
      {/* absorption lines */}
      {[320, 370, 405, 460, 510, 555, 610, 660, 705].map((x, i) => (
        <rect
          key={x}
          x={x}
          y="235"
          width="2"
          height="30"
          fill="oklch(0.10 0.03 265)"
          opacity={0.5 + (i % 3) * 0.15}
        />
      ))}
      {/* labels */}
      <g fill="oklch(0.90 0.02 250 / 0.6)" fontSize="10" fontFamily="ui-monospace, monospace" style={{ letterSpacing: "0.15em" }}>
        <text x="322" y="228">Hα</text>
        <text x="462" y="228">Hβ</text>
        <text x="608" y="228">Ca II</text>
      </g>
      {/* thin dispersion rays */}
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1="200"
          y1="250"
          x2="770"
          y2={130 + i * 60}
          stroke="oklch(0.85 0.10 90)"
          strokeOpacity="0.08"
          strokeWidth="0.8"
        />
      ))}
      {/* background stars */}
      {[[60,80],[720,60],[100,420],[600,60],[540,440],[770,400]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="1.2" fill="oklch(0.98 0.01 250)" opacity="0.6" />
      ))}
    </svg>
  );
}

/* ── Chapter 3 — Cosmic gateway / pulsar threshold ── */
function GatewayScene() {
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <defs>
        <radialGradient id="gate-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.95 0.05 220)" />
          <stop offset="20%" stopColor="oklch(0.78 0.15 210)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="oklch(0.08 0.04 265)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="gate-bg" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stopColor="oklch(0.20 0.10 245)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="oklch(0.06 0.03 265)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="oklch(0.07 0.03 265)" />
      <rect width="800" height="500" fill="url(#gate-bg)" />

      {/* lensed rings */}
      {[240, 200, 160, 120, 80].map((r, i) => (
        <ellipse
          key={r}
          cx="400"
          cy="250"
          rx={r * 1.3}
          ry={r}
          fill="none"
          stroke="oklch(0.78 0.15 210)"
          strokeOpacity={0.05 + i * 0.05}
          strokeWidth="1"
        />
      ))}
      {/* central pulsar */}
      <g className="anim-corona">
        <circle cx="400" cy="250" r="90" fill="url(#gate-glow)" />
        <circle cx="400" cy="250" r="14" fill="oklch(0.99 0.02 220)" />
      </g>
      {/* diagonal pulsar beams */}
      <g opacity="0.35">
        <polygon
          points="400,250 130,60 90,120"
          fill="oklch(0.78 0.15 210)"
          opacity="0.25"
        />
        <polygon
          points="400,250 690,470 720,410"
          fill="oklch(0.78 0.15 210)"
          opacity="0.25"
        />
      </g>
      {/* travelling path */}
      <path
        d="M 0 460 Q 200 400 400 250 T 800 40"
        fill="none"
        stroke="oklch(0.85 0.10 90)"
        strokeOpacity="0.5"
        strokeWidth="1.2"
        strokeDasharray="4 6"
      />
      {/* AIR 143 subtle */}
      <text
        x="620"
        y="440"
        fill="oklch(0.90 0.10 200)"
        opacity="0.35"
        fontFamily="ui-monospace, monospace"
        fontSize="14"
        style={{ letterSpacing: "0.25em" }}
      >
        AIR · 143
      </text>
      {/* stars */}
      {[[60,90],[720,70],[80,380],[740,410],[240,60],[560,470]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="1.4" fill="oklch(0.98 0.01 250)" opacity="0.7" />
      ))}
    </svg>
  );
}

/* ── Chapter 4 — M-dwarf system with flare loops & exoplanet ── */
function MDwarfScene() {
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <defs>
        <radialGradient id="md-star" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.95 0.10 45)" />
          <stop offset="45%" stopColor="oklch(0.68 0.22 28)" />
          <stop offset="100%" stopColor="oklch(0.30 0.15 20)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="md-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.55 0.22 30 / 0.7)" />
          <stop offset="100%" stopColor="oklch(0.55 0.22 30 / 0)" />
        </radialGradient>
        <radialGradient id="md-bg" cx="30%" cy="40%" r="70%">
          <stop offset="0%" stopColor="oklch(0.25 0.12 340)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.06 0.03 265)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="oklch(0.07 0.03 265)" />
      <rect width="800" height="500" fill="url(#md-bg)" />

      {/* halo */}
      <circle cx="300" cy="250" r="220" fill="url(#md-halo)" className="anim-corona" />
      {/* star */}
      <circle cx="300" cy="250" r="140" fill="url(#md-star)" />
      {/* starspots */}
      <ellipse cx="260" cy="215" rx="22" ry="14" fill="oklch(0.35 0.14 25)" opacity="0.6" />
      <ellipse cx="340" cy="280" rx="18" ry="10" fill="oklch(0.35 0.14 25)" opacity="0.5" />
      <ellipse cx="310" cy="170" rx="10" ry="6" fill="oklch(0.30 0.13 25)" opacity="0.55" />

      {/* magnetic loops */}
      {[
        "M 220 240 C 200 140, 400 140, 380 240",
        "M 240 260 C 240 180, 360 180, 360 260",
        "M 260 230 C 260 160, 340 160, 340 230",
      ].map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="oklch(0.85 0.15 60)"
          strokeOpacity={0.55 - i * 0.1}
          strokeWidth="1.4"
          className="anim-draw"
          style={{ animationDelay: `${i * 0.4}s`, animationDuration: "3s" }}
        />
      ))}

      {/* flare arc */}
      <path
        d="M 300 180 C 340 100, 460 100, 520 180"
        fill="none"
        stroke="oklch(0.90 0.18 80)"
        strokeWidth="2"
        opacity="0.75"
        className="anim-draw"
        style={{ animationDuration: "4s" }}
      />

      {/* exoplanet orbit */}
      <ellipse
        cx="450"
        cy="270"
        rx="290"
        ry="90"
        fill="none"
        stroke="oklch(0.90 0.02 250)"
        strokeOpacity="0.18"
        strokeWidth="0.8"
        strokeDasharray="2 4"
      />
      <circle r="9" fill="oklch(0.55 0.12 250)">
        <animateMotion dur="18s" repeatCount="indefinite" path="M 740 270 A 290 90 0 1 1 739.99 270 Z" />
      </circle>

      {/* wavelength band ticks */}
      <g fontFamily="ui-monospace, monospace" fontSize="9" style={{ letterSpacing: "0.2em" }}>
        {[
          ["OPTICAL", 620, 90, "oklch(0.80 0.14 210)"],
          ["NIR", 620, 110, "oklch(0.82 0.17 68)"],
          ["RADIO", 620, 130, "oklch(0.70 0.13 195)"],
        ].map(([t, x, y, c]) => (
          <text key={t as string} x={x as number} y={y as number} fill={c as string} opacity="0.6">
            {t as string}
          </text>
        ))}
      </g>
      {/* stars */}
      {[[70,80],[730,60],[100,440],[730,420],[520,60],[600,460]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="1.3" fill="oklch(0.98 0.01 250)" opacity="0.7" />
      ))}
    </svg>
  );
}

/* ── Thesis culmination — central red star with wavelength rings & lines ── */
function ThesisScene() {
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <defs>
        <radialGradient id="th-star" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.96 0.10 60)" />
          <stop offset="40%" stopColor="oklch(0.68 0.22 28)" />
          <stop offset="100%" stopColor="oklch(0.25 0.15 20)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="th-bg" cx="50%" cy="50%" r="80%">
          <stop offset="0%" stopColor="oklch(0.22 0.14 320)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="oklch(0.06 0.03 265)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="oklch(0.07 0.03 265)" />
      <rect width="800" height="500" fill="url(#th-bg)" />

      {/* rings */}
      {[
        { r: 90, c: "oklch(0.80 0.14 210)" },
        { r: 130, c: "oklch(0.82 0.17 68)" },
        { r: 170, c: "oklch(0.70 0.13 195)" },
        { r: 210, c: "oklch(0.55 0.22 300)" },
      ].map((ring, i) => (
        <circle
          key={ring.r}
          cx="400"
          cy="250"
          r={ring.r}
          fill="none"
          stroke={ring.c}
          strokeOpacity="0.5"
          strokeWidth="1"
          strokeDasharray={i % 2 ? "3 5" : "0"}
        />
      ))}

      {/* central star */}
      <circle cx="400" cy="250" r="70" fill="url(#th-star)" className="anim-corona" />
      <circle cx="400" cy="250" r="26" fill="oklch(0.90 0.14 60)" />

      {/* four studied systems */}
      {[
        { a: 0, label: "AD Leo" },
        { a: 90, label: "Wolf 359" },
        { a: 180, label: "GJ 1151" },
        { a: 270, label: "GJ 398" },
      ].map(({ a, label }) => {
        const rad = (a * Math.PI) / 180;
        const x = 400 + Math.cos(rad) * 210;
        const y = 250 + Math.sin(rad) * 210;
        return (
          <g key={label}>
            <circle cx={x} cy={y} r="6" fill="oklch(0.65 0.20 28)" />
            <text
              x={x + 12}
              y={y + 4}
              fill="oklch(0.90 0.02 250)"
              opacity="0.7"
              fontSize="10"
              fontFamily="ui-monospace, monospace"
              style={{ letterSpacing: "0.14em" }}
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* holographic chapter lines */}
      <g stroke="oklch(0.85 0.02 250)" strokeOpacity="0.14">
        {[60, 90, 120, 380, 410, 440].map((y) => (
          <line key={y} x1="30" y1={y} x2="200" y2={y} strokeWidth="0.8" />
        ))}
        {[60, 90, 120, 380, 410, 440].map((y) => (
          <line key={`r${y}`} x1="600" y1={y} x2="770" y2={y} strokeWidth="0.8" />
        ))}
      </g>

      {/* light curve overlay */}
      <path
        d="M 40 460 Q 120 440 200 455 T 340 430 T 480 455 T 620 425 T 780 455"
        fill="none"
        stroke="oklch(0.80 0.14 210)"
        strokeOpacity="0.5"
        strokeWidth="1.2"
        className="anim-draw"
        style={{ animationDuration: "4s" }}
      />
    </svg>
  );
}

/* ── Final / Present — open horizon galaxy branching paths ── */
function HorizonScene() {
  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <defs>
        <radialGradient id="hz-galaxy" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(0.95 0.05 260)" stopOpacity="0.9" />
          <stop offset="35%" stopColor="oklch(0.55 0.15 285)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="oklch(0.08 0.04 265)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hz-bg" cx="50%" cy="60%" r="80%">
          <stop offset="0%" stopColor="oklch(0.18 0.08 260)" stopOpacity="0.7" />
          <stop offset="100%" stopColor="oklch(0.06 0.03 265)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="oklch(0.06 0.03 265)" />
      <rect width="800" height="500" fill="url(#hz-bg)" />

      {/* distant galaxy */}
      <g transform="translate(400 220) rotate(-18)" className="anim-rotate-slow">
        <ellipse rx="180" ry="60" fill="url(#hz-galaxy)" />
        <ellipse rx="90" ry="24" fill="oklch(0.98 0.03 260)" opacity="0.6" />
      </g>

      {/* branching paths */}
      {[
        "M 100 480 Q 300 380 400 220",
        "M 260 490 Q 340 360 400 220",
        "M 700 480 Q 500 380 400 220",
        "M 540 490 Q 460 360 400 220",
        "M 400 500 L 400 220",
      ].map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="oklch(0.85 0.10 220)"
          strokeOpacity="0.28"
          strokeWidth="1"
          strokeDasharray="2 5"
        />
      ))}

      {/* scattered stars */}
      {[
        [60, 60], [740, 80], [140, 140], [700, 180], [40, 300], [760, 320],
        [200, 60], [600, 60], [180, 460], [620, 460], [340, 40], [480, 40],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 3 === 0 ? 1.6 : 1}
          fill="oklch(0.98 0.01 250)"
          opacity={0.5 + (i % 4) * 0.12}
        >
          <animate
            attributeName="opacity"
            values="0.3;1;0.3"
            dur={`${5 + (i % 3)}s`}
            begin={`${i * 0.3}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

/* ── Facility scenes (used by observing section) ─────────────────────── */
export function FacilityScene({ name }: { name: "tess" | "ugmrt" | "hct" | "dot" }) {
  if (name === "tess") return <TessScene />;
  if (name === "ugmrt") return <UgmrtScene />;
  if (name === "hct") return <HctScene />;
  return <DotScene />;
}

function TessScene() {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="earth" cx="40%" cy="70%" r="60%">
          <stop offset="0%" stopColor="oklch(0.55 0.14 220)" />
          <stop offset="65%" stopColor="oklch(0.30 0.10 240)" />
          <stop offset="100%" stopColor="oklch(0.08 0.04 265)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="atm" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.75 0.10 220 / 0.55)" />
          <stop offset="100%" stopColor="oklch(0.75 0.10 220 / 0)" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="oklch(0.06 0.03 265)" />
      {/* stars */}
      {[[30,30],[80,60],[260,30],[340,50],[380,120],[20,140]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="1.2" fill="oklch(0.98 0.01 250)" opacity="0.7" />
      ))}
      {/* earth arc */}
      <circle cx="200" cy="360" r="200" fill="url(#earth)" />
      <path d="M 0 180 Q 200 130 400 180" fill="none" stroke="url(#atm)" strokeWidth="20" />
      {/* orbit arc */}
      <path
        d="M 20 100 Q 200 30 380 100"
        fill="none"
        stroke="oklch(0.80 0.14 210)"
        strokeOpacity="0.35"
        strokeWidth="0.8"
        strokeDasharray="3 5"
      />
      {/* TESS satellite */}
      <g transform="translate(240 65)">
        <rect x="-6" y="-6" width="12" height="12" fill="oklch(0.90 0.02 250)" />
        <rect x="-24" y="-3" width="14" height="6" fill="oklch(0.55 0.15 265)" />
        <rect x="10" y="-3" width="14" height="6" fill="oklch(0.55 0.15 265)" />
      </g>
      <text x="16" y="210" fill="oklch(0.85 0.02 250 / 0.55)" fontSize="9" fontFamily="ui-monospace, monospace" style={{ letterSpacing: "0.22em" }}>
        LOW-EARTH ORBIT · OPTICAL
      </text>
    </svg>
  );
}

function UgmrtScene() {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="ug-sky" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="oklch(0.28 0.10 200)" />
          <stop offset="100%" stopColor="oklch(0.06 0.03 265)" />
        </radialGradient>
      </defs>
      <rect width="400" height="220" fill="url(#ug-sky)" />
      {/* horizon */}
      <path d="M 0 170 L 400 170 L 400 220 L 0 220 Z" fill="oklch(0.10 0.04 240)" />
      {/* dishes */}
      {[60, 140, 220, 300, 360].map((cx, i) => (
        <g key={cx} transform={`translate(${cx} 155)`}>
          <line x1="0" y1="0" x2="0" y2="18" stroke="oklch(0.75 0.05 240)" strokeWidth="2" />
          <path d={`M -${18 - i * 2} 0 Q 0 -${22 - i}, ${18 - i * 2} 0 Z`} fill="oklch(0.75 0.05 240)" />
        </g>
      ))}
      {/* radio waves from central dish */}
      {[26, 46, 66, 86].map((r, i) => (
        <circle
          key={r}
          cx="220"
          cy="130"
          r={r}
          fill="none"
          stroke="oklch(0.70 0.13 195)"
          strokeOpacity={0.45 - i * 0.09}
          strokeWidth="1"
        >
          <animate attributeName="r" values={`${r};${r + 30};${r}`} dur="6s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values={`${0.45 - i * 0.09};0;${0.45 - i * 0.09}`} dur="6s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {[[60,30],[320,20],[180,50],[360,60]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="1.2" fill="oklch(0.98 0.01 250)" opacity="0.7" />
      ))}
      <text x="16" y="210" fill="oklch(0.85 0.02 250 / 0.55)" fontSize="9" fontFamily="ui-monospace, monospace" style={{ letterSpacing: "0.22em" }}>
        LOW-FREQUENCY RADIO ARRAY
      </text>
    </svg>
  );
}

function HctScene() {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="hct-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.14 0.08 285)" />
          <stop offset="100%" stopColor="oklch(0.06 0.03 265)" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#hct-sky)" />
      {/* milky way band */}
      <path d="M 0 60 Q 200 30 400 90" stroke="oklch(0.85 0.06 250)" strokeOpacity="0.15" strokeWidth="30" fill="none" />
      {/* stars */}
      {[[40,20],[80,50],[130,30],[210,60],[300,25],[360,45],[380,90],[20,110],[240,20]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%3===0?1.6:1} fill="oklch(0.98 0.01 250)" opacity={0.5+(i%4)*0.12} />
      ))}
      {/* mountains */}
      <path d="M 0 190 L 90 130 L 150 170 L 240 110 L 320 160 L 400 140 L 400 220 L 0 220 Z" fill="oklch(0.14 0.05 260)" />
      <path d="M 0 200 L 120 160 L 210 180 L 300 150 L 400 175 L 400 220 L 0 220 Z" fill="oklch(0.10 0.04 260)" />
      {/* dome */}
      <g transform="translate(220 135)">
        <ellipse cx="0" cy="8" rx="22" ry="6" fill="oklch(0.28 0.03 260)" />
        <path d="M -20 8 Q 0 -18, 20 8 Z" fill="oklch(0.85 0.02 250)" opacity="0.85" />
        <rect x="-2" y="-14" width="4" height="12" fill="oklch(0.10 0.02 260)" />
      </g>
      <text x="16" y="210" fill="oklch(0.85 0.02 250 / 0.55)" fontSize="9" fontFamily="ui-monospace, monospace" style={{ letterSpacing: "0.22em" }}>
        HIMALAYAN OPTICAL · 2 m
      </text>
    </svg>
  );
}

function DotScene() {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="dot-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.16 0.10 300)" />
          <stop offset="100%" stopColor="oklch(0.06 0.03 265)" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#dot-sky)" />
      {/* nebula wash */}
      <ellipse cx="90" cy="80" rx="120" ry="40" fill="oklch(0.55 0.18 320)" opacity="0.25" />
      <ellipse cx="320" cy="60" rx="90" ry="30" fill="oklch(0.55 0.20 250)" opacity="0.22" />
      {/* stars */}
      {[[40,30],[110,50],[180,20],[250,40],[320,25],[370,60],[20,90],[380,110]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={i%3===0?1.6:1} fill="oklch(0.98 0.01 250)" opacity={0.6+(i%3)*0.1} />
      ))}
      {/* mountain ridge */}
      <path d="M 0 195 L 80 150 L 160 175 L 240 130 L 320 165 L 400 145 L 400 220 L 0 220 Z" fill="oklch(0.11 0.04 285)" />
      {/* larger dome */}
      <g transform="translate(210 140)">
        <rect x="-32" y="10" width="64" height="14" fill="oklch(0.20 0.03 285)" />
        <path d="M -30 10 Q 0 -30, 30 10 Z" fill="oklch(0.82 0.02 260)" />
        <rect x="-3" y="-24" width="6" height="16" fill="oklch(0.10 0.02 285)" />
      </g>
      <text x="16" y="210" fill="oklch(0.85 0.02 250 / 0.55)" fontSize="9" fontFamily="ui-monospace, monospace" style={{ letterSpacing: "0.22em" }}>
        DEVASTHAL OPTICAL · 3.6 m
      </text>
    </svg>
  );
}
