import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHero, Section } from "@/components/layout/Page";
import { ResearchNavigator, ChapterFooterNav } from "@/components/research/ResearchNavigator";
import { projects, type ProjectSummary, type ProjectStatus } from "@/data/misc";
import { facilities } from "@/data/facilities";
import { researchAreas } from "@/data/research";
import { publicationsArchive } from "@/data/publications-archive";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Radio,
  Sparkles,
  Waves,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Research Projects — Diya Ram" },
      {
        name: "description",
        content:
          "Mission control for Diya Ram's active, completed and forthcoming observational astrophysics projects.",
      },
      { property: "og:title", content: "Research Projects — Diya Ram" },
      {
        property: "og:description",
        content:
          "Structured project dossiers with scientific objective, target, wavelength, methodology and publications.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://astro-diya-portfolio.lovable.app/projects" }],
  }),
  component: ResearchProjectsPage,
});

const STATUS_ORDER: ProjectStatus[] = ["Ongoing", "Accepted", "Published", "In preparation"];
const WAVELENGTHS = ["All", "Radio", "Optical", "Optical / NIR", "Multi-wavelength"] as const;
type Wavelength = (typeof WAVELENGTHS)[number];

const sections = [
  { id: "mission-brief", label: "Mission Brief" },
  { id: "filters", label: "Filters" },
  { id: "dossiers", label: "Project Dossiers" },
  { id: "flow", label: "Investigation Flow" },
];

