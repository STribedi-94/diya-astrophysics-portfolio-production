/**
 * ObservatoryNetworkGlobe — the Observations page "Geographical Reach" visualisation.
 * Isolated, client-only, lazily loaded WebGL scene with an accessible companion
 * list, a facility information panel and a static fallback.
 */
import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Globe2, MapPin, Move3d, Satellite, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { groundNodes, networkNodes, spaceNode, type NetworkNode } from "@/data/observatory-network";

const GlobeScene = lazy(() => import("./GlobeScene"));

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
  const wrapRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);

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
      const r = el.getBoundingClientRect();
      setInView(r.bottom > -300 && r.top < window.innerHeight + 300);
    };
    check();
    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(() => check(), { rootMargin: "300px", threshold: 0 });
      io.observe(el);
    }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      io?.disconnect();
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);


  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId]);

  const showScene = mounted && inView && !failed;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
      {/* ---------- Globe ---------- */}
      <figure
        ref={wrapRef}
        className="relative m-0 overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.07_0.025_265/0.9)]"
      >
        <div
          className="relative h-[340px] w-full sm:h-[420px] lg:h-[560px]"
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
                  reducedMotion={reduced}
                  active={inView}
                />
              </Suspense>
            </SceneBoundary>
          )}

          {failed && <StaticFallback />}

          {!ready && !failed && (
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

          {ready && !hintDismissed && !failed && (
            <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-[oklch(0.12_0.03_265/0.75)] px-3 py-1 text-[10px] text-muted-foreground backdrop-blur-sm">
              <Move3d className="mr-1 inline h-3 w-3" aria-hidden /> Drag to rotate · scroll or pinch to zoom
            </div>
          )}

          {/* Legend */}
          {!failed && (
            <div className="pointer-events-none absolute left-3 top-3 space-y-1 rounded-xl border border-white/10 bg-[oklch(0.10_0.03_265/0.6)] px-2.5 py-2 text-[10px] backdrop-blur-sm">
              {networkNodes.map((n) => (
                <div key={n.id} className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: n.color }} aria-hidden />
                  <span className="text-foreground/90">{n.shortName}</span>
                  <span className="opacity-70">{n.kind === "space" ? "Space" : "Ground"}</span>
                </div>
              ))}
            </div>
          )}

          {/* Selected facility panel */}
          {selected && (
            <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/10 bg-[oklch(0.10_0.03_265/0.88)] p-3 backdrop-blur-md sm:max-w-xs">
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
        <figcaption className="border-t border-white/5 px-4 py-2 text-[11px] text-muted-foreground">
          Ground facilities are placed at their real coordinates. The TESS orbit is illustrative and
          time-compressed — it is not a real-time representation of the spacecraft's position.
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
