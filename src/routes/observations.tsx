import { createFileRoute, Link } from "@tanstack/react-router";
import { siteUrl } from "@/data/site";
import { useEffect, useMemo, useState } from "react";
import {
  Telescope,
  LineChart,
  Radio,
  FileText,
  Database,
  Sparkles,
  Target,
  ClipboardList,
  Settings2,
  Filter,
  BookOpen,
  ArrowRight,
  ArrowUp,
  MapPin,
  ChevronDown,
  ExternalLink,
  Waves,
  Sun,
  Moon,
  Compass,
} from "lucide-react";
import { PageHero, Section } from "@/components/layout/Page";
import { cn } from "@/lib/utils";
import { facilities } from "@/data/facilities";
import { ObservatoryNetworkGlobe } from "@/components/observatory/ObservatoryNetworkGlobe";
import { projects } from "@/data/misc";
import facilityUgmrt from "@/assets/facility-ugmrt.jpg";
import facilityHct from "@/assets/facility-hct.jpg";
import facilityDot from "@/assets/facility-dot.jpg";

/* ------------------------------------------------------------------ */
/*  Local page navigator (unique to Observations)                     */
/* ------------------------------------------------------------------ */

type NavSection = { id: string; label: string };

const NAV_SECTIONS: NavSection[] = [
  { id: "overview", label: "Overview" },
  { id: "journey", label: "Observing Journey" },
  { id: "logbook", label: "Logbook" },
  { id: "wavelengths", label: "Wavelengths" },
  { id: "facilities", label: "Facilities" },
  { id: "pipeline", label: "Data Pipeline" },
  { id: "network", label: "Observatory Network" },
  { id: "outputs", label: "Research Outputs" },
];

