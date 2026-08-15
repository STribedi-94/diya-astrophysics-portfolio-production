import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUp,
  BookOpen,
  Camera,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  Compass,
  Filter,
  GraduationCap,
  Home as HomeIcon,
  Info,
  Layers,
  MapPin,
  Menu as MenuIcon,
  MonitorPlay,
  Newspaper,
  Presentation,
  Search,
  Star,
  Telescope,
  Timer,
  Users,
  X,
} from "lucide-react";
import {
  gallery,
  galleryByEventSeries,
  galleryCategories,
  galleryStats,
  galleryYearRange,
  galleryYears,
  type GalleryRecord,
} from "@/data/gallery";
import { cn } from "@/lib/utils";
import { siteUrl } from "@/data/site";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Scientific Gallery — Astronomical Journey Archive · Diya Ram" },
      {
        name: "description",
        content:
          "A curated visual archive of Diya Ram's astronomical journey: telescope observing runs, poster and oral presentations, conferences, academic milestones and research community. 29 records across ARIES, IIT Roorkee, Goa University, St. Xavier's and the University of Calcutta.",
      },
      { property: "og:title", content: "Scientific Gallery — Astronomical Journey Archive" },
      {
        property: "og:description",
        content:
          "Observations, presentations, conferences and doctoral milestones from Diya Ram's observational astrophysics journey.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { rel: "canonical", href: siteUrl("/gallery") },
    ],
  }),
  component: GalleryPage,
});

// ---------- helpers ----------

const NAV_SECTIONS: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Mission Overview", icon: Compass },
  { id: "featured", label: "Featured Records", icon: Star },
  { id: "archive", label: "Archive Search", icon: Search },
  { id: "gallery-grid", label: "All Records", icon: Layers },
  { id: "facilities", label: "Research Facilities", icon: Telescope },
  { id: "conferences", label: "Conferences", icon: Presentation },
  { id: "milestones", label: "Academic Milestones", icon: GraduationCap },
  { id: "community", label: "Research Community", icon: Users },
  { id: "timeline", label: "Timeline", icon: Timer },
  { id: "related", label: "Related Pages", icon: MonitorPlay },
];

// ---------- page ----------

function GalleryPage() {
  return (
    <>
      <Breadcrumbs />
      <ArchiveHero />
      <SideNavigator />
      <FeaturedSection />
      <ArchiveControls />
      <FacilitySection />
      <ConferenceSection />
      <MilestoneSection />
      <CommunitySection />
      <TimelineSection />
      <RelatedSection />
      <EndOfArchive />
    </>
  );
}

// ---------- breadcrumbs ----------

function Breadcrumbs() {
  return (
    <nav aria-label="Breadcrumb" className="container-page relative z-10 pt-28 md:pt-32">
      <ol className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <li>
          <Link to="/" className="inline-flex items-center gap-1 hover:text-foreground">
            <HomeIcon className="h-3 w-3" /> Home
          </Link>
        </li>
        <li className="opacity-50">/</li>
        <li className="opacity-70">More</li>
        <li className="opacity-50">/</li>
        <li className="text-foreground">Scientific Gallery</li>
      </ol>
    </nav>
  );
}

// ---------- hero ----------

