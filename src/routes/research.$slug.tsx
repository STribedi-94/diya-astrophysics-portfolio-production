import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel, Placeholder } from "@/components/layout/Page";
import { researchAreas } from "@/data/research";

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
    </Section>
  ),
});

function ResearchDetail() {
  const { area } = Route.useLoaderData();
  return (
    <>
      <PageHero
        eyebrow={area.shortTitle}
        title={area.title}
        intro={area.scientificSummary}
      />
      <Section>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <GlassPanel>
              <h3 className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Motivation</h3>
              <p className="mt-3 text-muted-foreground">{area.motivation}</p>
            </GlassPanel>
            <GlassPanel>
              <h3 className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Research question</h3>
              <p className="mt-3 text-foreground">{area.question}</p>
            </GlassPanel>
            <GlassPanel>
              <h3 className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Methodology</h3>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {area.methodology.map((m: string) => (
                  <li key={m} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full" style={{ background: `var(--${area.accent})` }} />
                    {m}
                  </li>
                ))}
              </ul>
            </GlassPanel>
            <Placeholder>
              Detailed research results, figures and related publications will be
              populated from published papers and approved scientific documents.
            </Placeholder>
          </div>
          <aside className="space-y-4">
            <GlassPanel>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Facilities</div>
              <ul className="mt-3 space-y-2 text-sm">
                {area.facilities.map((f: string) => (
                  <li key={f}>
                    <Link to="/facilities" className="text-muted-foreground hover:text-foreground">
                      {f}
                    </Link>
                  </li>
                ))}
              </ul>
            </GlassPanel>
            <GlassPanel>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Status</div>
              <div className="mt-2 text-sm">{area.status}</div>
            </GlassPanel>
            <GlassPanel>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Future directions</div>
              <p className="mt-2 text-sm text-muted-foreground">{area.future}</p>
            </GlassPanel>
          </aside>
        </div>
      </Section>
    </>
  );
}
