import type { ReactElement } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Copy,
  ExternalLink,
  Filter,
  Presentation,
  Radio,
  Search,
  Sparkles,
  Star,
  Telescope,
  Users,
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/publications")({
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
    ],
    links: [
      { rel: "canonical", href: "https://astro-diya-portfolio.lovable.app/publications" },
    ],
  }),
  component: PublicationsPage,
});

// ---------- Local UI atoms ----------

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

// ---------- Cosmic micro-scenes for first-author panels ----------

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
      <text x="300" y="105" textAnchor="middle" fill="oklch(0.78 0.15 210 / 0.85)" fontSize="9" style={{ letterSpacing: "0.2em" }}>uGMRT 1.36 GHz</text>
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
      {/* starspots */}
      <ellipse cx="180" cy="115" rx="14" ry="10" fill="oklch(0.28 0.10 20)" opacity="0.85" />
      <ellipse cx="215" cy="140" rx="10" ry="7" fill="oklch(0.28 0.10 20)" opacity="0.85" />
      <ellipse cx="195" cy="155" rx="6" ry="5" fill="oklch(0.28 0.10 20)" opacity="0.7" />
      {/* QPP wave */}
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
      {/* flare light-curve */}
      <path d="M 220 200 L 250 200 L 260 100 L 275 180 L 300 195 L 380 195" fill="none" stroke="oklch(0.9 0.16 55)" strokeWidth="1.8" />
      {/* spectrum bar */}
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
        <radialGradient id="gj398-star" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="oklch(0.85 0.16 55)" stopOpacity="0.95" />
          <stop offset="50%" stopColor="oklch(0.55 0.18 25)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="oklch(0.14 0.04 265)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="260" fill="oklch(0.11 0.03 265)" />
      {[...Array(45)].map((_, i) => (
        <circle key={i} cx={Math.random() * 400} cy={Math.random() * 260} r={Math.random() * 0.9} fill="white" opacity={Math.random() * 0.7} />
      ))}
      <circle cx="200" cy="130" r="130" fill="url(#gj398-star)" />
      <circle cx="200" cy="130" r="34" fill="oklch(0.9 0.16 55)" />
      {/* magnetic loops */}
      {[50, 70, 90].map((r) => (
        <path key={r} d={`M ${200 - r} 130 A ${r} ${r * 0.6} 0 0 1 ${200 + r} 130`} fill="none" stroke="oklch(0.82 0.16 85)" strokeOpacity={0.55 - r * 0.004} strokeWidth="1" />
      ))}
      <text x="200" y="235" textAnchor="middle" fill="oklch(0.82 0.16 85 / 0.85)" fontSize="9" style={{ letterSpacing: "0.2em" }}>EMERGING · ACCEPTED</text>
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

const sceneMap: Record<string, () => JSX.Element> = {
  gj1151: SceneGJ1151,
  wolf359: SceneWolf359,
  adleo: SceneADLeo,
  gj398: SceneGJ398,
  "proc-mdwarf-spectro": SceneProceeding,
};

