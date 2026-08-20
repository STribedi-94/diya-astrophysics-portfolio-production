import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Archive,
  ArrowDown,
  Download,
  BookOpen,
  Search,
  Star,
  Users,
  BookMarked,
  Presentation,
  Frame,
  Camera,
  IdCard,
  Sparkles,
  Compass,
  ShieldCheck,
  Info,
  X,
  LayoutGrid,
  List,
  Telescope,
  Radio,
  GraduationCap,
  MessagesSquare,
  Newspaper,
  Mail,
  FlaskConical,
} from "lucide-react";

import {
  archiveRecords,
  archiveStats,
  archiveTypes,
  archiveYears,
  archiveThemes,
  archiveFacilities,
  archiveAccessLevels,
  featuredRecords,
  firstAuthorRecords,
  collaborativeRecords,
  posterRecords,
  talkRecords,
  visualRecords,
  cvRecord,
  thesisRecord,
  pathways,
  formatBytes,
  heroImageCredit,
  ACCESS_LABEL,
  RECORD_TYPE_LABEL,
  type ArchiveRecord,
  type RecordType,
  type AccessStatus,
} from "@/data/downloads";
import { aboutIdentity, credentialRail } from "@/data/about";
import { ArchiveNavigator, buildSections, RelatedLink } from "@/components/downloads/ArchiveNavigator";
import { RecordCard } from "@/components/downloads/RecordCard";
import { DocumentViewer } from "@/components/downloads/DocumentViewer";
import { imageService } from "@/services/images";
import { cn } from "@/lib/utils";
import { siteUrl } from "@/data/site";

export const Route = createFileRoute("/downloads")({
  head: () => ({
    meta: [
      { title: "The Stellar Research Vault — Downloads | Diya Ram" },
      {
        name: "description",
        content:
          "Download Diya Ram's curriculum vitae, first-author and collaborative M-dwarf research papers, doctoral thesis record, conference posters and presentation material.",
      },
      { property: "og:title", content: "The Stellar Research Vault — Diya Ram" },
      {
        property: "og:description",
        content:
          "An orbital archive of peer-reviewed research, doctoral scholarship, scientific presentations and verified academic records.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl("/downloads") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/downloads") }],
  }),
  component: DownloadsPage,
});

/* ------------------------------------------------------------- utilities */

function useCountUp(target: number, run: boolean) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || target === 0) {
      setValue(target);
      return;
    }
    let frame = 0;
    const total = 40;
    const id = window.setInterval(() => {
      frame += 1;
      setValue(Math.round((target * frame) / total));
      if (frame >= total) window.clearInterval(id);
    }, 18);
    return () => window.clearInterval(id);
  }, [target, run]);
  return value;
}

function useInView<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!node) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold: 0.2 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [node]);
  return { ref: setNode, inView };
}

