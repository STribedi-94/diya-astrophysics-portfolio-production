import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUp,
  ArrowRight,
  BookOpen,
  Building2,
  Compass,
  Download,
  ExternalLink,
  Filter,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  LayoutList,
  MapPin,
  Menu as MenuIcon,
  Mic,
  Network,
  Newspaper,
  Presentation,
  Radio,
  Search,
  SlidersHorizontal,
  Star,
  Telescope,
  Timer,
  Users,
  Workflow,
  X,
} from "lucide-react";
import {
  conferenceRecords,
  conferenceScopes,
  conferenceStats,
  conferenceTypes,
  conferenceYears,
  galleryForConference,
  type ConferenceRecord,
  type ConferenceType,
} from "@/data/conferences";
import { facilities } from "@/data/facilities";
import { publicationsArchive } from "@/data/publications-archive";
import { projects } from "@/data/misc";
import { cn } from "@/lib/utils";
import { siteUrl } from "@/data/site";

export const Route = createFileRoute("/conferences")({
  head: () => ({
    meta: [
      { title: "Interstellar Scientific Conferences & Summits | Diya Ram" },
      {
        name: "description",
        content:
          "Explore Diya Ram's scientific conferences, oral presentations, poster sessions, research collaborations and links between astrophysical research, facilities and publications.",
      },
      {
        property: "og:title",
        content: "Interstellar Scientific Conferences & Summits — Diya Ram",
      },
      {
        property: "og:description",
        content:
          "A cinematic scientific communication archive of oral talks, posters, workshops and academic exchange across Diya Ram's observational astrophysics journey.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl("/conferences") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/conferences") }],
  }),
  component: ConferencesPage,
});

// ---------- helpers ----------

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setR(m.matches);
    const on = () => setR(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return r;
}

// Real geographic coordinates (lon, lat) for the India map. Cities are only
// mapped when they correspond to a verified in-person conference venue.
// Projection is applied at render time using the same bounds as the SVG paths.
const INDIA_CITY_COORDS: Record<string, { lon: number; lat: number }> = {
  Kolkata: { lon: 88.36, lat: 22.57 },
  Goa: { lon: 73.87, lat: 15.30 },
  Roorkee: { lon: 77.89, lat: 29.87 },
  Bhimtal: { lon: 79.56, lat: 29.35 },
};

// Projection bounds — MUST match those used to generate india-states.json
const MAP_BOUNDS = { minLon: 68.0, maxLon: 97.5, minLat: 6.5, maxLat: 35.7 };
const MAP_W = 800;
const MAP_H = 900;
function projectLonLat(lon: number, lat: number) {
  const x = ((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon)) * MAP_W;
  const y = MAP_H - ((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * MAP_H;
  return { x, y };
}


// Publication slug → title lookup for cross-links
const pubTitleBySlug = Object.fromEntries(
  publicationsArchive.map((p) => [p.slug, p.title] as const),
);
const projectTitleBySlug = Object.fromEntries(
  projects.map((p) => [p.slug, p.title] as const),
);
const facilityBySlug = Object.fromEntries(
  facilities.map((f) => [f.slug, f] as const),
);

const TYPE_ICON: Record<ConferenceType, React.ComponentType<{ className?: string }>> = {
  "Oral Presentation": Mic,
  "Poster Presentation": Presentation,
  Workshop: Workflow,
  Participation: Users,
  "Online Participation": Globe,
  "Local Organising Committee": Building2,
};

const SECTIONS = [
  { id: "forum-entrance", label: "Forum Entrance", icon: Compass },
  { id: "overview", label: "Overview", icon: LayoutList },
  { id: "featured-presentations", label: "Featured", icon: Star },
  { id: "conference-timeline", label: "Timeline", icon: Timer },
  { id: "oral-presentations", label: "Oral Talks", icon: Mic },
  { id: "poster-presentations", label: "Posters", icon: Presentation },
  { id: "conference-map", label: "Map", icon: MapPin },
  { id: "collaboration-constellation", label: "Collaborations", icon: Network },
  { id: "impact-journey", label: "Impact", icon: Workflow },
  { id: "presentation-publication", label: "Publications", icon: BookOpen },
  { id: "doctoral-contributions", label: "Doctoral", icon: GraduationCap },
  { id: "conference-archive", label: "Archive", icon: Filter },
  { id: "conference-memories", label: "Memories", icon: ImageIcon },
] as const;

// ---------- shared UI ----------

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-primary/90">
      <span className="h-1.5 w-1.5 rounded-full bg-primary anim-pulse-slow" />
      {children}
    </div>
  );
}

