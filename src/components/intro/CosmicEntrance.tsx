import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * Premium first-visit entrance overlay.
 * Shows only once per browser session, and only when the very first page
 * opened is the site root ("/"). The Home page renders behind it the whole
 * time — this is purely a dissolve-in transition, never a splash route.
 */

const LINES = ["Welcome to Diya’s", "Astrophysical Universe"] as const;
const GLYPHS = "⟟⌇⏃⌰⋉⌖⏁⍜⌿⟒⋏⊑⏚⍀⋔⟊";
const SESSION_KEY = "dr-entrance-seen";
const PENDING_CLASS = "entrance-pending";

// Choreography (ms)
const T_INTERFACE_IN = 800;
const T_DECODE_START = 1150;
const T_DECODE_END = 4150;
const T_DISSOLVE = 4550;
const T_TOTAL = 5200;
const DISSOLVE_MS = T_TOTAL - T_DISSOLVE;

const R_INTERFACE_IN = 200;
const R_DISSOLVE = 700;
const R_TOTAL = 1200;

const STATUS: Array<{ at: number; label: string }> = [
  { at: 800, label: "OBSERVATORY INITIALIZATION" },
  { at: 1800, label: "SIGNAL SYNCHRONIZATION" },
  { at: 2900, label: "MULTI-WAVELENGTH ARRAY ONLINE" },
  { at: 4150, label: "OBSERVATORY READY" },
];

const PROGRESS_KEYS: Array<[number, number]> = [
  [0, 0],
  [800, 5],
  [1150, 10],
  [2500, 50],
  [4150, 95],
  [4550, 100],
];

function progressAt(t: number) {
  for (let i = 1; i < PROGRESS_KEYS.length; i++) {
    const [t1, p1] = PROGRESS_KEYS[i];
    const [t0, p0] = PROGRESS_KEYS[i - 1];
    if (t <= t1) {
      const k = (t - t0) / (t1 - t0);
      const eased = k * k * (3 - 2 * k); // smoothstep, monotonic
      return p0 + (p1 - p0) * eased;
    }
  }
  return 100;
}

export type EntranceState = {
  active: boolean;
  leaving: boolean;
  elapsed: number;
  reduced: boolean;
};

export function useCosmicEntrance(): EntranceState {
  const [state, setState] = useState<EntranceState>({
    active: false,
    leaving: false,
    elapsed: 0,
    reduced: false,
  });
  const raf = useRef<number | null>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  // Runs before the first painted frame after hydration: either the overlay
  // takes over, or the pre-paint root class is released immediately.
  useLayoutEffect(() => {
    let shouldRun = false;
    try {
      shouldRun =
        window.location.pathname === "/" && !window.sessionStorage.getItem(SESSION_KEY);
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      shouldRun = false;
    }

    const releaseClass = () =>
      document.documentElement.classList.remove(PENDING_CLASS);

    if (!shouldRun) {
      releaseClass();
      return;
    }

    const reduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const total = reduced ? R_TOTAL : T_TOTAL;
    const dissolveAt = reduced ? R_DISSOLVE : T_DISSOLVE;

    setState({ active: true, leaving: false, elapsed: 0, reduced });
    // React now owns the visibility; drop the pre-paint class.
    releaseClass();

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(total, now - start);
      setState((s) => ({ ...s, elapsed: t, leaving: s.leaving || t >= dissolveAt }));
      if (t < total) raf.current = requestAnimationFrame(tick);
      else setState((s) => ({ ...s, active: false }));
    };
    raf.current = requestAnimationFrame(tick);

    // Failure safety: never trap the visitor.
    timers.current.push(
      setTimeout(() => setState((s) => ({ ...s, leaving: true })), dissolveAt + 400),
    );
    timers.current.push(
      setTimeout(
        () => setState((s) => ({ ...s, active: false, elapsed: total })),
        total + 800,
      ),
    );

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      timers.current.forEach(clearTimeout);
      timers.current = [];
      releaseClass();
    };
  }, []);

  return state;
}