function Stat({ value, label, suffix }: { value: number; label: string; suffix?: string }) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const n = useCountUp(value, inView);
  return (
    <div ref={ref} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="font-display text-2xl font-semibold text-foreground md:text-3xl">
        {n}
        {suffix}
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

function SectionShell({
  id,
  eyebrow,
  title,
  intro,
  children,
  tint,
}: {
  id: string;
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
  tint?: string;
}) {
  return (
    <section id={id} className="relative scroll-mt-24 py-16 md:py-24">
      {tint && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-70"
          style={{ background: tint }}
        />
      )}
      <div className="container-page">
        <header className="mb-10 max-w-3xl">
          <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">
            {eyebrow}
          </div>
          <h2 className="font-display text-3xl font-semibold md:text-4xl">{title}</h2>
          <p className="mt-4 text-muted-foreground md:text-lg">{intro}</p>
        </header>
        {children}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- the page */

function DownloadsPage() {
  const [viewerRecord, setViewerRecord] = useState<ArchiveRecord | null>(null);

  // repository state
  const [query, setQuery] = useState("");
  const [type, setType] = useState<RecordType | "all">("all");
  const [year, setYear] = useState<number | "all">("all");
  const [theme, setTheme] = useState<string | "all">("all");
  const [facility, setFacility] = useState<string | "all">("all");
  const [access, setAccess] = useState<AccessStatus | "all">("all");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"dossiers" | "ledger">("dossiers");
  const [limit, setLimit] = useState(9);

  const sections = useMemo(
    () =>
      buildSections({
        featured: featuredRecords.length,
        firstAuthor: firstAuthorRecords.length,
        collaborative: collaborativeRecords.length,
        presentations: posterRecords.length + talkRecords.length,
        images: visualRecords.length,
        total: archiveStats.totalRecords,
      }),
    [],
  );

  // "/" focuses the repository search on desktop
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement;
      if (e.key === "/" && !typing && window.innerWidth >= 768) {
        e.preventDefault();
        document.getElementById("archive-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // deep link: #record-<id> opens the viewer
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash.startsWith("record-")) {
      const rec = archiveRecords.find((r) => r.id === hash.slice(7));
      if (rec) setViewerRecord(rec);
    }
  }, []);

  const openViewer = (r: ArchiveRecord) => {
    setViewerRecord(r);
    window.history.replaceState(null, "", `#record-${r.id}`);
  };
  const closeViewer = (open: boolean) => {
    if (!open) {
      setViewerRecord(null);
      window.history.replaceState(null, "", window.location.pathname);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = archiveRecords.filter((r) => {
      if (type !== "all" && r.type !== type) return false;
      if (year !== "all" && r.year !== year) return false;
      if (theme !== "all" && !r.themes.includes(theme)) return false;
      if (facility !== "all" && !r.facilities.some((f) => f.startsWith(facility))) return false;
      if (access !== "all" && r.access !== access) return false;
      if (!q) return true;
      const haystack = [
        r.title,
        r.summary,
        r.venue,
        r.doi,
        r.downloadName,
        r.fileKind,
        ...(r.authors ?? []),
        ...r.themes,
        ...r.facilities,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    out = [...out].sort((a, b) => {
      switch (sort) {
        case "oldest":
          return a.sortDate - b.sortDate;
        case "first-author":
          return (
            Number(b.type === "first-author") - Number(a.type === "first-author") ||
            b.sortDate - a.sortDate
          );
        case "type":
          return a.type.localeCompare(b.type) || b.sortDate - a.sortDate;
        case "alpha":
          return a.title.localeCompare(b.title);
        default:
          return b.sortDate - a.sortDate;
      }
    });
    return out;
  }, [query, type, year, theme, facility, access, sort]);

  useEffect(() => setLimit(9), [query, type, year, theme, facility, access, sort]);

  const activeFilters =
    (type !== "all" ? 1 : 0) +
    (year !== "all" ? 1 : 0) +
    (theme !== "all" ? 1 : 0) +
    (facility !== "all" ? 1 : 0) +
    (access !== "all" ? 1 : 0) +
    (query ? 1 : 0);

  const clearFilters = () => {
    setQuery("");
    setType("all");
    setYear("all");
    setTheme("all");
    setFacility("all");
    setAccess("all");
  };

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      <ArchiveNavigator sections={sections} />
      <DocumentViewer record={viewerRecord} onOpenChange={closeViewer} />

      {/* ============================================================ HERO */}
      <section className="relative isolate overflow-hidden pb-16 pt-28 md:min-h-[760px] md:pt-36">
        <img
          src={imageService.getRequiredImage("hubble-hero").imageUrl}
          alt="The Hubble Ultra Deep Field — thousands of distant galaxies across a dark region of sky."
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-55"
          fetchPriority="high"
          decoding="async"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,oklch(0.09_0.03_265/0.96)_0%,oklch(0.09_0.03_265/0.85)_42%,oklch(0.09_0.03_265/0.45)_100%)]"
        />
        <div aria-hidden className="absolute inset-0 -z-10 starfield anim-drift opacity-50" />
        <div aria-hidden className="absolute inset-0 -z-10 grid-cosmic opacity-20" />
        <div aria-hidden className="absolute inset-0 -z-10 vignette" />

        <div className="container-page relative">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.28em] text-primary/90">
                <span className="h-1.5 w-1.5 rounded-full bg-primary anim-pulse-slow" aria-hidden />
                Diya Research Archive // DRV-2026
              </div>

              <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
                The Stellar <span className="text-grad-accent">Research Vault</span>
              </h1>
              <p className="mt-4 font-display text-lg text-foreground/90 md:text-2xl">
                Research publications, thesis, presentations &amp; academic documents
              </p>
              <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
                An orbital archive of peer-reviewed research, doctoral scholarship, scientific
                presentations, observational work and verified academic records.
              </p>

              <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground">
                Archive online · Verified records · Last updated {archiveStats.lastUpdated}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => scrollTo("overview")}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-5 py-2.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <Archive className="h-4 w-4" aria-hidden /> Enter the archive
                </button>
                <Link
                  to="/publications"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm transition-colors hover:border-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <BookOpen className="h-4 w-4" aria-hidden /> Browse publications
                </Link>
                <a
                  href={cvRecord.fileUrl}
                  download={cvRecord.downloadName}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stellar-gold/40 bg-stellar-gold/10 px-5 py-2.5 text-sm transition-all hover:-translate-y-0.5 hover:bg-stellar-gold/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  aria-label={`Download curriculum vitae, PDF, ${formatBytes(cvRecord.fileSize)}`}
                >
                  <Download className="h-4 w-4" aria-hidden /> Download CV
                </a>
              </div>

              <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { v: archiveStats.totalRecords, l: "Public records" },
                  { v: archiveStats.firstAuthor, l: "First-author papers" },
                  { v: archiveStats.collaborative, l: "Collaborative papers" },
                  { v: archiveStats.posters + archiveStats.presentations, l: "Presentation records" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-xl border border-white/10 bg-black/30 p-3 backdrop-blur-sm"
                  >
                    <dt className="sr-only">{s.l}</dt>
                    <dd className="font-display text-2xl font-semibold">{s.v}</dd>
                    <dd className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
                      {s.l}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Archive emblem */}
            <div className="hidden justify-self-center lg:block" aria-hidden>
              <ArchiveEmblem />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================ ARCHIVE GATEWAY */}
      <div className="relative border-y border-white/10 bg-black/30 py-4">
        <div className="container-page flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" aria-hidden />
          <span>Identity verified</span>
          <span>Archive online</span>
          <span>Scientific records indexed</span>
          <span>Public access enabled</span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" aria-hidden />
        </div>
      </div>

      {/* ============================================= COMMAND CENTRE */}
      <SectionShell
        id="overview"
        eyebrow="Archive Command Centre"
        title="Archive overview"
        intro="A verified summary of the repository — every figure below is computed from the records held in this archive."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat value={archiveStats.totalRecords} label="Public records" />
          <Stat value={archiveStats.downloadable} label="Downloadable files" />
          <Stat value={archiveStats.categories} label="Record categories" />
          <Stat value={archiveStats.years} label="Years covered" />
          <Stat value={archiveStats.firstAuthor} label="First-author papers" />
          <Stat value={archiveStats.collaborative} label="Collaborative papers" />
          <Stat value={archiveStats.documentPages} label="Indexed document pages" />
          <Stat value={archiveStats.formats} label="File formats" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
            <h3 className="font-display text-lg font-semibold">Research themes in the archive</h3>
            <ul className="mt-3 flex flex-wrap gap-2" role="list">
              {archiveThemes.map((t) => (
                <li key={t}>
                  <button
                    type="button"
                    onClick={() => {
                      setTheme(t);
                      scrollTo("repository");
                    }}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    {t}
                  </button>
                </li>
              ))}
            </ul>
            <h3 className="mt-6 font-display text-lg font-semibold">Facilities &amp; instruments</h3>
            <ul className="mt-3 flex flex-wrap gap-2" role="list">
              {archiveFacilities.map((f) => (
                <li
                  key={f}
                  className="rounded-full border border-radio-teal/25 bg-radio-teal/5 px-3 py-1 text-xs text-muted-foreground"
                >
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-display text-lg font-semibold">Archive status</h3>
            <dl className="mt-3 space-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <div className="flex justify-between gap-3">
                <dt>Coverage</dt>
                <dd className="text-foreground">
                  {archiveStats.yearRange.min}–{archiveStats.yearRange.max}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Thesis</dt>
                <dd className="text-foreground">Metadata only</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Featured record</dt>
                <dd className="text-foreground">Curriculum vitae</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Last updated</dt>
                <dd className="text-foreground">{archiveStats.lastUpdated}</dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => {
                scrollTo("repository");
                window.setTimeout(() => document.getElementById("archive-search")?.focus(), 600);
              }}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-4 py-2 text-xs transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <Search className="h-3.5 w-3.5" aria-hidden /> Find a research record
            </button>
          </div>
        </div>
      </SectionShell>

      {/* ================================================ FEATURED RECORDS */}
      <SectionShell
        id="featured"
        eyebrow="Featured Scientific Records"
        title="Featured records"
        intro="The documents most requested by collaborators, examiners and colleagues."
        tint="radial-gradient(ellipse at 20% 0%, oklch(0.55 0.22 300 / 0.14), transparent 60%)"
      >
        <div className="grid gap-5 md:grid-cols-2">
          {featuredRecords.map((r) => (
            <RecordCard key={r.id} record={r} onPreview={openViewer} />
          ))}
        </div>
      </SectionShell>

      {/* ============================================ FIRST-AUTHOR PAPERS */}
      <SectionShell
        id="first-author"
        eyebrow="Primary Research Records"
        title="First-Author Research Constellation"
        intro="Peer-reviewed papers and proceedings led by Diya Ram. Each record links to its publication page, the facilities used and the research themes it belongs to."
        tint="radial-gradient(ellipse at 80% 10%, oklch(0.65 0.20 28 / 0.12), transparent 60%)"
      >
        <ConstellationStrip records={firstAuthorRecords} onSelect={openViewer} />
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {firstAuthorRecords.map((r) => (
            <RecordCard key={r.id} record={r} onPreview={openViewer} />
          ))}
        </div>
      </SectionShell>

      {/* ============================================ COLLABORATIVE WORK */}
      <SectionShell
        id="collaborative"
        eyebrow="Collaborative Research Network"
        title="Collaborative Research Network"
        intro="Co-authored studies carried out with collaborators across Indian and international institutions."
        tint="radial-gradient(ellipse at 15% 20%, oklch(0.70 0.13 195 / 0.12), transparent 60%)"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {collaborativeRecords.map((r) => (
            <RecordCard key={r.id} record={r} onPreview={openViewer} />
          ))}
        </div>
      </SectionShell>

      {/* ==================================================== THESIS CHAMBER */}
      <section
        id="thesis"
        className="relative scroll-mt-24 overflow-hidden py-16 md:py-24"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at 30% 20%, oklch(0.30 0.14 300 / 0.35), transparent 60%), radial-gradient(ellipse at 80% 70%, oklch(0.45 0.20 28 / 0.18), transparent 60%), linear-gradient(180deg, oklch(0.09 0.03 265), oklch(0.11 0.05 285))",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 starfield opacity-40" />
        <div className="container-page">
          <header className="mb-10 max-w-3xl">
            <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-uv-violet">
              Doctoral Scholarship
            </div>
            <h2 className="font-display text-3xl font-semibold md:text-4xl">
              Doctoral Thesis Chamber
            </h2>
            <p className="mt-4 text-muted-foreground md:text-lg">
              The doctoral work that connects every other record in this archive.
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
            <div className="relative rounded-2xl border border-uv-violet/25 bg-[oklch(0.14_0.06_290_/_0.6)] p-6 backdrop-blur-md">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-black/50">
                <div className="aspect-[3/2] bg-black">
                  <img
                    src={thesisRecord.thumbnail}
                    alt={thesisRecord.thumbnailAlt ?? thesisRecord.title}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <div className="p-5 text-center">
                  <p className="font-display text-base font-semibold leading-snug">
                    {thesisRecord.title}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">Diya Ram · 2026</p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
                    Metadata only
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                {aboutIdentity.thesisStatus} Metadata is publicly available; the full thesis is not
                distributed from this archive.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[oklch(0.16_0.05_265_/_0.5)] p-6 backdrop-blur-md">
              <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {[
                  ["Author", "Diya Ram"],
                  ["Institution", aboutIdentity.institution],
                  ["Department", aboutIdentity.department],
                  ["Supervisor", "Prof. Soumen Mondal"],
                  ["Submitted", aboutIdentity.thesisSubmitted],
                  ["Facilities", thesisRecord.facilities.join(" · ")],
                  ["Wavelength domains", thesisRecord.wavelength ?? ""],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {k}
                    </dt>
                    <dd className="mt-0.5 text-sm">{v}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {thesisRecord.summary}
              </p>

              <h3 className="mt-6 font-display text-base font-semibold">Trace the thesis universe</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2" role="list">
                {firstAuthorRecords.map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => openViewer(r)}
                      className="flex w-full items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left text-xs transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stellar-gold" aria-hidden />
                      <span className="min-w-0">{r.title}</span>
                    </button>
                  </li>
                ))}
              </ul>

              <nav aria-label="Thesis related pages" className="mt-5 flex flex-wrap gap-2">
                {thesisRecord.related.map((r) => (
                  <RelatedLink key={r.label} to={r.to} slug={r.hash} label={r.label} />
                ))}
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================= PRESENTATION OBSERVATORY */}
      <SectionShell
        id="presentations"
        eyebrow="Scientific Presentation Observatory"
        title="Posters & presentations"
        intro="Verified photographic records of posters presented and talks delivered at national and international meetings. Each image is downloadable and linked to its conference entry."
        tint="radial-gradient(ellipse at 60% 0%, oklch(0.66 0.24 340 / 0.10), transparent 60%)"
      >
        <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
          <Frame className="h-4 w-4 text-magenta" aria-hidden /> Poster hall
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {posterRecords.length} records
          </span>
        </h3>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posterRecords.map((r) => (
            <RecordCard key={r.id} record={r} onPreview={openViewer} />
          ))}
        </div>

        <h3 className="mb-4 mt-12 flex items-center gap-2 font-display text-xl font-semibold">
          <Presentation className="h-4 w-4 text-magenta" aria-hidden /> Oral presentation theatre
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {talkRecords.length} records
          </span>
        </h3>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {talkRecords.map((r) => (
            <RecordCard key={r.id} record={r} onPreview={openViewer} />
          ))}
        </div>
      </SectionShell>

      {/* ================================================= CV MISSION DOSSIER */}
      <SectionShell
        id="dossier"
        eyebrow="Professional Mission Dossier"
        title="Curriculum vitae"
        intro="The complete academic record — education, doctoral research, telescope allocations, publications, presentations, teaching and service."
        tint="radial-gradient(ellipse at 85% 15%, oklch(0.80 0.14 210 / 0.10), transparent 60%)"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
          <div className="rounded-2xl border border-white/10 bg-[oklch(0.16_0.05_265_/_0.55)] p-5 backdrop-blur-md">
            <img
              src={cvRecord.thumbnail}
              alt={cvRecord.thumbnailAlt ?? "First page of the curriculum vitae"}
              loading="lazy"
              decoding="async"
              width={760}
              height={983}
              className="w-full rounded-xl border border-white/10 object-cover object-top"
            />
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-stellar-gold/30 bg-stellar-gold/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-stellar-gold">
              <ShieldCheck className="h-3 w-3" aria-hidden /> Latest verified version
            </div>
            <dl className="mt-4 space-y-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
              <div className="flex justify-between">
                <dt>Format</dt>
                <dd className="text-foreground">
                  PDF · {formatBytes(cvRecord.fileSize)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Pages</dt>
                <dd className="text-foreground">{cvRecord.pageCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Updated</dt>
                <dd className="text-foreground">{cvRecord.date}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={cvRecord.fileUrl}
                download={cvRecord.downloadName}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-medium transition-all hover:-translate-y-0.5 hover:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label={`Download curriculum vitae, PDF, ${formatBytes(cvRecord.fileSize)}`}
              >
                <Download className="h-4 w-4" aria-hidden /> Download CV
              </a>
              <button
                type="button"
                onClick={() => openViewer(cvRecord)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm transition-colors hover:border-white/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <BookOpen className="h-4 w-4" aria-hidden /> Reading mode
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[oklch(0.16_0.05_265_/_0.45)] p-6 backdrop-blur-md">
            <h3 className="font-display text-lg font-semibold">Verified profile summary</h3>
            <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {credentialRail.map((c) => (
                <div key={c.label}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {c.label}
                  </dt>
                  <dd className="mt-0.5 text-sm">{c.value}</dd>
                </div>
              ))}
            </dl>
            <ul className="mt-5 flex flex-wrap gap-2" role="list">
              {aboutIdentity.researchTags.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-muted-foreground"
                >
                  {t}
                </li>
              ))}
            </ul>
            <nav aria-label="Curriculum vitae related pages" className="mt-6 flex flex-wrap gap-2">
              {cvRecord.related.map((r) => (
                <RelatedLink key={r.label} to={r.to} label={r.label} />
              ))}
            </nav>
          </div>
        </div>
      </SectionShell>

      {/* ============================================== ACADEMIC DOCUMENTS */}
      <SectionShell
        id="documents"
        eyebrow="Academic & Supporting Documents"
        title="Academic documents"
        intro="Supporting academic material is published here only when it is appropriate for public access. Records without a public file remain listed with their verified metadata."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary/80">
              <IdCard className="h-3.5 w-3.5" aria-hidden /> Public download
            </div>
            <h3 className="mt-2 font-display text-lg font-semibold">Curriculum vitae</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The CV consolidates education, fellowships, telescope allocations, publications,
              presentations, teaching and scientific service.
            </p>
            <a
              href={cvRecord.fileUrl}
              download={cvRecord.downloadName}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-4 py-2 text-xs transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label={`Download curriculum vitae, PDF, ${formatBytes(cvRecord.fileSize)}`}
            >
              <Download className="h-3.5 w-3.5" aria-hidden /> Download PDF ·{" "}
              {formatBytes(cvRecord.fileSize)}
            </a>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              <Info className="h-3.5 w-3.5" aria-hidden /> Metadata only
            </div>
            <h3 className="mt-2 font-display text-lg font-semibold">
              Certificates, proposals &amp; institutional records
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Conference certificates, observing proposals, examiner records and institutional
              paperwork are not distributed publicly. Verified summaries of the underlying activity
              are published on the conferences, observations and teaching pages.
            </p>
            <nav aria-label="Related academic pages" className="mt-4 flex flex-wrap gap-2">
              <RelatedLink to="/conferences" label="Conferences & presentations" />
              <RelatedLink to="/observations" label="Observing programme" />
              <RelatedLink to="/teaching" label="Teaching & mentoring" />
            </nav>
          </div>
        </div>
      </SectionShell>

      {/* ================================================== VISUAL ARCHIVE */}
      <SectionShell
        id="visual"
        eyebrow="Visual Research Archive"
        title="Selected downloadable imagery"
        intro="A curated subset of facility and milestone photographs released for download. The Scientific Gallery remains the complete source for event imagery."
      >
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visualRecords.map((r) => (
            <RecordCard key={r.id} record={r} onPreview={openViewer} />
          ))}
        </div>
        <div className="mt-6">
          <Link
            to="/gallery"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Camera className="h-4 w-4" aria-hidden /> View the full Scientific Gallery
          </Link>
        </div>
      </SectionShell>

      {/* ====================================================== REPOSITORY */}
      <SectionShell
        id="repository"
        eyebrow="Complete Research Repository"
        title="Search the archive"
        intro="Every record in the vault, searchable by title, author, journal, DOI, facility, theme, filename and format."
      >
        {/* Archive timeline */}
        <div className="mb-6 overflow-x-auto">
          <ul className="flex min-w-max items-center gap-2" role="list">
            <li>
              <button
                type="button"
                onClick={() => setYear("all")}
                aria-pressed={year === "all"}
                className={cn(
                  "min-h-9 rounded-full border px-4 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  year === "all"
                    ? "border-primary/50 bg-primary/15 text-foreground"
                    : "border-white/10 text-muted-foreground hover:border-white/25",
                )}
              >
                All years
              </button>
            </li>
            {archiveYears.map((y) => (
              <li key={y} className="flex items-center gap-2">
                <span className="h-px w-4 bg-white/15" aria-hidden />
                <button
                  type="button"
                  onClick={() => setYear(y)}
                  aria-pressed={year === y}
                  className={cn(
                    "min-h-9 rounded-full border px-4 py-1.5 font-mono text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    year === y
                      ? "border-primary/50 bg-primary/15 text-foreground"
                      : "border-white/10 text-muted-foreground hover:border-white/25",
                  )}
                >
                  {y}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Sticky search & filters */}
        <div className="sticky top-16 z-30 rounded-2xl border border-white/10 bg-[oklch(0.12_0.04_265_/_0.92)] p-4 backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                id="archive-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search titles, authors, journals, DOIs, facilities…"
                aria-label="Search the research archive"
                className="min-h-11 w-full rounded-full border border-white/10 bg-white/[0.04] pl-9 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="sort-select">
                Sort records
              </label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="min-h-11 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="first-author">First-author priority</option>
                <option value="type">Document type</option>
                <option value="alpha">Alphabetical</option>
              </select>
              <div className="flex rounded-full border border-white/10 p-0.5" role="group" aria-label="View mode">
                <button
                  type="button"
                  onClick={() => setView("dossiers")}
                  aria-pressed={view === "dossiers"}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    view === "dossiers" ? "bg-primary/20 text-foreground" : "text-muted-foreground",
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" aria-hidden /> Dossiers
                </button>
                <button
                  type="button"
                  onClick={() => setView("ledger")}
                  aria-pressed={view === "ledger"}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    view === "ledger" ? "bg-primary/20 text-foreground" : "text-muted-foreground",
                  )}
                >
                  <List className="h-3.5 w-3.5" aria-hidden /> Ledger
                </button>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <FilterSelect
              label="Type"
              value={type}
              onChange={(v) => setType(v as RecordType | "all")}
              options={[
                { value: "all", label: "All types" },
                ...archiveTypes.map((t) => ({ value: t, label: RECORD_TYPE_LABEL[t] })),
              ]}
            />
            <FilterSelect
              label="Theme"
              value={theme}
              onChange={setTheme}
              options={[
                { value: "all", label: "All themes" },
                ...archiveThemes.map((t) => ({ value: t, label: t })),
              ]}
            />
            <FilterSelect
              label="Facility"
              value={facility}
              onChange={setFacility}
              options={[
                { value: "all", label: "All facilities" },
                ...archiveFacilities.map((f) => ({ value: f, label: f })),
              ]}
            />
            <FilterSelect
              label="Access"
              value={access}
              onChange={(v) => setAccess(v as AccessStatus | "all")}
              options={[
                { value: "all", label: "All access levels" },
                ...archiveAccessLevels.map((a) => ({ value: a, label: ACCESS_LABEL[a] })),
              ]}
            />
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <X className="h-3.5 w-3.5" aria-hidden /> Clear filters ({activeFilters})
              </button>
            )}
            <p aria-live="polite" className="ml-auto font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
              {filtered.length} of {archiveStats.totalRecords} records
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="mt-6">
          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-muted-foreground">
              No records match the current filters. Try clearing a filter or searching a different
              term.
            </p>
          ) : view === "dossiers" ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filtered.slice(0, limit).map((r) => (
                <RecordCard key={r.id} record={r} onPreview={openViewer} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[720px] text-left text-sm">
                <caption className="sr-only">Archive ledger of all research records</caption>
                <thead className="bg-white/[0.04] font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3">Year</th>
                    <th scope="col" className="px-4 py-3">Type</th>
                    <th scope="col" className="px-4 py-3">Title</th>
                    <th scope="col" className="px-4 py-3">Venue</th>
                    <th scope="col" className="px-4 py-3">Format</th>
                    <th scope="col" className="px-4 py-3">Access</th>
                    <th scope="col" className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, limit).map((r) => (
                    <tr key={r.id} className="border-t border-white/10 align-top">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.year ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{RECORD_TYPE_LABEL[r.type]}</td>
                      <td className="px-4 py-3">{r.title}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.venue ?? "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {r.fileKind ? `${r.fileKind}${formatBytes(r.fileSize) ? ` · ${formatBytes(r.fileSize)}` : ""}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{ACCESS_LABEL[r.access]}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          {r.fileUrl ? (
                            <>
                              <a
                                href={r.fileUrl}
                                download={r.downloadName}
                                className="rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                                aria-label={`Download ${r.title}, ${r.fileKind}${formatBytes(r.fileSize) ? `, ${formatBytes(r.fileSize)}` : ""}`}
                              >
                                Download
                              </a>
                              <button
                                type="button"
                                onClick={() => openViewer(r)}
                                className="rounded-full border border-white/15 px-3 py-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                              >
                                Preview
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">Restricted</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > limit && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setLimit((l) => l + 9)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <ArrowDown className="h-4 w-4" aria-hidden /> Load more records (
                {filtered.length - limit} remaining)
              </button>
            </div>
          )}
        </div>

        {/* Curated pathways */}
        <div className="mt-12">
          <h3 className="font-display text-xl font-semibold">Curated research pathways</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pathways.map((p) => {
              const count = archiveRecords.filter(p.match).length;
              if (count === 0) return null;
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-primary/80">
                    <Compass className="h-3.5 w-3.5" aria-hidden /> {count} records
                  </div>
                  <h4 className="mt-2 font-display text-base font-semibold">{p.label}</h4>
                  <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        clearFilters();
                        setQuery("");
                        setTheme("all");
                        // apply the pathway by searching its dominant facility/theme
                        const first = archiveRecords.find(p.match);
                        if (p.id === "tess-ugmrt") setFacility("uGMRT");
                        else if (p.id === "m-dwarf") setTheme("M-dwarf Magnetic Activity");
                        else if (p.id === "doctoral") setType("first-author");
                        else if (p.id === "conference-to-publication") setType("poster");
                        else if (first) setType(first.type);
                        scrollTo("repository");
                      }}
                      className="inline-flex min-h-9 items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-4 py-2 text-xs transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                      Filter the archive
                    </button>
                    <RelatedLink to={p.route.to} label={p.route.label} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </SectionShell>

      {/* ============================================ CITATION & USAGE */}
      <SectionShell
        id="citation"
        eyebrow="Citation, Usage & Provenance"
        title="Citation & usage"
        intro="How to cite this work, how these documents may be used, and where the astronomical imagery comes from."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-2">
            <h3 className="font-display text-lg font-semibold">Download &amp; usage information</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground" role="list">
              <li>Documents are provided for academic and professional reference.</li>
              <li>
                Published papers may remain subject to publisher rights; the DOI and publisher links
                lead to the version of record.
              </li>
              <li>Public documents may be downloaded individually from their record.</li>
              <li>Restricted material is not publicly distributed from this archive.</li>
              <li>Image credits must be preserved wherever imagery is reused.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="font-display text-lg font-semibold">Visual credits</h3>
            <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em]">Object</dt>
                <dd>{heroImageCredit.object}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em]">Mission</dt>
                <dd>{heroImageCredit.mission}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.18em]">Credit</dt>
                <dd>{heroImageCredit.credit}</dd>
              </div>
            </dl>
            <a
              href={heroImageCredit.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              Original source (opens in a new tab)
            </a>
            <p className="mt-3 text-xs text-muted-foreground/80">
              Photographs in this archive are from Diya Ram&apos;s personal research archive. Files
              are published only where suitable for public academic use.
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ============================================ RELATED DESTINATIONS */}
      <SectionShell
        id="destinations"
        eyebrow="Continue Exploring the Universe"
        title="Related destinations"
        intro="Follow the research beyond the archive."
        tint="radial-gradient(ellipse at 50% 100%, oklch(0.55 0.22 300 / 0.14), transparent 60%)"
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {[
            { to: "/publications", label: "Publications", icon: BookOpen },
            { to: "/research", label: "Research", icon: FlaskConical },
            { to: "/observations", label: "Observations", icon: Telescope },
            { to: "/conferences", label: "Conferences & Presentations", icon: MessagesSquare },
            { to: "/gallery", label: "Scientific Gallery", icon: Camera },
            { to: "/academic-journey", label: "Academic Journey", icon: GraduationCap },
            { to: "/teaching", label: "Teaching & Mentoring", icon: Users },
            { to: "/mission-log", label: "Scientific Mission Log", icon: Newspaper },
            { to: "/contact", label: "Contact", icon: Mail },
          ].map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className="group flex min-h-11 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <Icon className="h-4 w-4 text-primary" aria-hidden />
                <span className="text-sm">{label}</span>
                <Sparkles
                  className="ml-auto h-3.5 w-3.5 text-muted-foreground/50 transition-colors group-hover:text-primary"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </SectionShell>
    </>
  );
}

