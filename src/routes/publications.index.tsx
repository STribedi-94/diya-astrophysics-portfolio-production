import type { ReactElement } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Copy,
  ExternalLink,
  Filter,
  Menu,
  Presentation,
  Radio,
  Search,
  Sparkles,
  Star,
  Telescope,
  Users,
  X,
} from "lucide-react";
import { profileLinks } from "@/data/about";
import {
  archiveMetrics,
  communityContribution,
  formatBibtex,
  formatPlainCitation,
  publicationsArchive,
  researchThemes,
  scientificEvents,
  workshops,
  type PublicationRecord,
  type EventRole,
} from "@/data/publications-archive";
import heroImage from "@/assets/hubble-ultra-deep-field.jpg.asset.json";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/publications/")({
  head: () => ({
    meta: [
      { title: "Publications & Scientific Exchange | Diya Ram — Astrophysics Research" },
      {
        name: "description",
        content:
          "Explore Diya Ram's research on M-dwarf magnetic activity, stellar flares, starspots, TESS photometry, optical spectroscopy and uGMRT radio observations.",
      },
      { property: "og:title", content: "Publications & Scientific Exchange — Diya Ram" },
      {
        property: "og:description",
        content:
          "A cosmic archive of first-author and collaborative research on magnetic activity in nearby M-dwarf stars.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://astro-diya-portfolio.lovable.app/publications" },
      { property: "og:image", content: `https://astro-diya-portfolio.lovable.app${heroImage.url}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `https://astro-diya-portfolio.lovable.app${heroImage.url}` },
    ],
    links: [
      { rel: "canonical", href: "https://astro-diya-portfolio.lovable.app/publications" },
      { rel: "preload", as: "image", href: heroImage.url },
    ],
  }),
  component: PublicationsPage,
});

// ============================================================================
// UI atoms
// ============================================================================

function Chip({
  children,
  active,
  onClick,
  ariaLabel,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  const Cmp = onClick ? "button" : "span";
  return (
    <Cmp
      {...(onClick ? { onClick, "aria-pressed": active, "aria-label": ariaLabel, type: "button" } : {})}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-all",
        active
          ? "border-primary/60 bg-primary/15 text-primary-foreground shadow-[0_0_18px_-4px_oklch(0.78_0.15_210/0.45)]"
          : "border-white/10 bg-white/[0.03] text-white/70 hover:border-white/25 hover:bg-white/[0.06] hover:text-white/90",
      )}
    >
      {children}
    </Cmp>
  );
}

function StatusBadge({ status }: { status: PublicationRecord["status"] }) {
  const styles = {
    Published: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
    Accepted: "border-amber-400/40 bg-amber-400/10 text-amber-200",
    Proceeding: "border-cyan-400/40 bg-cyan-400/10 text-cyan-200",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
        styles[status],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function RoleBadge({ role }: { role: PublicationRecord["role"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em]",
        role === "First Author"
          ? "border-primary/50 bg-primary/10 text-primary"
          : "border-white/15 bg-white/[0.04] text-white/70",
      )}
    >
      {role === "First Author" ? <Star className="h-3 w-3" /> : <Users className="h-3 w-3" />}
      {role}
    </span>
  );
}

function Authors({ authors, diyaPos }: { authors: string[]; diyaPos: number }) {
  return (
    <p className="text-sm leading-relaxed text-white/70">
      {authors.map((a, i) => (
        <span key={a}>
          <span className={cn(i + 1 === diyaPos && "font-semibold text-white")}>{a}</span>
          {i < authors.length - 1 ? ", " : ""}
        </span>
      ))}
    </p>
  );
}

// ============================================================================
// Cosmic micro-scenes for first-author panels (unchanged — each is distinct)
// ============================================================================

function SceneGJ1151() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="g1151-star" cx="30%" cy="50%" r="55%">
          <stop offset="0%" stopColor="oklch(0.85 0.14 45)" stopOpacity="0.95" />
          <stop offset="50%" stopColor="oklch(0.55 0.18 25)" stopOpacity="0.6" />
          <stop offset="100%" stopColor="oklch(0.14 0.04 265)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="260" fill="oklch(0.11 0.03 265)" />
      {[...Array(60)].map((_, i) => (
        <circle key={i} cx={Math.random() * 400} cy={Math.random() * 260} r={Math.random() * 0.9} fill="white" opacity={Math.random() * 0.7} />
      ))}
      <circle cx="120" cy="130" r="120" fill="url(#g1151-star)" />
      <circle cx="120" cy="130" r="26" fill="oklch(0.9 0.14 50)" />
      {[70, 100, 140, 180].map((r) => (
        <circle key={r} cx="300" cy="130" r={r} fill="none" stroke="oklch(0.78 0.15 210)" strokeOpacity={0.28 - r * 0.001} strokeDasharray="2 6" />
      ))}
      <circle cx="300" cy="130" r="4" fill="oklch(0.78 0.15 210)" />
      <text x="300" y="105" textAnchor="middle" fill="oklch(0.78 0.15 210 / 0.85)" fontSize="9" style={{ letterSpacing: "0.2em" }}>uGMRT · UPPER LIMIT</text>
      <text x="120" y="235" textAnchor="middle" fill="oklch(0.9 0.1 50 / 0.7)" fontSize="9" style={{ letterSpacing: "0.2em" }}>GJ 1151 · M4.5V</text>
    </svg>
  );
}

function SceneWolf359() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="wolf-star" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="oklch(0.75 0.20 25)" stopOpacity="0.95" />
          <stop offset="60%" stopColor="oklch(0.4 0.18 20)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.14 0.04 265)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="260" fill="oklch(0.11 0.03 265)" />
      {[...Array(50)].map((_, i) => (
        <circle key={i} cx={Math.random() * 400} cy={Math.random() * 260} r={Math.random() * 0.8} fill="white" opacity={Math.random() * 0.7} />
      ))}
      <circle cx="200" cy="130" r="110" fill="url(#wolf-star)" />
      <circle cx="200" cy="130" r="55" fill="oklch(0.55 0.20 25)" />
      <ellipse cx="180" cy="115" rx="14" ry="10" fill="oklch(0.28 0.10 20)" opacity="0.85" />
      <ellipse cx="215" cy="140" rx="10" ry="7" fill="oklch(0.28 0.10 20)" opacity="0.85" />
      <ellipse cx="195" cy="155" rx="6" ry="5" fill="oklch(0.28 0.10 20)" opacity="0.7" />
      <path d="M 20 220 Q 60 200, 100 220 T 180 220 T 260 220 T 340 220 T 400 220" fill="none" stroke="oklch(0.78 0.15 210)" strokeWidth="1.5" opacity="0.7" />
      <text x="20" y="245" fill="oklch(0.78 0.15 210 / 0.75)" fontSize="9" style={{ letterSpacing: "0.2em" }}>QUASI-PERIODIC PULSATION</text>
    </svg>
  );
}

