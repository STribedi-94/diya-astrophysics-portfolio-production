import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";
import { ResearchNavigator, ChapterFooterNav } from "@/components/research/ResearchNavigator";
import { projects } from "@/data/misc";
import { facilities } from "@/data/facilities";
import { researchAreas } from "@/data/research";
import { publicationsArchive } from "@/data/publications-archive";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => {
    const p = projects.find((x) => x.slug === params.slug);
    return {
      meta: [
        { title: p ? `${p.title} — Diya Ram` : "Project — Diya Ram" },
        { name: "description", content: p?.question ?? "Research project." },
      ],
    };
  },
  loader: ({ params }) => {
    const project = projects.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    return { project };
  },
  component: ProjectDetail,
  notFoundComponent: () => (
    <Section>
      <p className="text-muted-foreground">Project not found.</p>
      <Link to="/projects" className="text-primary">← Back to Projects</Link>
    </Section>
  ),
});

function ProjectDetail() {
  const { project } = Route.useLoaderData() as {
  project: (typeof projects)[number];
  };
  const facs = facilities.filter((f) => project.facilities.includes(f.slug));
  const areas = researchAreas.filter((a) => project.areas.includes(a.slug));
  const pubs = publicationsArchive.filter((p) => project.publications.includes(p.slug));
  const sections = [
    { id: "objective", label: "Objective" },
    { id: "methodology", label: "Methodology" },
    { id: "outcome", label: "Outcome" },
    { id: "related", label: "Related" },
  ];
  return (
    <>
      <ResearchNavigator chapterIndex={2} sections={sections} />
      <PageHero eyebrow={project.status} title={project.title} intro={project.question} />
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <GlassPanel>
              <h3 id="objective" className="text-[10px] uppercase tracking-[0.24em] text-primary/80 scroll-mt-24">
                Scientific motivation
              </h3>
              <p className="mt-3 text-muted-foreground">{project.motivation}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm">
                <MiniStat label="Target" value={project.target} />
                <MiniStat label="Wavelength" value={project.wavelength} />
              </div>
            </GlassPanel>
            <GlassPanel>
              <h3 id="methodology" className="text-[10px] uppercase tracking-[0.24em] text-primary/80 scroll-mt-24">
                Methodology
              </h3>
              <ul className="mt-3 space-y-1.5">
                {project.methodology.map((m: string) => (
                  <li key={m} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-primary/70" />
                    {m}
                  </li>
                ))}
              </ul>
            </GlassPanel>
            <GlassPanel>
              <h3 id="outcome" className="text-[10px] uppercase tracking-[0.24em] text-primary/80 scroll-mt-24">
                Outcome
              </h3>
              <p className="mt-3 text-muted-foreground">{project.outcome}</p>
            </GlassPanel>
          </div>
          <aside id="related" className="space-y-3 scroll-mt-24">
            <GlassPanel>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Facilities</div>
              <ul className="mt-2 space-y-1.5 text-sm">
                {facs.map((f) => (
                  <li key={f.id}>
                    <Link
                      to="/facilities/$slug"
                      params={{ slug: f.slug }}
                      className="flex items-center justify-between text-muted-foreground hover:text-foreground"
                    >
                      <span>{f.abbreviation}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-primary/60" />
                    </Link>
                  </li>
                ))}
              </ul>
            </GlassPanel>
            {areas.length > 0 && (
              <GlassPanel>
                <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Research areas</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {areas.map((a) => (
                    <Link
                      key={a.id}
                      to="/research/$slug"
                      params={{ slug: a.slug }}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      {a.shortTitle}
                    </Link>
                  ))}
                </div>
              </GlassPanel>
            )}
            {pubs.length > 0 && (
              <GlassPanel>
                <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Publications</div>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {pubs.map((p) => (
                    <li key={p.id}>
                      <Link
                        to="/publications"
                        hash={`pub-${p.id}`}
                        className="flex items-start gap-2 text-muted-foreground hover:text-foreground"
                      >
                        <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span className="line-clamp-2">{p.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </GlassPanel>
            )}
            <GlassPanel>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Status</div>
              <div className="mt-2 text-sm">{project.status}</div>
            </GlassPanel>
          </aside>
        </div>
      </Section>
      <ChapterFooterNav chapterIndex={2} />
    </>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="text-[10px] uppercase tracking-[0.24em] text-primary/70">{label}</div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}