function SectionShell({
  id,
  eyebrow,
  title,
  intro,
  children,
  tone = "graphite",
}: {
  id: string;
  eyebrow?: string;
  title?: React.ReactNode;
  intro?: React.ReactNode;
  children: React.ReactNode;
  tone?: "graphite" | "steel";
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-24 py-16 md:py-24",
        tone === "steel" &&
          "bg-[oklch(0.11_0.02_260_/_0.55)] border-y border-white/[0.06]",
      )}
    >
      <div className="container-page relative">
        {(eyebrow || title || intro) && (
          <div className="mb-10 max-w-3xl">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {title && (
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight md:text-4xl">
                {title}
              </h2>
            )}
            {intro && (
              <p className="mt-4 text-muted-foreground md:text-lg">{intro}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

function Chip({
  children,
  active,
  onClick,
  as = "button",
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  as?: "button" | "span";
}) {
  const cls = cn(
    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] transition-colors",
    active
      ? "border-primary/60 bg-primary/15 text-foreground"
      : "border-white/10 bg-white/[0.04] text-muted-foreground hover:border-white/25 hover:text-foreground",
  );
  if (as === "span") return <span className={cls}>{children}</span>;
  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

function MetalPanel({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      className={cn(
        "rounded-2xl border border-white/10 bg-[oklch(0.13_0.03_260_/_0.7)] shadow-[0_1px_0_oklch(1_0_0_/_0.05)_inset,_0_30px_60px_-40px_oklch(0_0_0_/_0.9)] backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ---------- Page ----------

function ConferencesPage() {
  const reduced = useReducedMotion();

  // Active section tracking
  const [active, setActive] = useState<string>("forum-entrance");
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Dossier modal
  const [dossier, setDossier] = useState<ConferenceRecord | null>(null);
  const openDossier = useCallback((rec: ConferenceRecord) => setDossier(rec), []);
  const closeDossier = useCallback(() => setDossier(null), []);
  useEffect(() => {
    if (!dossier) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDossier();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [dossier, closeDossier]);

  return (
    <>
      {/* Ambient observatory overlay just for this page — very restrained */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-[5] overflow-hidden"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-10%,oklch(0.30_0.05_215_/_0.35),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,oklch(0.08_0.02_260_/_0.6))]" />
      </div>

      <ForumEntrance reduced={reduced} />
      <ForumDashboard />
      <FeaturedPresentations openDossier={openDossier} />
      <ConferenceTimeline openDossier={openDossier} />
      <OralPresentationTheatre openDossier={openDossier} />
      <PosterExhibitionHall openDossier={openDossier} />
      <ConferenceMap openDossier={openDossier} />
      <CollaborationConstellation />
      <ImpactJourney />
      <PresentationToPublication />
      <DoctoralContributions />
      <ConferenceArchive openDossier={openDossier} />
      <ConferenceMemories />
      <ContinueJourney />

      <SideNavigator active={active} />
      {dossier && <Dossier rec={dossier} onClose={closeDossier} />}
      <BackToTop />
    </>
  );
}

// ---------- 1. Cinematic Forum Entrance ----------

function ForumEntrance({ reduced }: { reduced: boolean }) {
  return (
    <section
      id="forum-entrance"
      className="relative isolate overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 scroll-mt-24"
    >
      {/* Panoramic architectural backdrop rendered in CSS/SVG (no external image dependency) */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.08_0.02_260)_0%,oklch(0.10_0.03_260)_60%,oklch(0.07_0.02_260)_100%)]" />
        {/* Observatory window arc */}
        <svg
          viewBox="0 0 1600 700"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full opacity-70"
        >
          <defs>
            <linearGradient id="floorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.16 0.03 260)" />
              <stop offset="100%" stopColor="oklch(0.09 0.02 260)" />
            </linearGradient>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.14 0.04 240)" />
              <stop offset="100%" stopColor="oklch(0.24 0.06 220)" stopOpacity="0.6" />
            </linearGradient>
            <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="oklch(0.55 0.10 210 / 0.55)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Distant stars */}
          {Array.from({ length: 90 }).map((_, i) => {
            const x = (i * 173) % 1600;
            const y = ((i * 91) % 380) + 10;
            const r = (i % 5 === 0 ? 1.4 : 0.7);
            return <circle key={i} cx={x} cy={y} r={r} fill="oklch(0.95 0.02 240 / 0.7)" />;
          })}

          {/* Panoramic window with subtle curve */}
          <path
            d="M 0 60 Q 800 -40 1600 60 L 1600 420 Q 800 340 0 420 Z"
            fill="url(#skyGrad)"
            opacity="0.55"
          />
          {/* Earth crescent through the window */}
          <circle cx="1200" cy="260" r="180" fill="url(#earthGlow)" />
          <circle cx="1200" cy="260" r="90" fill="oklch(0.35 0.08 220 / 0.5)" />

          {/* Metal frame mullions */}
          {[200, 500, 800, 1100, 1400].map((x) => (
            <line
              key={x}
              x1={x}
              y1="0"
              x2={x}
              y2="420"
              stroke="oklch(0.55 0.02 240 / 0.35)"
              strokeWidth="1"
            />
          ))}
          <line
            x1="0"
            y1="420"
            x2="1600"
            y2="420"
            stroke="oklch(0.65 0.03 220 / 0.5)"
            strokeWidth="1.5"
          />

          {/* Floor plane */}
          <rect x="0" y="420" width="1600" height="280" fill="url(#floorGrad)" />
          {/* Audience silhouettes */}
          {Array.from({ length: 24 }).map((_, i) => {
            const x = 40 + i * 65;
            const y = 520 + ((i % 3) * 10);
            return (
              <g key={i} opacity="0.55">
                <ellipse cx={x} cy={y} rx="14" ry="18" fill="oklch(0.06 0.02 260)" />
                <circle cx={x} cy={y - 22} r="8" fill="oklch(0.08 0.02 260)" />
              </g>
            );
          })}

          {/* Ceiling illumination line */}
          <line
            x1="0"
            y1="30"
            x2="1600"
            y2="30"
            stroke="oklch(0.80 0.14 210 / 0.4)"
            strokeWidth="1"
          />
        </svg>

        {/* Soft warm stage light */}
        <div
          className={cn(
            "absolute inset-x-0 top-24 mx-auto h-64 w-[70%] rounded-full blur-3xl opacity-40",
            !reduced && "anim-pulse-slow",
          )}
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.78 0.14 68 / 0.35), transparent 65%)",
          }}
        />
      </div>

      <div className="container-page relative">
        <Eyebrow>Scientific Communication Archive</Eyebrow>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
          Interstellar Scientific{" "}
          <span className="text-grad-accent">Conferences &amp; Summits</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
          Exploring Diya Ram's scientific journey through conferences, oral
          presentations, poster sessions, research exchange and global academic
          collaboration.
        </p>

        {/* Compact verified overview */}
        <dl className="mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Years", v: `${Math.min(...conferenceYears)}–${Math.max(...conferenceYears)}` },
            { k: "Conference Records", v: conferenceStats.total },
            { k: "Oral Talks", v: conferenceStats.oralTalks },
            { k: "Posters", v: conferenceStats.poster },
          ].map((s) => (

            <div
              key={s.k}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm"
            >
              <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                {s.k}
              </dt>
              <dd className="mt-1 font-display text-xl font-semibold">{s.v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#featured-presentations"
            className="inline-flex items-center gap-2 rounded-full bg-grad-accent px-5 py-2.5 text-sm font-medium text-[oklch(0.10_0.04_265)] shadow-[0_0_28px_-8px_oklch(0.78_0.15_210_/_0.7)]"
          >
            Explore Featured Presentations <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#conference-timeline"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-5 py-2.5 text-sm text-foreground hover:bg-white/[0.08]"
          >
            View Conference Timeline
          </a>
          <a
            href="#conference-archive"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Browse Complete Archive
          </a>
        </div>
      </div>
    </section>
  );
}

// ---------- 2. Forum Dashboard ----------

function ForumDashboard() {
  const metrics = [
    { label: "Verified Conference Records", value: conferenceStats.total, icon: LayoutList, hint: "Distinct events attended" },
    { label: "Oral Presentation Events", value: conferenceStats.oral, icon: Mic, hint: "Conferences with oral contributions" },
    { label: "Individual Oral Talks", value: conferenceStats.oralTalks, icon: Mic, hint: "Bose Fest 2025 delivered two talks" },
    { label: "Scientific Poster Presentations", value: conferenceStats.poster, icon: Presentation, hint: "Accepted conference posters" },
    { label: "Workshops Attended", value: conferenceStats.workshops, icon: Workflow, hint: "Advanced technical training" },
    { label: "Online Participation", value: conferenceStats.online, icon: Globe, hint: "Virtual and hybrid meetings" },
    { label: "Organising Committee Roles", value: conferenceStats.organiser, icon: Building2, hint: "Local Organising Committee" },
    { label: "Organising Institutions", value: conferenceStats.institutions, icon: Building2, hint: "Distinct organising bodies" },
    { label: "Cities & Venues", value: conferenceStats.locations, icon: MapPin, hint: "Including online participation" },
    { label: "Years of Participation", value: conferenceStats.years, icon: Timer, hint: `${Math.min(...conferenceYears)}–${Math.max(...conferenceYears)}` },
  ].filter((m) => m.value > 0);


  return (
    <SectionShell
      id="overview"
      eyebrow="Forum Dashboard"
      title="Scientific communication at a glance"
      intro="A compact instrument panel summarising the verified scale of academic exchange across Diya Ram's doctoral journey."
      tone="steel"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <MetalPanel key={m.label} className="group p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                    {m.label}
                  </div>
                  <div className="mt-2 font-display text-3xl font-semibold tabular-nums">
                    {m.value}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{m.hint}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-primary/80">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 h-px w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-60" />
            </MetalPanel>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ---------- 3. Featured Presentations ----------

function FeaturedPresentations({
  openDossier,
}: {
  openDossier: (r: ConferenceRecord) => void;
}) {
  const featured = conferenceRecords.filter((c) => c.featured);
  return (
    <SectionShell
      id="featured-presentations"
      eyebrow="Featured"
      title="Featured Scientific Presentations"
      intro="Highlights from Diya Ram's most academically substantial verified presentations — alternating dossier panels pairing conference imagery with structured scientific context."
    >
      <div className="space-y-10">
        {featured.map((rec, i) => (
          <FeaturedRow
            key={rec.id}
            rec={rec}
            reverse={i % 2 === 1}
            openDossier={openDossier}
          />
        ))}
      </div>
    </SectionShell>
  );
}

function FeaturedRow({
  rec,
  reverse,
  openDossier,
}: {
  rec: ConferenceRecord;
  reverse: boolean;
  openDossier: (r: ConferenceRecord) => void;
}) {
  const images = galleryForConference(rec);
  const cover = images[0];
  const Icon = TYPE_ICON[rec.type];
  const pub = rec.relatedPublicationSlug
    ? publicationsArchive.find((p) => p.slug === rec.relatedPublicationSlug)
    : null;
  const project = rec.relatedProjectSlug
    ? projects.find((p) => p.slug === rec.relatedProjectSlug)
    : null;
  const facility = rec.relatedFacilitySlug
    ? facilityBySlug[rec.relatedFacilitySlug]
    : null;

  return (
    <MetalPanel className="overflow-hidden">
      <div
        className={cn(
          "grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
          reverse && "md:[&>*:first-child]:order-2",
        )}
      >
        <div className="relative min-h-[220px] md:min-h-[380px]">
          {cover ? (
            <img
              src={cover.src}
              alt={cover.alt}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[oklch(0.14_0.03_260)] text-muted-foreground">
              <Presentation className="h-10 w-10 opacity-40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.08_0.03_260_/_0.85)] via-transparent to-transparent" />
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] text-primary/90 backdrop-blur">
            <Icon className="h-3 w-3" />
            {rec.type}
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="font-mono uppercase tracking-[0.22em] text-primary/80">
              {rec.year}
            </span>
            <span className="text-white/20">·</span>
            <span>{rec.date}</span>
            <span className="text-white/20">·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {rec.location}
            </span>
          </div>
          <h3 className="mt-3 font-display text-xl font-semibold leading-snug md:text-2xl">
            {rec.title ?? rec.event}
          </h3>
          <div className="mt-1 text-sm text-muted-foreground">
            {rec.event}
            {rec.organiser && rec.organiser !== rec.event && ` · ${rec.organiser}`}
          </div>

          {rec.summary && (
            <p className="mt-4 text-sm leading-relaxed text-foreground/85">
              {rec.summary}
            </p>
          )}

          {rec.coAuthors && rec.coAuthors.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              <span className="uppercase tracking-[0.18em] text-primary/70">
                Co-authors ·{" "}
              </span>
              {rec.coAuthors.join(", ")}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openDossier(rec)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/40 px-3.5 py-1.5 text-xs text-foreground hover:bg-primary/25"
            >
              View Conference Record <ArrowRight className="h-3 w-3" />
            </button>
            {images.length > 0 && (
              <Link
                to="/gallery"
                hash="conferences"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <ImageIcon className="h-3 w-3" /> View Gallery Album
              </Link>
            )}
            {pub && (
              <Link
                to="/publications/$slug"
                params={{ slug: pub.slug }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <BookOpen className="h-3 w-3" /> View Related Publication
              </Link>
            )}
            {project && (
              <Link
                to="/projects/$slug"
                params={{ slug: project.slug }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Telescope className="h-3 w-3" /> Explore Research Project
              </Link>
            )}
            {facility && (
              <Link
                to="/facilities/$slug"
                params={{ slug: facility.slug }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Radio className="h-3 w-3" /> View Research Facility
              </Link>
            )}
          </div>
        </div>
      </div>
    </MetalPanel>
  );
}

// ---------- 4. Timeline ----------

function ConferenceTimeline({
  openDossier,
}: {
  openDossier: (r: ConferenceRecord) => void;
}) {
  const byYear = useMemo(() => {
    const map = new Map<number, ConferenceRecord[]>();
    for (const r of conferenceRecords) {
      const arr = map.get(r.year) ?? [];
      arr.push(r);
      map.set(r.year, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, []);
  const latest = Math.max(...conferenceYears);

  return (
    <SectionShell
      id="conference-timeline"
      eyebrow="Trajectory"
      title="Orbital Conference Timeline"
      intro="An illuminated trajectory of scientific communication stations from 2021 to the latest verified year."
      tone="steel"
    >
      {/* Desktop horizontal timeline */}
      <div className="hidden lg:block">
        <div className="relative">
          {/* trajectory line */}
          <div className="absolute inset-x-6 top-16 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <div className="grid grid-cols-5 gap-6">
            {byYear.map(([year, list]) => (
              <div key={year} className="relative">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "relative z-10 grid h-10 w-10 place-items-center rounded-full border font-mono text-xs",
                      year === latest
                        ? "border-primary bg-primary/25 text-foreground shadow-[0_0_20px_oklch(0.78_0.15_210_/_0.6)]"
                        : "border-white/20 bg-[oklch(0.12_0.03_260)] text-primary/80",
                    )}
                  >
                    {year}
                  </div>
                  <div className="mt-1 h-6 w-px bg-white/15" />
                </div>
                <ul className="mt-2 space-y-2">
                  {list.map((r) => {
                    const Icon = TYPE_ICON[r.type];
                    return (
                      <li key={r.id}>
                        <button
                          type="button"
                          onClick={() => openDossier(r)}
                          className="w-full rounded-lg border border-white/10 bg-white/[0.03] p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/[0.06]"
                        >
                          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-primary/70">
                            <Icon className="h-3 w-3" />
                            {r.type}
                          </div>
                          <div className="mt-1 line-clamp-2 text-xs font-medium text-foreground">
                            {r.acronym ?? r.event}
                          </div>
                          <div className="mt-0.5 text-[10px] text-muted-foreground">
                            {r.city ?? r.location}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile / tablet vertical */}
      <ol className="lg:hidden relative ml-4 space-y-6 border-l border-white/15 pl-6">
        {byYear
          .slice()
          .reverse()
          .map(([year, list]) => (
            <li key={year} className="relative">
              <span
                className={cn(
                  "absolute -left-[33px] top-0 grid h-7 w-7 place-items-center rounded-full border font-mono text-[10px]",
                  year === latest
                    ? "border-primary bg-primary/25 text-foreground"
                    : "border-white/20 bg-[oklch(0.12_0.03_260)] text-primary/80",
                )}
              >
                {year}
              </span>
              <div className="space-y-2">
                {list.map((r) => {
                  const Icon = TYPE_ICON[r.type];
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => openDossier(r)}
                      className="block w-full rounded-lg border border-white/10 bg-white/[0.03] p-3 text-left hover:border-primary/40"
                    >
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-primary/70">
                        <Icon className="h-3 w-3" />
                        {r.type}
                      </div>
                      <div className="mt-1 text-sm font-medium">
                        {r.acronym ?? r.event}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {r.date} · {r.location}
                      </div>
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
      </ol>
    </SectionShell>
  );
}

// ---------- 5. Oral Presentation Theatre ----------

function OralPresentationTheatre({
  openDossier,
}: {
  openDossier: (r: ConferenceRecord) => void;
}) {
  const oral = conferenceRecords.filter((c) => c.type === "Oral Presentation");
  return (
    <SectionShell
      id="oral-presentations"
      eyebrow="Theatre"
      title="Oral Presentation Theatre"
      intro="Widescreen dossier of verified oral presentations delivered in person. Each panel traces the pathway from observation through analysis to presentation."
    >
      <div className="space-y-6">
        {oral.map((r) => {
          const images = galleryForConference(r);
          const cover = images[0];
          const pub = r.relatedPublicationSlug
            ? publicationsArchive.find((p) => p.slug === r.relatedPublicationSlug)
            : null;
          const facility = r.relatedFacilitySlug
            ? facilityBySlug[r.relatedFacilitySlug]
            : null;
          return (
            <MetalPanel key={r.id} className="overflow-hidden">
              <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
                {cover && (
                  <div className="relative h-40 md:h-auto">
                    <img
                      src={cover.src}
                      alt={cover.alt}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5 md:p-6">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-mono uppercase tracking-[0.22em] text-primary/80">
                      {r.year}
                    </span>
                    <span>·</span>
                    <span>{r.date}</span>
                    <span>·</span>
                    <span>{r.location}</span>
                  </div>
                  <h3 className="mt-2 font-display text-lg font-semibold md:text-xl">
                    {r.title ?? r.event}
                  </h3>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {r.event} · {r.organiser}
                  </div>
                  {r.summary && (
                    <p className="mt-3 text-sm text-foreground/85">{r.summary}</p>
                  )}

                  {/* Pathway */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    {["Observation", "Analysis", "Presentation", pub ? "Publication" : null]
                      .filter(Boolean)
                      .map((step, i, arr) => (
                        <span key={step as string} className="flex items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5",
                              step === "Presentation"
                                ? "border-primary/50 bg-primary/15 text-foreground"
                                : "border-white/15 bg-white/[0.03] text-muted-foreground",
                            )}
                          >
                            {step}
                          </span>
                          {i < arr.length - 1 && <ArrowRight className="h-3 w-3 opacity-40" />}
                        </span>
                      ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => openDossier(r)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/40 px-3 py-1.5 text-xs hover:bg-primary/25"
                    >
                      View Record
                    </button>
                    {pub && (
                      <Link
                        to="/publications/$slug"
                        params={{ slug: pub.slug }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Related Paper
                      </Link>
                    )}
                    {facility && (
                      <Link
                        to="/facilities/$slug"
                        params={{ slug: facility.slug }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        {facility.abbreviation}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </MetalPanel>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ---------- 6. Poster Exhibition Hall ----------

function PosterExhibitionHall({
  openDossier,
}: {
  openDossier: (r: ConferenceRecord) => void;
}) {
  const posters = conferenceRecords.filter((c) => c.type === "Poster Presentation");
  return (
    <SectionShell
      id="poster-presentations"
      eyebrow="Exhibition"
      title="Poster Exhibition Hall"
      intro="A curated digital exhibition of Diya Ram's accepted conference poster presentations, with links to Gallery previews and related publications."
      tone="steel"
    >
      <div className="grid gap-6 md:grid-cols-2">
        {posters.map((r) => {
          const images = galleryForConference(r);
          const cover = images.find((g) => g.category === "poster") ?? images[0];
          const pub = r.relatedPublicationSlug
            ? publicationsArchive.find((p) => p.slug === r.relatedPublicationSlug)
            : null;
          return (
            <MetalPanel key={r.id} className="overflow-hidden">
              {cover ? (
                <button
                  onClick={() => openDossier(r)}
                  className="relative block w-full overflow-hidden bg-black/30"
                  style={{ aspectRatio: "4 / 3" }}
                >
                  <img
                    src={cover.src}
                    alt={cover.alt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 hover:scale-[1.02]"
                  />
                  <span className="absolute right-3 top-3 rounded-full border border-white/20 bg-black/60 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.2em] text-primary/90">
                    Poster · {r.year}
                  </span>
                </button>
              ) : (
                <div className="grid h-40 place-items-center border-b border-white/10 text-muted-foreground">
                  <Presentation className="h-10 w-10 opacity-40" />
                </div>
              )}
              <div className="p-5">
                <div className="text-[11px] uppercase tracking-[0.22em] text-primary/80">
                  {r.acronym ?? r.event}
                </div>
                <h3 className="mt-1.5 font-display text-base font-semibold leading-snug">
                  {r.title ?? r.event}
                </h3>
                <div className="mt-1 text-xs text-muted-foreground">
                  {r.date} · {r.location}
                </div>
                {r.coAuthors && (
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                    <span className="uppercase tracking-[0.16em] text-primary/70">
                      Authors ·{" "}
                    </span>
                    Diya Ram, {r.coAuthors.filter((a) => a !== "Diya Ram").join(", ")}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => openDossier(r)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/40 px-3 py-1.5 text-xs hover:bg-primary/25"
                  >
                    Open Poster Record
                  </button>
                  {pub && (
                    <Link
                      to="/publications/$slug"
                      params={{ slug: pub.slug }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Related Paper
                    </Link>
                  )}
                </div>
              </div>
            </MetalPanel>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ---------- 7. Conference Map (India-focused SVG) ----------

import indiaStates from "@/data/india-states.json";

function ConferenceMap({
  openDossier,
}: {
  openDossier: (r: ConferenceRecord) => void;
}) {
  const inCountryRecords = conferenceRecords.filter(
    (r) => r.city && INDIA_CITY_COORDS[r.city],
  );
  const cityGroups = useMemo(() => {
    const m = new Map<string, ConferenceRecord[]>();
    for (const r of inCountryRecords) {
      const arr = m.get(r.city!) ?? [];
      arr.push(r);
      m.set(r.city!, arr);
    }
    return Array.from(m.entries());
  }, [inCountryRecords]);

  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [hoverCity, setHoverCity] = useState<string | null>(null);
  const selectedRecords = selectedCity
    ? cityGroups.find((c) => c[0] === selectedCity)?.[1] ?? []
    : [];

  return (
    <SectionShell
      id="conference-map"
      eyebrow="Cartography"
      title="Scientific Conference Map"
      intro="Verified in-person conference venues across India, rendered on a geographically accurate state-boundary outline. Online meetings are listed alongside the map for completeness."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <MetalPanel className="relative overflow-hidden p-4">
          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="h-auto w-full"
            role="img"
            aria-label="Geographic map of India showing verified conference venues"
          >
            <defs>
              <radialGradient id="mapGlow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="oklch(0.55 0.10 220 / 0.18)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <filter id="pinGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>
            <rect width={MAP_W} height={MAP_H} fill="url(#mapGlow)" />
            {/* States */}
            <g fill="oklch(0.14 0.03 260 / 0.55)" stroke="oklch(0.65 0.10 220 / 0.55)" strokeWidth="0.8" strokeLinejoin="round">
              {(indiaStates as { n: string; d: string }[]).map((s) => (
                <path key={s.n} d={s.d}>
                  <title>{s.n}</title>
                </path>
              ))}
            </g>
            {/* Constellation lines between verified venues */}
            <g stroke="oklch(0.80 0.14 210 / 0.25)" strokeWidth="1" strokeDasharray="3 4" fill="none">
              {cityGroups.map(([c1], i) =>
                cityGroups.slice(i + 1).map(([c2]) => {
                  const p1 = projectLonLat(INDIA_CITY_COORDS[c1].lon, INDIA_CITY_COORDS[c1].lat);
                  const p2 = projectLonLat(INDIA_CITY_COORDS[c2].lon, INDIA_CITY_COORDS[c2].lat);
                  return <line key={`${c1}-${c2}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />;
                }),
              )}
            </g>
            {/* Pins */}
            {cityGroups.map(([city, recs]) => {
              const c = INDIA_CITY_COORDS[city];
              const { x, y } = projectLonLat(c.lon, c.lat);
              const active = selectedCity === city || hoverCity === city;
              return (
                <g
                  key={city}
                  className="cursor-pointer"
                  onClick={() => setSelectedCity(city === selectedCity ? null : city)}
                  onMouseEnter={() => setHoverCity(city)}
                  onMouseLeave={() => setHoverCity(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${city} — ${recs.length} conference record${recs.length === 1 ? "" : "s"}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedCity(city === selectedCity ? null : city);
                    }
                  }}
                >
                  <circle cx={x} cy={y} r={active ? 26 : 18} fill="oklch(0.80 0.14 210 / 0.35)" filter="url(#pinGlow)" />
                  <circle cx={x} cy={y} r={active ? 10 : 7} fill="oklch(0.80 0.14 210 / 0.25)" />
                  <circle
                    cx={x}
                    cy={y}
                    r={active ? 6 : 4.5}
                    fill="oklch(0.85 0.16 210)"
                    className={active ? "" : "anim-pulse-slow"}
                  />
                  <text
                    x={x + 12}
                    y={y - 8}
                    fontSize="18"
                    fontWeight="700"
                    fill="oklch(0.97 0.02 240)"
                    stroke="oklch(0.05 0.02 260)"
                    strokeWidth="3"
                    paintOrder="stroke"
                    className="font-display select-none"
                  >
                    {city}
                  </text>
                  <text
                    x={x + 12}
                    y={y + 12}
                    fontSize="13"
                    fill="oklch(0.80 0.14 210)"
                    stroke="oklch(0.05 0.02 260)"
                    strokeWidth="2.5"
                    paintOrder="stroke"
                    className="font-mono select-none"
                  >
                    {recs.length} record{recs.length === 1 ? "" : "s"}
                  </text>
                </g>
              );
            })}
          </svg>
          {hoverCity && (
            <div className="pointer-events-none absolute left-4 top-4 rounded-lg border border-white/15 bg-black/70 px-3 py-2 text-xs backdrop-blur">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">{hoverCity}</div>
              <ul className="mt-1 space-y-0.5">
                {(cityGroups.find((c) => c[0] === hoverCity)?.[1] ?? []).map((r) => (
                  <li key={r.id} className="text-foreground/90">
                    {r.year} · {r.acronym ?? r.event} — <span className="text-primary/80">{r.type}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </MetalPanel>

        {/* Accessible list alternative */}
        <div className="space-y-3">
          <div className="text-[11px] uppercase tracking-[0.22em] text-primary/80 font-mono">
            {selectedCity
              ? `${selectedCity} · ${selectedRecords.length} record${selectedRecords.length === 1 ? "" : "s"}`
              : "All in-person venues"}
          </div>
          <ul className="space-y-2">
            {(selectedCity ? selectedRecords : inCountryRecords).map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => openDossier(r)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left hover:border-primary/40"
                >
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-primary/70">
                    {r.year} · {r.type}
                  </div>
                  <div className="mt-1 text-sm font-medium">{r.event}</div>
                  <div className="text-xs text-muted-foreground">{r.venue ?? r.location}</div>
                </button>
              </li>
            ))}
          </ul>
          {selectedCity && (
            <button
              onClick={() => setSelectedCity(null)}
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Show all locations
            </button>
          )}
          <div className="pt-4 text-[11px] uppercase tracking-[0.22em] text-primary/80 font-mono">
            Online participation
          </div>
          <ul className="space-y-1.5">
            {conferenceRecords
              .filter((r) => r.scope === "Online")
              .map((r) => (
                <li key={r.id} className="text-xs text-muted-foreground">
                  <span className="text-primary/80 font-mono">{r.year}</span> · {r.event}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
}


// ---------- 8. Collaboration Constellation ----------

function CollaborationConstellation() {
  const groups = [
    {
      label: "Doctoral Institution",
      icon: GraduationCap,
      nodes: [
        { name: "S. N. Bose National Centre for Basic Sciences", href: "https://www.bose.res.in/", external: true },
      ],
    },
    {
      label: "University",
      icon: Building2,
      nodes: [{ name: "University of Calcutta", href: "https://www.caluniv.ac.in/", external: true }],
    },
    {
      label: "Supervisor",
      icon: Users,
      nodes: [{ name: "Prof. Soumen Mondal", href: null }],
    },
    {
      label: "Research Institutes",
      icon: Building2,
      nodes: [
        { name: "ARIES, Nainital", href: "https://www.aries.res.in/", external: true },
        { name: "IIA, Bangalore", href: "https://www.iiap.res.in/", external: true },
        { name: "NCRA–TIFR (GMRT)", href: "https://www.ncra.tifr.res.in/", external: true },
        { name: "IISER Kolkata", href: "https://www.iiserkol.ac.in/", external: true },
        { name: "IIT Roorkee", href: "https://www.iitr.ac.in/", external: true },
        { name: "Goa University", href: "https://www.unigoa.ac.in/", external: true },
      ],
    },
    {
      label: "Scientific Societies",
      icon: Network,
      nodes: [
        { name: "Astronomical Society of India (ASI)", href: "https://astron-soc.in/", external: true },
        { name: "BINA — Belgo-Indian Network for Astronomy", href: null },
      ],
    },
    {
      label: "Space Agencies & Missions",
      icon: Globe,
      nodes: [
        { name: "Indian Space Research Organisation (ISRO)", href: "https://www.isro.gov.in/", external: true },
        { name: "NASA Exoplanet Science Institute (NExScI)", href: "https://nexsci.caltech.edu/", external: true },
        { name: "NASA TESS Mission", href: "https://science.nasa.gov/mission/tess/", external: true },
        { name: "MIT — TESS Science Conference", href: "https://tess.mit.edu/", external: true },
      ],
    },
    {
      label: "Observing Facilities",
      icon: Telescope,
      nodes: facilities.map((f) => ({
        name: `${f.abbreviation} — ${f.observatory}`,
        href: `/facilities/${f.slug}`,
      })),
    },
  ];

  return (
    <SectionShell
      id="collaboration-constellation"
      eyebrow="Constellation"
      title="Collaboration Constellation"
      intro="Verified scientific relationships from Diya Ram's conference and research trajectory — institutional hosts, supervisors, collaborators, societies and observing facilities."
      tone="steel"
    >
      {/* Center node */}
      <div className="mb-8 flex justify-center">
        <div className="rounded-2xl border border-primary/40 bg-primary/10 px-5 py-3 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/90">
            Center Node
          </div>
          <div className="mt-1 font-display text-lg font-semibold">
            Diya Ram — Astrophysics Researcher
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => {
          const Icon = g.icon;
          return (
            <MetalPanel key={g.label} className="p-5">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                <Icon className="h-3.5 w-3.5" />
                {g.label}
              </div>
              <ul className="mt-3 space-y-1.5">
                {g.nodes.map((n) => (
                  <li key={n.name}>
                    {n.href ? (
                      "external" in n && n.external ? (
                        <a
                          href={n.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-foreground/90 hover:text-foreground hover:underline underline-offset-4"
                        >
                          {n.name}
                          <ExternalLink className="h-3 w-3 opacity-60" />
                        </a>
                      ) : (
                        <Link
                          to={n.href}
                          className="text-sm text-foreground/90 hover:text-foreground hover:underline underline-offset-4"
                        >
                          {n.name}
                        </Link>
                      )
                    ) : (
                      <span className="text-sm text-foreground/85">{n.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </MetalPanel>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ---------- 9. Impact Journey ----------

function ImpactJourney() {
  const stages = [
    {
      label: "Observation",
      detail: "HCT, DOT, uGMRT, TESS",
      to: "/facilities",
      icon: Telescope,
    },
    {
      label: "Data Acquisition",
      detail: "TANSPEC, HFOSC, uGMRT Band 4 / Band 5",
      to: "/facilities",
      icon: Radio,
    },
    {
      label: "Analysis",
      detail: "BASSMAN, ALTAIPONY, FLARING-SPI",
      to: "/projects",
      icon: Workflow,
    },
    {
      label: "Conference Presentation",
      detail: "Bose Fest, ASI, NSSS, BINA",
      to: "/conferences",
      icon: Mic,
    },
    {
      label: "Scientific Discussion",
      detail: "Collaborators & scientific societies",
      to: "/conferences",
      icon: Users,
    },
    {
      label: "Publication",
      detail: "ApJ · Bulletin SRSL",
      to: "/publications",
      icon: BookOpen,
    },
    {
      label: "Next Research Question",
      detail: "Star–planet interaction, radio survey",
      to: "/research",
      icon: Compass,
    },
  ];
  return (
    <SectionShell
      id="impact-journey"
      eyebrow="Workflow"
      title="Scientific Impact Journey"
      intro="An illuminated scientific workflow — from observation on a mountain-top telescope through analysis, presentation and publication to the next research question."
    >
      <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {stages.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.label} className="relative">
              <Link
                to={s.to}
                className="block h-full rounded-2xl border border-white/10 bg-[oklch(0.13_0.03_260_/_0.7)] p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-[oklch(0.16_0.04_260_/_0.7)]"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-primary/90">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/60">
                    Stage {i + 1}
                  </span>
                </div>
                <div className="mt-3 font-display text-base font-semibold">
                  {s.label}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{s.detail}</div>
              </Link>
            </li>
          );
        })}
      </ol>
    </SectionShell>
  );
}

// ---------- 10. Presentation → Publication ----------

function PresentationToPublication() {
  const rows = conferenceRecords.filter((r) => r.relatedPublicationSlug);
  return (
    <SectionShell
      id="presentation-publication"
      eyebrow="Continuity"
      title="From Presentation to Publication"
      intro="Verified continuity between presented work, ongoing research projects and peer-reviewed publications. Only confirmed relationships are shown."
      tone="steel"
    >
      {/* Desktop table */}
      <div className="hidden md:block">
        <MetalPanel className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-left font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">
              <tr>
                <th className="px-4 py-3">Presentation</th>
                <th className="px-4 py-3">Conference</th>
                <th className="px-4 py-3">Facility</th>
                <th className="px-4 py-3">Related Paper</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const pub = publicationsArchive.find(
                  (p) => p.slug === r.relatedPublicationSlug,
                );
                const facility = r.relatedFacilitySlug
                  ? facilityBySlug[r.relatedFacilitySlug]
                  : null;
                return (
                  <tr
                    key={r.id}
                    className="border-t border-white/[0.06] hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground/95">
                        {r.title ?? r.event}
                      </div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                        {r.type} · {r.year}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.acronym ?? r.event}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {facility ? (
                        <Link
                          to="/facilities/$slug"
                          params={{ slug: facility.slug }}
                          className="hover:text-foreground hover:underline underline-offset-4"
                        >
                          {facility.abbreviation}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {pub ? (
                        <Link
                          to="/publications/$slug"
                          params={{ slug: pub.slug }}
                          className="text-foreground/90 hover:underline underline-offset-4"
                        >
                          {pub.title}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </MetalPanel>
      </div>

      {/* Mobile cards */}
      <ul className="grid gap-3 md:hidden">
        {rows.map((r) => {
          const pub = publicationsArchive.find(
            (p) => p.slug === r.relatedPublicationSlug,
          );
          return (
            <li key={r.id}>
              <MetalPanel className="p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary/70">
                  {r.year} · {r.type}
                </div>
                <div className="mt-1 text-sm font-medium">
                  {r.title ?? r.event}
                </div>
                <div className="text-xs text-muted-foreground">
                  {r.acronym ?? r.event}
                </div>
                {pub && (
                  <Link
                    to="/publications/$slug"
                    params={{ slug: pub.slug }}
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary/90 hover:underline"
                  >
                    <BookOpen className="h-3 w-3" /> {pub.title}
                  </Link>
                )}
              </MetalPanel>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}

// ---------- 11. Doctoral Contributions ----------

function DoctoralContributions() {
  const items = conferenceRecords.filter((r) => r.thesisConnection);
  return (
    <SectionShell
      id="doctoral-contributions"
      eyebrow="Doctoral"
      title="Conference Contributions to the Doctoral Journey"
      intro='Verified links between conference presentations and the doctoral thesis "Understanding Stellar Activity in M-dwarfs".'
    >
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((r) => (
          <MetalPanel key={r.id} className="p-5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">
              <GraduationCap className="h-3.5 w-3.5" /> {r.year} · {r.type}
            </div>
            <div className="mt-2 font-display text-base font-semibold">
              {r.acronym ?? r.event}
            </div>
            {r.topic && (
              <div className="mt-0.5 text-xs text-muted-foreground">
                Thesis theme · {r.topic}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                to="/academic-journey"
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Academic Journey
              </Link>
              <Link
                to="/downloads"
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Downloads
              </Link>
            </div>
          </MetalPanel>
        ))}
      </div>
    </SectionShell>
  );
}

// ---------- 12. Searchable Archive ----------

function ConferenceArchive({
  openDossier,
}: {
  openDossier: (r: ConferenceRecord) => void;
}) {
  const [q, setQ] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [type, setType] = useState<ConferenceType | null>(null);
  const [scope, setScope] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return conferenceRecords.filter((r) => {
      if (year && r.year !== year) return false;
      if (type && r.type !== type) return false;
      if (scope && r.scope !== scope) return false;
      if (query) {
        const hay = [
          r.title,
          r.event,
          r.acronym,
          r.organiser,
          r.location,
          r.topic,
          r.type,
          ...(r.coAuthors ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [q, year, type, scope]);

  const anyFilter = q || year || type || scope;
  const clearAll = () => {
    setQ("");
    setYear(null);
    setType(null);
    setScope(null);
  };

  return (
    <SectionShell
      id="conference-archive"
      eyebrow="Archive"
      title="Complete Conference Archive"
      intro="Full-text search and filters across every verified record."
      tone="steel"
    >
      <MetalPanel className="p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles, events, organisers, topics, authors…"
              aria-label="Search conferences"
              className="w-full rounded-lg border border-white/10 bg-black/25 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {filtered.length} of {conferenceRecords.length} record
            {filtered.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/70 self-center mr-1">
            Year
          </span>
          {conferenceYears.map((y) => (
            <Chip key={y} active={year === y} onClick={() => setYear(year === y ? null : y)}>
              {y}
            </Chip>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/70 self-center mr-1">
            Type
          </span>
          {conferenceTypes.map((t) => (
            <Chip key={t} active={type === t} onClick={() => setType(type === t ? null : t)}>
              {t}
            </Chip>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/70 self-center mr-1">
            Scope
          </span>
          {conferenceScopes.map((s) => (
            <Chip key={s} active={scope === s} onClick={() => setScope(scope === s ? null : s)}>
              {s}
            </Chip>
          ))}
        </div>

        {anyFilter && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Active:</span>
            {q && <Chip as="span">"{q}"</Chip>}
            {year && <Chip as="span">Year · {year}</Chip>}
            {type && <Chip as="span">Type · {type}</Chip>}
            {scope && <Chip as="span">Scope · {scope}</Chip>}
            <button
              onClick={clearAll}
              className="ml-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] text-muted-foreground hover:text-foreground"
            >
              Clear all
            </button>
          </div>
        )}
      </MetalPanel>

      <div className="mt-6 grid gap-3">
        {filtered.length === 0 ? (
          <MetalPanel className="p-8 text-center text-sm text-muted-foreground">
            No conference records match the selected filters. Clear one or more
            filters to continue exploring the archive.
          </MetalPanel>
        ) : (
          filtered.map((r) => {
            const Icon = TYPE_ICON[r.type];
            const images = galleryForConference(r);
            const cover = images[0];
            return (
              <button
                key={r.id}
                onClick={() => openDossier(r)}
                className="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition-all hover:border-primary/40 hover:bg-white/[0.05]"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/40">
                  {cover ? (
                    <img
                      src={cover.src}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Icon className="h-5 w-5 text-primary/80" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-primary/70">
                    <Icon className="h-3 w-3" />
                    {r.type} · {r.year}
                  </div>
                  <div className="mt-1 truncate font-medium">
                    {r.title ?? r.event}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {r.event} · {r.location} · {r.date}
                  </div>
                </div>
                <ArrowRight className="hidden h-4 w-4 shrink-0 opacity-40 transition-transform group-hover:translate-x-0.5 sm:block" />
              </button>
            );
          })
        )}
      </div>
    </SectionShell>
  );
}

// ---------- 13. Conference Memories (Gallery reuse) ----------

function ConferenceMemories() {
  const withImages = conferenceRecords.filter(
    (r) => r.galleryIds && r.galleryIds.length > 0,
  );
  return (
    <SectionShell
      id="conference-memories"
      eyebrow="Gallery"
      title="Conference Memories"
      intro="Photographs are reused from the Scientific Gallery — the authoritative visual archive."
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {withImages.map((r) => {
          const images = galleryForConference(r).slice(0, 4);
          return (
            <MetalPanel key={r.id} className="overflow-hidden">
              <div className="grid grid-cols-2 gap-px bg-white/5">
                {images.map((g) => (
                  <img
                    key={g.id}
                    src={g.src}
                    alt={g.alt}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                ))}
              </div>
              <div className="p-4">
                <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary/80">
                  {r.year} · {r.acronym ?? r.event}
                </div>
                <div className="mt-1 text-sm font-medium">{r.event}</div>
                <Link
                  to="/gallery"
                  hash="conferences"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary/90 hover:text-foreground hover:underline underline-offset-4"
                >
                  View Full Album in Scientific Gallery <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </MetalPanel>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ---------- 14. Continue Journey ----------

function ContinueJourney() {
  const links = [
    { to: "/gallery", label: "Scientific Gallery", reason: "Full visual archive of observations, conferences and milestones.", icon: ImageIcon },
    { to: "/publications", label: "Publications", reason: "Peer-reviewed journal articles and conference proceedings.", icon: BookOpen },
    { to: "/projects", label: "Research Projects", reason: "Ongoing and completed research investigations.", icon: Telescope },
    { to: "/research", label: "Research Areas", reason: "M-dwarf magnetic activity, flares, starspots, radio astronomy.", icon: Compass },
    { to: "/facilities", label: "Research Facilities", reason: "HCT, DOT, uGMRT and TESS observing capabilities.", icon: Radio },
    { to: "/academic-journey", label: "Academic Journey", reason: "The doctoral trajectory and milestones behind these talks.", icon: GraduationCap },
    { to: "/downloads", label: "Downloads", reason: "CV, publication list and other research documents.", icon: Download },
    { to: "/mission-log", label: "Scientific Mission Log", reason: "Verified milestones across the research programme.", icon: Newspaper },
  ] as const;
  return (
    <SectionShell
      id="continue"
      eyebrow="Onwards"
      title="Continue the Scientific Journey"
      intro="Related destinations across the Research Universe."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <Link
              key={l.to}
              to={l.to}
              className="group block rounded-2xl border border-white/10 bg-[oklch(0.13_0.03_260_/_0.7)] p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2 text-primary/90">
                  <Icon className="h-4 w-4" />
                </div>
                <ArrowRight className="h-4 w-4 opacity-40 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-3 font-display text-base font-semibold">{l.label}</div>
              <p className="mt-1 text-xs text-muted-foreground">{l.reason}</p>
            </Link>
          );
        })}
      </div>
    </SectionShell>
  );
}

// ---------- Side Navigator ----------

function SideNavigator({ active }: { active: string }) {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop rail */}
      <aside
        className={cn(
          "fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 rounded-2xl border border-white/10 bg-[oklch(0.10_0.03_260_/_0.85)] p-1.5 shadow-[0_20px_60px_-30px_oklch(0_0_0_/_0.9)] backdrop-blur-xl transition-all lg:block",
          expanded ? "w-56" : "w-12",
        )}
        aria-label="Section navigation"
      >
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mb-1 flex w-full items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] py-1.5 text-primary/80 hover:text-foreground"
          aria-label={expanded ? "Collapse navigator" : "Expand navigator"}
          aria-expanded={expanded}
        >
          <MenuIcon className="h-4 w-4" />
        </button>
        <ul className="space-y-0.5">
          {SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-lg px-2 py-2 text-xs transition-colors",
                    isActive
                      ? "bg-primary/15 text-foreground"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                  title={label}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
                  {expanded && <span className="truncate">{label}</span>}
                  {isActive && (
                    <span className="absolute -left-1.5 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                  )}
                </a>
              </li>
            );
          })}
          <li>
            <a
              href="#forum-entrance"
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground"
            >
              <ArrowUp className="h-4 w-4" />
              {expanded && <span>Back to Top</span>}
            </a>
          </li>
        </ul>
      </aside>

      {/* Mobile floating button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-[oklch(0.10_0.03_260_/_0.9)] px-4 py-2.5 text-xs font-medium text-foreground shadow-[0_10px_30px_-8px_oklch(0_0_0_/_0.8)] backdrop-blur-lg lg:hidden"
        aria-label="Open sections menu"
      >
        <LayoutList className="h-4 w-4" /> Sections
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[70] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Sections"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[oklch(0.10_0.03_260)] p-4">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
            <div className="mb-2 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                Sections
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close sections"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-1.5">
              {SECTIONS.map(({ id, label, icon: Icon }) => {
                const isActive = active === id;
                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-sm",
                        isActive
                          ? "border-primary/40 bg-primary/15 text-foreground"
                          : "bg-white/[0.03] text-muted-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}

// ---------- Dossier modal ----------

function Dossier({
  rec,
  onClose,
}: {
  rec: ConferenceRecord;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);
  const images = galleryForConference(rec);
  const pub = rec.relatedPublicationSlug
    ? publicationsArchive.find((p) => p.slug === rec.relatedPublicationSlug)
    : null;
  const project = rec.relatedProjectSlug
    ? projects.find((p) => p.slug === rec.relatedProjectSlug)
    : null;
  const facility = rec.relatedFacilitySlug
    ? facilityBySlug[rec.relatedFacilitySlug]
    : null;
  const Icon = TYPE_ICON[rec.type];

  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-title"
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.10_0.03_260_/_0.98)] shadow-[0_30px_80px_-20px_oklch(0_0_0_/_0.9)]">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-primary/80">
            <Icon className="h-3.5 w-3.5" /> {rec.type} · {rec.year}
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close dossier"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto">
          {images[0] && (
            <img
              src={images[0].src}
              alt={images[0].alt}
              className="max-h-[300px] w-full object-cover"
            />
          )}
          <div className="p-6">
            <h3 id="dossier-title" className="font-display text-2xl font-semibold">
              {rec.title ?? rec.event}
            </h3>
            <div className="mt-1 text-sm text-muted-foreground">
              {rec.event}
              {rec.acronym && rec.acronym !== rec.event && ` (${rec.acronym})`}
            </div>

            <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/70">Organiser</dt>
                <dd className="mt-0.5 text-foreground/90">{rec.organiser}</dd>
              </div>
              {rec.venue && (
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/70">Venue</dt>
                  <dd className="mt-0.5 text-foreground/90">{rec.venue}</dd>
                </div>
              )}
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/70">Location</dt>
                <dd className="mt-0.5 text-foreground/90">{rec.location}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/70">Date</dt>
                <dd className="mt-0.5 text-foreground/90">{rec.date}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/70">Scope</dt>
                <dd className="mt-0.5 text-foreground/90">{rec.scope}</dd>
              </div>
              {rec.role && (
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/70">Role</dt>
                  <dd className="mt-0.5 text-foreground/90">{rec.role}</dd>
                </div>
              )}
              {rec.topic && (
                <div className="sm:col-span-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/70">Topic</dt>
                  <dd className="mt-0.5 text-foreground/90">{rec.topic}</dd>
                </div>
              )}
              {rec.coAuthors && (
                <div className="sm:col-span-2">
                  <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/70">Co-authors</dt>
                  <dd className="mt-0.5 text-foreground/90">Diya Ram, {rec.coAuthors.filter((a) => a !== "Diya Ram").join(", ")}</dd>
                </div>
              )}
            </dl>

            {rec.summary && (
              <p className="mt-5 text-sm leading-relaxed text-foreground/90">
                {rec.summary}
              </p>
            )}

            {(pub || project || facility || images.length > 1) && (
              <div className="mt-6 border-t border-white/10 pt-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                  Related Work
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pub && (
                    <Link
                      to="/publications/$slug"
                      params={{ slug: pub.slug }}
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs hover:text-foreground hover:border-primary/40"
                    >
                      <BookOpen className="h-3 w-3" /> {pub.title}
                    </Link>
                  )}
                  {project && (
                    <Link
                      to="/projects/$slug"
                      params={{ slug: project.slug }}
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs hover:text-foreground hover:border-primary/40"
                    >
                      <Telescope className="h-3 w-3" /> {project.title}
                    </Link>
                  )}
                  {facility && (
                    <Link
                      to="/facilities/$slug"
                      params={{ slug: facility.slug }}
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs hover:text-foreground hover:border-primary/40"
                    >
                      <Radio className="h-3 w-3" /> {facility.abbreviation} — {facility.observatory}
                    </Link>
                  )}
                  {images.length > 0 && (
                    <Link
                      to="/gallery"
                      hash="conferences"
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs hover:text-foreground hover:border-primary/40"
                    >
                      <ImageIcon className="h-3 w-3" /> View in Gallery
                    </Link>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {images.slice(1).map((g) => (
                      <img
                        key={g.id}
                        src={g.src}
                        alt={g.alt}
                        loading="lazy"
                        className="aspect-square w-full rounded-md object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Back to Top ----------

function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 600);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-5 left-5 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[oklch(0.10_0.03_260_/_0.9)] text-primary/90 backdrop-blur hover:text-foreground"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}