/* --------------------------------------------------------- sub-components */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const id = `filter-${label.toLowerCase()}`;
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="sr-only">
        Filter by {label.toLowerCase()}
      </label>
      <select
        id={id}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-9 max-w-[13rem] rounded-full border border-white/10 bg-white/[0.04] px-3 text-xs text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Verified relationships only: nodes share the M-dwarf research programme and
 *  are ordered chronologically. Clicking a node opens that paper. */
function ConstellationStrip({
  records,
  onSelect,
}: {
  records: ArchiveRecord[];
  onSelect: (r: ArchiveRecord) => void;
}) {
  const ordered = [...records].sort((a, b) => a.sortDate - b.sortDate);
  return (
    <div className="hidden overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-6 lg:block">
      <div className="relative flex items-center justify-between gap-4">
        <div
          className="absolute inset-x-6 top-1/2 h-px bg-gradient-to-r from-transparent via-stellar-gold/40 to-transparent"
          aria-hidden
        />
        {ordered.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelect(r)}
            className="relative z-10 flex w-40 flex-col items-center gap-2 rounded-xl p-2 text-center transition-transform hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            aria-label={`Open ${r.title}`}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-stellar-gold/40 bg-stellar-gold/10">
              <Star className="h-4 w-4 text-stellar-gold" aria-hidden />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {r.year}
            </span>
            <span className="line-clamp-2 text-xs text-muted-foreground">
              {r.facilities.slice(0, 2).join(" · ")}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ArchiveEmblem() {
  const labels = ["Publications", "Thesis", "Presentations", "Posters", "CV", "Media", "Records"];
  return (
    <div className="relative h-72 w-72">
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,oklch(0.80_0.14_210/0.18),transparent_65%)]" />
      <svg viewBox="0 0 300 300" className="absolute inset-0 h-full w-full">
        <g className="anim-spin-slow" style={{ transformOrigin: "150px 150px" }}>
          <circle cx="150" cy="150" r="128" fill="none" stroke="oklch(0.80 0.14 210 / 0.35)" strokeWidth="1" strokeDasharray="4 10" />
          <circle cx="150" cy="150" r="112" fill="none" stroke="oklch(0.55 0.22 300 / 0.3)" strokeWidth="1" />
        </g>
        <circle cx="150" cy="150" r="84" fill="none" stroke="oklch(0.96 0.01 250 / 0.12)" strokeWidth="1" />
        <circle cx="150" cy="150" r="56" fill="none" stroke="oklch(0.82 0.16 88 / 0.35)" strokeWidth="1" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={(150 + Math.cos(a) * 56).toFixed(2)}
              y1={(150 + Math.sin(a) * 56).toFixed(2)}
              x2={(150 + Math.cos(a) * 84).toFixed(2)}
              y2={(150 + Math.sin(a) * 84).toFixed(2)}
              stroke="oklch(0.96 0.01 250 / 0.15)"
              strokeWidth="1"
            />
          );
        })}
        <circle cx="150" cy="150" r="26" fill="oklch(0.80 0.14 210 / 0.15)" stroke="oklch(0.80 0.14 210 / 0.6)" />
        {labels.map((l, i) => {
          const a = (i / labels.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <text
              key={l}
              x={(150 + Math.cos(a) * 108).toFixed(2)}
              y={(150 + Math.sin(a) * 108).toFixed(2)}
              textAnchor="middle"
              className="fill-[oklch(0.74_0.03_250)] font-mono"
              fontSize="7.5"
              letterSpacing="1.4"
            >
              {l.toUpperCase()}
            </text>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Radio className="h-6 w-6 text-primary" aria-hidden />
      </div>
    </div>
  );
}