/** Visual style for the underlying app shell while the entrance plays. */
export function shellStyle(s: EntranceState): React.CSSProperties | undefined {
  if (!s.active) return undefined;
  if (s.leaving) return { opacity: 1, filter: "blur(0px)", transform: "none" };
  return { opacity: 0, filter: "blur(2px)", transform: "scale(0.995)" };
}

export function CosmicEntrance({ state }: { state: EntranceState }) {
  const { active, leaving, elapsed, reduced } = state;

  // Mount-time hint for browsers that reach here without the pre-paint class.
  useEffect(() => {
    if (!active) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [active]);

  if (!active) return null;

  const t = elapsed;
  const interfaceIn = reduced ? R_INTERFACE_IN : T_INTERFACE_IN;
  const interfaceOpacity = Math.min(1, Math.max(0, (t - interfaceIn) / 350));
  const progress = reduced
    ? Math.min(100, Math.round((t / R_DISSOLVE) * 100))
    : Math.round(progressAt(t));

  const totalChars = LINES.join("").length;
  const decodeP = reduced
    ? 1
    : Math.min(1, Math.max(0, (t - T_DECODE_START) / (T_DECODE_END - T_DECODE_START)));
  const resolved = Math.floor(decodeP * totalChars);
  const glyphStep = Math.floor(t / 90) % 3;

  let statusLabel = STATUS[0].label;
  for (const s of STATUS) if (t >= (reduced ? s.at / 4 : s.at)) statusLabel = s.label;

  let cursor = 0;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#04060e]"
      style={{
        opacity: leaving ? 0 : 1,
        transition: `opacity ${leaving ? (reduced ? 350 : DISSOLVE_MS) : 0}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        pointerEvents: leaving ? "none" : "auto",
      }}
    >
      <EntranceScene reduced={reduced} elapsed={t} />

      <div className="relative z-10 w-full max-w-3xl px-6 text-center">
        <h2
          className="mx-auto flex flex-col items-center justify-center gap-y-1 font-mono text-[1.05rem] font-semibold leading-snug tracking-[0.02em] text-foreground sm:flex-row sm:flex-wrap sm:gap-x-[0.5ch] sm:text-3xl"
          style={{
            opacity: interfaceOpacity,
            textShadow: "0 0 26px oklch(0.80 0.10 210 / 0.28)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {LINES.map((line, li) => (
            <span key={li} className="block whitespace-nowrap">
              {line.split("").map((c, i) => {
                const index = cursor++;
                const done = reduced || index < resolved;
                const isActive = !reduced && index === resolved;
                if (c === " ") return <span key={i}>&nbsp;</span>;
                if (done)
                  return (
                    <span key={i} className="text-foreground">
                      {c}
                    </span>
                  );
                if (isActive)
                  return (
                    <span
                      key={i}
                      className="text-primary"
                      style={{ opacity: 0.75 + glyphStep * 0.08 }}
                    >
                      {GLYPHS[(index * 5 + glyphStep) % GLYPHS.length]}
                    </span>
                  );
                return (
                  <span key={i} className="text-primary/25">
                    {GLYPHS[(index * 3) % GLYPHS.length]}
                  </span>
                );
              })}
            </span>
          ))}
        </h2>

        <div className="mx-auto mt-8 max-w-md" style={{ opacity: interfaceOpacity }}>
          <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-grad-accent"
              style={{
                width: `${progress}%`,
                boxShadow: "0 0 10px oklch(0.78 0.13 210 / 0.65)",
              }}
            />
          </div>
          <div className="mt-3 flex h-4 items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground/80">
            <span key={statusLabel} className="anim-fade-in" style={{ animationDuration: "200ms" }}>
              {statusLabel}
            </span>
            <span className="tabular-nums">{progress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EntranceScene({ reduced, elapsed }: { reduced: boolean; elapsed: number }) {
  const sceneOpacity = Math.min(1, elapsed / 800);
  return (
    <div className="absolute inset-0" style={{ opacity: reduced ? 1 : sceneOpacity }}>
      {/* Deep-space foundation */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_10%,#0a1024_0%,#060a17_45%,#04060e_100%)]" />

      {/* Faint nebular haze / dust band */}
      <div
        className={`absolute inset-0 ${reduced ? "" : "entrance-glow"}`}
        style={{
          background:
            "radial-gradient(60% 32% at 22% 34%, oklch(0.45 0.07 250 / 0.22), transparent 70%), radial-gradient(48% 26% at 78% 58%, oklch(0.42 0.05 285 / 0.16), transparent 72%)",
          filter: "blur(18px)",
        }}
      />

      {/* Distant star field */}
      <div className={`absolute -inset-16 ${reduced ? "" : "entrance-drift"}`}>
        <div className="absolute inset-0 starfield opacity-45" />
        <div className="absolute inset-0 starfield-sparse opacity-35" />
      </div>

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="ent-earth" cx="28%" cy="18%" r="85%">
            <stop offset="0%" stopColor="#1d3f63" />
            <stop offset="55%" stopColor="#0e2440" />
            <stop offset="100%" stopColor="#050b16" />
          </radialGradient>
          <linearGradient id="ent-limb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.78 0.09 215 / 0.55)" />
            <stop offset="100%" stopColor="oklch(0.78 0.09 215 / 0)" />
          </linearGradient>
          <radialGradient id="ent-moon" cx="38%" cy="34%">
            <stop offset="0%" stopColor="#8d8f98" />
            <stop offset="70%" stopColor="#3b3e48" />
            <stop offset="100%" stopColor="#0a0d16" />
          </radialGradient>
        </defs>

        {/* Thin orbital arcs / coordinate lines */}
        <g stroke="oklch(0.80 0.06 210 / 0.10)" fill="none">
          <ellipse cx="980" cy="900" rx="720" ry="300" />
          <ellipse cx="980" cy="900" rx="540" ry="230" />
          <line x1="0" y1="150" x2="1200" y2="150" />
          <line x1="0" y1="640" x2="1200" y2="640" />
        </g>
        <g stroke="oklch(0.80 0.06 210 / 0.16)" strokeWidth="1">
          {[240, 420, 600, 780, 960].map((x) => (
            <line key={x} x1={x} y1="146" x2={x} y2="154" />
          ))}
        </g>

        {/* Distant, partly shadowed moon */}
        <circle cx="1010" cy="205" r="34" fill="url(#ent-moon)" opacity="0.6" />

        {/* Earth limb entering from the lower-right, cropped by the frame */}
        <g opacity="0.95">
          <circle cx="1010" cy="1000" r="420" fill="url(#ent-earth)" />
          <path
            d="M590 1000 A420 420 0 0 1 1430 1000"
            fill="none"
            stroke="url(#ent-limb)"
            strokeWidth="6"
          />
          <path
            d="M590 1000 A420 420 0 0 1 1430 1000"
            fill="none"
            stroke="oklch(0.86 0.08 210 / 0.30)"
            strokeWidth="1.5"
          />
        </g>

        {/* Ground-based observatory silhouette, lower third */}
        <g fill="#070b16" stroke="oklch(0.78 0.07 210 / 0.28)" strokeWidth="1.2">
          <path d="M150 700 L150 640 A64 64 0 0 1 278 640 L278 700 Z" />
          <path d="M196 604 L268 566" strokeLinecap="round" strokeWidth="4" />
          <rect x="132" y="698" width="164" height="8" rx="2" />
          <path d="M92 706 L336 706 L360 726 L68 726 Z" stroke="none" />
        </g>
      </svg>

      <div className="absolute inset-0 vignette" />
    </div>
  );
}
