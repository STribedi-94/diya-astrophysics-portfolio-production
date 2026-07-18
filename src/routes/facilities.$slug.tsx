import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel, Placeholder } from "@/components/layout/Page";
import { facilities } from "@/data/facilities";

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
  notFoundComponent: () => <Section><p className="text-muted-foreground">Facility not found.</p></Section>,
});

function FacilityDetail() {
  const { facility } = Route.useLoaderData();
  return (
    <>
      <PageHero
        eyebrow={facility.abbreviation}
        title={facility.fullName}
        intro={facility.purpose}
      />
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <GlassPanel>
              <h3 className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Role in Diya Ram's research</h3>
              <p className="mt-3 text-muted-foreground">{facility.role}</p>
            </GlassPanel>
            <Placeholder>
              Observation logs, proposal details, gallery and related publications
              will be added from verified telescope records.
            </Placeholder>
          </div>
          <aside className="space-y-3 text-sm">
            {[
              ["Observatory", facility.observatory],
              ["Location", `${facility.location}, ${facility.country}`],
              ["Band", facility.band],
              ["Wavelength", facility.wavelength],
              ["Aperture / Array", facility.aperture],
            ].map(([k, v]) => (
              <GlassPanel key={k}>
                <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">{k}</div>
                <div className="mt-1.5">{v}</div>
              </GlassPanel>
            ))}
          </aside>
        </div>
      </Section>
    </>
  );
}
