import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";
import { MissionSync } from "@/components/chronicle/MissionSync";
import { ChronicleNavigator, type NavSection } from "@/components/chronicle/ChronicleNavigator";
import { ChronicleConstellation } from "@/components/chronicle/ChronicleConstellation";
import { ChronicleCard, StatusBadge, SourceTag, RelatedLinks } from "@/components/chronicle/ChronicleCard";
import {
  chronicleRecords,
  chronicleStats,
  chronicleCategories,
  chronicleStatuses,
  chronicleYears,
  datedRecords,
  featuredRecord,
  latestTransmissions,
  upcomingRecords,
  missionStatus,
  missionStatusGroups,
  researchPulse,
  pulseSummary,

  signalToDiscovery,
  impactMetrics,
  yearSummaries,
  careerPhases,
  phaseForYear,
  type ChronicleRecord,
} from "@/data/chronicle";
import { cn } from "@/lib/utils";
import { Search, Radio, Rows3, LayoutGrid, GitBranch } from "lucide-react";

const TITLE = "Research Chronicle — A Living Scientific Mission Log | Diya Ram";
const DESCRIPTION =
  "A continuously growing scientific chronicle of Diya Ram's verified research: publications, observing programmes, conference presentations, thesis milestones, teaching, peer review and upcoming missions.";
const URL = "https://astro-diya-portfolio.lovable.app/news";

const SECTIONS: NavSection[] = [
  { id: "mission-status", label: "Mission status" },
  { id: "featured", label: "Featured transmission" },
  { id: "pulse", label: "Research pulse" },
  { id: "timeline", label: "Mission timeline" },
  { id: "constellation", label: "Chronicle constellation" },
  { id: "signal", label: "Signal to discovery" },
  { id: "impact", label: "Research impact" },
  { id: "upcoming", label: "Upcoming missions" },
  { id: "archive", label: "Full archive" },
];

export const Route = createFileRoute("/mission-log/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Research Chronicle — A Living Scientific Mission Log",
          description: DESCRIPTION,
          url: URL,
          about: "Observational astrophysics of M-dwarf magnetic activity",
          author: { "@type": "Person", name: "Diya Ram" },
        }),
      },
    ],
  }),
  component: ChroniclePage,
});

type ViewMode = "story" | "timeline" | "archive";

/** Groups upcoming records into the three publicly meaningful commitment tiers. */
function upcomingTier(r: ChronicleRecord): "Confirmed" | "In Progress" | "Long-Term Vision" {
  if (r.status === "Long-Term Vision") return "Long-Term Vision";
  if (r.status === "In Progress") return "In Progress";
  return "Confirmed";
}


function ChroniclePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [year, setYear] = useState<string>("All");
  const [status, setStatus] = useState<string>("All");
  const [view, setView] = useState<ViewMode>("story");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chronicleRecords.filter((r) => {
      if (category !== "All" && r.category !== category) return false;
      if (status !== "All" && r.status !== status) return false;
      if (year !== "All" && String(r.year ?? "") !== year) return false;
      if (!q) return true;
      return [
        r.title,
        r.summary,
        r.institution,
        r.location,
        ...(r.tags ?? []),
        ...(r.facility ?? []),
        ...(r.researchTheme ?? []),
        ...(r.collaborators ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, category, year, status]);

  const timelineRecords = filtered.filter((r) => !r.undated);
  const reset = () => {
    setQuery("");
    setCategory("All");
    setYear("All");
    setStatus("All");
  };

  return (
    <>
      <MissionSync recordCount={chronicleStats.totalRecords} />
      <ChronicleNavigator sections={SECTIONS} />

      <PageHero
        eyebrow="Research Chronicle"
        title={
          <>
            A living <span className="text-grad-accent">scientific mission log</span>
          </>
        }
        intro="Every verified step of Diya Ram's research programme — publications, observing campaigns, conference presentations, doctoral milestones, teaching, academic service and the missions still ahead. This chronicle grows as the science does."
      >
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Verified records", v: chronicleStats.totalRecords },
            { k: "Years documented", v: `${chronicleStats.earliestYear}–${chronicleStats.latestYear}` },
            { k: "Publications", v: chronicleStats.totalPublications },
            { k: "Presentation records", v: chronicleStats.presentations },
          ].map((s) => (
            <div key={s.k} className="glass rounded-xl px-4 py-3">
              <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.k}</dt>
              <dd className="mt-1 font-display text-xl font-semibold">{s.v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Last log entry · {chronicleStats.latestDate}
        </p>
      </PageHero>

      {/* ------------------------------------------- current mission status */}
      <Section
        id="mission-status"
        eyebrow="Mission control"
        title="Current mission status"
        intro="Where the research programme stands right now, grouped by activity and drawn from verified institutional and publication records."
      >
        <div className="space-y-8">
          {missionStatusGroups.map((group) => {
            const modules = missionStatus.filter((m) => m.group === group);
            if (modules.length === 0) return null;
            return (
              <div key={group}>
                <div className="mb-3 flex items-center gap-3">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary/80">
                    {group}
                  </h3>
                  <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" aria-hidden />
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {String(modules.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {modules.map((m) => (
                    <div
                      key={m.id}
                      className="glass flex flex-col rounded-2xl p-5 transition-colors duration-300 hover:bg-white/[0.06]"
                    >
                      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                        <span className="min-w-0 text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          {m.label}
                        </span>
                        <StatusBadge status={m.status} />
                      </div>
                      <h4 className="mt-3 font-display text-base font-semibold leading-snug">{m.title}</h4>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {m.description}
                      </p>
                      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {m.date}
                      </p>
                      <div className="mt-3">
                        <RelatedLinks links={[m.link]} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* -------------------------------------------- featured transmission */}
      <Section
        id="featured"
        eyebrow="Featured transmission"
        title="The most recent major development"
        intro="One record is highlighted at a time — the latest significant, verified step in the programme."
      >
        <div className="relative">
          <span
            className="pointer-events-none absolute inset-x-0 -inset-y-8 -z-10 sm:-inset-x-6 rounded-[2rem] opacity-50 blur-3xl"
            style={{ background: "radial-gradient(closest-side, var(--nebula), transparent 75%)" }}
            aria-hidden
          />
          <div className="glow-ring rounded-[1.15rem]">
            <ChronicleCard record={featuredRecord} variant="feature" />
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary/80">
              Also transmitting
            </h3>
            <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" aria-hidden />
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {latestTransmissions.map((r) => (
              <ChronicleCard key={r.id} record={r} />
            ))}
          </div>
        </div>
      </Section>

      {/* --------------------------------------------------- research pulse */}
      <Section
        id="pulse"
        eyebrow="Research pulse"
        title="Live activity readout"
        intro="What the programme has actually been doing lately — rolling activity counters followed by the most recent verified signals."
      >
        <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {pulseSummary.map((s) => (
            <div key={s.label} className="glass rounded-2xl px-4 py-4">
              <dt className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{s.label}</dt>
              <dd className="mt-1 font-display text-2xl font-semibold">{s.value}</dd>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary/70">
                {s.note}
              </p>
            </div>
          ))}
        </dl>

        <div className="glass overflow-hidden rounded-2xl">
          <ul className="divide-y divide-white/5">
            {researchPulse.map((p) => (
              <li key={p.id}>
                <Link
                  to="/news/$slug"
                  params={{ slug: p.slug }}
                  className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-1 px-5 py-3.5 text-sm transition-colors hover:bg-white/5 md:grid-cols-[auto_11rem_minmax(0,1fr)_auto] md:items-center"
                >
                  <Radio className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary anim-pulse-slow md:mt-0" aria-hidden />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/80">
                    {p.label}
                  </span>
                  <span className="col-span-2 text-foreground md:col-span-1">{p.title}</span>
                  <span className="col-start-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground md:col-start-auto md:text-right">
                    {p.date}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>


      {/* ---------------------------------------------- filters + view mode */}
      <Section
        id="timeline"
        eyebrow="Mission timeline"
        title="The chronological record"
        intro="Filter the chronicle by category, year or status, and read it as a story feed, a vertical mission timeline, or a dense archive index."
      >
        <div className="sticky top-16 z-30 mb-8">
          <div className="glass-strong rounded-2xl p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <label className="relative flex-1">
                <span className="sr-only">Search the chronicle</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search records, facilities, collaborators, themes…"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/50"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <FilterSelect label="Category" value={category} onChange={setCategory} options={chronicleCategories} />
                <FilterSelect label="Year" value={year} onChange={setYear} options={chronicleYears.map(String)} />
                <FilterSelect label="Status" value={status} onChange={setStatus} options={chronicleStatuses} />
              </div>
              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                {(
                  [
                    ["story", "Story", LayoutGrid],
                    ["timeline", "Timeline", GitBranch],
                    ["archive", "Archive", Rows3],
                  ] as const
                ).map(([mode, label, Icon]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setView(mode)}
                    aria-pressed={view === mode}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs",
                      view === mode ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:bg-white/5",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground" aria-live="polite">
              {filtered.length} of {chronicleRecords.length} records shown
              {filtered.length !== chronicleRecords.length && (
                <button type="button" onClick={reset} className="ml-2 text-primary underline-offset-4 hover:underline">
                  Reset filters
                </button>
              )}
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <GlassPanel>
            No records match this combination. Try a broader search — the chronicle only lists verified entries.
          </GlassPanel>
        ) : view === "story" ? (
          <StoryFeed records={filtered} />
        ) : view === "timeline" ? (
          <MissionTimeline records={timelineRecords} />
        ) : (
          <ArchiveLedger records={filtered} />
        )}
      </Section>

      {/* -------------------------------------------------- constellation --- */}
      <Section
        id="constellation"
        eyebrow="Chronicle constellation"
        title="How the work connects"
        intro="Observing programmes lead to papers; papers become talks and thesis chapters. Only verified relationships are drawn."
      >
        <ChronicleConstellation />
      </Section>

      {/* ----------------------------------------------- signal to discovery */}
      <Section
        id="signal"
        eyebrow="From signal to discovery"
        title="How a research result is made"
        intro="Each entry in this chronicle sits somewhere along this path."
      >
        <ol className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {signalToDiscovery.map((s, i) => (
            <li key={s.id} className="glass rounded-2xl p-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">
                Stage {i + 1}
              </span>
              <h3 className="mt-2 font-display text-lg font-semibold">{s.stage}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-4">
                <RelatedLinks links={[s.link]} />
              </div>
            </li>
          ))}
        </ol>
      </Section>

      {/* -------------------------------------------------- research impact */}
      <Section
        id="impact"
        eyebrow="Research impact"
        title="Verified activity snapshot"
        intro="Counts of documented scientific output. No citation counts, rankings or invented metrics are shown."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="glass rounded-2xl p-6">
            <ul className="space-y-4">
              {impactMetrics.map((m) => (
                <li key={m.label}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-muted-foreground">{m.label}</span>
                    <span className="font-display text-lg font-semibold">{m.value}</span>
                  </div>
                  <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-1 rounded-full bg-primary/70"
                      style={{ width: `${Math.min(100, (m.value / m.max) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold">Year by year</h3>
            <ul className="mt-4 space-y-3">
              {yearSummaries.map((y) => (
                <li key={y.year} className="flex items-start gap-4 border-b border-white/5 pb-3 last:border-0">
                  <span className="font-mono text-sm text-primary">{y.year}</span>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{y.headline}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {y.publications} publication{y.publications === 1 ? "" : "s"} · {y.presentations} presentation
                      {y.presentations === 1 ? "" : "s"} · {y.milestones} milestone{y.milestones === 1 ? "" : "s"}
                      {phaseForYear(y.year) ? ` · ${phaseForYear(y.year)!.label}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ------------------------------------------------ upcoming missions */}
      <Section
        id="upcoming"
        eyebrow="Upcoming missions"
        title="What comes next"
        intro="Confirmed next steps and long-term scientific directions, clearly labelled. Nothing here is presented as a completed result."
      >
        <div className="space-y-8">
          {(["Confirmed", "In Progress", "Long-Term Vision"] as const).map((tier) => {
            const records = upcomingRecords.filter((r) => upcomingTier(r) === tier);
            if (records.length === 0) return null;
            return (
              <div key={tier}>
                <div className="mb-3 flex items-center gap-3">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary/80">{tier}</h3>
                  <span className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" aria-hidden />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {records.map((r) => (
                    <div
                      key={r.id}
                      className="glass flex flex-col rounded-2xl p-5 transition-colors duration-300 hover:bg-white/[0.06]"
                    >
                      <StatusBadge status={r.status} />
                      <h4 className="mt-3 font-display text-lg font-semibold leading-snug">
                        <Link to="/news/$slug" params={{ slug: r.slug }} className="hover:text-primary">
                          {r.title}
                        </Link>
                      </h4>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{r.summary}</p>
                      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {r.dateLabel}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </Section>

      {/* ----------------------------------------------------- full archive */}
      <Section
        id="archive"
        eyebrow="Chronicle archive"
        title="Every record, permanently indexed"
        intro="The complete mission log, grouped by career phase. Each entry has its own permanent page with sources and related links."
      >
        <div className="space-y-8">
          {careerPhases
            .slice()
            .reverse()
            .map((phase) => {
              const records = datedRecords.filter(
                (r) => (r.year ?? 0) >= phase.from && (r.year ?? 0) <= phase.to,
              );
              if (records.length === 0) return null;
              return (
                <div key={phase.id}>
                  <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-display text-xl font-semibold">{phase.label}</h3>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary/80">
                      {phase.from}–{phase.to}
                    </span>
                  </div>
                  <p className="mb-4 max-w-3xl text-sm text-muted-foreground">{phase.note}</p>
                  <ul className="glass divide-y divide-white/5 overflow-hidden rounded-2xl">
                    {records.map((r) => (
                      <li key={r.id}>
                        <Link
                          to="/news/$slug"
                          params={{ slug: r.slug }}
                          className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-white/5"
                        >
                          <span className="w-40 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                            {r.dateLabel}
                          </span>
                          <span className="flex-1 text-sm text-foreground">{r.title}</span>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-primary/80">
                            {r.category}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
        </div>

        <div className="mt-8">
          <GlassPanel>
            <p className="text-sm text-muted-foreground">
              This chronicle is maintained as a permanent scientific record. New publications, observing campaigns,
              presentations and milestones are appended as they are verified — nothing is removed.
            </p>
            <div className="mt-4">
              <RelatedLinks
                links={[
                  { to: "/publications", label: "Publications" },
                  { to: "/conferences", label: "Conferences" },
                  { to: "/observations", label: "Observing programme" },
                  { to: "/downloads", label: "Research Vault" },
                  { to: "/contact", label: "Contact" },
                ]}
              />
            </div>
          </GlassPanel>
        </div>
      </Section>
    </>
  );
}

/* --------------------------------------------------------------- pieces */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs text-foreground outline-none"
      >
        <option value="All" className="bg-background">
          All
        </option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-background">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function StoryFeed({ records }: { records: ChronicleRecord[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {records.map((r) => (
        <ChronicleCard key={r.id} record={r} />
      ))}
    </div>
  );
}

function MissionTimeline({ records }: { records: ChronicleRecord[] }) {
  let lastYear: number | undefined;
  return (
    <div className="relative border-l border-white/10 pl-6 md:pl-10">
      {records.map((r) => {
        const showYear = r.year !== lastYear;
        lastYear = r.year;
        const phase = r.year ? phaseForYear(r.year) : undefined;
        return (
          <div key={r.id}>
            {showYear && (
              <div className="relative mb-4 mt-8 first:mt-0">
                <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border border-primary/60 bg-background md:-left-[47px]" />
                <h3 className="font-display text-2xl font-semibold">{r.year}</h3>
                {phase && (
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary/80">{phase.label}</p>
                )}
              </div>
            )}
            <div className="relative mb-4">
              <span className="absolute -left-[27px] top-6 h-1.5 w-1.5 rounded-full bg-primary/70 md:-left-[43px]" />
              <ChronicleCard record={r} variant="compact" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ArchiveLedger({ records }: { records: ChronicleRecord[] }) {
  return (
    <div className="glass overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[720px] text-left text-sm">
        <caption className="sr-only">Complete chronicle archive of verified research records</caption>
        <thead>
          <tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <th scope="col" className="px-5 py-3 font-normal">Date</th>
            <th scope="col" className="px-5 py-3 font-normal">Record</th>
            <th scope="col" className="px-5 py-3 font-normal">Category</th>
            <th scope="col" className="px-5 py-3 font-normal">Status</th>
            <th scope="col" className="px-5 py-3 font-normal">Source</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {records.map((r) => (
            <tr key={r.id} className="hover:bg-white/5">
              <td className="px-5 py-3 font-mono text-[11px] text-muted-foreground">{r.dateLabel}</td>
              <td className="px-5 py-3">
                <Link to="/news/$slug" params={{ slug: r.slug }} className="text-foreground hover:text-primary">
                  {r.title}
                </Link>
              </td>
              <td className="px-5 py-3 text-[11px] text-primary/80">{r.category}</td>
              <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
              <td className="px-5 py-3"><SourceTag label={r.sourceLabel} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