// ---------- First-author cinematic panel ----------

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
    } catch {
      /* noop */
    }
  }

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl transition-all hover:border-white/20 md:p-8",
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
              <a
                href={pub.doiUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${pub.title} on the publisher (opens in new tab)`}
                className="story-link"
              >
                {pub.title}
              </a>
            ) : (
              pub.title
            )}
          </h3>

          <div className="mt-3">
            <Authors authors={pub.authors} diyaPos={pub.diyaAuthorPosition} />
          </div>

          <p className="mt-2 text-xs text-white/50">
            {pub.journal}
            {pub.volume && ` · Vol. ${pub.volume}`}
            {pub.issue && `, Issue ${pub.issue}`}
            {pub.articleNumber && ` · Article ${pub.articleNumber}`}
            {pub.pages && ` · pp. ${pub.pages}`}
          </p>

          <p className="mt-4 text-sm leading-relaxed text-white/80">{pub.shortSummary}</p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {pub.instruments.map((i) => (
              <Chip key={i}>
                <Telescope className="h-3 w-3" /> {i}
              </Chip>
            ))}
            {pub.themes.slice(0, 3).map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {pub.doiUrl && (
              <a
                href={pub.doiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/20"
                aria-label={`Open DOI ${pub.doi} in a new tab`}
              >
                <ExternalLink className="h-3.5 w-3.5" /> DOI · {pub.doi}
              </a>
            )}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition-all hover:bg-white/[0.08]"
              aria-expanded={expanded}
            >
              <Sparkles className="h-3.5 w-3.5" /> {expanded ? "Collapse research" : "Explore the research"}
            </button>
            <button
              type="button"
              onClick={() => copy("cite")}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition-all hover:bg-white/[0.08]"
              aria-label="Copy plain-text citation"
            >
              <Copy className="h-3.5 w-3.5" /> {copied === "cite" ? "Copied" : "Cite"}
            </button>
            <button
              type="button"
              onClick={() => copy("bib")}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/80 transition-all hover:bg-white/[0.08]"
              aria-label="Copy BibTeX entry"
            >
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
                  <h4 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/80">Key findings</h4>
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
                  {pub.keywords.map((k) => (
                    <Chip key={k}>{k}</Chip>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// ---------- Collaborative compact card ----------

function CollabCard({ pub }: { pub: PublicationRecord }) {
  return (
    <article className="glass group relative overflow-hidden rounded-2xl p-6 transition-all hover:border-white/25 hover:bg-white/[0.05]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" aria-hidden />
      <div className="relative">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={pub.status} />
          <RoleBadge role={pub.role} />
          <span className="text-[10px] uppercase tracking-[0.24em] text-white/50">
            {pub.month ? `${pub.month} ${pub.year}` : pub.year}
          </span>
        </div>
        <h4 className="font-display text-base font-semibold leading-snug text-white md:text-lg">
          {pub.doiUrl ? (
            <a href={pub.doiUrl} target="_blank" rel="noopener noreferrer" className="story-link">
              {pub.title}
            </a>
          ) : (
            pub.title
          )}
        </h4>
        <div className="mt-2">
          <Authors authors={pub.authors} diyaPos={pub.diyaAuthorPosition} />
        </div>
        <p className="mt-1 text-xs text-white/50">
          {pub.journal}
          {pub.volume && ` · Vol. ${pub.volume}`}
          {pub.issue && `, Issue ${pub.issue}`}
          {pub.articleNumber && ` · Article ${pub.articleNumber}`}
          {pub.pages && ` · pp. ${pub.pages}`}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pub.themes.slice(0, 3).map((t) => (
            <Chip key={t}>{t}</Chip>
          ))}
        </div>
        {pub.doiUrl && (
          <a
            href={pub.doiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            aria-label={`Open DOI ${pub.doi} in a new tab`}
          >
            DOI · {pub.doi} <ArrowUpRight className="h-3 w-3" />
          </a>
        )}
      </div>
    </article>
  );
}

// ---------- Main page ----------

const roleIcons: Record<EventRole, JSX.Element> = {
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

  const filtered = useMemo(() => {
    return publicationsArchive.filter((p) => {
      if (themeFilter && !p.themes.includes(themeFilter) && !p.instruments.includes(themeFilter))
        return false;
      if (roleFilter !== "All" && p.role !== roleFilter) return false;
      if (!search) return true;
      const hay = [
        p.title,
        p.authors.join(" "),
        String(p.year),
        p.journal,
        p.status,
        ...p.themes,
        ...p.instruments,
        ...p.targets,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(search.toLowerCase());
    });
  }, [search, themeFilter, roleFilter]);

  const firstAuthorPublished = filtered.filter(
    (p) => p.role === "First Author" && p.status === "Published",
  );
  const accepted = filtered.filter((p) => p.status === "Accepted");
  const firstAuthorProceedings = filtered.filter(
    (p) => p.role === "First Author" && p.status === "Proceeding",
  );
  const collabJournals = filtered.filter(
    (p) => p.role === "Collaborative" && p.type === "Journal",
  );
  const collabProceedings = filtered.filter(
    (p) => p.role === "Collaborative" && p.type === "Proceeding",
  );

  const years = Array.from(new Set(scientificEvents.map((e) => e.year))).sort((a, b) => b - a);
  const eventsFiltered = scientificEvents.filter(
    (e) =>
      (yearFilter === null || e.year === yearFilter) &&
      (eventRoleFilter === "All" || e.role === eventRoleFilter),
  );

  const totalMatches = filtered.length;

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.28_0.14_285/0.5),transparent_65%)]" />
          <div
            className="absolute -left-40 top-10 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(circle, oklch(0.55 0.20 295 / 0.55), transparent 70%)" }}
          />
          <div
            className="absolute -right-32 bottom-0 h-[380px] w-[380px] rounded-full opacity-35 blur-3xl"
            style={{ background: "radial-gradient(circle, oklch(0.68 0.14 210 / 0.4), transparent 70%)" }}
          />
          {/* diagonal light shafts */}
          <div className="absolute inset-0 opacity-[0.08] [background:repeating-linear-gradient(115deg,transparent_0_60px,white_60px_61px)]" />
          {/* central archive aperture */}
          <div className="absolute left-1/2 top-1/2 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]" />
          <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.08]" />
          <div className="absolute left-1/2 top-1/2 h-[200px] w-[200px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20" />
        </div>

        <div className="container-page relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-primary/90">
            <span className="h-1.5 w-1.5 rounded-full bg-primary anim-pulse-slow" />
            Publications · Research Output · Scientific Exchange
          </div>
          <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.03] md:text-6xl">
            A <span className="text-grad-accent">Cosmic Library</span> of Discovery
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/70 md:text-lg">
            An evolving archive of research exploring magnetic activity, flares, starspots,
            radio emission and the environments of nearby M-dwarf stars.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-white/50">
            From optical flares and starspot evolution to low-frequency radio searches, each work
            forms part of a connected exploration of magnetically active low-mass stars.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-[10px] uppercase tracking-[0.24em] text-white/50">
            <span>Stellar Activity Archive</span>
            <span className="text-white/25">·</span>
            <span>M-dwarf Systems</span>
            <span className="text-white/25">·</span>
            <span>Multi-wavelength Observations</span>
          </div>

          {/* summary metrics */}
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
        </div>
      </section>

      {/* ============ CELESTIAL INDEX ============ */}
      <section className="relative py-14 md:py-20">
        <div className="container-page">
          <div className="mb-8 max-w-2xl">
            <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary/80">
              Celestial Index
            </div>
            <h2 className="font-display text-2xl font-semibold md:text-3xl">
              Coordinates of the scientific archive
            </h2>
            <p className="mt-3 text-sm text-white/60">
              Verified counts derived from the current curriculum vitae. No citation totals or
              impact metrics are displayed until formally verifiable.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { v: archiveMetrics.scientificEvents, l: "Conferences & seminars" },
              { v: archiveMetrics.workshops, l: "Workshops" },
              { v: archiveMetrics.oralPresentations, l: "Oral presentations" },
              { v: archiveMetrics.posterPresentations, l: "Poster presentations" },
            ].map((m) => (
              <div key={m.l} className="glass rounded-2xl border-white/10 p-4">
                <div className="font-display text-2xl font-bold text-white md:text-3xl">{m.v}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/55">{m.l}</div>
              </div>
            ))}
          </div>
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
                  <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">
                    Research Constellation Navigator
                  </div>
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
                <Chip key={r} active={roleFilter === r} onClick={() => setRoleFilter(r)}>
                  {r}
                </Chip>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[10px] uppercase tracking-[0.24em] text-white/50">Theme</span>
              <Chip active={themeFilter === null} onClick={() => setThemeFilter(null)}>
                Show all
              </Chip>
              {researchThemes.map((t) => (
                <Chip key={t} active={themeFilter === t} onClick={() => setThemeFilter(t)}>
                  {t}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRIMARY DISCOVERY CONSTELLATION ============ */}
      <section className="relative py-14 md:py-20">
        <div className="container-page">
          <div className="mb-10 max-w-3xl">
            <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary/80">
              Primary Discovery Constellation
            </div>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              First-author investigations
            </h2>
            <p className="mt-3 text-white/65">
              The central arc of Diya Ram's doctoral research on magnetic activity in nearby
              M-dwarf stars — combining TESS photometry, optical spectroscopy and uGMRT radio
              observations.
            </p>
          </div>

          {firstAuthorPublished.length === 0 ? (
            <p className="glass rounded-2xl p-6 text-sm text-white/60">
              No first-author publications match the current filters.
            </p>
          ) : (
            <div className="space-y-8">
              {firstAuthorPublished.map((p, i) => (
                <FirstAuthorPanel key={p.id} pub={p} align={i % 2 === 1 ? "right" : "left"} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ EMERGING RESEARCH (Accepted) ============ */}
      {accepted.length > 0 && (
        <section className="relative py-14 md:py-20">
          <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
            <div
              className="absolute left-1/2 top-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
              style={{ background: "radial-gradient(circle, oklch(0.75 0.16 55 / 0.16), transparent 70%)" }}
            />
          </div>
          <div className="container-page relative">
            <div className="mb-10 max-w-3xl">
              <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-amber-300/90">
                Emerging Research · Event Horizon
              </div>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Accepted manuscript
              </h2>
              <p className="mt-3 text-white/65">
                A discovery approaching the visible scientific record. Final bibliographic details
                will be added after formal publication.
              </p>
            </div>
            <div className="space-y-8">
              {accepted.map((p) => (
                <FirstAuthorPanel key={p.id} pub={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ FIRST-AUTHOR PROCEEDING SPOTLIGHT ============ */}
      {firstAuthorProceedings.length > 0 && (
        <section className="relative py-14 md:py-20">
          <div className="container-page">
            <div className="mb-10 max-w-3xl">
              <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary/80">
                Signals Beyond the Journal
              </div>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                First-author conference proceeding
              </h2>
            </div>
            <div className="space-y-8">
              {firstAuthorProceedings.map((p) => (
                <FirstAuthorPanel key={p.id} pub={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ COLLABORATIVE GALAXY ============ */}
      {(collabJournals.length > 0 || collabProceedings.length > 0) && (
        <section className="relative py-14 md:py-20">
          <div className="container-page">
            <div className="mb-10 max-w-3xl">
              <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary/80">
                Collaborative Galaxy
              </div>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Contributions across the field
              </h2>
              <p className="mt-3 text-white/65">
                Research contributions extending Diya Ram's work across stellar variability,
                starspots, flares and young low-mass objects.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {collabJournals.map((p) => (
                <CollabCard key={p.id} pub={p} />
              ))}
            </div>
            {collabProceedings.length > 0 && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {collabProceedings.map((p) => (
                  <CollabCard key={p.id} pub={p} />
                ))}
              </div>
            )}
            <p className="mt-6 text-xs text-white/45">
              Detailed abstracts, methodology and figures for collaborative works will be added in
              the upcoming archive-enrichment pass.
            </p>
          </div>
        </section>
      )}

      {/* ============ OBSERVATORY OF SCIENTIFIC EXCHANGE ============ */}
      <section className="relative py-14 md:py-20">
        <div className="container-page">
          <div className="mb-10 max-w-3xl">
            <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary/80">
              Observatory of Scientific Exchange
            </div>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Conferences, seminars & scientific gatherings
            </h2>
            <p className="mt-3 text-white/65">
              Presentations, discussions and scientific gatherings through which research ideas
              entered the wider astronomical community.
            </p>
          </div>

          <div className="glass mb-6 rounded-2xl p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[10px] uppercase tracking-[0.24em] text-white/50">Year</span>
              <Chip active={yearFilter === null} onClick={() => setYearFilter(null)}>All</Chip>
              {years.map((y) => (
                <Chip key={y} active={yearFilter === y} onClick={() => setYearFilter(y)}>{y}</Chip>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-[10px] uppercase tracking-[0.24em] text-white/50">Role</span>
              {(["All", "Oral Presentation", "Poster Presentation", "Participant", "Online Participant"] as const).map((r) => (
                <Chip key={r} active={eventRoleFilter === r} onClick={() => setEventRoleFilter(r)}>{r}</Chip>
              ))}
            </div>
          </div>

          <ol className="relative space-y-3 border-l border-white/10 pl-6">
            {eventsFiltered.map((e) => (
              <li key={e.id} className="relative">
                <span className="absolute -left-[29px] top-2 h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_oklch(0.78_0.15_210/0.7)]" />
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
      <section className="relative py-14 md:py-20">
        <div className="container-page">
          <div className="mb-8 max-w-3xl">
            <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary/80">
              Methods, Tools & Continuing Exploration
            </div>
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

      {/* ============ COMMUNITY CONTRIBUTION ============ */}
      <section className="relative py-10">
        <div className="container-page">
          <div className="glass rounded-2xl p-6 md:p-8">
            <div className="text-[10px] uppercase tracking-[0.22em] text-primary/80">
              Scientific-community contribution
            </div>
            <h3 className="mt-2 font-display text-xl font-semibold text-white">
              {communityContribution.role} · {communityContribution.event}
            </h3>
            <p className="mt-2 text-sm text-white/65">
              {communityContribution.host} · {communityContribution.dateRange}
            </p>
          </div>
        </div>
      </section>

      {/* ============ EXTERNAL PROFILES ============ */}
      <section className="relative py-10">
        <div className="container-page">
          <div className="glass rounded-2xl p-6 md:p-8">
            <div className="mb-4 text-[10px] uppercase tracking-[0.22em] text-primary/80">
              Explore external publication profiles
            </div>
            <div className="flex flex-wrap gap-2">
              {profileLinks.map((p) => (
                <a
                  key={p.label}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={p.ariaLabel}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/85 transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                >
                  {p.label} <ArrowUpRight className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ CLOSING TRANSITION ============ */}
      <section className="relative py-20 md:py-28">
        <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: "radial-gradient(ellipse, oklch(0.42 0.18 295 / 0.28), transparent 70%)" }} />
        </div>
        <div className="container-page relative text-center">
          <div className="mb-4 text-[10px] uppercase tracking-[0.28em] text-primary/80">
            The Archive Continues
          </div>
          <h2 className="mx-auto max-w-3xl font-display text-3xl font-semibold md:text-4xl">
            Each observation opens another question.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/65">
            Each paper becomes a coordinate in a larger search for how magnetic activity shapes
            low-mass stars and the worlds that may orbit them.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/research-universe"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Enter the research universe <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white/85 hover:bg-white/[0.08]"
            >
              About the researcher
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
