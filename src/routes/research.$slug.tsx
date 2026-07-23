import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";
import { ResearchNavigator, ChapterFooterNav } from "@/components/research/ResearchNavigator";
import { researchAreas } from "@/data/research";
import { facilities } from "@/data/facilities";
import { projects } from "@/data/misc";
import { publicationsArchive } from "@/data/publications-archive";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/research/$slug")({
  head: ({ params }) => {
    const area = researchAreas.find((a) => a.slug === params.slug);
    return {
      meta: [
        { title: area ? `${area.title} — Diya Ram` : "Research — Diya Ram" },
        { name: "description", content: area?.scientificSummary ?? "Research area." },
      ],
    };
  },
  loader: ({ params }) => {
    const area = researchAreas.find((a) => a.slug === params.slug);
    if (!area) throw notFound();
    return { area };
  },
  component: ResearchDetail,
  notFoundComponent: () => (
    <Section>
      <p className="text-muted-foreground">Research area not found.</p>
      <Link to="/research" className="text-primary">← Back to Research Areas</Link>
    </Section>
  ),
});

function ResearchDetail() {
  const { area } = Route.useLoaderData();
  const facs = facilities.filter((f) => area.facilities.includes(f.slug));
  const projs = projects.filter((p) => area.projects.includes(p.slug));
  const pubs = publicationsArchive.filter((p) => area.publications.includes(p.slug));
  const sections = [
    { id: "motivation", label: "Motivation" },
    { id: "question", label: "Research question" },
    { id: "methodology", label: "Methodology" },
    { id: "related", label: "Related" },
  ];
  return (
    <>
      <ResearchNavigator chapterIndex={1} sections={sections} />
      <PageHero eyebrow={area.shortTitle} title={area.title} intro={area.scientificSummary} />
      <Section>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <GlassPanel>
              <h3 id="motivation" className="text-[10px] uppercase tracking-[0.24em] text-primary/80 scroll-mt-24">
                Motivation
              </h3>
              <p className="mt-3 text-muted-foreground">{area.motivation}</p>
            </GlassPanel>
            <GlassPanel>
              <h3 id="question" className="text-[10px] uppercase tracking-[0.24em] text-primary/80 scroll-mt-24">
                Research question
              </h3>
              <p className="mt-3 text-foreground">{area.question}</p>
            </GlassPanel>
            <GlassPanel>
              <h3 id="methodology" className="text-[10px] uppercase tracking-[0.24em] text-primary/80 scroll-mt-24">
                Methodology
              </h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {area.methodology.map((m: string) => (
                  <li key={m} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 rounded-full"
                      style={{ background: `var(--${area.accent})` }}
                    />
                    {m}
                  </li>
                ))}
              </ul>
            </GlassPanel>

            <div id="related" className="scroll-mt-24 grid gap-4 md:grid-cols-2">
              {projs.length > 0 && (
                <GlassPanel>
                  <h3 className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Connected projects</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {projs.map((p) => (
                      <li key={p.id}>
                        <Link
                          to="/projects/$slug"
                          params={{ slug: p.slug }}
                          className="flex items-center justify-between gap-2 text-muted-foreground hover:text-foreground"
                        >
                          <span>{p.shortTitle}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-primary/60" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </GlassPanel>
              )}
              {pubs.length > 0 && (
                <GlassPanel>
                  <h3 className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Related publications</h3>
                  <ul className="mt-3 space-y-2 text-sm">
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
            </div>
          </div>

          <aside className="space-y-4">
            <GlassPanel>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Facilities used</div>
              <ul className="mt-3 space-y-2 text-sm">
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
            {area.targets.length > 0 && (
              <GlassPanel>
                <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Stellar targets</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {area.targets.map((t: string) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </GlassPanel>
            )}
            <GlassPanel>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Status</div>
              <div className="mt-2 text-sm">{area.status}</div>
            </GlassPanel>
            <GlassPanel>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Future directions</div>
              <p className="mt-2 text-sm text-muted-foreground">{area.future}</p>
            </GlassPanel>
            <Link
              to="/research"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-foreground"
            >
              ← All research areas
            </Link>
          </aside>
        </div>
      </Section>
      <ChapterFooterNav chapterIndex={1} />
    </>
  );
}