function PageNavigator() {
  const astraHashEntry =
    typeof window !== "undefined" &&
    window.location.hash === "#network";

  const [activeId, setActiveId] = useState<string>(
    astraHashEntry ? "network" : NAV_SECTIONS[0].id,
  );
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [holdNetwork, setHoldNetwork] = useState(astraHashEntry);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCollapsed(window.innerWidth < 1536);
  }, []);

  useEffect(() => {
    if (!holdNetwork || typeof window === "undefined") return;

    const release = window.setTimeout(() => {
      setHoldNetwork(false);
      setActiveId("network");
    }, 1100);

    return () => window.clearTimeout(release);
  }, [holdNetwork]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    const compute = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
      let current = NAV_SECTIONS[0].id;
      for (const s of NAV_SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - 140 <= 0) current = s.id;
      }
      if (!holdNetwork) {
        setActiveId(current);
      }
    };
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [holdNetwork]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: "smooth" });
    if (history.replaceState) history.replaceState(null, "", `#${id}`);
  };

  const activeIndex = NAV_SECTIONS.findIndex((s) => s.id === activeId);
  const activeLabel = NAV_SECTIONS[activeIndex]?.label ?? "";

  return (
    <>
      {/* Desktop rail */}
      <nav
        aria-label="Observations page navigator"
        className="pointer-events-none fixed right-3 top-24 z-30 hidden lg:block"
      >
        {collapsed ? (
          <div className="pointer-events-auto flex w-11 flex-col items-center gap-2 rounded-2xl border border-white/10 bg-[oklch(0.09_0.03_265/0.92)] p-2 shadow-xl backdrop-blur-xl">
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-primary transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label="Expand page navigator"
              title="Expand navigator"
            >
              <Compass className="h-4 w-4" />
            </button>
            <div
              className="relative my-1 h-24 w-1 overflow-hidden rounded-full bg-white/5"
              aria-hidden
            >
              <div
                className="absolute bottom-0 left-0 w-full rounded-full bg-gradient-to-t from-primary/80 to-white/60"
                style={{ height: `${Math.max(6, progress * 100)}%` }}
              />
            </div>
            <div className="text-[9px] tabular-nums text-primary/80">
              {String(activeIndex + 1).padStart(2, "0")}
            </div>
          </div>
        ) : (
          <div className="pointer-events-auto w-60 rounded-2xl border border-white/10 bg-[oklch(0.09_0.03_265/0.92)] p-4 shadow-xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/80">
                On this page
              </div>
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label="Collapse navigator"
                title="Collapse"
              >
                <ChevronDown className="h-3.5 w-3.5 rotate-90" />
              </button>
            </div>
            <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-white/70 transition-[width] duration-200"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <ul className="space-y-1">
              {NAV_SECTIONS.map((s, i) => {
                const active = s.id === activeId;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => scrollToId(s.id)}
                      className={cn(
                        "group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                        active
                          ? "bg-primary/15 text-foreground"
                          : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                      )}
                      aria-current={active ? "true" : undefined}
                    >
                      <span
                        className={cn(
                          "inline-block h-1.5 w-1.5 rounded-full",
                          active ? "bg-primary shadow-[0_0_8px_var(--primary)]" : "bg-white/20",
                        )}
                        aria-hidden
                      />
                      <span className="tabular-nums text-[10px] text-primary/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="truncate">{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <ArrowUp className="h-3 w-3" /> Back to top
            </button>
          </div>
        )}
      </nav>

      {/* Mobile: compact sticky bar */}
      <div className="pointer-events-none fixed inset-x-3 bottom-3 z-30 lg:hidden">
        <div className="pointer-events-auto rounded-2xl border border-white/10 bg-[oklch(0.09_0.03_265/0.95)] shadow-xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            aria-expanded={mobileOpen}
            aria-controls="obs-mobile-nav"
          >
            <span className="flex items-center gap-2 text-xs">
              <Compass className="h-3.5 w-3.5 text-primary" aria-hidden />
              <span className="text-primary/80">
                {String(activeIndex + 1).padStart(2, "0")} · {activeLabel}
              </span>
            </span>
            <ChevronDown
              className={cn("h-4 w-4 text-muted-foreground transition-transform", mobileOpen && "rotate-180")}
              aria-hidden
            />
          </button>
          {mobileOpen && (
            <ul
              id="obs-mobile-nav"
              className="max-h-[50vh] space-y-0.5 overflow-y-auto border-t border-white/10 p-2"
            >
              {NAV_SECTIONS.map((s, i) => {
                const active = s.id === activeId;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        setTimeout(() => scrollToId(s.id), 60);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm min-h-11",
                        active ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-white/5",
                      )}
                      aria-current={active ? "true" : undefined}
                    >
                      <span className="tabular-nums text-[10px] text-primary/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span>{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Cinematic Hero — observatory at night                             */
/* ------------------------------------------------------------------ */

function ObservatoryHero() {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      {/* Sky gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.10 0.04 265) 0%, oklch(0.13 0.05 265) 40%, oklch(0.09 0.03 260) 75%, oklch(0.06 0.02 260) 100%)",
        }}
        aria-hidden
      />
      {/* Slow starfield */}
      <div className="absolute inset-0 -z-10 starfield anim-drift opacity-70" aria-hidden />
      {/* Milky Way arc */}
      <svg
        className="absolute inset-x-0 top-8 -z-10 h-[520px] w-full opacity-40"
        viewBox="0 0 1440 520"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <radialGradient id="mw" cx="50%" cy="15%" r="60%">
            <stop offset="0%" stopColor="oklch(0.85 0.06 285)" stopOpacity="0.55" />
            <stop offset="45%" stopColor="oklch(0.55 0.10 285)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="oklch(0.10 0.04 265)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="720" cy="180" rx="900" ry="180" fill="url(#mw)" />
      </svg>
      {/* Moon glow */}
      <div
        className="pointer-events-none absolute right-[8%] top-24 -z-10 h-40 w-40 rounded-full opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(closest-side, oklch(0.92 0.02 90 / 0.55), transparent 70%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[9%] top-28 -z-10 h-24 w-24 rounded-full"
        style={{ background: "radial-gradient(closest-side, oklch(0.96 0.02 90), oklch(0.85 0.03 85))" }}
        aria-hidden
      />
      {/* Mountain silhouette + dome */}
      <svg
        className="absolute inset-x-0 bottom-0 -z-10 h-[280px] w-full md:h-[360px]"
        viewBox="0 0 1440 360"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="ridgeFar" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.20 0.04 265)" />
            <stop offset="100%" stopColor="oklch(0.10 0.03 260)" />
          </linearGradient>
          <linearGradient id="ridgeNear" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.13 0.03 260)" />
            <stop offset="100%" stopColor="oklch(0.05 0.02 260)" />
          </linearGradient>
        </defs>
        {/* far ridge */}
        <path
          d="M0,240 L120,180 L240,220 L360,150 L500,200 L640,140 L780,190 L920,150 L1060,200 L1200,160 L1320,210 L1440,180 L1440,360 L0,360 Z"
          fill="url(#ridgeFar)"
        />
        {/* near ridge with observatory */}
        <path
          d="M0,300 L160,260 L320,290 L480,240 L620,270 L720,220 L740,220 L760,225 L900,260 L1080,235 L1240,275 L1440,255 L1440,360 L0,360 Z"
          fill="url(#ridgeNear)"
        />
        {/* dome */}
        <g transform="translate(700,190)">
          <rect x="10" y="20" width="80" height="18" fill="oklch(0.16 0.02 260)" />
          <path d="M10,20 Q50,-14 90,20 Z" fill="oklch(0.22 0.02 260)" />
          <rect x="46" y="4" width="8" height="20" fill="oklch(0.10 0.02 260)" />
          {/* aperture glow */}
          <rect x="46" y="4" width="8" height="20" fill="oklch(0.85 0.07 60 / 0.35)" />
        </g>
        {/* tiny instrument lights */}
        <circle cx="740" cy="228" r="1.4" fill="oklch(0.85 0.14 40)" opacity="0.85" />
        <circle cx="750" cy="235" r="1.1" fill="oklch(0.90 0.18 30)" opacity="0.75" />
      </svg>

      <div className="container-page relative">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-primary/90">
          <span className="h-1.5 w-1.5 rounded-full bg-primary anim-pulse-slow" />
          Observations
        </div>
        <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
          From <span className="text-grad-accent">photon</span> to publication
        </h1>
        <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
          A researcher-led observing journey across optical, near-infrared and low-frequency
          radio wavelengths — from telescope planning on Himalayan and Deccan-plateau
          observatories to calibrated data, physical interpretation and peer-reviewed
          publication.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#journey"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-lg transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Explore the observing journey
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
          <Link
            to="/facilities"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Research facilities
            <Telescope className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {/* Scroll cue */}
        <div className="mt-14 hidden items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:flex">
          <span className="h-8 w-px bg-gradient-to-b from-primary/80 to-transparent" aria-hidden />
          Scroll to begin the night
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Observing Journey Timeline                                        */
/* ------------------------------------------------------------------ */

const JOURNEY_STAGES = [
  {
    icon: Sparkles,
    title: "Scientific Question",
    desc: "Frame a specific, testable question about M-dwarf magnetism, flaring or stellar rotation that observations can address.",
  },
  {
    icon: Target,
    title: "Target Selection",
    desc: "Identify nearby cool stars — such as AD Leo, Wolf 359, GJ 1151 or GJ 398 — whose properties best probe the question.",
  },
  {
    icon: ClipboardList,
    title: "Proposal & Planning",
    desc: "Prepare observing proposals, define cadence and integration, and coordinate windows across ground-based and space-based facilities.",
  },
  {
    icon: Settings2,
    title: "Instrument Configuration",
    desc: "Choose the appropriate telescope, backend and mode — HFOSC on HCT, spectrographs on DOT, Band 4 / Band 5 on uGMRT, TESS short cadence.",
  },
  {
    icon: Telescope,
    title: "Data Acquisition",
    desc: "Execute the observing run: photometric monitoring, chromospheric spectra, interferometric imaging and dynamic spectra.",
  },
  {
    icon: Database,
    title: "Calibration & Reduction",
    desc: "Apply instrument-appropriate calibrations, produce cleaned light curves, wavelength-calibrated spectra and imaged radio maps.",
  },
  {
    icon: LineChart,
    title: "Scientific Analysis",
    desc: "Characterise flares, starspot modulation, chromospheric lines and radio constraints — connecting diagnostics across wavelengths.",
  },
  {
    icon: FileText,
    title: "Interpretation & Publication",
    desc: "Interpret the physical picture and share it through peer-reviewed papers, conference talks and open data products.",
  },
] as const;

function ObservingJourney() {
  return (
    <ol className="relative grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Connective line, hidden on small */}
      <div
        className="pointer-events-none absolute left-6 top-6 hidden h-[calc(100%-3rem)] w-px bg-gradient-to-b from-primary/40 via-white/10 to-transparent md:block lg:hidden"
        aria-hidden
      />
      {JOURNEY_STAGES.map((s, i) => (
        <li
          key={s.title}
          className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-white/[0.05]"
        >
          <div className="flex items-center justify-between">
            <span className="font-display text-2xl font-semibold text-grad-accent tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 transition-shadow group-hover:shadow-[0_0_16px_var(--primary)]">
              <s.icon className="h-4 w-4" aria-hidden />
            </span>
          </div>
          <h3 className="mt-3 font-display text-base font-semibold">{s.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          {i < JOURNEY_STAGES.length - 1 && (
            <div
              className="pointer-events-none absolute -right-2 top-1/2 hidden h-px w-4 -translate-y-1/2 bg-gradient-to-r from-primary/40 to-transparent lg:block"
              aria-hidden
            />
          )}
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/*  Observation Logbook                                               */
/* ------------------------------------------------------------------ */

type LogbookEntry = {
  facilitySlug: string;
  facility: string;
  instrument: string;
  wavelength: "Optical" | "Near-Infrared" | "Radio";
  purpose: string;
  targetType: string;
  role: string;
  relatedArea: string;
  relatedRef: { label: string; to?: string; href?: string };
  status: string;
};

const LOGBOOK: LogbookEntry[] = [
  {
    facilitySlug: "ugmrt",
    facility: "upgraded GMRT",
    instrument: "Band 4 & Band 5 interferometry (550–850 MHz · 1000–1450 MHz)",
    wavelength: "Radio",
    purpose: "Search for and constrain low-frequency emission from nearby M-dwarfs.",
    targetType: "Nearby M-dwarfs (GJ 1151, GJ 398)",
    role: "Principal Investigator on approved observing proposals",
    relatedArea: "Radio Astronomy of Cool Stars",
    relatedRef: { label: "GJ 1151 · uGMRT paper", to: "/publications", href: "#pub-gj1151-flares-ugmrt" },
    status: "Analysis connected to published work",
  },
  {
    facilitySlug: "hct",
    facility: "Himalayan Chandra Telescope",
    instrument: "HFOSC — medium-resolution optical spectroscopy",
    wavelength: "Optical",
    purpose: "Chromospheric line monitoring and flare spectroscopy of active M-dwarfs.",
    targetType: "Active M-dwarfs (AD Leo, EV Lac)",
    role: "Lead observer on multi-epoch spectroscopic runs",
    relatedArea: "Optical & Near-Infrared Spectroscopy",
    relatedRef: { label: "AD Leonis flare spectra", to: "/publications", href: "#pub-ad-leonis-flares-spectra" },
    status: "Research completed",
  },
  {
    facilitySlug: "dot",
    facility: "Devasthal Optical Telescope",
    instrument: "Optical / near-infrared spectroscopy",
    wavelength: "Near-Infrared",
    purpose: "Deep line-profile analysis of magnetic diagnostics on faint low-mass targets.",
    targetType: "Faint late-type M-dwarfs",
    role: "Programme collaborator",
    relatedArea: "Optical & Near-Infrared Spectroscopy",
    relatedRef: {
      label: "M-dwarf spectroscopy proceedings",
      to: "/publications",
      href: "#pub-understanding-magnetic-activity-mdwarfs-spectroscopy",
    },
    status: "Details documented in project records",
  },
  {
    facilitySlug: "tess",
    facility: "TESS (NASA)",
    instrument: "2-min & 20-sec cadence photometry",
    wavelength: "Optical",
    purpose: "High-cadence detection of flares, quasi-periodic pulsations and starspot modulation.",
    targetType: "M-dwarfs and young brown dwarfs",
    role: "Archival investigator and light-curve analyst",
    relatedArea: "Stellar Flares & Time-Domain Astronomy",
    relatedRef: { label: "Wolf 359 · starspots & QPP", to: "/publications", href: "#pub-wolf-359-starspots-qpp" },
    status: "Research completed",
  },
  {
    facilitySlug: "tess",
    facility: "TESS (NASA)",
    instrument: "Short-cadence photometry",
    wavelength: "Optical",
    purpose: "Spot modelling and rotation-period recovery for a benchmark active M-dwarf.",
    targetType: "TIC 272272592",
    role: "Lead author on the analysis",
    relatedArea: "Stellar Rotation & Starspots",
    relatedRef: { label: "TIC 272272592 · starspots", to: "/publications", href: "#pub-tic-272272592-starspots" },
    status: "Research completed",
  },
  {
    facilitySlug: "ugmrt",
    facility: "upgraded GMRT",
    instrument: "Low-frequency radio follow-up",
    wavelength: "Radio",
    purpose: "Multi-epoch monitoring of GJ 398 in coordination with optical flare studies.",
    targetType: "GJ 398 (M-dwarf)",
    role: "Principal Investigator on approved observing proposals",
    relatedArea: "Radio Astronomy of Cool Stars",
    relatedRef: { label: "GJ 398 flares & radio", to: "/publications", href: "#pub-gj-398-flares-radio" },
    status: "Analysis connected to published work",
  },
];

const LOGBOOK_FILTERS = ["All", "Optical", "Near-Infrared", "Radio"] as const;
type LogbookFilter = (typeof LOGBOOK_FILTERS)[number];

function Logbook() {
  const [filter, setFilter] = useState<LogbookFilter>("All");
  const entries = useMemo(
    () => (filter === "All" ? LOGBOOK : LOGBOOK.filter((e) => e.wavelength === filter)),
    [filter],
  );
  return (
    <>
      <div
        role="group"
        aria-label="Filter logbook by wavelength"
        className="mb-6 flex flex-wrap items-center gap-2"
      >
        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
          <Filter className="h-3 w-3" aria-hidden /> Filter
        </span>
        {LOGBOOK_FILTERS.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                active
                  ? "border-primary/40 bg-primary/15 text-foreground"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground",
              )}
              aria-pressed={active}
            >
              {f}
            </button>
          );
        })}
      </div>

      <ul className="grid gap-4 md:grid-cols-2">
        {entries.map((e, i) => (
          <li
            key={i}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.10_0.02_260/0.55)] p-5"
          >
            {/* Notebook rule */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-full opacity-[0.06]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0 22px, oklch(0.9 0.02 260) 22px 23px)",
              }}
              aria-hidden
            />
            <div className="relative">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em]">
                <span className="text-primary/80">Log · {String(i + 1).padStart(3, "0")}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5",
                    e.wavelength === "Radio" && "bg-[oklch(0.55_0.14_195/0.18)] text-[oklch(0.85_0.10_195)]",
                    e.wavelength === "Optical" && "bg-[oklch(0.70_0.15_60/0.18)] text-[oklch(0.90_0.12_60)]",
                    e.wavelength === "Near-Infrared" && "bg-[oklch(0.60_0.14_25/0.18)] text-[oklch(0.85_0.10_25)]",
                  )}
                >
                  {e.wavelength}
                </span>
              </div>
              <h3 className="mt-2 font-display text-lg font-semibold">{e.facility}</h3>
              <p className="text-xs text-muted-foreground">{e.instrument}</p>

              <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Purpose</dt>
                  <dd>{e.purpose}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Target</dt>
                  <dd>{e.targetType}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Role</dt>
                  <dd>{e.role}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Area</dt>
                  <dd>{e.relatedArea}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 text-xs">
                <span className="text-muted-foreground">{e.status}</span>
                {e.relatedRef.to && (
                  <Link
                    to={e.relatedRef.to}
                    hash={e.relatedRef.href?.replace(/^#/, "")}
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    {e.relatedRef.label}
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </Link>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Wavelength Domains                                                */
/* ------------------------------------------------------------------ */

function WavelengthDomains() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Optical */}
      <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.10_0.03_265/0.55)]">
        <div className="relative h-40 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.35 0.18 300), oklch(0.40 0.20 265), oklch(0.55 0.19 220), oklch(0.72 0.18 155), oklch(0.85 0.17 95), oklch(0.72 0.19 55), oklch(0.55 0.20 25))",
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, oklch(0.06 0.02 260 / 0.35), oklch(0.06 0.02 260 / 0.85))",
            }}
            aria-hidden
          />
          {/* Absorption lines */}
          <div className="absolute inset-0 flex items-end gap-[6px] px-4 pb-3" aria-hidden>
            {[3, 6, 2, 8, 4, 5, 3, 7, 4, 5, 6, 3, 4, 8, 5, 4, 6, 3, 5, 4].map((h, i) => (
              <span
                key={i}
                className="w-px flex-1 bg-white/80"
                style={{ height: `${h * 8}%`, opacity: 0.35 + (i % 3) * 0.15 }}
              />
            ))}
          </div>
          <Sun className="absolute right-3 top-3 h-4 w-4 text-white/70" aria-hidden />
        </div>
        <div className="p-5">
          <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Optical</div>
          <h3 className="mt-1 font-display text-xl font-semibold">0.35 – 1.0 µm</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Photometric monitoring and medium-resolution spectroscopy of chromospheric activity,
            starspots, rotation and flare energetics. HCT (HFOSC) and TESS anchor this window.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <Link to="/research/$slug" params={{ slug: "stellar-flares" }} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 hover:bg-white/10">Stellar Flares</Link>
            <Link to="/research/$slug" params={{ slug: "stellar-rotation-and-starspots" }} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 hover:bg-white/10">Rotation & Starspots</Link>
          </div>
        </div>
      </article>

      {/* Near-Infrared */}
      <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.10_0.03_265/0.55)]">
        <div className="relative h-40 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 60% at 30% 40%, oklch(0.45 0.14 30 / 0.85), transparent 70%), radial-gradient(90% 70% at 80% 70%, oklch(0.35 0.10 20 / 0.85), transparent 70%), oklch(0.10 0.03 40)",
            }}
            aria-hidden
          />
          {/* Faint spectral peaks */}
          <svg viewBox="0 0 400 160" className="absolute inset-0 h-full w-full" aria-hidden>
            <path
              d="M0,120 C40,110 60,80 90,90 C120,100 140,60 170,70 C200,80 220,50 260,65 C300,80 320,95 360,88 L400,92 L400,160 L0,160 Z"
              fill="oklch(0.85 0.10 30 / 0.25)"
              stroke="oklch(0.85 0.10 30 / 0.6)"
              strokeWidth="1"
            />
          </svg>
          <Moon className="absolute right-3 top-3 h-4 w-4 text-white/70" aria-hidden />
        </div>
        <div className="p-5">
          <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Near-Infrared</div>
          <h3 className="mt-1 font-display text-xl font-semibold">1.0 – 2.5 µm</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Magnetically sensitive spectral diagnostics of cool photospheres, complementing optical
            activity indicators. Supported by DOT-class spectroscopy for faint late-type stars.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <Link to="/research/$slug" params={{ slug: "optical-and-near-infrared-spectroscopy" }} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 hover:bg-white/10">Spectroscopy</Link>
            <Link to="/research/$slug" params={{ slug: "m-dwarf-magnetic-activity" }} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 hover:bg-white/10">M-dwarf Magnetism</Link>
          </div>
        </div>
      </article>

      {/* Radio */}
      <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.10_0.03_265/0.55)]">
        <div className="relative h-40 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, oklch(0.18 0.06 210), oklch(0.10 0.04 220))",
            }}
            aria-hidden
          />
          {/* Waveforms */}
          <svg viewBox="0 0 400 160" className="absolute inset-0 h-full w-full" aria-hidden>
            {[0, 1, 2].map((row) => (
              <path
                key={row}
                d={`M0,${40 + row * 40} Q25,${20 + row * 40} 50,${40 + row * 40} T100,${40 + row * 40} T150,${40 + row * 40} T200,${40 + row * 40} T250,${40 + row * 40} T300,${40 + row * 40} T350,${40 + row * 40} T400,${40 + row * 40}`}
                stroke={`oklch(${0.75 - row * 0.1} 0.12 195)`}
                strokeWidth="1.2"
                fill="none"
                opacity={0.8 - row * 0.2}
              />
            ))}
          </svg>
          {/* Dishes */}
          <svg viewBox="0 0 400 160" className="absolute inset-x-0 bottom-0 h-16 w-full" aria-hidden>
            {[40, 130, 220, 310].map((x, i) => (
              <g key={i} transform={`translate(${x},110)`}>
                <ellipse cx="10" cy="0" rx="14" ry="4" fill="oklch(0.22 0.03 220)" />
                <path d="M-2,-2 Q10,-16 22,-2" stroke="oklch(0.75 0.08 210)" strokeWidth="1.5" fill="none" />
                <line x1="10" y1="0" x2="10" y2="20" stroke="oklch(0.22 0.03 220)" strokeWidth="1.5" />
              </g>
            ))}
          </svg>
          <Radio className="absolute right-3 top-3 h-4 w-4 text-white/70" aria-hidden />
        </div>
        <div className="p-5">
          <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Radio</div>
          <h3 className="mt-1 font-display text-xl font-semibold">Metre wavelengths</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Low-frequency interferometric imaging and dynamic spectra with the uGMRT — used to
            search for, characterise or place upper limits on coherent emission from M-dwarfs.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <Link to="/research/$slug" params={{ slug: "radio-astronomy-of-cool-stars" }} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 hover:bg-white/10">Radio Astronomy</Link>
            <Link to="/facilities/$slug" params={{ slug: "ugmrt" }} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 hover:bg-white/10">uGMRT</Link>
          </div>
        </div>
      </article>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Telescopes & Facilities showcase                                  */