function ArchiveHero() {
  return (
    <section id="overview" className="relative overflow-hidden pt-8 pb-16 md:pb-24 scroll-mt-24">
      <div className="absolute inset-0 bg-grad-hero opacity-80" aria-hidden />
      <div className="absolute inset-0 starfield anim-drift opacity-70" aria-hidden />
      <div className="absolute inset-0 grid-cosmic opacity-30" aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--uv-violet), transparent 70%)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px opacity-40"
        style={{ background: "linear-gradient(90deg, transparent, var(--spectral-cyan), transparent)" }}
        aria-hidden
      />
      <div className="container-page relative mt-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-primary/90">
          <span className="h-1.5 w-1.5 rounded-full bg-primary anim-pulse-slow" />
          Scientific Gallery
        </div>
        <h1 className="mt-5 max-w-4xl font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
          Astronomical Journey <span className="text-grad-accent">Archive</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          A visual record of observations, research, conferences, collaborations, scientific communication, and
          academic milestones.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground/80">
          From classroom optics to professional observing runs with India's premier optical telescopes.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#gallery-grid"
            className="inline-flex items-center gap-2 rounded-full bg-grad-accent px-5 py-2.5 text-sm font-medium text-[oklch(0.12_0.04_265)] shadow-[0_0_24px_-8px_oklch(0.78_0.15_210_/_0.6)] transition-transform hover:scale-[1.02]"
          >
            Explore Archive <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#featured"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-white/10"
          >
            Start Scientific Journey
          </a>
          <a
            href="#nav-anchor"
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
          >
            Open Archive Navigator →
          </a>
        </div>

        <dl className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          <HeroStat label="Archive Status" value="ONLINE" accent />
          <HeroStat label="Total Records" value={String(galleryStats.total).padStart(2, "0")} />
          <HeroStat label="Year Range" value={`${galleryYearRange.min} – ${galleryYearRange.max}`} />
          <HeroStat label="Conference Events" value={String(galleryStats.conferenceEvents).padStart(2, "0")} />
        </dl>
      </div>
    </section>
  );
}

function HeroStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">{label}</div>
      <div
        className={cn(
          "mt-1.5 font-display text-xl font-semibold md:text-2xl",
          accent && "text-grad-accent",
        )}
      >
        {value}
      </div>
    </div>
  );
}

// ---------- side navigator ----------

function SideNavigator() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState<string>(NAV_SECTIONS[0].id);

  useEffect(() => {
    try {
      setCollapsed(sessionStorage.getItem("gallery-nav-collapsed") === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("gallery-nav-collapsed", collapsed ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY + 140;
        let current = NAV_SECTIONS[0].id;
        for (const s of NAV_SECTIONS) {
          const el = document.getElementById(s.id);
          if (el && el.offsetTop <= y) current = s.id;
        }
        setActive(current);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const goTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: "smooth" });
    setMobileOpen(false);
  }, []);

  return (
    <>
      <span id="nav-anchor" />
      <aside
        aria-label="Gallery navigator"
        className={cn(
          "fixed left-4 top-24 z-30 hidden lg:block transition-[width] duration-300",
          collapsed ? "w-14" : "w-56",
        )}
      >
        <div className="glass-strong rounded-2xl p-2">
          <div className="flex items-center justify-between px-2 pb-2">
            {!collapsed && (
              <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-primary/80">
                Archive Navigator
              </span>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? "Expand navigator" : "Collapse navigator"}
              className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-white/10 hover:text-foreground"
            >
              <ChevronsLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            </button>
          </div>
          <ul className="space-y-0.5">
            {NAV_SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = active === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => goTo(s.id)}
                    title={s.label}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                      isActive
                        ? "bg-primary/15 text-foreground"
                        : "text-muted-foreground hover:bg-white/10 hover:text-foreground",
                    )}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{s.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full bg-grad-accent px-4 py-2.5 text-xs font-medium text-[oklch(0.12_0.04_265)] shadow-[0_0_20px_-6px_oklch(0.78_0.15_210_/_0.6)] lg:hidden"
        aria-label="Open archive navigator"
      >
        <MenuIcon className="h-4 w-4" /> Archive Navigator
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-[oklch(0.09_0.03_265_/_0.98)] p-4 backdrop-blur-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                Archive Navigator
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigator"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {NAV_SECTIONS.map((s) => {
                const Icon = s.icon;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => goTo(s.id)}
                      className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-left text-sm text-foreground"
                    >
                      <Icon className="h-4 w-4 text-primary/80" /> {s.label}
                    </button>
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

// ---------- featured ----------

function FeaturedSection() {
  const featured = useMemo(
    () => [...gallery].filter((g) => g.featured).sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999)),
    [],
  );
  const [dominant, ...rest] = featured;
  const [openId, setOpenId] = useState<string | null>(null);

  if (!dominant) return null;

  return (
    <section id="featured" className="py-14 md:py-20 scroll-mt-24">
      <div className="container-page">
        <SectionEyebrow label="Featured Records" title="Highlights from the archive" />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <FeaturedCard record={dominant} large onOpen={() => setOpenId(dominant.id)} />
          <div className="grid gap-4 lg:col-span-1">
            {rest.slice(0, 2).map((r) => (
              <FeaturedCard key={r.id} record={r} onOpen={() => setOpenId(r.id)} />
            ))}
          </div>
          <div className="grid gap-4 lg:col-span-1">
            {rest.slice(2, 4).map((r) => (
              <FeaturedCard key={r.id} record={r} onOpen={() => setOpenId(r.id)} />
            ))}
          </div>
        </div>
        {rest.length > 4 && (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rest.slice(4).map((r) => (
              <FeaturedCard key={r.id} record={r} onOpen={() => setOpenId(r.id)} />
            ))}
          </div>
        )}
      </div>
      {openId && (
        <Lightbox
          initialId={openId}
          set={featured}
          onClose={() => setOpenId(null)}
          onNavigate={(id) => setOpenId(id)}
        />
      )}
    </section>
  );
}

