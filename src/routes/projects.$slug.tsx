import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel, Placeholder } from "@/components/layout/Page";
import { projects } from "@/data/misc";

export const Route = createFileRoute("/projects/$slug")({
  head: ({ params }) => {
    const p = projects.find((x) => x.slug === params.slug);
    return { meta: [{ title: p ? `${p.title} — Diya Ram` : "Project — Diya Ram" }] };
  },
  loader: ({ params }) => {
    const project = projects.find((p) => p.slug === params.slug);
    if (!project) throw notFound();
    return { project };
  },
  component: ProjectDetail,
  notFoundComponent: () => <Section><p className="text-muted-foreground">Project not found.</p></Section>,
});

function ProjectDetail() {
  const { project } = Route.useLoaderData();
  return (
    <>
      <PageHero eyebrow={project.status} title={project.title} intro={project.question} />
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <GlassPanel>
              <h3 className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Scientific goal</h3>
              <p className="mt-3 text-muted-foreground">{project.question}</p>
            </GlassPanel>
            <Placeholder>
              Detailed methodology, observation log, figures and outputs will be
              added from verified telescope and analysis records.
            </Placeholder>
          </div>
          <aside className="space-y-3">
            <GlassPanel>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Facilities</div>
              <div className="mt-2 text-sm">{project.facilities.join(" · ")}</div>
            </GlassPanel>
            <GlassPanel>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Status</div>
              <div className="mt-2 text-sm">{project.status}</div>
            </GlassPanel>
          </aside>
        </div>
      </Section>
    </>
  );
}