/* ------------------------------------------------------------------ */

const FACILITY_IMAGES: Record<string, { src: string; credit: string }> = {
  ugmrt: {
    src: facilityUgmrt,
    credit: "Representative visualisation — see NCRA-TIFR / GMRT for official imagery.",
  },
  hct: {
    src: facilityHct,
    credit: "Representative visualisation — see Indian Institute of Astrophysics for official imagery.",
  },
  dot: {
    src: facilityDot,
    credit: "Representative visualisation — see ARIES for official imagery.",
  },
};

function FacilityShowcase() {
  const shown = facilities.filter((f) => FACILITY_IMAGES[f.slug]);
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {shown.map((f) => {
        const img = FACILITY_IMAGES[f.slug];
        return (
          <article
            key={f.slug}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.10_0.02_260/0.55)]"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={img.src}
                alt={`Representative visualisation of ${f.fullName}`}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent 40%, oklch(0.05 0.02 260 / 0.85))",
                }}
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.24em] text-primary/90">
                  <MapPin className="h-3 w-3" aria-hidden />
                  {f.location}
                </div>
                <h3 className="font-display text-lg font-semibold">{f.abbreviation}</h3>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs text-muted-foreground">{f.fullName}</p>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Domain</dt>
                  <dd>{f.band}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Role in Diya's work</dt>
                  <dd className="text-muted-foreground">{f.role}</dd>
                </div>
              </dl>
              <p className="mt-3 text-[10px] italic text-muted-foreground">{img.credit}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <Link
                  to="/facilities/$slug"
                  params={{ slug: f.slug }}
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Full facility profile <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
                <a
                  href={f.officialWebsite}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  aria-label={`Visit official website: ${f.officialWebsiteLabel}`}
                >
                  Official site <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data reduction pipeline                                           */
