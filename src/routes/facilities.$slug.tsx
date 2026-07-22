import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";
import { ResearchNavigator, ChapterFooterNav } from "@/components/research/ResearchNavigator";
import { facilities } from "@/data/facilities";
import { researchAreas } from "@/data/research";
import { projects } from "@/data/misc";
import { publicationsArchive } from "@/data/publications-archive";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/facilities/$slug")({
  head: ({ params }) => {
    const f = facilities.find((x) => x.slug === params.slug);
    return {
      meta: [
        { title: f ? `${f.fullName} — Diya Ram` : "Facility — Diya Ram" },
        { name: "description", content: f?.purpose ?? "Telescope facility." },
      ],
    };
  },
  loader: ({ params }) => {
    const facility = facilities.find((f) => f.slug === params.slug);
    if (!facility) throw notFound();
    return { facility };
  },
  component: FacilityDetail,
  notFoundComponent: () => (
    <Section>
      <p className="text-muted-foreground">Facility not found.</p>
      <Link to="/facilities" className="text-primary">← Back to Facilities</Link>
    </Section>
  ),
});

function FacilityDetail() {
  const { facility } = Route.useLoaderData();
  const areas = researchAreas.filter((a) => facility.relatedAreas.includes(a.slug));
  const projs = projects.filter((p) => facility.relatedProjects.includes(p.slug));
  const pubs = publicationsArchive.filter((p) => facility.relatedPublications.includes(p.slug));
  const sections = [
    { id: "role", label: "Role" },
    { id: "capability", label: "Capability" },
    { id: "related", label: "Related" },
  ];
  return (
    <>
      <ResearchNavigator chapterIndex={3} sections={sections} />
      <PageHero eyebrow={facility.abbreviation} title={facility.fullName} intro={facility.purpose} />
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <GlassPanel>
              <h3 id="role" className="text-[10px] uppercase tracking-[0.24em] text-primary/80 scroll-mt-24">
                Role in Diya Ram&apos;s research
              </h3>
              <p className="mt-3 text-muted-foreground">{facility.role}</p>
            </GlassPanel>
            <GlassPanel>
              <h3 id="capability" className="text-[10px] uppercase tracking-[0.24em] text-primary/80 scroll-mt-24">
                Primary capability
              </h3>
              <p className="mt-3 text-muted-foreground">{facility.capability}</p>
            </GlassPanel>

            <div id="related" className="scroll-mt-24 grid gap-4 md:grid-cols-2">
              {projs.length > 0 && (
                <GlassPanel>
                  <h3 className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Projects using this facility</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {projs.map((p) => (
                      <li key={p.id}>
                        <Link
                          to="/projects/$slug"
                          params={{ slug: p.slug }}
                          className="flex items-center justify-between text-muted-foreground hover:text-foreground"
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
                          hash={p.slug}
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
          <aside className="space-y-3 text-sm">
            {[
              ["Observatory", facility.observatory],
              ["Location", `${facility.location}, ${facility.country}`],
              ["Type", facility.type === "space" ? "Space-based" : "Ground-based"],
              ["Band", facility.band],
              ["Wavelength", facility.wavelength],
              ["Aperture / Array", facility.aperture],
            ].map(([k, v]) => (
              <GlassPanel key={k}>
                <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">{k}</div>
                <div className="mt-1.5">{v}</div>
              </GlassPanel>
            ))}
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
            <Link
              to="/facilities"
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-foreground"
            >
              ← All facilities
            </Link>
          </aside>
        </div>
      </Section>
      <ChapterFooterNav chapterIndex={3} />
    </>
  );
}
