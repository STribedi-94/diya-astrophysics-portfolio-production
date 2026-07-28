import { useEffect, useRef, useState } from "react";

/**
 * Premium first-visit entrance overlay.
 * Shows only once per browser session, and only when the very first page
 * opened is the site root ("/"). The Home page renders behind it the whole
 * time — this is purely a dissolve-in transition, never a splash route.
 */

const SENTENCE = "Welcome to Diya's Astrophysical Universe";
const GLYPHS = "⟟⌇⏃⌰⋉⌖⏁⍜⌿⟒⌇⋏⊑⌇⏚⍀⋔⟊⌰⍜⏃⋉⌖⏁";
const SESSION_KEY = "dr-entrance-seen";
const STATUS = [
  "SIGNAL ACQUISITION",
  "MULTI-WAVELENGTH ARRAY ONLINE",
  "OBSERVATORY INITIALIZATION",
];

function glyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
}

export function CosmicEntrance() {
  const [active, setActive] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chars, setChars] = useState<string[]>(() => SENTENCE.split(""));
  const [reduced, setReduced] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    let shouldRun = false;
    try {
      shouldRun =
        window.location.pathname === "/" &&
        !window.sessionStorage.getItem(SESSION_KEY);
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      shouldRun = false;
    }
    if (!shouldRun) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setReduced(prefersReduced);
    setActive(true);

    const total = prefersReduced ? 1000 : 3500;
    const start = performance.now();
    const letters = SENTENCE.split("");

    if (!prefersReduced) setChars(letters.map((c) => (c === " " ? " " : glyph())));

    const finish = () => {
      setProgress(100);
      setChars(letters);
      setLeaving(true);
      timers.current.push(setTimeout(() => setActive(false), 520));
    };

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / total);
      setProgress(Math.round(p * 100));

      if (!prefersReduced) {
        // Decode left-to-right between 5% and 95% of the timeline.
        const decodeP = Math.min(1, Math.max(0, (p - 0.05) / 0.9);
        const resolved = Math.floor(decodeP * letters.length);
        setChars(
          letters.map((c, i) => {
            if (i < resolved || c === " ") return c;
            return glyph();
          }),
        );
      }

      if (p < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        finish();
      }
    };
    raf.current = requestAnimationFrame(tick);

    // Failure safety: never trap the visitor.
    timers.current.push(setTimeout(() => finish(), total + 900));

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  if (!active) return null;

  const statusLabel = STATUS[Math.min(STATUS.length - 1, Math.floor(progress / 34))];

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[oklch(0.12_0.04_265)] transition-opacity duration-500"
      style={{ opacity: leaving ? 0 : 1 }}
    >
      <EntranceScene reduced={reduced} />

      <div className="relative z-10 w-full max-w-3xl px-6 text-center">
        <h2
          className="font-display text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-4xl"
          style={{ textShadow: "0 0 28px oklch(0.78 0.15 210 / 0.35)" }}
        >
          {chars.map((c, i) => (
            <span
              key={i}
              className={c === SENTENCE[i] ? "" : "text-primary/70"}
              style={{ whiteSpace: c === " " ? "pre" : undefined }}
            >
              {c}
            </span>
          ))}
        </h2>

        <div className="mx-auto mt-8 max-w-md">
          <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-grad-accent transition-[width] duration-150 ease-linear"
              style={{
                width: `${progress}%`,
                boxShadow: "0 0 14px oklch(0.78 0.15 210 / 0.8)",
              }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground/80">
            <span>{statusLabel}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EntranceScene({ reduced }: { reduced: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-grad-hero opacity-90" />
      <div className={`absolute inset-0 starfield opacity-60 ${reduced ? "" : "anim-drift"}`} />
      <div className="absolute inset-0 starfield-sparse opacity-70" />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="ent-earth" cx="35%" cy="30%">
            <stop offset="0%" stopColor="oklch(0.72 0.13 220)" />
            <stop offset="60%" stopColor="oklch(0.42 0.12 250)" />
            <stop offset="100%" stopColor="oklch(0.18 0.06 265)" />
          </radialGradient>
          <radialGradient id="ent-moon" cx="40%" cy="35%">
            <stop offset="0%" stopColor="oklch(0.86 0.02 260)" />
            <stop offset="100%" stopColor="oklch(0.42 0.02 260)" />
          </radialGradient>
        </defs>

        {/* Faint orbital trajectories */}
        <g stroke="oklch(0.78 0.10 210 / 0.18)" fill="none">
          <ellipse cx="600" cy="720" rx="720" ry="240" />
          <ellipse cx="600" cy="720" rx="560" ry="180" />
          <ellipse cx="600" cy="720" rx="400" ry="130" />
        </g>

        {/* Earth limb from space */}
        <circle cx="240" cy="880" r="330" fill="url(#ent-earth)" opacity="0.9" />
        <circle
          cx="240"
          cy="880"
          r="340"
          fill="none"
          stroke="oklch(0.80 0.12 205 / 0.45)"
          strokeWidth="2"
        />

        {/* Distant moon */}
        <circle cx="985" cy="180" r="46" fill="url(#ent-moon)" opacity="0.75" />

        {/* Observatory silhouette */}
        <g fill="oklch(0.16 0.03 265)" stroke="oklch(0.70 0.10 210 / 0.35)" strokeWidth="1.5">
          <path d="M760 800 L760 690 A70 70 0 0 1 900 690 L900 800 Z" />
          <path d="M812 690 L900 622" strokeLinecap="round" />
          <rect x="742" y="792" width="176" height="10" rx="3" />
        </g>

        {/* Subtle interface lines */}
        <g stroke="oklch(0.78 0.10 210 / 0.14)" strokeWidth="1">
          <line x1="0" y1="120" x2="1200" y2="120" />
          <line x1="0" y1="680" x2="1200" y2="680" />
          <line x1="120" y1="0" x2="120" y2="800" />
          <line x1="1080" y1="0" x2="1080" y2="800" />
        </g>
      </svg>
      <div className="absolute inset-0 vignette" />
    </div>
  );
}