function SceneADLeo() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="spec-adleo" x1="0" x2="1">
          <stop offset="0%" stopColor="oklch(0.42 0.18 295)" />
          <stop offset="35%" stopColor="oklch(0.68 0.19 245)" />
          <stop offset="55%" stopColor="oklch(0.78 0.15 210)" />
          <stop offset="75%" stopColor="oklch(0.82 0.16 85)" />
          <stop offset="100%" stopColor="oklch(0.72 0.18 45)" />
        </linearGradient>
        <radialGradient id="flare-adleo" cx="30%" cy="50%" r="55%">
          <stop offset="0%" stopColor="oklch(0.9 0.18 55)" stopOpacity="1" />
          <stop offset="50%" stopColor="oklch(0.55 0.2 25)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.14 0.04 265)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="260" fill="oklch(0.11 0.03 265)" />
      {[...Array(40)].map((_, i) => (
        <circle key={i} cx={Math.random() * 400} cy={Math.random() * 260} r={Math.random() * 0.9} fill="white" opacity={Math.random() * 0.7} />
      ))}
      <circle cx="110" cy="130" r="110" fill="url(#flare-adleo)" />
      <circle cx="110" cy="130" r="28" fill="oklch(0.92 0.15 55)" />
      <path d="M 220 200 L 250 200 L 260 100 L 275 180 L 300 195 L 380 195" fill="none" stroke="oklch(0.9 0.16 55)" strokeWidth="1.8" />
      <rect x="220" y="40" width="160" height="10" rx="5" fill="url(#spec-adleo)" opacity="0.9" />
      {[240, 260, 285, 320, 355].map((x) => (
        <rect key={x} x={x} y="40" width="1.6" height="10" fill="oklch(0.14 0.04 265)" />
      ))}
      <text x="220" y="30" fill="oklch(0.96 0.01 250 / 0.7)" fontSize="9" style={{ letterSpacing: "0.2em" }}>Hα · Ca II H&K</text>
      <text x="220" y="228" fill="oklch(0.9 0.16 55 / 0.8)" fontSize="9" style={{ letterSpacing: "0.2em" }}>SUPERFLARE 4.9×10³⁵ erg</text>
    </svg>
  );
}

function SceneGJ398() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="gj398-halo" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="oklch(0.75 0.14 85)" stopOpacity="0.8" />
          <stop offset="50%" stopColor="oklch(0.45 0.12 60)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="oklch(0.14 0.04 265)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="260" fill="oklch(0.09 0.03 275)" />
      {/* interstellar dust */}
      {[...Array(120)].map((_, i) => (
        <circle key={i} cx={Math.random() * 400} cy={Math.random() * 260} r={Math.random() * 1.4} fill="oklch(0.75 0.05 45)" opacity={Math.random() * 0.35} />
      ))}
      <circle cx="200" cy="130" r="150" fill="url(#gj398-halo)" />
      <circle cx="200" cy="130" r="18" fill="oklch(0.88 0.14 75)" opacity="0.9" />
      <circle cx="200" cy="130" r="30" fill="none" stroke="oklch(0.82 0.16 85)" strokeOpacity="0.4" strokeDasharray="3 5" />
      <text x="200" y="235" textAnchor="middle" fill="oklch(0.82 0.16 85 / 0.85)" fontSize="9" style={{ letterSpacing: "0.24em" }}>GJ 398 · SUPERFLARE 2.6×10³⁴ erg</text>
    </svg>
  );
}

function SceneProceeding() {
  return (
    <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="proc-spec" x1="0" x2="1">
          <stop offset="0%" stopColor="oklch(0.42 0.18 295)" />
          <stop offset="50%" stopColor="oklch(0.78 0.15 210)" />
          <stop offset="100%" stopColor="oklch(0.72 0.18 45)" />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill="oklch(0.11 0.03 265)" />
      {[...Array(35)].map((_, i) => (
        <circle key={i} cx={Math.random() * 400} cy={Math.random() * 260} r={Math.random() * 0.8} fill="white" opacity={Math.random() * 0.7} />
      ))}
      {[60, 110, 160].map((y, i) => (
        <g key={y}>
          <rect x="40" y={y} width="320" height="8" rx="4" fill="url(#proc-spec)" opacity={0.7 - i * 0.15} />
          {[80, 130, 200, 260, 320].map((x) => (
            <rect key={x} x={x} y={y} width="1.4" height="8" fill="oklch(0.14 0.04 265)" />
          ))}
        </g>
      ))}
      <text x="40" y="215" fill="oklch(0.96 0.01 250 / 0.7)" fontSize="9" style={{ letterSpacing: "0.2em" }}>Ca IRT · Hα · NIR SPECTRA</text>
    </svg>
  );
}

const sceneMap: Record<string, () => ReactElement> = {
  gj1151: SceneGJ1151,
  wolf359: SceneWolf359,
  adleo: SceneADLeo,
  gj398: SceneGJ398,
  "proc-mdwarf-spectro": SceneProceeding,
};

// ============================================================================
// Section navigator (right rail + mobile jump menu)
// ============================================================================

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "constellation-map", label: "Research Map" },
  { id: "first-author", label: "First-Author Papers" },
  { id: "accepted", label: "Accepted Research" },
  { id: "proceedings", label: "Proceedings" },
  { id: "collaborative", label: "Collaborative Papers" },
  { id: "scientific-exchange", label: "Scientific Exchange" },
  { id: "workshops", label: "Workshops" },
  { id: "profiles", label: "Research Profiles" },
];

function useActiveSection() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const seen = new Map<string, number>();
    const update = () => {
      let bestId = active;
      let bestRatio = 0;
      seen.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      });
      setActive(bestId);
    };
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => seen.set(s.id, e.intersectionRatio));
          update();
        },
        { threshold: [0, 0.15, 0.4, 0.7, 1] },
      );
      io.observe(el);
      observers.push(io);
    });
    return () => observers.forEach((o) => o.disconnect());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return active;
}

