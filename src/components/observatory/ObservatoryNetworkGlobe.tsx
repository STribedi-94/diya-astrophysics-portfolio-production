/**
 * ObservatoryNetworkGlobe — the Observations page "Geographical Reach" visualisation.
 * Isolated, client-only, lazily loaded WebGL scene with an accessible companion
 * list, a facility information panel, immersive fullscreen mode and a static fallback.
 */
import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Expand,
  Globe2,
  MapPin,
  Minimize2,
  Move3d,
  Orbit,
  Rotate3d,
  RotateCcw,
  Satellite,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { groundNodes, networkNodes, spaceNode, type NetworkNode } from "@/data/observatory-network";
import { usePerf } from "@/lib/performance";

const GlobeScene =
  lazy(
    () =>
      import("./GlobeScene"),
  );

type AstraInteractionMode =
  | "earth"
  | "scene";

/* ------------------------------------------------------------------ */
/*  Error isolation                                                    */
/* ------------------------------------------------------------------ */

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/*  Static fallback (no WebGL)                                         */
/* ------------------------------------------------------------------ */

function StaticFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 400 320" className="h-full w-full" role="img"
        aria-label="Diagram of Earth with the uGMRT, HCT and DOT observatories in India and the TESS spacecraft on a highly elliptical Earth orbit.">
        <defs>
          <radialGradient id="onf-earth" cx="38%" cy="32%">
            <stop offset="0%" stopColor="oklch(0.55 0.10 230)" />
            <stop offset="70%" stopColor="oklch(0.30 0.07 250)" />
            <stop offset="100%" stopColor="oklch(0.14 0.04 265)" />
          </radialGradient>
          <radialGradient id="onf-atm" cx="50%" cy="50%">
            <stop offset="78%" stopColor="oklch(0.6 0.12 235 / 0)" />
            <stop offset="100%" stopColor="oklch(0.65 0.12 235 / 0.45)" />
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="160" rx="170" ry="96" fill="none" stroke="oklch(0.72 0.12 300 / 0.42)" strokeDasharray="4 6" transform="rotate(-16 200 160)" />
        <circle cx="200" cy="170" r="86" fill="url(#onf-earth)" />
        <circle cx="200" cy="170" r="94" fill="url(#onf-atm)" />
        {[
          { x: 214, y: 158, c: "#4fd8c0", l: "uGMRT" },
          { x: 224, y: 138, c: "#7fa8ff", l: "HCT" },
          { x: 222, y: 148, c: "#ffb774", l: "DOT" },
        ].map((m) => (
          <g key={m.l}>
            <circle cx={m.x} cy={m.y} r="3.2" fill={m.c} />
            <circle cx={m.x} cy={m.y} r="7" fill="none" stroke={m.c} strokeOpacity="0.4" />
          </g>
        ))}
        <g transform="translate(348,96)">
          <rect x="-5" y="-5" width="10" height="10" fill="#d8d8e4" />
          <rect x="-14" y="-2.5" width="8" height="5" fill="#3f5fa8" />
          <rect x="6" y="-2.5" width="8" height="5" fill="#3f5fa8" />
        </g>
        <text x="330" y="80" fontSize="10" fill="#c49bff" textAnchor="middle">TESS</text>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function ObservatoryNetworkGlobe() {
  const { allowWebGL, mode } = usePerf();

  const wrapRef = useRef<HTMLElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);

  // Starts true so the scene mounts with the component; checks below only pause
  // the render loop when the globe is scrolled well out of view.
  const [inView, setInView] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] =
    useState(false);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [
    interactionMode,
    setInteractionMode,
  ] =
    useState<AstraInteractionMode>(
      "earth",
    );

  const [
    restoreSignal,
    setRestoreSignal,
  ] =
    useState(0);

  const [hintDismissed, setHintDismissed] = useState(false);

  // Fullscreen belongs to this React wrapper rather than the Three.js camera
  // system. The same GlobeScene therefore remains mounted across entry/exit.
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenSupported, setFullscreenSupported] = useState(false);

  const selected = networkNodes.find((n) => n.id === selectedId) ?? null;

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const check = () => {
      // The original document position is irrelevant while this surface
      // owns native browser fullscreen.
      if (document.fullscreenElement === fullscreenRef.current) {
        setInView(true);
        return;
      }

      const r = el.getBoundingClientRect();
      setInView(r.bottom > -300 && r.top < window.innerHeight + 300);
    };

    check();

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(() => check(), { rootMargin: "300px", threshold: 0 });
      io.observe(el);
    }

    document.addEventListener("scroll", check, { passive: true, capture: true });
    window.addEventListener("resize", check);

    return () => {
      io?.disconnect();
      document.removeEventListener("scroll", check, true);
      window.removeEventListener("resize", check);
    };
  }, []);

  useEffect(() => {
    const el = fullscreenRef.current;

    setFullscreenSupported(
      Boolean(
        el &&
        typeof el.requestFullscreen === "function" &&
        typeof document.exitFullscreen === "function",
      ),
    );

    const onFullscreenChange = () => {
      const active = document.fullscreenElement === fullscreenRef.current;
      setIsFullscreen(active);

      if (active) {
        setInView(true);
        return;
      }

      const wrap = wrapRef.current;
      if (!wrap) return;

      const r = wrap.getBoundingClientRect();
      setInView(r.bottom > -300 && r.top < window.innerHeight + 300);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    // In native fullscreen Escape belongs to the browser exit operation.
    // Outside fullscreen it retains the existing selected-panel behaviour.
    if (!selectedId || isFullscreen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, isFullscreen]);

  const enterFullscreen = async () => {
    const el = fullscreenRef.current;
    if (!el || typeof el.requestFullscreen !== "function") return;

    try {
      await el.requestFullscreen();
      setHintDismissed(true);
    } catch {
      // Native fullscreen may be denied by browser/device policy.
      // The embedded Observatory remains fully usable.
    }
  };

  const exitFullscreen = async () => {
    if (
      document.fullscreenElement !== fullscreenRef.current ||
      typeof document.exitFullscreen !== "function"
    ) {
      return;
    }

    try {
      await document.exitFullscreen();
    } catch {
      // Browser controls and Escape remain available as an exit path.
    }
  };

  const lowPower = reduced || mode === "reduced-motion" || mode === "performance";
  const showScene = mounted && allowWebGL && !failed;
  const sceneActive = isFullscreen || inView;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
      {/* ---------- Globe ---------- */}
      <figure
        ref={wrapRef}
        className="relative m-0 overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.07_0.025_265/0.9)]"
      >
        {/* Native fullscreen expands this existing surface. GlobeScene is not remounted. */}
        <div
          ref={fullscreenRef}
          className={cn(
            "relative overflow-hidden bg-[oklch(0.07_0.025_265/1)]",
            isFullscreen && "h-screen w-screen rounded-none",
          )}
        >
          <div
            className={cn(
              "relative w-full",
              isFullscreen
                ? "h-[100dvh] min-h-screen"
                : "h-[340px] sm:h-[420px] lg:h-[560px]",
            )}
            role="group"
            aria-label="Interactive 3D Observatory Network visualisation: Earth with the Indian ground observatories and the TESS spacecraft in Earth orbit. A text list of the same facilities follows."
          >
            {showScene && (
              <SceneBoundary onError={() => setFailed(true)}>
                <Suspense fallback={null}>
                  <GlobeScene
                    selectedId={selectedId}
                    onSelect={(id) => {
                      setSelectedId(id);
                      setHintDismissed(true);
                    }}
                    onReady={() => setReady(true)}
                    onError={() => setFailed(true)}
                    reducedMotion={
                      lowPower
                    }
                    active={sceneActive}
                    interactionMode={
                      interactionMode
                    }
                    restoreSignal={
                      restoreSignal
                    }
                  />
                </Suspense>
              </SceneBoundary>
            )}

            {(failed || (mounted && !allowWebGL)) && <StaticFallback />}

            {!ready && !failed && allowWebGL && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-24 w-24 rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_30%,oklch(0.32_0.06_250),oklch(0.11_0.03_265))]" />
                  <div className="h-px w-32 overflow-hidden bg-white/10">
                    <div className="h-full w-1/3 animate-[slide-in-right_1.6s_ease-in-out_infinite] bg-primary/70" />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                    Initializing observatory network
                  </span>
                </div>
              </div>
            )}

            {/* Fullscreen entry / exit */}
            {ready && !failed && fullscreenSupported && (
              <div
                className={cn(
                  "absolute right-3 top-3 z-30",
                  isFullscreen && "right-4 top-4 sm:right-5 sm:top-5",
                )}
              >
                <button
                  type="button"
                  onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                  className={cn(
                    "group flex items-center gap-2 rounded-xl border border-white/10 bg-[oklch(0.10_0.03_265/0.78)] text-foreground shadow-lg backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-[oklch(0.14_0.035_265/0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    isFullscreen ? "px-3 py-2 text-xs" : "p-2.5 sm:px-3 sm:py-2",
                  )}
                  aria-label={
                    isFullscreen
                      ? "Exit fullscreen Observatory Network"
                      : "Open Observatory Network in fullscreen"
                  }
                  title={isFullscreen ? "Exit fullscreen" : "View fullscreen"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4 text-primary" aria-hidden />
                  ) : (
                    <Expand className="h-4 w-4 text-primary" aria-hidden />
                  )}
                  <span className={cn("whitespace-nowrap", isFullscreen ? "inline" : "hidden sm:inline")}>
                    {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  </span>
                </button>
              </div>
            )}

            {ready && !failed && (
              <div
                className={cn(
                  "absolute left-1/2 z-20 flex max-w-[calc(100%-1rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-xl border border-white/10 bg-[oklch(0.10_0.03_265/0.82)] p-1 text-[10px] shadow-lg backdrop-blur-md",
                  isFullscreen ? "bottom-4 sm:bottom-5" : "bottom-3",
                )}
                role="toolbar"
                aria-label="Observatory interaction controls"
              >
                <button
                  type="button"
                  onClick={() => {
                    setInteractionMode(
                      "earth",
                    );
                    setHintDismissed(
                      true,
                    );
                  }}
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 transition-colors",
                    interactionMode ===
                      "earth"
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                  aria-pressed={
                    interactionMode ===
                    "earth"
                  }
                  title="Drag to rotate Earth independently"
                >
                  <Rotate3d
                    className="h-3 w-3"
                    aria-hidden
                  />
                  <span className="whitespace-nowrap">
                    Rotate Earth
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setInteractionMode(
                      "scene",
                    );
                    setHintDismissed(
                      true,
                    );
                  }}
                  className={cn(
                    "flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 transition-colors",
                    interactionMode ===
                      "scene"
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                  aria-pressed={
                    interactionMode ===
                    "scene"
                  }
                  title="Drag to orbit the complete astronomical scene"
                >
                  <Orbit
                    className="h-3 w-3"
                    aria-hidden
                  />
                  <span className="whitespace-nowrap">
                    Orbit Scene
                  </span>
                </button>

                <span
                  className="mx-0.5 h-4 w-px shrink-0 bg-white/10"
                  aria-hidden
                />

                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(null);
                    setInteractionMode(
                      "earth",
                    );
                    setRestoreSignal(
                      (value) =>
                        value + 1,
                    );
                    setHintDismissed(
                      true,
                    );
                  }}
                  className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                  title="Restore the canonical India–Sun overview"
                >
                  <RotateCcw
                    className="h-3 w-3"
                    aria-hidden
                  />
                  <span className="whitespace-nowrap">
                    Restore
                  </span>
                </button>

                {!hintDismissed && (
                  <span className="hidden shrink-0 items-center gap-1 px-1 text-muted-foreground sm:flex">
                    <Move3d
                      className="h-3 w-3"
                      aria-hidden
                    />
                    Drag · scroll or pinch
                  </span>
                )}
              </div>
            )}

            {/* Legend */}
            {!failed && allowWebGL && (
              <div
                className={cn(
                  "pointer-events-none absolute left-3 top-3 space-y-1 rounded-xl border border-white/10 bg-[oklch(0.10_0.03_265/0.6)] px-2.5 py-2 text-[10px] backdrop-blur-sm",
                  isFullscreen && "left-4 top-4 sm:left-5 sm:top-5",
                )}
              >
                {networkNodes.map((n) => (
                  <div key={n.id} className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: n.color }} aria-hidden />
                    <span className="text-foreground/90">{n.shortName}</span>
                    <span className="opacity-70">{n.kind === "space" ? "Space" : "Ground"}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Fullscreen identity */}
            {isFullscreen && ready && !failed && (
              <div className="pointer-events-none absolute left-1/2 top-4 z-20 hidden -translate-x-1/2 text-center sm:block">
                <div className="text-[9px] font-medium uppercase tracking-[0.32em] text-primary/75">
                  Diya Astra
                </div>
                <div className="mt-1 text-[11px] tracking-[0.12em] text-foreground/65">
                  Observatory Network
                </div>
              </div>
            )}

            {/* Selected facility panel */}
            {selected && (
              <div
                className={cn(
                  "absolute left-3 rounded-xl border border-white/10 bg-[oklch(0.10_0.03_265/0.88)] p-3 backdrop-blur-md sm:max-w-xs",
                  isFullscreen
                    ? "bottom-16 right-3 sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-sm"
                    : "bottom-3 right-3",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full" style={{ background: selected.color }} aria-hidden />
                      <span className="font-display text-sm font-semibold">{selected.shortName}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">{selected.fullName}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label={`Close ${selected.shortName} information`}
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">{selected.kindLabel}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">{selected.domain}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{selected.description}</p>
                <div className="mt-2 text-[10px] text-muted-foreground">
                  {selected.location}
                  {selected.coordsLabel ? ` · ${selected.coordsLabel}` : ""}
                </div>
                <Link
                  to="/facilities/$slug"
                  params={{ slug: selected.slug }}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Facility profile <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </div>
            )}
          </div>
        </div>

        <figcaption className="border-t border-white/5 px-4 py-2 text-[11px] text-muted-foreground">
          Ground facilities are placed at their real coordinates. The TESS orbit is illustrative and
          time-compressed — it is not a real-time representation of the spacecraft&apos;s position.
        </figcaption>
      </figure>

      {/* ---------- Accessible companion list ---------- */}
      <ul className="grid gap-3 self-start">
        {networkNodes.map((n) => {
          const isSel = selectedId === n.id;
          return (
            <li key={n.id}>
              <div
                className={cn(
                  "rounded-xl border p-4 transition-colors",
                  isSel ? "border-primary/40 bg-primary/[0.07]" : "border-white/10 bg-white/[0.03]",
                )}
              >
                <button
                  type="button"
                  aria-pressed={isSel}
                  onClick={() => setSelectedId(isSel ? null : n.id)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: n.color }} aria-hidden />
                    <span className="font-display text-base font-semibold">{n.shortName}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
                    {n.kind === "space" ? (
                      <Satellite className="h-3 w-3" aria-hidden />
                    ) : (
                      <MapPin className="h-3 w-3" aria-hidden />
                    )}
                    {n.kind === "space" ? "Space" : "Ground"}
                  </span>
                </button>
                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="sr-only">{n.a11yLabel} </span>
                  {n.location}
                  {n.coordsLabel ? ` · ${n.coordsLabel}` : ""}
                </p>
                <Link
                  to="/facilities/$slug"
                  params={{ slug: n.slug }}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Facility profile <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </div>
            </li>
          );
        })}

        <li className="flex items-start gap-2 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-muted-foreground">
          <Globe2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
          <span>
            {groundNodes.length} ground observatories across India work alongside {spaceNode.shortName} in
            a highly elliptical high-Earth orbit (≈ 13.7-day period, 2:1 lunar resonance) to enable
            multi-wavelength study of M-dwarf activity.
          </span>
        </li>
      </ul>
    </div>
  );
}