/* ------------------------------------------------------------------ */

const PIPELINE = [
  { title: "Raw Observation", desc: "Frames or visibilities recorded at the telescope backend.", tone: "raw" },
  { title: "Instrumental Calibration", desc: "Bias, dark, flat, bandpass or gain corrections appropriate to the instrument.", tone: "cal" },
  { title: "Cleaning & Quality Check", desc: "Flag bad pixels, cosmic rays, RFI or corrupted scans.", tone: "cal" },
  { title: "Extraction / Imaging", desc: "Aperture or PSF photometry, spectral extraction, or radio imaging and self-calibration.", tone: "red" },
  { title: "Wavelength / Flux Analysis", desc: "Wavelength-calibrated spectra, calibrated light curves, imaged radio maps and dynamic spectra.", tone: "red" },
  { title: "Physical Interpretation", desc: "Flare energetics, chromospheric activity, spot modelling, radio constraints and upper limits.", tone: "sci" },
  { title: "Publication-Ready Result", desc: "Figures, tables and text prepared for peer-reviewed publication.", tone: "sci" },
] as const;

function DataPipeline() {
  const toneClass = (t: string) =>
    t === "raw"
      ? "from-[oklch(0.55_0.15_25)] to-[oklch(0.35_0.10_25)]"
      : t === "cal"
        ? "from-[oklch(0.55_0.15_90)] to-[oklch(0.35_0.10_90)]"
        : t === "red"
          ? "from-[oklch(0.55_0.15_195)] to-[oklch(0.35_0.10_195)]"
          : "from-[oklch(0.60_0.18_285)] to-[oklch(0.35_0.14_285)]";
  return (
    <>
      <ol className="relative space-y-3">
        <div
          className="pointer-events-none absolute left-4 top-4 h-[calc(100%-2rem)] w-px bg-gradient-to-b from-primary/40 via-white/10 to-transparent"
          aria-hidden
        />
        {PIPELINE.map((s, i) => (
          <li
            key={s.title}
            className="relative flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 pl-12"
          >
            <span
              className={cn(
                "absolute left-2 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b text-[10px] font-semibold tabular-nums text-white shadow-[0_0_10px_oklch(0.65_0.15_200/0.35)]",
                toneClass(s.tone),
              )}
            >
              {i + 1}
            </span>
            <div>
              <h3 className="font-display text-base font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs italic text-muted-foreground">
        Terminology and specific steps vary across optical photometry, spectroscopy and radio
        interferometry. The stages above summarise the shared logic rather than a single
        instrument workflow.
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Observatory Network — interactive 3D globe (see components/observatory) */
/* ------------------------------------------------------------------ */

function ObservatoryNetwork() {
  return <ObservatoryNetworkGlobe />;
}


/* ------------------------------------------------------------------ */
/*  Research outputs cross-link                                       */
/* ------------------------------------------------------------------ */

function ResearchOutputs() {
  const featured = projects.slice(0, 4);
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Observation → Output</div>
        <h3 className="mt-2 font-display text-2xl font-semibold">Every observation leads somewhere</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          Diya's observing programmes on uGMRT, HCT, DOT and TESS feed directly into research
          areas and peer-reviewed publications. The pathway is deliberate:
        </p>
        <ol className="mt-4 space-y-2 text-sm">
          {[
            "Facility & instrument",
            "Wavelength domain",
            "Scientific question",
            "Research project",
            "Publication",
          ].map((s, i, arr) => (
            <li key={s} className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] tabular-nums text-primary">
                {i + 1}
              </span>
              <span>{s}</span>
              {i < arr.length - 1 && (
                <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden />
              )}
            </li>
          ))}
        </ol>
        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <Link to="/research" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10">Research Areas</Link>
          <Link to="/projects" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10">Research Projects</Link>
          <Link to="/facilities" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10">Research Facilities</Link>
          <Link to="/publications" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 hover:bg-white/10">Publications</Link>
        </div>
      </div>
      <ul className="space-y-3">
        {featured.map((p) => (
          <li
            key={p.slug}
            className="rounded-xl border border-white/10 bg-[oklch(0.10_0.02_260/0.55)] p-4"
          >
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.22em]">
              <span className="text-primary/80">{p.wavelength}</span>
              <span className="text-muted-foreground">{p.status}</span>
            </div>
            <h4 className="mt-1 font-display text-base font-semibold">{p.shortTitle}</h4>
            <p className="mt-1 text-xs text-muted-foreground">{p.question}</p>
            <Link
              to="/projects/$slug"
              params={{ slug: p.slug }}
              className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View project <ArrowRight className="h-3 w-3" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Route                                                             */
/* ------------------------------------------------------------------ */

export const Route = createFileRoute("/observations")({
  head: () => ({
    meta: [
      { title: "Observations — From Photon to Publication · Diya Ram" },
      {
        name: "description",
        content:
          "An observing journey with Diya Ram across optical, near-infrared and radio wavelengths — planning, telescope time on uGMRT, HCT and DOT, calibration, analysis and publication.",
      },
      { property: "og:title", content: "Observations — From Photon to Publication · Diya Ram" },
      {
        property: "og:description",
        content:
          "A cinematic, researcher-led observing journey: planning, telescope operations, calibration and interpretation across optical, near-infrared and radio wavelengths.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl("/observations") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Observations — From Photon to Publication · Diya Ram" },
      {
        name: "twitter:description",
        content:
          "How Diya Ram's astronomical observations become peer-reviewed science across uGMRT, HCT, DOT and TESS.",
      },
    ],
    links: [{ rel: "canonical", href: siteUrl("/observations") }],
  }),
  component: ObservationsPage,
});

function ObservationsPage() {
  return (
    <>
      <PageNavigator />

      <ObservatoryHero />

      {/* Overview */}
      <Section
        id="overview"
        eyebrow="Mission Overview"
        title="An observing mission in motion"
        intro="Diya's research combines complementary wavelength regimes, national and space-based facilities, and a full observational workflow — from proposal to publication."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Wavelength Domains", value: "Optical · Near-IR · Radio", icon: Waves },
            { label: "Major Facilities", value: "uGMRT · HCT · DOT · TESS", icon: Telescope },
            { label: "Techniques", value: "Photometry · Spectroscopy · Interferometry", icon: LineChart },
            { label: "Programmes", value: "PI-led radio · Optical follow-up", icon: ClipboardList },
          ].map((m) => (
            <div key={m.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <m.icon className="h-4 w-4 text-primary" aria-hidden />
              <div className="mt-3 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {m.label}
              </div>
              <div className="mt-1 font-display text-base font-semibold">{m.value}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Journey */}
      <Section
        id="journey"
        eyebrow="Observing Journey"
        title="Eight stages from photon to publication"
        intro="The workflow that shapes every observing programme — from framing the scientific question to interpreting the results in a peer-reviewed paper."
      >
        <ObservingJourney />
      </Section>

      {/* Logbook */}
      <Section
        id="logbook"
        eyebrow="Observational Experience"
        title="A curated logbook"
        intro="Verified observational experience organised by facility and wavelength. Exact observing-night metadata remains in project records; entries below summarise role, purpose and connection to published research."
      >
        <Logbook />
      </Section>

      {/* Wavelengths */}
      <Section
        id="wavelengths"
        eyebrow="Spectral Windows"
        title="Three complementary wavelength domains"
        intro="Each window reveals a different aspect of stellar magnetism. Together they build a unified picture of activity on cool stars."
      >
        <WavelengthDomains />
      </Section>

      {/* Facilities */}
      <Section
        id="facilities"
        eyebrow="Telescopes & Observatories"
        title="Where the observations happen"
        intro="Ground- and space-based facilities that anchor the observational programme. Visuals are representative; official imagery is available on each facility's website."
      >
        <FacilityShowcase />
      </Section>

      {/* Pipeline */}
      <Section
        id="pipeline"
        eyebrow="Data Reduction"
        title="From raw signal to scientific result"
        intro="The reduction pipeline turns raw frames and visibilities into calibrated, publication-ready data products."
      >
        <DataPipeline />
      </Section>

      {/* Network */}
      <Section
        id="network"
        eyebrow="Geographical Reach"
        title="Observatory network"
        intro="A schematic of the observatories used across Diya's programmes — from Himalayan ridges to the Deccan plateau, complemented by TESS in Earth orbit."
      >
        <ObservatoryNetwork />
      </Section>

      {/* Outputs */}
      <Section
        id="outputs"
        eyebrow="Interconnected Science"
        title="From observation to research output"
        intro="Observations connect directly to research areas, projects and peer-reviewed publications across the site."
      >
        <ResearchOutputs />
      </Section>

      {/* Personal narrative */}
      <Section className="!pt-4">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[oklch(0.10_0.03_265/0.55)] p-8 text-center">
          <BookOpen className="mx-auto h-5 w-5 text-primary" aria-hidden />
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Her observational workflow combines low-frequency radio interferometry with
            optical and near-infrared spectroscopy to build a coherent picture of magnetic
            activity on M-dwarf stars — connecting the physics of the star to the
            environment it creates for any planets that orbit it.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/publications"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Explore publications <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              to="/research"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm hover:bg-white/10"
            >
              Research areas
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