function DesktopSectionRail({ active }: { active: string }) {
  return (
    <nav
      aria-label="Publications page sections"
      className="pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
    >
      <ul className="pointer-events-auto glass flex flex-col gap-1 rounded-full border border-white/10 bg-black/40 p-2 backdrop-blur-xl">
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={cn(
                  "group flex items-center justify-end gap-3 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] transition-all",
                  isActive
                    ? "text-primary"
                    : "text-white/45 hover:text-white/85",
                )}
                aria-current={isActive ? "true" : undefined}
              >
                <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:max-w-[180px] group-hover:opacity-100">
                  {s.label}
                </span>
                <span
                  className={cn(
                    "inline-block h-2 w-2 rounded-full border transition-all",
                    isActive
                      ? "scale-110 border-primary bg-primary shadow-[0_0_12px_oklch(0.78_0.15_210/0.7)]"
                      : "border-white/30 bg-transparent group-hover:border-white/70",
                  )}
                />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function MobileJumpMenu({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const current = SECTIONS.find((s) => s.id === active) ?? SECTIONS[0];
  return (
    <div className="lg:hidden">
      <div className="sticky top-[64px] z-30 -mx-4 border-b border-white/10 bg-[oklch(0.09_0.03_270/0.85)] px-4 py-2 backdrop-blur-lg">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-between rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-left text-xs"
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className="flex items-center gap-2">
            <Menu className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] uppercase tracking-[0.22em] text-white/50">Jump to</span>
            <span className="font-semibold text-white/90">{current.label}</span>
          </span>
          <span className="text-white/40">▾</span>
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full rounded-t-3xl border-t border-white/15 bg-[oklch(0.09_0.03_270)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Jump to section</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full border border-white/15 p-1.5 text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-1">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all",
                      s.id === active
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/[0.02] text-white/80 hover:bg-white/[0.05]",
                    )}
                  >
                    <span>{s.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Interactive Research Constellation Map
// ============================================================================

type MapNode = {
  id: string;
  label: string;
  type: "pub" | "target" | "instrument" | "theme";
  x: number;
  y: number;
  pub?: PublicationRecord;
};

function buildMap(pubs: PublicationRecord[]) {
  const nodes: MapNode[] = [];
  const edges: Array<[string, string]> = [];

  const targets = new Map<string, MapNode>();
  const instruments = new Map<string, MapNode>();
  const themes = new Map<string, MapNode>();

  const themeAngles = new Map<string, number>();
  const primaryThemes = ["M-dwarf Magnetic Activity", "Flares", "Starspots", "Optical Spectroscopy", "Radio Astronomy", "TESS Photometry", "Brown Dwarfs"];
  primaryThemes.forEach((t, i) => themeAngles.set(t, (i / primaryThemes.length) * Math.PI * 2));

  // publications along a central ring
  pubs.forEach((p, i) => {
    const angle = (i / pubs.length) * Math.PI * 2 - Math.PI / 2;
    nodes.push({
      id: `p:${p.id}`,
      label: p.targets[0] || p.title.slice(0, 24),
      type: "pub",
      x: 500 + Math.cos(angle) * 160,
      y: 300 + Math.sin(angle) * 160,
      pub: p,
    });
  });

  // gather unique satellites
  pubs.forEach((p) => {
    p.targets.forEach((t) => {
      if (!targets.has(t)) {
        const idx = targets.size;
        const angle = (idx / 8) * Math.PI * 2;
        targets.set(t, { id: `t:${t}`, label: t, type: "target", x: 500 + Math.cos(angle) * 320, y: 300 + Math.sin(angle) * 240 });
      }
      edges.push([`p:${p.id}`, `t:${t}`]);
    });
    p.instruments.forEach((inst) => {
      if (!instruments.has(inst)) {
        const idx = instruments.size;
        const angle = (idx / 6) * Math.PI * 2 + Math.PI / 6;
        instruments.set(inst, { id: `i:${inst}`, label: inst, type: "instrument", x: 500 + Math.cos(angle) * 380, y: 300 + Math.sin(angle) * 270 });
      }
      edges.push([`p:${p.id}`, `i:${inst}`]);
    });
    p.themes.forEach((th) => {
      if (!primaryThemes.includes(th)) return;
      if (!themes.has(th)) {
        const angle = themeAngles.get(th) ?? 0;
        themes.set(th, { id: `th:${th}`, label: th, type: "theme", x: 500 + Math.cos(angle) * 430, y: 300 + Math.sin(angle) * 310 });
      }
      edges.push([`p:${p.id}`, `th:${th}`]);
    });
  });

  targets.forEach((n) => nodes.push(n));
  instruments.forEach((n) => nodes.push(n));
  themes.forEach((n) => nodes.push(n));

  return { nodes, edges };
}

function ConstellationMap({
  onSelectPub,
  onSelectTheme,
}: {
  onSelectPub: (id: string) => void;
  onSelectTheme: (t: string | null) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const { nodes, edges } = useMemo(() => buildMap(publicationsArchive), []);

  const connected = useMemo(() => {
    if (!selected) return null;
    const set = new Set<string>([selected]);
    edges.forEach(([a, b]) => {
      if (a === selected) set.add(b);
      if (b === selected) set.add(a);
    });
    return set;
  }, [selected, edges]);

  function nodeFill(n: MapNode) {
    if (n.type === "pub") {
      if (n.pub?.status === "Accepted") return "oklch(0.82 0.16 85)";
      if (n.pub?.type === "Proceeding") return "oklch(0.72 0.15 195)";
      if (n.pub?.role === "First Author") return "oklch(0.78 0.15 210)";
      return "oklch(0.65 0.10 260)";
    }
    if (n.type === "target") return "oklch(0.85 0.14 45)";
    if (n.type === "instrument") return "oklch(0.75 0.13 155)";
    return "oklch(0.72 0.18 295)";
  }

  function nodeRadius(n: MapNode) {
    if (n.type === "pub") {
      if (n.pub?.role === "First Author" && n.pub?.status === "Published") return 11;
      if (n.pub?.status === "Accepted") return 9;
      return 7;
    }
    if (n.type === "target") return 6;
    if (n.type === "instrument") return 6;
    return 5;
  }

  const nodeById = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  function handleClick(n: MapNode) {
    if (selected === n.id) {
      setSelected(null);
      onSelectTheme(null);
      return;
    }
    setSelected(n.id);
    if (n.type === "theme") onSelectTheme(n.label);
    else onSelectTheme(null);
    if (n.type === "pub" && n.pub) {
      onSelectPub(n.pub.id);
    }
  }

  return (
    <div className="relative">
      <div className="glass overflow-hidden rounded-3xl border-white/10 p-4 md:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-white/60">
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.78_0.15_210)]" /> First-author</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.82_0.16_85)] anim-pulse-slow" /> Accepted</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.72_0.15_195)]" /> Proceeding</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.65_0.10_260)]" /> Collaborative</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.85_0.14_45)]" /> Target</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.75_0.13_155)]" /> Instrument</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.72_0.18_295)]" /> Theme</span>
          </div>
          {selected && (
            <button
              type="button"
              onClick={() => { setSelected(null); onSelectTheme(null); }}
              className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/80 hover:bg-white/10"
            >
              Reset map
            </button>
          )}
        </div>

        <div className="relative w-full overflow-x-auto">
          <svg viewBox="0 0 1000 600" className="mx-auto block h-auto w-full min-w-[560px] max-w-[1000px]" role="img" aria-label="Interactive research constellation">
            <defs>
              <radialGradient id="map-bg" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="oklch(0.16 0.05 275)" />
                <stop offset="100%" stopColor="oklch(0.08 0.02 265)" />
              </radialGradient>
            </defs>
            <rect width="1000" height="600" fill="url(#map-bg)" rx="24" />
            {/* faint background stars */}
            {[...Array(80)].map((_, i) => (
              <circle key={i} cx={Math.random() * 1000} cy={Math.random() * 600} r={Math.random() * 0.9} fill="white" opacity={Math.random() * 0.5} />
            ))}
            {/* edges */}
            {edges.map(([a, b], i) => {
              const na = nodeById.get(a);
              const nb = nodeById.get(b);
              if (!na || !nb) return null;
              const active = connected ? connected.has(a) && connected.has(b) : false;
              return (
                <line
                  key={i}
                  x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke="oklch(0.78 0.15 210)"
                  strokeOpacity={connected ? (active ? 0.6 : 0.05) : 0.14}
                  strokeWidth={active ? 1.3 : 0.8}
                />
              );
            })}
            {/* nodes */}
            {nodes.map((n) => {
              const isSelected = selected === n.id;
              const dim = connected ? !connected.has(n.id) : false;
              const r = nodeRadius(n);
              return (
                <g key={n.id} style={{ opacity: dim ? 0.22 : 1, transition: "opacity 200ms" }}>
                  {n.pub?.status === "Accepted" && (
                    <circle cx={n.x} cy={n.y} r={r + 6} fill="oklch(0.82 0.16 85)" opacity="0.18" className="anim-pulse-slow" />
                  )}
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={r + (isSelected ? 4 : 0)}
                    fill={nodeFill(n)}
                    stroke={isSelected ? "white" : "oklch(0.14 0.04 265)"}
                    strokeWidth={isSelected ? 2 : 1}
                    style={{ cursor: "pointer", transition: "all 200ms" }}
                    onClick={() => handleClick(n)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(n); } }}
                    aria-label={`${n.type}: ${n.label}${n.pub ? ` (${n.pub.year})` : ""}`}
                  >
                    <title>{n.type === "pub" && n.pub ? `${n.pub.title} · ${n.pub.year}` : `${n.type}: ${n.label}`}</title>
                  </circle>
                  {(isSelected || n.type !== "pub") && (
                    <text
                      x={n.x}
                      y={n.y - r - 6}
                      textAnchor="middle"
                      fill="white"
                      fillOpacity={isSelected ? 1 : 0.7}
                      fontSize={n.type === "pub" ? 10 : 9}
                      style={{ pointerEvents: "none", letterSpacing: "0.02em" }}
                    >
                      {n.label.length > 22 ? `${n.label.slice(0, 22)}…` : n.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        {selected && (() => {
          const n = nodeById.get(selected);
          if (!n) return null;
          if (n.type === "pub" && n.pub) {
            return (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm">
                <div className="mb-1 flex flex-wrap gap-2">
                  <StatusBadge status={n.pub.status} />
                  <RoleBadge role={n.pub.role} />
                </div>
                <div className="font-display text-base font-semibold text-white">{n.pub.title}</div>
                <div className="mt-1 text-xs text-white/60">{n.pub.journal} · {n.pub.year}</div>
                <a href={`#pub-${n.pub.id}`} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Scroll to paper <ArrowUpRight className="h-3 w-3" /></a>
              </div>
            );
          }
          return (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
              Highlighting publications connected to <span className="font-semibold text-white">{n.label}</span>.
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ============================================================================
// First-author cinematic panel
// ============================================================================

function FirstAuthorPanel({
  pub,
  align = "left",
}: {
  pub: PublicationRecord;
  align?: "left" | "right";
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<"cite" | "bib" | null>(null);
  const Scene = sceneMap[pub.id] ?? SceneProceeding;

  async function copy(kind: "cite" | "bib") {
    const txt = kind === "cite" ? formatPlainCitation(pub) : formatBibtex(pub);
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1800);
    } catch { /* noop */ }
  }

  return (
    <article
      id={`pub-${pub.id}`}
      className={cn(
        "group relative scroll-mt-32 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl transition-all hover:border-white/20 md:p-8",
        "shadow-[0_20px_60px_-30px_oklch(0.42_0.18_295/0.5)]",
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
      </div>

      <div className={cn("relative grid gap-8 md:grid-cols-5", align === "right" && "md:[direction:rtl]")}>
        <div className={cn("md:col-span-2 [direction:ltr]")}>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
            <Scene />
          </div>
          {pub.targets.length > 0 && (
            <p className="mt-3 text-[10px] uppercase tracking-[0.28em] text-white/50">
              Target · {pub.targets.join(" · ")}
            </p>
          )}
        </div>

        <div className="md:col-span-3 [direction:ltr]">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={pub.status} />
            <RoleBadge role={pub.role} />
            <span className="text-[10px] uppercase tracking-[0.24em] text-white/50">
              {pub.month ? `${pub.month} ${pub.year}` : pub.year}
            </span>
          </div>

          <h3 className="font-display text-xl font-semibold leading-tight text-white md:text-2xl">
            {pub.doiUrl ? (
              <a href={pub.doiUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${pub.title} on the publisher (opens in new tab)`} className="story-link">
                {pub.title}
              </a>
            ) : pub.title}
          </h3>

          <div className="mt-3"><Authors authors={pub.authors} diyaPos={pub.diyaAuthorPosition} /></div>

          <p className="mt-2 text-xs text-white/50">
            {pub.journal}
            {pub.volume && ` · Vol. ${pub.volume}`}
            {pub.issue && `, Issue ${pub.issue}`}
            {pub.articleNumber && ` · Article ${pub.articleNumber}`}
            {pub.pages && ` · pp. ${pub.pages}`}
          </p>

          {(pub.keyFindings && pub.keyFindings.length > 0) && (
            <div className="mt-4 rounded-2xl border border-primary/25 bg-primary/[0.05] p-4">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/90">Key discovery</div>
              <ul className="space-y-1.5 text-sm text-white/85">
                {pub.keyFindings.slice(0, 2).map((k) => (
                  <li key={k} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary/80" />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-4 text-sm leading-relaxed text-white/80">{pub.shortSummary}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {pub.instruments.map((i) => (
              <Chip key={i}><Telescope className="h-3 w-3" /> {i}</Chip>
            ))}
            {pub.themes.slice(0, 3).map((t) => <Chip key={t}>{t}</Chip>)}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {pub.doiUrl && (
              <a href={pub.doiUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/20" aria-label={`Open DOI ${pub.doi} in a new tab`}>
                <ExternalLink className="h-3.5 w-3.5" /> DOI
              </a>
            )}
            {pub.adsUrl && (
              <a href={pub.adsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/85 transition-all hover:bg-white/[0.08]" aria-label="Open on NASA ADS (opens in new tab)">
                <ExternalLink className="h-3.5 w-3.5" /> NASA ADS
              </a>
            )}
            {pub.pdfUrl && (
              <a href={pub.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/[0.08] px-4 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/15" aria-label={`Read the ${pub.title} PDF in a new tab`}>
                <BookOpen className="h-3.5 w-3.5" /> Read Paper
              </a>
            )}

            <button type="button" onClick={() => setExpanded((v) => !v)} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition-all hover:bg-white/[0.08]" aria-expanded={expanded}>
              <Sparkles className="h-3.5 w-3.5" /> {expanded ? "Collapse research" : "Explore the research"}
            </button>
            <button type="button" onClick={() => copy("cite")} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition-all hover:bg-white/[0.08]" aria-label="Copy plain-text citation">
              <Copy className="h-3.5 w-3.5" /> {copied === "cite" ? "Copied" : "Cite"}
            </button>
            <button type="button" onClick={() => copy("bib")} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition-all hover:bg-white/[0.08]" aria-label="Copy BibTeX entry">
              <Copy className="h-3.5 w-3.5" /> {copied === "bib" ? "Copied" : "BibTeX"}
            </button>
          </div>

          {expanded && (pub.abstract || pub.keyFindings) && (
            <div className="mt-6 space-y-5 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-white/80">
              {pub.abstract && (
                <div>
                  <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/80">Abstract</h4>
                  <p className="leading-relaxed">{pub.abstract}</p>
                </div>
              )}
              {pub.keyFindings && (
                <div>
                  <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/80">All key findings</h4>
                  <ul className="space-y-1.5">
                    {pub.keyFindings.map((k) => (
                      <li key={k} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary/80" />
                        <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {pub.keywords && (
                <div className="flex flex-wrap gap-1.5">
                  {pub.keywords.map((k) => <Chip key={k}>{k}</Chip>)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ============================================================================
// Collaborative card with expandable abstract + citation tools
// ============================================================================

function CollabCard({ pub }: { pub: PublicationRecord }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<"cite" | "bib" | null>(null);

  async function copy(kind: "cite" | "bib") {
    const txt = kind === "cite" ? formatPlainCitation(pub) : formatBibtex(pub);
    try {
      await navigator.clipboard.writeText(txt);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1800);
    } catch { /* noop */ }
  }

  return (
    <article id={`pub-${pub.id}`} className="glass group relative scroll-mt-32 overflow-hidden rounded-2xl p-6 transition-all hover:border-white/25 hover:bg-white/[0.05]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" aria-hidden />
      <div className="relative">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={pub.status} />
          <RoleBadge role={pub.role} />
          <span className="text-[10px] uppercase tracking-[0.24em] text-white/50">
            Author #{pub.diyaAuthorPosition} · {pub.month ? `${pub.month} ${pub.year}` : pub.year}
          </span>
        </div>
        <h4 className="font-display text-base font-semibold leading-snug text-white md:text-lg">
          {pub.doiUrl ? (
            <a href={pub.doiUrl} target="_blank" rel="noopener noreferrer" className="story-link">{pub.title}</a>
          ) : pub.title}
        </h4>
        <div className="mt-2"><Authors authors={pub.authors} diyaPos={pub.diyaAuthorPosition} /></div>
        <p className="mt-1 text-xs text-white/50">
          {pub.journal}
          {pub.volume && ` · Vol. ${pub.volume}`}
          {pub.issue && `, Issue ${pub.issue}`}
          {pub.articleNumber && ` · Article ${pub.articleNumber}`}
          {pub.pages && ` · pp. ${pub.pages}`}
        </p>
        <p className="mt-3 text-sm text-white/75">{pub.shortSummary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pub.instruments.map((i) => <Chip key={i}><Telescope className="h-3 w-3" /> {i}</Chip>)}
          {pub.themes.slice(0, 3).map((t) => <Chip key={t}>{t}</Chip>)}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {pub.doiUrl && (
            <a href={pub.doiUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/20" aria-label={`Open DOI ${pub.doi} in a new tab`}>
              DOI <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
          {pub.adsUrl && (
            <a href={pub.adsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/85 hover:bg-white/[0.08]" aria-label="Open on NASA ADS (opens in new tab)">
              ADS <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
          {pub.pdfUrl && (
            <a href={pub.pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/[0.08] px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/15" aria-label={`Read the ${pub.title} PDF in a new tab`}>
              <BookOpen className="h-3 w-3" /> Read Paper
            </a>
          )}

          <button type="button" onClick={() => setExpanded((v) => !v)} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/85 hover:bg-white/[0.08]" aria-expanded={expanded}>
            {expanded ? "Hide summary" : "Read summary"}
          </button>
          <button type="button" onClick={() => copy("bib")} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[11px] font-semibold text-white/85 hover:bg-white/[0.08]" aria-label="Copy BibTeX entry">
            <Copy className="h-3 w-3" /> {copied === "bib" ? "Copied" : "BibTeX"}
          </button>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/80">
            {pub.abstract && (
              <div>
                <h5 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/80">Abstract</h5>
                <p className="leading-relaxed">{pub.abstract}</p>
              </div>
            )}
            {pub.keyFindings && (
              <div>
                <h5 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary/80">Key findings</h5>
                <ul className="space-y-1.5">
                  {pub.keyFindings.map((k) => (
                    <li key={k} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary/80" />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

// ============================================================================
// Main page
// ============================================================================

const roleIcons: Record<EventRole, ReactElement> = {
  "Oral Presentation": <Presentation className="h-3.5 w-3.5" />,
  "Poster Presentation": <BookOpen className="h-3.5 w-3.5" />,
  Participant: <Users className="h-3.5 w-3.5" />,
  "Online Participant": <Radio className="h-3.5 w-3.5" />,
};

function PublicationsPage() {
  const [search, setSearch] = useState("");
  const [themeFilter, setThemeFilter] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<"All" | "First Author" | "Collaborative">("All");
  const [yearFilter, setYearFilter] = useState<number | null>(null);
  const [eventRoleFilter, setEventRoleFilter] = useState<EventRole | "All">("All");
  const [scrollY, setScrollY] = useState(0);
  const active = useActiveSection();
  const heroRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const filtered = useMemo(() => {
    return publicationsArchive.filter((p) => {
      if (themeFilter && !p.themes.includes(themeFilter) && !p.instruments.includes(themeFilter)) return false;
      if (roleFilter !== "All" && p.role !== roleFilter) return false;
      if (!search) return true;
      const hay = [p.title, p.authors.join(" "), String(p.year), p.journal, p.status, ...p.themes, ...p.instruments, ...p.targets].join(" ").toLowerCase();
      return hay.includes(search.toLowerCase());
    });
  }, [search, themeFilter, roleFilter]);

  const firstAuthorPublished = filtered.filter((p) => p.role === "First Author" && p.status === "Published");
  const accepted = filtered.filter((p) => p.status === "Accepted");
  const firstAuthorProceedings = filtered.filter((p) => p.role === "First Author" && p.status === "Proceeding");
  const collabJournals = filtered.filter((p) => p.role === "Collaborative" && p.type === "Journal");
  const collabProceedings = filtered.filter((p) => p.role === "Collaborative" && p.type === "Proceeding");

  const years = Array.from(new Set(scientificEvents.map((e) => e.year))).sort((a, b) => b - a);
  const eventsFiltered = scientificEvents.filter(
    (e) => (yearFilter === null || e.year === yearFilter) && (eventRoleFilter === "All" || e.role === eventRoleFilter),
  );

  const totalMatches = filtered.length;

  const secondaryThemes = ["Quasi-periodic Pulsations", "TESS Photometry", "Chromospheric Diagnostics", "Low-mass Stars", "Brown Dwarfs", "Star–Planet Interaction"];
  const primaryThemes = ["M-dwarf Magnetic Activity", "Flares", "Starspots", "Optical Spectroscopy", "Radio Astronomy"];
  const [showMoreThemes, setShowMoreThemes] = useState(false);

  function scrollToPub(id: string) {
    const el = document.getElementById(`pub-${id}`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <DesktopSectionRail active={active} />
      <MobileJumpMenu active={active} />

      {/* ============ CINEMATIC HERO ============ */}
      <section ref={heroRef} className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24" aria-label="Publications hero">
        {/* Layer 1 — authentic astronomical image */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className="absolute inset-0 will-change-transform"
            style={{ transform: `translate3d(0, ${scrollY * 0.15}px, 0)` }}
          >
            <img
              src={heroImage.url}
              alt=""
              width={1280}
              height={1280}
              className="h-full w-full scale-110 object-cover opacity-70"
              loading="eager"
              decoding="async"
            />
          </div>
          {/* Layer 2 — depth gradients + subtle dust */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent,oklch(0.08_0.03_270/0.6)_45%,oklch(0.08_0.03_270/0.95)_75%)]" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-[oklch(0.09_0.03_270)]" />
          <div
            className="absolute inset-0 will-change-transform"
            style={{ transform: `translate3d(0, ${scrollY * 0.05}px, 0)` }}
          >
            <svg
             className="h-full w-full"
             viewBox="0 0 800 600"
             preserveAspectRatio="xMidYMid slice"
             >
             {Array.from({ length: 60 }, (_, i) => {
             const radius = 0.35 + ((i * 17) % 12) / 10;
             const opacity = 0.18 + ((i * 29) % 42) / 100;

             return (
             <circle
             key={i}
             cx={(i * 137) % 800}
             cy={(i * 89) % 600}
             r={radius}
             fill="white"
             opacity={opacity}
             />
             );
             })}
            </svg>
          </div>
        </div>

        {/* Layer 3 — foreground text */}
        <div className="container-page relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-primary/90 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary anim-pulse-slow" />
            Publications & Scientific Output
          </div>
          <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.03] md:text-6xl">
            A <span className="text-grad-accent">Cosmic Library</span> of Discovery
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/85 md:text-lg">
            Peer-reviewed research on magnetic activity, stellar flares, starspots and radio
            emission from nearby low-mass stars — connecting multi-wavelength observations,
            collaborative work and scientific communication into a single observational archive.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.24em] text-white/60">
            <span>Multi-wavelength observations</span>
            <span className="text-white/25">·</span>
            <span>M-dwarf systems & brown dwarfs</span>
            <span className="text-white/25">·</span>
            <span>TESS · uGMRT · HCT · DOT</span>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { v: archiveMetrics.journalPublications, l: "Journal publications" },
              { v: archiveMetrics.firstAuthorPublished, l: "First-author published" },
              { v: archiveMetrics.firstAuthorAccepted, l: "Accepted manuscript" },
              { v: archiveMetrics.conferenceProceedings, l: "Conference proceedings" },
            ].map((m) => (
              <div key={m.l} className="glass rounded-2xl p-4">
                <div className="font-display text-3xl font-bold text-white md:text-4xl">{m.v}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/55">{m.l}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-2 text-[10px] text-white/55">
            <a
              href="https://esahubble.org/images/heic0611b/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1 uppercase tracking-[0.22em] hover:border-white/30 hover:text-white/80"
              aria-label="Open hero image credit page in new tab"
            >
              Image · Hubble Ultra Deep Field · NASA · ESA · S. Beckwith (STScI) & the HUDF Team <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </section>

      {/* ============ OVERVIEW / CELESTIAL INDEX ============ */}
      <section id="overview" className="relative scroll-mt-32 py-14 md:py-20">
        <div className="container-page">
          <div className="mb-8 max-w-2xl">
            <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary/80">
              Scientific Output Atlas
            </div>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">
              Coordinates of the scientific archive
            </h2>
            <p className="mt-3 text-sm text-white/60">
              Verified counts drawn from the current curriculum vitae. Interactive — select a
              statistic to jump into that section of the archive.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { v: archiveMetrics.scientificEvents, l: "Conferences & seminars", target: "scientific-exchange" },
              { v: archiveMetrics.workshops, l: "Workshops", target: "workshops" },
              { v: archiveMetrics.oralPresentations, l: "Oral presentations", target: "scientific-exchange", role: "Oral Presentation" as EventRole },
              { v: archiveMetrics.posterPresentations, l: "Poster presentations", target: "scientific-exchange", role: "Poster Presentation" as EventRole },
            ].map((m) => (
              <a
                key={m.l}
                href={`#${m.target}`}
                onClick={() => { if (m.role) setEventRoleFilter(m.role); }}
                className="glass block rounded-2xl border-white/10 p-4 transition-all hover:border-primary/40 hover:bg-primary/[0.04]"
              >
                <div className="font-display text-2xl font-bold text-white md:text-3xl">{m.v}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/55">{m.l}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ============ RESEARCH CONSTELLATION MAP ============ */}
      <section id="constellation-map" className="relative scroll-mt-32 py-14 md:py-20">
        <div className="container-page">
          <div className="mb-8 max-w-3xl">
            <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary/80">Research Constellation</div>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Connections across publications, targets, facilities & themes
            </h2>
            <p className="mt-3 text-white/65">
              Select any node — a paper, a stellar target, an instrument or a research theme — to
              highlight its connections across the archive. Publication nodes scroll directly to
              their full entry; theme nodes update the filters below.
            </p>
          </div>

          <ConstellationMap onSelectPub={scrollToPub} onSelectTheme={setThemeFilter} />
        </div>
      </section>

      {/* ============ NAVIGATOR / SEARCH / FILTERS ============ */}
      <section className="relative py-6" aria-label="Publications archive controls">
        <div className="container-page">
          <div className="glass rounded-2xl p-5 md:p-6">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Archive Filters</div>
                  <div className="text-xs text-white/55" aria-live="polite">
                    Showing {totalMatches} of {publicationsArchive.length} works
                  </div>
                </div>
              </div>
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search title, author, target, instrument…"
                  aria-label="Search publications"
                  className="w-full rounded-full border border-white/15 bg-black/40 py-2 pl-9 pr-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-primary/60"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[10px] uppercase tracking-[0.24em] text-white/50">Role</span>
              {(["All", "First Author", "Collaborative"] as const).map((r) => (
                <Chip key={r} active={roleFilter === r} onClick={() => setRoleFilter(r)}>{r}</Chip>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[10px] uppercase tracking-[0.24em] text-white/50">Theme</span>
              <Chip active={themeFilter === null} onClick={() => setThemeFilter(null)}>Show all</Chip>
              {primaryThemes.map((t) => (
                <Chip key={t} active={themeFilter === t} onClick={() => setThemeFilter(t)}>{t}</Chip>
              ))}
              <Chip active={showMoreThemes} onClick={() => setShowMoreThemes((v) => !v)} ariaLabel="Toggle more themes">
                {showMoreThemes ? "Fewer themes" : "More themes"}
              </Chip>
              {showMoreThemes && secondaryThemes.map((t) => (
                <Chip key={t} active={themeFilter === t} onClick={() => setThemeFilter(t)}>{t}</Chip>
              ))}
              {(themeFilter || roleFilter !== "All" || search) && (
                <button
                  type="button"
                  onClick={() => { setThemeFilter(null); setRoleFilter("All"); setSearch(""); }}
                  className="ml-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70 hover:bg-white/[0.08]"
                >
                  Reset filters
                </button>
              )}
            </div>

            {totalMatches === 0 && (
              <p className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
                No publications match the current filters. Try clearing filters or search terms.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Reserve space under the desktop rail so it doesn't overlap right-edge content */}
      <div className="lg:pr-16">
        {/* ============ FIRST-AUTHOR ============ */}
        <section id="first-author" className="relative scroll-mt-32 py-14 md:py-20">
          <div className="container-page">
            <div className="mb-10 max-w-3xl">
              <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary/80">Primary Discovery Constellation</div>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">First-author investigations</h2>
              <p className="mt-3 text-white/65">
                The central arc of Diya Ram's doctoral research on magnetic activity in nearby
                M-dwarf stars — combining TESS photometry, optical spectroscopy and uGMRT radio
                observations.
              </p>
            </div>

            {firstAuthorPublished.length === 0 ? (
              <p className="glass rounded-2xl p-6 text-sm text-white/60">No first-author publications match the current filters.</p>
            ) : (
              <div className="space-y-8">
                {firstAuthorPublished.map((p, i) => (
                  <FirstAuthorPanel key={p.id} pub={p} align={i % 2 === 1 ? "right" : "left"} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ============ ACCEPTED ============ */}
        <section id="accepted" className="relative scroll-mt-32 py-14 md:py-20">
          {accepted.length > 0 && (
            <>
              <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
                <div className="absolute left-1/2 top-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, oklch(0.75 0.16 55 / 0.16), transparent 70%)" }} />
              </div>
              <div className="container-page relative">
                <div className="mb-10 max-w-3xl">
                  <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-amber-300/90">Emerging Research</div>
                  <h2 className="font-display text-3xl font-semibold md:text-4xl">Accepted manuscript</h2>
                  <p className="mt-3 text-white/65">
                    Peer-accepted manuscript on the mid-M dwarf GJ 398 — combining TESS
                    short-cadence photometry with uGMRT Band 4 / Band 5 radio observations to probe
                    the magnetic activity of a star at the fully-convective boundary.
                  </p>

                </div>
                <div className="space-y-8">
                  {accepted.map((p) => <FirstAuthorPanel key={p.id} pub={p} />)}
                </div>
              </div>
            </>
          )}
        </section>

        {/* ============ PROCEEDINGS ============ */}
        <section id="proceedings" className="relative scroll-mt-32 py-14 md:py-20">
          {firstAuthorProceedings.length > 0 && (
            <div className="container-page">
              <div className="mb-10 max-w-3xl">
                <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary/80">Signals Beyond the Journal</div>
                <h2 className="font-display text-3xl font-semibold md:text-4xl">First-author conference proceeding</h2>
              </div>
              <div className="space-y-8">
                {firstAuthorProceedings.map((p) => <FirstAuthorPanel key={p.id} pub={p} />)}
              </div>
            </div>
          )}
        </section>

        {/* ============ COLLABORATIVE ============ */}
        <section id="collaborative" className="relative scroll-mt-32 py-14 md:py-20">
          {(collabJournals.length > 0 || collabProceedings.length > 0) && (
            <div className="container-page">
              <div className="mb-10 max-w-3xl">
                <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary/80">Collaborative Galaxy</div>
                <h2 className="font-display text-3xl font-semibold md:text-4xl">Contributions across the field</h2>
                <p className="mt-3 text-white/65">
                  Research contributions extending Diya Ram's work across stellar variability,
                  starspots, flares and young low-mass objects — with verified abstracts, findings
                  and links.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {collabJournals.map((p) => <CollabCard key={p.id} pub={p} />)}
              </div>
              {collabProceedings.length > 0 && (
                <>
                  <h3 className="mt-10 mb-4 font-display text-xl font-semibold text-white/90">Collaborative proceeding</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {collabProceedings.map((p) => <CollabCard key={p.id} pub={p} />)}
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* ============ SCIENTIFIC EXCHANGE ============ */}
        <section id="scientific-exchange" className="relative scroll-mt-32 py-14 md:py-20">
          <div className="container-page">
            <div className="mb-10 max-w-3xl">
              <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary/80">Observatory of Scientific Exchange</div>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">Conferences, seminars & scientific gatherings</h2>
              <p className="mt-3 text-white/65">
                Presentations, discussions and scientific gatherings through which research ideas
                entered the wider astronomical community.
              </p>
            </div>

            <div className="glass mb-6 rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[10px] uppercase tracking-[0.24em] text-white/50">Year</span>
                <Chip active={yearFilter === null} onClick={() => setYearFilter(null)}>All</Chip>
                {years.map((y) => <Chip key={y} active={yearFilter === y} onClick={() => setYearFilter(y)}>{y}</Chip>)}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[10px] uppercase tracking-[0.24em] text-white/50">Role</span>
                {(["All", "Oral Presentation", "Poster Presentation", "Participant", "Online Participant"] as const).map((r) => (
                  <Chip key={r} active={eventRoleFilter === r} onClick={() => setEventRoleFilter(r)}>{r}</Chip>
                ))}
              </div>
              <div className="mt-3 text-xs text-white/55" aria-live="polite">Showing {eventsFiltered.length} of {scientificEvents.length} events</div>
            </div>

            <ol className="relative space-y-3 border-l border-white/10 pl-6">
              {eventsFiltered.map((e) => (
                <li key={e.id} className="relative">
                  <span
                    className={cn(
                      "absolute top-2 h-2.5 w-2.5 rounded-full",
                      e.role === "Oral Presentation" && "-left-[30px] bg-primary shadow-[0_0_14px_oklch(0.78_0.15_210/0.7)]",
                      e.role === "Poster Presentation" && "-left-[30px] bg-fuchsia-400 shadow-[0_0_10px_oklch(0.7_0.2_320/0.6)]",
                      e.role === "Online Participant" && "-left-[30px] border border-cyan-300/70 bg-cyan-400/40",
                      e.role === "Participant" && "-left-[29px] h-2 w-2 border border-white/40 bg-white/20",
                    )}
                  />
                  <div className="glass rounded-xl p-4">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/50">
                      <span>{e.year}</span>
                      <span className="text-white/25">·</span>
                      <span>{e.dateRange}</span>
                      <span className="text-white/25">·</span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/70">
                        {roleIcons[e.role]} {e.role}
                      </span>
                    </div>
                    <h4 className="mt-2 font-display text-base font-semibold text-white">{e.title}</h4>
                    <p className="mt-1 text-xs text-white/55">{e.host}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ============ WORKSHOPS ============ */}
        <section id="workshops" className="relative scroll-mt-32 py-14 md:py-20">
          <div className="container-page">
            <div className="mb-8 max-w-3xl">
              <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary/80">Methods, Tools & Continuing Exploration</div>
              <h2 className="font-display text-2xl font-semibold md:text-3xl">Workshops & specialised learning</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {workshops.map((w) => (
                <div key={w.id} className="glass rounded-2xl p-5">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">{w.format}</div>
                  <h4 className="mt-2 font-display text-base font-semibold text-white">{w.title}</h4>
                  <p className="mt-2 text-xs text-white/60">{w.host}</p>
                  <p className="mt-1 text-xs text-white/50">{w.dateRange}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============ COMMUNITY ============ */}
        <section className="relative py-10">
          <div className="container-page">
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">Scientific-community contribution</div>
              <h3 className="mt-2 font-display text-xl font-semibold text-white">
                {communityContribution.role} · {communityContribution.event}
              </h3>
              <p className="mt-2 text-sm text-white/65">{communityContribution.host} · {communityContribution.dateRange}</p>
            </div>
          </div>
        </section>

        {/* ============ RESEARCH PROFILES ============ */}
        <section id="profiles" className="relative scroll-mt-32 py-10">
          <div className="container-page">
            <div className="glass rounded-2xl p-6 md:p-8">
              <div className="mb-4 text-[10px] uppercase tracking-[0.22em] text-primary/80">Explore external research profiles</div>
              <div className="flex flex-wrap gap-2">
                {profileLinks.map((p) => (
                  <a key={p.label} href={p.url} target="_blank" rel="noopener noreferrer" aria-label={p.ariaLabel}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/85 transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary">
                    {p.label} <ArrowUpRight className="h-3 w-3" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ============ CLOSING ============ */}
        <section className="relative py-20 md:py-28">
          <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
            <div className="absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: "radial-gradient(ellipse, oklch(0.42 0.18 295 / 0.28), transparent 70%)" }} />
          </div>
          <div className="container-page relative text-center">
            <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-primary/80">The Archive Continues</div>
            <h2 className="mx-auto max-w-3xl font-display text-3xl font-semibold md:text-4xl">Each observation opens another question.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/65">
              Each paper becomes a coordinate in a larger search for how magnetic activity shapes
              low-mass stars and the worlds that may orbit them.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/research-universe" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]">
                Enter the research universe <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/[0.08]">
                About the researcher
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