function ResearchProjectsPage() {
  const [status, setStatus] = useState<"All" | ProjectStatus>("All");
  const [wavelength, setWavelength] = useState<Wavelength>("All");
  const [area, setArea] = useState<string>("All");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (status !== "All" && p.status !== status) return false;
      if (wavelength !== "All" && p.wavelength !== wavelength) return false;
      if (area !== "All" && !p.areas.includes(area)) return false;
      return true;
    });
  }, [status, wavelength, area]);

  const groups = STATUS_ORDER.map((s) => ({
    status: s,
    items: filtered.filter((p) => p.status === s),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <ResearchNavigator chapterIndex={2} sections={sections} />

      {/* Mission-control hero (grid & readouts, not a cosmic scene) */}
      <section id="mission-brief" className="relative overflow-hidden pt-32 pb-12 md:pt-40">
        <div className="absolute inset-0 grid-cosmic opacity-40" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, oklch(0.14 0.04 265 / 0.6), oklch(0.09 0.03 265 / 0.9))",
          }}
          aria-hidden
        />
        <div className="container-page relative">
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary anim-pulse-slow" />
                Chapter 03 · Mission Control
              </div>
              <h1 className="max-w-3xl font-display text-4xl font-semibold leading-tight md:text-6xl">
                Structured <span className="text-grad-accent">observational investigations</span>
              </h1>
              <p className="mt-5 max-w-2xl text-muted-foreground md:text-lg">
                Each dossier records one scientific investigation — its question, target star, wavelength
                coverage, telescope facility, methodology and, where applicable, the publication in which
                the result was reported.
              </p>
            </div>
            <ReadoutPanel />
          </div>
        </div>
      </section>

      {/* Filters */}
      <section id="filters" className="pb-6 scroll-mt-24">
        <div className="container-page">
          <div className="glass rounded-2xl border border-white/10 p-4">
            <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-primary/80">
              <Filter className="h-3.5 w-3.5" /> Mission filters
              <button
                type="button"
                onClick={() => {
                  setStatus("All");
                  setWavelength("All");
                  setArea("All");
                }}
                className="ml-auto rounded-full border border-white/10 px-2 py-0.5 text-[10px] normal-case tracking-normal text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <FilterGroup
                label="Status"
                value={status}
                onChange={(v) => setStatus(v as typeof status)}
                options={["All", ...STATUS_ORDER]}
              />
              <FilterGroup
                label="Wavelength"
                value={wavelength}
                onChange={(v) => setWavelength(v as Wavelength)}
                options={[...WAVELENGTHS]}
              />
              <FilterGroup
                label="Research area"
                value={area}
                onChange={setArea}
                options={["All", ...researchAreas.map((a) => a.slug)]}
                labelFor={(v) =>
                  v === "All" ? "All" : researchAreas.find((a) => a.slug === v)?.shortTitle ?? v
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dossiers */}
      <Section id="dossiers" className="!pt-8">
        {groups.length === 0 && (
          <p className="glass rounded-2xl border border-white/10 p-6 text-sm text-muted-foreground">
            No projects match the current filters. Reset to view the full mission list.
          </p>
        )}
        <div className="space-y-10">
          {groups.map((g) => (
            <div key={g.status}>
              <div className="mb-3 flex items-center gap-3">
                <StatusChip status={g.status} />
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-xs text-muted-foreground">{g.items.length}</span>
              </div>
              <div className="space-y-3">
                {g.items.map((p) => (
                  <ProjectDossier key={p.id} project={p} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Investigation flow */}
      <Section id="flow" eyebrow="Investigation flow" title="From question to publication">
        <div className="grid gap-3 md:grid-cols-5">
          {["Scientific question", "Observation / dataset", "Analysis", "Result", "Publication"].map(
            (step, i) => (
              <div key={step} className="glass rounded-2xl border border-white/10 p-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-primary/70">
                  Step {i + 1}
                </div>
                <div className="mt-1 text-sm font-semibold text-foreground">{step}</div>
                {i === 4 && (
                  <Link to="/publications" className="mt-2 inline-flex items-center gap-1 text-xs text-primary">
                    View publications <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            ),
          )}
        </div>
      </Section>

      <ChapterFooterNav chapterIndex={2} />
    </>
  );
}

function ReadoutPanel() {
  const counts = {
    total: projects.length,
    published: projects.filter((p) => p.status === "Published").length,
    accepted: projects.filter((p) => p.status === "Accepted").length,
    ongoing: projects.filter((p) => p.status === "Ongoing").length,
  };
  return (
    <div className="glass grid grid-cols-2 gap-3 rounded-2xl border border-white/10 p-4">
      {[
        ["Total missions", counts.total],
        ["Published", counts.published],
        ["Accepted", counts.accepted],
        ["Ongoing", counts.ongoing],
      ].map(([k, v]) => (
        <div key={k as string} className="rounded-xl border border-white/5 bg-black/20 p-3">
          <div className="text-[10px] uppercase tracking-[0.24em] text-primary/70">{k}</div>
          <div className="mt-1 font-display text-2xl font-semibold text-foreground">{v}</div>
        </div>
      ))}
    </div>
  );
}

function FilterGroup({
  label,
  value,
  onChange,
  options,
  labelFor,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  labelFor?: (v: string) => string;
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
        {label}
      </legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = o === value;
          return (
            <button
              key={o}
              type="button"
              onClick={() => onChange(o)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                active
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={active}
            >
              {labelFor ? labelFor(o) : o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function StatusChip({ status }: { status: ProjectStatus }) {
  const cls = {
    Published: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
    Accepted: "border-sky-400/40 bg-sky-400/10 text-sky-200",
    Ongoing: "border-amber-400/40 bg-amber-400/10 text-amber-200",
    "In preparation": "border-violet-400/40 bg-violet-400/10 text-violet-200",
  }[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.24em]",
        cls,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {status}
    </span>
  );
}

function WavelengthIcon({ w }: { w: string }) {
  if (w === "Radio") return <Radio className="h-3.5 w-3.5" aria-hidden />;
  if (w.includes("NIR") || w === "Multi-wavelength") return <Waves className="h-3.5 w-3.5" aria-hidden />;
  return <Sparkles className="h-3.5 w-3.5" aria-hidden />;
}

function ProjectDossier({ project }: { project: ProjectSummary }) {
  const [open, setOpen] = useState(false);
  const facs = facilities.filter((f) => project.facilities.includes(f.slug));
  const pubs = publicationsArchive.filter((p) => project.publications.includes(p.slug));
  const areas = researchAreas.filter((a) => project.areas.includes(a.slug));

  return (
    <article className="glass rounded-2xl border border-white/10 bg-black/20">
      <div className="grid gap-3 p-5 md:grid-cols-[auto_1fr_auto] md:items-start md:gap-6">
        <div className="hidden md:flex md:h-12 md:w-12 md:items-center md:justify-center md:rounded-xl md:border md:border-white/10 md:bg-white/5">
          <WavelengthIcon w={project.wavelength} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.24em]">
            <StatusChip status={project.status} />
            <span className="text-muted-foreground">{project.theme}</span>
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold text-foreground">{project.title}</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">{project.question}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>
              <span className="text-primary/70">Target:</span> {project.target}
            </span>
            <span>
              <span className="text-primary/70">Wavelength:</span> {project.wavelength}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-primary/70">Facilities:</span>
              {facs.map((f, i) => (
                <span key={f.id}>
                  <Link
                    to="/facilities/$slug"
                    params={{ slug: f.slug }}
                    className="text-foreground hover:text-primary"
                  >
                    {f.abbreviation}
                  </Link>
                  {i < facs.length - 1 ? " · " : ""}
                </span>
              ))}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="glass inline-flex items-center gap-1.5 self-start rounded-full border border-white/10 px-3 py-1.5 text-xs text-primary hover:bg-white/5"
          aria-expanded={open}
        >
          {open ? "Collapse" : "Open dossier"}
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {open && (
        <div className="grid gap-6 border-t border-white/10 p-5 md:grid-cols-2">
          <div className="space-y-4">
            <DossierBlock label="Motivation">{project.motivation}</DossierBlock>
            <DossierBlock label="Methodology">
              <ul className="mt-1 space-y-1.5">
                {project.methodology.map((m) => (
                  <li key={m} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/70" />
                    {m}
                  </li>
                ))}
              </ul>
            </DossierBlock>
            <DossierBlock label="Outcome">{project.outcome}</DossierBlock>
          </div>
          <div className="space-y-4">
            {areas.length > 0 && (
              <DossierBlock label="Related research areas">
                <div className="flex flex-wrap gap-1.5">
                  {areas.map((a) => (
                    <Link
                      key={a.id}
                      to="/research/$slug"
                      params={{ slug: a.slug }}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {a.shortTitle}
                    </Link>
                  ))}
                </div>
              </DossierBlock>
            )}
            {facs.length > 0 && (
              <DossierBlock label="Facilities used">
                <ul className="space-y-1.5">
                  {facs.map((f) => (
                    <li key={f.id}>
                      <Link
                        to="/facilities/$slug"
                        params={{ slug: f.slug }}
                        className="flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <span>{f.abbreviation} — {f.fullName}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-primary/60" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </DossierBlock>
            )}
            {pubs.length > 0 && (
              <DossierBlock label="Publication">
                <ul className="space-y-1.5">
                  {pubs.map((p) => (
                    <li key={p.id}>
                      <Link
                        to="/publications"
                        hash={`pub-${p.id}`}
                        className="flex items-start gap-2 text-sm text-primary hover:text-foreground"
                      >
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-2">{p.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </DossierBlock>
            )}
            <Link
              to="/projects/$slug"
              params={{ slug: project.slug }}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-foreground"
            >
              Full project page <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}

function DossierBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">{label}</div>
      <div className="mt-1 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