function FeaturedCard({
  record,
  large,
  onOpen,
}: {
  record: GalleryRecord;
  large?: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group relative block w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-left transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        large ? "lg:col-span-1 lg:row-span-2 aspect-[4/5] lg:aspect-auto" : "aspect-[4/3]",
      )}
    >
      <img
        src={record.src}
        alt={record.alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-5">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-primary/90">
          <Star className="h-3 w-3" /> Featured
          {record.year && <span className="text-muted-foreground/90">· {record.year}</span>}
        </div>
        <div className="mt-1.5 font-display text-lg font-semibold leading-tight md:text-xl">
          {record.title}
        </div>
        <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{record.shortCaption}</div>
      </div>
    </button>
  );
}

// ---------- archive search / grid controls ----------

function ArchiveControls() {
  const [category, setCategory] = useState<string>("all");
  const [year, setYear] = useState<string>("all");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  // Hash-based deep link support (#record-<id>)
  useEffect(() => {
    const applyHash = () => {
      const h = window.location.hash.replace("#", "");
      if (h.startsWith("record-")) {
        const id = h.slice("record-".length);
        if (gallery.find((g) => g.id === id)) setOpenId(id);
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return gallery.filter((g) => {
      if (category === "featured" && !g.featured) return false;
      if (category !== "all" && category !== "featured" && g.category !== category) return false;
      if (year !== "all" && String(g.year ?? "") !== year) return false;
      if (!term) return true;
      const hay =
        `${g.title} ${g.caption} ${g.institution ?? ""} ${g.location ?? ""} ${g.event ?? ""} ${g.facility ?? ""} ${g.topic ?? ""} ${g.role ?? ""} ${g.presentationType ?? ""} ${g.tags.join(" ")} ${g.year ?? ""}`.toLowerCase();
      return hay.includes(term);
    });
  }, [category, year, q]);

  const reset = () => {
    setCategory("all");
    setYear("all");
    setQ("");
  };

  return (
    <>
      <section id="archive" className="scroll-mt-24">
        <div className="container-page">
          <div className="glass-strong sticky top-16 z-20 rounded-2xl p-4 md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  aria-label="Search the archive"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search the archive — DOT, AD Leonis, poster, Bose Fest, ARIES, 2024…"
                  className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="sr-only" htmlFor="year-filter">
                  Year filter
                </label>
                <select
                  id="year-filter"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-foreground focus:border-primary/50 focus:outline-none"
                >
                  <option value="all">All years</option>
                  {galleryYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Filter className="h-3.5 w-3.5" /> Reset
                </button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {galleryCategories.map((c) => {
                const active = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-[11px] transition-colors",
                      active
                        ? "border-primary/50 bg-primary/15 text-foreground"
                        : "border-white/10 bg-white/5 text-muted-foreground hover:text-foreground",
                    )}
                    aria-pressed={active}
                  >
                    {c.label}
                  </button>
                );
              })}
              <div className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="font-mono">{String(filtered.length).padStart(2, "0")}</span>
                <span>of</span>
                <span className="font-mono">{String(gallery.length).padStart(2, "0")}</span>
                <span>records</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="gallery-grid" className="py-10 md:py-14 scroll-mt-24">
        <div className="container-page">
          {filtered.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <div className="font-display text-lg">No records match your filters</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Try clearing the search or resetting the filters.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs hover:bg-white/10"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="columns-1 gap-4 md:columns-2 lg:columns-3 [column-fill:_balance]">
              {filtered.map((r) => (
                <GridCard
                  key={r.id}
                  record={r}
                  onOpen={() => setOpenId(r.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {openId && (
        <Lightbox
          initialId={openId}
          set={filtered.find((f) => f.id === openId) ? filtered : gallery}
          onClose={() => {
            setOpenId(null);
            if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
          }}
          onNavigate={(id) => setOpenId(id)}
        />
      )}
    </>
  );
}

function GridCard({ record, onOpen }: { record: GalleryRecord; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-black/40 text-left transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 hover:shadow-[0_0_32px_-12px_oklch(0.78_0.15_210_/_0.45)]"
    >
      <div className="relative">
        <img
          src={record.src}
          alt={record.alt}
          loading="lazy"
          className="w-full transition-transform duration-700 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="p-3.5">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-primary/80">
          <span className="truncate">{presentationLabel(record)}</span>
          {record.year && <span className="text-muted-foreground">· {record.year}</span>}
          {record.featured && <Star className="h-3 w-3 text-stellar-gold" aria-label="Featured" />}
        </div>
        <div className="mt-1 font-display text-sm font-semibold leading-snug">{record.title}</div>
        {record.location && (
          <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <MapPin className="h-3 w-3" /> {record.location}
          </div>
        )}
      </div>
    </button>
  );
}

function presentationLabel(r: GalleryRecord) {
  return r.presentationType ?? "Record";
}

// ---------- lightbox ----------

function Lightbox({
  initialId,
  set,
  onClose,
  onNavigate,
}: {
  initialId: string;
  set: GalleryRecord[];
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  const list = set.length ? set : gallery;
  const idx = Math.max(0, list.findIndex((r) => r.id === initialId));
  const current = list[idx];
  const [zoom, setZoom] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setZoom(false);
    if (current) {
      history.replaceState(null, "", `#record-${current.id}`);
    }
  }, [current]);

  const go = useCallback(
    (dir: -1 | 1) => {
      const next = (idx + dir + list.length) % list.length;
      onNavigate(list[next].id);
    },
    [idx, list, onNavigate],
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, go]);

  const touch = useRef<{ x: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => (touch.current = { x: e.touches[0].clientX });
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touch.current) return;
    const dx = e.changedTouches[0].clientX - touch.current.x;
    if (Math.abs(dx) > 60) go(dx > 0 ? -1 : 1);
    touch.current = null;
  };

  if (!current) return null;

  const related = (
    current.eventSeries
      ? list.filter((r) => r.id !== current.id && r.eventSeries === current.eventSeries)
      : []
  ).slice(0, 4);

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-[oklch(0.04_0.02_265_/_0.97)] backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label={current.title}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="absolute inset-0 starfield-sparse opacity-40" aria-hidden />
      <div className="relative flex items-center justify-between gap-3 border-b border-white/10 p-3 md:p-4">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
            {presentationLabel(current)} · {String(idx + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
          </div>
          <div className="truncate font-display text-sm text-foreground md:text-base">{current.title}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((z) => !z)}
            className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground md:inline-flex"
          >
            {zoom ? "Fit to screen" : "Actual size"}
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close viewer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous record"
          className="absolute left-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur hover:bg-black/60 md:left-4"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className={cn("h-full w-full overflow-auto p-3 md:p-6", zoom ? "cursor-zoom-out" : "cursor-zoom-in")}>
          <img
            src={current.src}
            alt={current.alt}
            onClick={() => setZoom((z) => !z)}
            className={cn(
              "mx-auto rounded-lg shadow-[0_20px_60px_-20px_oklch(0_0_0_/_0.8)]",
              zoom ? "max-w-none" : "max-h-[70vh] w-auto max-w-full object-contain",
            )}
          />
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next record"
          className="absolute right-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur hover:bg-black/60 md:right-4"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="relative max-h-[38vh] overflow-y-auto border-t border-white/10 bg-black/40 p-4 backdrop-blur md:p-6">
        <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="text-sm leading-relaxed text-muted-foreground">{current.caption}</p>
            {current.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {current.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            {related.length > 0 && (
              <div className="mt-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                  From the same event
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {related.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => onNavigate(r.id)}
                      className="group relative overflow-hidden rounded-md border border-white/10"
                    >
                      <img src={r.src} alt={r.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <dl className="space-y-2 text-xs">
            {current.event && <Meta label="Event" value={current.event} />}
            {current.year && <Meta label="Year" value={current.date ?? String(current.year)} />}
            {current.institution && <Meta label="Institution" value={current.institution} />}
            {current.location && <Meta label="Location" value={current.location} />}
            {current.facility && <Meta label="Facility" value={current.facility} />}
            {current.role && <Meta label="Role" value={current.role} />}
            {current.topic && <Meta label="Topic" value={current.topic} />}
            <Meta label="Category" value={presentationLabel(current)} />
            {current.relatedRoute && (
              <div className="pt-1">
                <Link
                  to={current.relatedRoute.to}
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  {current.relatedRoute.label} <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-white/5 pb-1.5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/70">{label}</dt>
      <dd className="text-right text-xs text-foreground">{value}</dd>
    </div>
  );
}

// ---------- section shells ----------

function SectionEyebrow({ label, title }: { label: string; title: string }) {
  return (
    <div className="max-w-3xl">
      <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">{label}</div>
      <h2 className="font-display text-2xl font-semibold md:text-3xl">{title}</h2>
    </div>
  );
}

// ---------- facilities ----------

function FacilitySection() {
  const facilities = [
    {
      key: "dot",
      name: "3.6-m Devasthal Optical Telescope",
      subtitle: "ARIES · Nainital, Uttarakhand",
      records: gallery.filter(
        (g) => g.facility === "3.6-m Devasthal Optical Telescope",
      ),
      role: "Principal Investigator",
    },
    {
      key: "dfot",
      name: "1.3-m Devasthal Fast Optical Telescope",
      subtitle: "ARIES · Nainital, Uttarakhand",
      records: gallery.filter((g) => g.facility === "1.3-m Devasthal Fast Optical Telescope"),
      role: "Facility Visit",
    },
  ];
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <section id="facilities" className="py-14 md:py-20 scroll-mt-24">
      <div className="container-page">
        <SectionEyebrow label="Research Facilities" title="Observatories, telescopes and instrumentation" />
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {facilities.map((f) => (
            <div key={f.key} className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                    <Telescope className="mr-1 inline h-3 w-3" /> {f.subtitle}
                  </div>
                  <div className="mt-1 font-display text-lg font-semibold">{f.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Role: <span className="text-foreground">{f.role}</span> · {f.records.length} records
                  </div>
                </div>
                <Link
                  to="/facilities"
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                >
                  Explore <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {f.records.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setOpenId(r.id)}
                    className="group relative overflow-hidden rounded-lg border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    <img
                      src={r.src}
                      alt={r.alt}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition-transform group-hover:scale-[1.04]"
                    />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {openId && (
        <Lightbox
          initialId={openId}
          set={gallery.filter((g) => g.category === "facility")}
          onClose={() => setOpenId(null)}
          onNavigate={(id) => setOpenId(id)}
        />
      )}
    </section>
  );
}

// ---------- conferences ----------

function ConferenceSection() {
  const [openId, setOpenId] = useState<string | null>(null);
  const groups = galleryByEventSeries.filter((g) =>
    g.records.some((r) => ["oral", "poster", "participation"].includes(r.category)),
  );
  return (
    <section id="conferences" className="py-14 md:py-20 scroll-mt-24">
      <div className="container-page">
        <SectionEyebrow label="Conference Archive" title="Presentations and participation" />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => {
            const cover = g.records[0];
            return (
              <div key={g.series} className="glass rounded-2xl p-4">
                <button
                  type="button"
                  onClick={() => setOpenId(cover.id)}
                  className="group block w-full overflow-hidden rounded-xl"
                >
                  <img
                    src={cover.src}
                    alt={cover.alt}
                    loading="lazy"
                    className="aspect-[16/10] w-full rounded-xl object-cover transition-transform group-hover:scale-[1.02]"
                  />
                </button>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-display text-sm font-semibold">{g.series}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {g.count} record{g.count === 1 ? "" : "s"}
                      {g.year && ` · ${g.year}`}
                    </div>
                  </div>
                  <Link
                    to="/conferences"
                    className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
                  >
                    Details →
                  </Link>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-1.5">
                  {g.records.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setOpenId(r.id)}
                      className="overflow-hidden rounded-md border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      aria-label={r.title}
                    >
                      <img src={r.src} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6">
          <Link
            to="/conferences"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs hover:bg-white/10"
          >
            <Presentation className="h-3.5 w-3.5" /> Full Conferences &amp; Presentations
          </Link>
        </div>
      </div>
      {openId && (
        <Lightbox
          initialId={openId}
          set={gallery.filter((g) => ["oral", "poster", "participation"].includes(g.category))}
          onClose={() => setOpenId(null)}
          onNavigate={(id) => setOpenId(id)}
        />
      )}
    </section>
  );
}

// ---------- milestones ----------

function MilestoneSection() {
  const records = gallery.filter((g) => g.category === "milestone");
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <section id="milestones" className="py-14 md:py-20 scroll-mt-24">
      <div className="container-page">
        <SectionEyebrow label="Academic Milestones" title="Doctoral thesis journey" />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {records.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setOpenId(r.id)}
              className="group glass block w-full overflow-hidden rounded-2xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <img
                src={r.src}
                alt={r.alt}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover transition-transform group-hover:scale-[1.02]"
              />
              <div className="p-5">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-stellar-gold">
                  <BookOpen className="h-3 w-3" /> {r.date ?? r.year}
                </div>
                <div className="mt-1 font-display text-lg font-semibold">{r.title}</div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{r.caption}</p>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-6">
          <Link
            to="/academic-journey"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs hover:bg-white/10"
          >
            <GraduationCap className="h-3.5 w-3.5" /> View Academic Journey
          </Link>
        </div>
      </div>
      {openId && (
        <Lightbox
          initialId={openId}
          set={records}
          onClose={() => setOpenId(null)}
          onNavigate={(id) => setOpenId(id)}
        />
      )}
    </section>
  );
}

// ---------- community ----------

function CommunitySection() {
  const records = gallery.filter((g) => g.category === "community");
  const [openId, setOpenId] = useState<string | null>(null);
  if (records.length === 0) return null;
  return (
    <section id="community" className="py-14 md:py-20 scroll-mt-24">
      <div className="container-page">
        <SectionEyebrow label="Research Community" title="Mentorship and collaboration beyond the laboratory" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {records.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setOpenId(r.id)}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <img
                src={r.src}
                alt={r.alt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3">
                <div className="text-[11px] text-foreground line-clamp-2">{r.title}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {openId && (
        <Lightbox
          initialId={openId}
          set={records}
          onClose={() => setOpenId(null)}
          onNavigate={(id) => setOpenId(id)}
        />
      )}
    </section>
  );
}

// ---------- timeline ----------

function TimelineSection() {
  const years = galleryYears;
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <section id="timeline" className="py-14 md:py-20 scroll-mt-24">
      <div className="container-page">
        <SectionEyebrow label="Chronological Timeline" title="Journey through recorded years" />
        <div className="mt-8 relative">
          <div className="absolute inset-x-0 top-8 h-px bg-grad-spectral opacity-40" />
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            {years.map((y) => {
              const items = gallery.filter((g) => g.year === y);
              return (
                <div key={y} className="relative pt-6">
                  <div className="absolute left-1/2 top-6 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_16px_oklch(0.78_0.15_210_/_0.7)]" />
                  <div className="text-center font-display text-2xl font-semibold">{y}</div>
                  <div className="mt-1 text-center text-[11px] text-muted-foreground">
                    {items.length} record{items.length === 1 ? "" : "s"}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    {items.slice(0, 6).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setOpenId(r.id)}
                        className="overflow-hidden rounded-md border border-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        aria-label={r.title}
                      >
                        <img
                          src={r.src}
                          alt=""
                          loading="lazy"
                          className="aspect-square w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatChip icon={Camera} label="Records" value={galleryStats.total} />
          <StatChip icon={Telescope} label="Facilities" value={galleryStats.facilities} />
          <StatChip icon={Presentation} label="Oral talks" value={galleryStats.oral} />
          <StatChip icon={Layers} label="Posters" value={galleryStats.poster} />
          <StatChip icon={GraduationCap} label="Milestones" value={galleryStats.milestones} />
          <StatChip icon={Users} label="Community" value={galleryStats.community} />
        </div>
      </div>
      {openId && (
        <Lightbox
          initialId={openId}
          set={gallery.filter((g) => typeof g.year === "number")}
          onClose={() => setOpenId(null)}
          onNavigate={(id) => setOpenId(id)}
        />
      )}
    </section>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="glass flex items-center gap-3 rounded-xl p-3">
      <Icon className="h-4 w-4 text-primary/80" />
      <div>
        <div className="font-display text-lg font-semibold leading-none">{value}</div>
        <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

// ---------- related ----------

const RELATED = [
  { to: "/conferences", label: "Conferences & Presentations", icon: Presentation },
  { to: "/facilities", label: "Research Facilities", icon: Telescope },
  { to: "/academic-journey", label: "Academic Journey", icon: GraduationCap },
  { to: "/publications", label: "Publications", icon: BookOpen },
  { to: "/mission-log", label: "Scientific Mission Log", icon: Newspaper },
] as const;

function RelatedSection() {
  return (
    <section id="related" className="py-14 md:py-20 scroll-mt-24">
      <div className="container-page">
        <SectionEyebrow label="Continue Exploring" title="Where this archive connects" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {RELATED.map((r) => {
            const Icon = r.icon;
            return (
              <Link
                key={r.to}
                to={r.to}
                className="glass group rounded-2xl p-5 transition-transform hover:-translate-y-0.5 hover:shadow-[0_0_28px_-12px_oklch(0.78_0.15_210_/_0.5)]"
              >
                <Icon className="h-5 w-5 text-primary/80" />
                <div className="mt-3 font-display text-sm font-semibold">{r.label}</div>
                <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  Open <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------- end ----------

function EndOfArchive() {
  return (
    <section className="py-14 md:py-20">
      <div className="container-page">
        <div className="glass-strong rounded-3xl p-8 text-center md:p-12">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-primary/90">
            <Info className="h-3 w-3" /> End of Current Archive
          </div>
          <h2 className="mt-4 font-display text-2xl font-semibold md:text-3xl">
            29 curated records — and counting
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
            A visual account of an evolving journey through physics, astrophysics, observational research,
            scientific communication and doctoral scholarship. More observations, collaborations, and discoveries
            will continue to expand this archive.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs hover:bg-white/10"
            >
              <ArrowUp className="h-3.5 w-3.5" /> Return to top
            </button>
            {RELATED.map((r) => (
              <Link
                key={r.to}
                to={r.to}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs hover:bg-white/10"
              >
                {r.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}