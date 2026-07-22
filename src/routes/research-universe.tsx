import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/Page";
import { ResearchUniverseMap } from "@/components/visuals/ResearchUniverseMap";
import { ResearchNavigator, ChapterFooterNav } from "@/components/research/ResearchNavigator";
import { researchAreas } from "@/data/research";
import { projects } from "@/data/misc";
import { facilities } from "@/data/facilities";
import { publicationsArchive } from "@/data/publications-archive";
import { ArrowRight, Layers, Rocket, Telescope, BookOpen, Waves, Radio, Sparkles } from "lucide-react";

const sections = [
  { id: "gateway", label: "Gateway" },
  { id: "constellation", label: "Research Constellation" },
  { id: "ecosystem", label: "Ecosystem Overview" },
  { id: "expedition", label: "Continue the Expedition" },
];

export const Route = createFileRoute("/research-universe")({
  head: () => ({
    meta: [
      { title: "Research Universe — Diya Ram" },
      {
        name: "description",
        content:
          "The scientific cosmos of Diya Ram's observational astrophysics — an interactive map of research areas, projects, facilities and publications.",
      },
      { property: "og:title", content: "Research Universe — Diya Ram" },
      {
        property: "og:description",
        content:
          "An interactive constellation of research themes connecting M-dwarf magnetic activity, flares, spectroscopy and radio astronomy.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://astro-diya-portfolio.lovable.app/research-universe" }],
  }),
  component: ResearchUniversePage,
});

function ResearchUniversePage() {
  const wavelengthDomains = [
    { label: "Radio", icon: Radio, note: "uGMRT metre wavelengths" },
    { label: "Optical", icon: Sparkles, note: "TESS / HCT / DOT photometry" },
    { label: "Near-Infrared", icon: Waves, note: "HCT / DOT spectroscopy" },
  ];

  return (
    <>
      <ResearchNavigator chapterIndex={0} sections={sections} />

      <div id="gateway">
        <PageHero
          eyebrow="Chapter 01 · Research Universe"
          title={
            <>
              A scientific cosmos of{" "}
              <span className="text-grad-accent">low-mass stellar magnetism</span>
            </>
          }
          intro="Every research direction traces back to one central question: how do magnetic processes shape M-dwarf stars — and the planets that orbit them?"
        >
          <div className="flex flex-wrap gap-3">
            <Link
              to="/research"
              className="glass inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary hover:bg-primary/20"
            >
              <Layers className="h-4 w-4" /> Explore Research Areas
            </Link>
            <Link
              to="/projects"
              className="glass inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10"
            >
              <Rocket className="h-4 w-4" /> View Research Projects
            </Link>
            <Link
              to="/facilities"
              className="glass inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10"
            >
              <Telescope className="h-4 w-4" /> Discover Facilities
            </Link>
            <Link
              to="/publications"
              className="glass inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-foreground hover:bg-white/10"
            >
              <BookOpen className="h-4 w-4" /> Browse Publications
            </Link>
          </div>
        </PageHero>
      </div>

      <Section id="constellation" eyebrow="Research Constellation" title="An interconnected map of research themes"
        intro="Nodes represent research areas. Radial lines connect each theme back to the central question; dashed threads mark scientifically related domains.">
        <div className="glass rounded-3xl p-4 md:p-10">
          <ResearchUniverseMap />
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Select an area below for its dedicated research page and cross-linked projects, facilities and publications.
          </p>
        </div>
      </Section>

      <Section id="ecosystem" eyebrow="Ecosystem" title="The observational ecosystem at a glance"
        intro="Verified themes, wavelength domains and facilities that power this research programme.">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Research areas" value={researchAreas.length} sub="Interconnected themes" to="/research" />
          <StatCard label="Research projects" value={projects.length} sub="Investigations in progress or complete" to="/projects" />
          <StatCard label="Verified facilities" value={facilities.length} sub="Ground-based & space missions" to="/facilities" />
          <StatCard label="Publications" value={publicationsArchive.length} sub="First-author and collaborative" to="/publications" />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {wavelengthDomains.map((w) => (
            <div key={w.label} className="glass rounded-2xl border border-white/10 p-5">
              <div className="flex items-center gap-2 text-primary">
                <w.icon className="h-5 w-5" />
                <span className="text-sm font-semibold">{w.label}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{w.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {researchAreas.map((a) => (
            <Link
              key={a.id}
              to="/research/$slug"
              params={{ slug: a.slug }}
              className="group glass flex items-start gap-3 rounded-xl border border-white/10 p-4 hover:bg-white/5"
            >
              <span
                className="mt-1 h-2 w-2 shrink-0 rounded-full"
                style={{ background: `var(--${a.accent})` }}
                aria-hidden
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">{a.shortTitle}</div>
                <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {a.accessibleSummary}
                </div>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-primary/60 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </Section>

      <Section id="expedition" className="pb-24">
        <div className="glass relative overflow-hidden rounded-3xl border border-white/10 p-8 md:p-12">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(closest-side, var(--nebula), transparent 70%)" }}
            aria-hidden
          />
          <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Continue the expedition</div>
              <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
                Enter the domains of stellar discovery
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Chapter 02 opens each research area as its own scientific world — with a central question,
                methodology, telescope facilities and the publications where the work has been reported.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              <Link
                to="/research"
                className="glass inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-5 py-2.5 text-sm text-primary hover:bg-primary/25"
              >
                Chapter 02 · Research Areas <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/projects" className="text-xs text-muted-foreground hover:text-foreground">
                Skip to Research Projects →
              </Link>
              <Link to="/facilities" className="text-xs text-muted-foreground hover:text-foreground">
                Skip to Research Facilities →
              </Link>
            </div>
          </div>
        </div>
      </Section>

      <ChapterFooterNav chapterIndex={0} />
    </>
  );
}

function StatCard({
  label,
  value,
  sub,
  to,
}: {
  label: string;
  value: number;
  sub: string;
  to: "/research" | "/projects" | "/facilities" | "/publications";
}) {
  return (
    <Link
      to={to}
      className="glass group flex flex-col rounded-2xl border border-white/10 p-5 hover:bg-white/5"
    >
      <span className="text-[10px] uppercase tracking-[0.24em] text-primary/80">{label}</span>
      <span className="mt-2 font-display text-4xl font-semibold text-foreground">{value}</span>
      <span className="mt-1 text-xs text-muted-foreground">{sub}</span>
      <span className="mt-4 inline-flex items-center gap-1 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
        Open <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  );
}
