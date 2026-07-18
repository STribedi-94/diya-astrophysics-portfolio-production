import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel, Placeholder } from "@/components/layout/Page";
import { publications } from "@/data/misc";

export const Route = createFileRoute("/publications/$slug")({
  head: ({ params }) => {
    const p = publications.find((x) => x.slug === params.slug);
    return { meta: [{ title: p ? `${p.title.slice(0, 60)} — Diya Ram` : "Publication" }] };
  },
  loader: ({ params }) => {
    const pub = publications.find((p) => p.slug === params.slug);
    if (!pub) throw notFound();
    return { pub };
  },
  component: PubDetail,
  notFoundComponent: () => <Section><p className="text-muted-foreground">Publication not found.</p></Section>,
});

function PubDetail() {
  const { pub } = Route.useLoaderData();
  return (
    <>
      <PageHero eyebrow={pub.status} title={pub.title} intro={pub.summary} />
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <GlassPanel>
              <h3 className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Abstract</h3>
              <Placeholder>Abstract will be populated from the verified publication record.</Placeholder>
            </GlassPanel>
            <GlassPanel>
              <h3 className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Main results</h3>
              <Placeholder>Verified main results will be added from the published paper.</Placeholder>
            </GlassPanel>
          </div>
          <aside className="space-y-3 text-sm">
            <GlassPanel>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Authors</div>
              <div className="mt-2">{pub.authors}</div>
            </GlassPanel>
            <GlassPanel>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Journal</div>
              <div className="mt-2">{pub.journal} · {pub.year}</div>
            </GlassPanel>
            <GlassPanel>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Links</div>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                <li>DOI — pending</li>
                <li>NASA ADS — pending</li>
                <li>arXiv — pending</li>
                <li>Publisher — pending</li>
              </ul>
            </GlassPanel>
          </aside>
        </div>
      </Section>
    </>
  );
}
