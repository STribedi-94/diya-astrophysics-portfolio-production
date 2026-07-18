import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel, Placeholder } from "@/components/layout/Page";
import { site } from "@/data/site";
import { facilities } from "@/data/facilities";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Diya Ram" },
      {
        name: "description",
        content:
          "About Diya Ram, observational astrophysicist studying magnetic activity of M-dwarf stars across optical, spectroscopic and radio wavelengths.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={<>Scientist, observer, storyteller of <span className="text-grad-accent">small stars</span></>}
        intro={site.summary}
      />
      <Section>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6 text-base leading-relaxed text-muted-foreground">
            <p>{site.longBio}</p>
            <p>
              Her observational programme combines TESS photometry and ground-based
              optical monitoring with spectroscopy from the Himalayan Chandra Telescope
              and the Devasthal Optical Telescope, and low-frequency radio observations
              from the upgraded Giant Metrewave Radio Telescope.
            </p>
            <Placeholder>
              A detailed academic biography, verified degrees, supervisors and
              appointments will be added from Diya Ram's curriculum vitae.
            </Placeholder>
          </div>
          <aside className="space-y-4">
            <GlassPanel>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">At a glance</div>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Focus</dt>
                  <dd>Magnetic activity of M-dwarf stars</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Approach</dt>
                  <dd>Multi-wavelength · time-domain</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Facilities</dt>
                  <dd>{facilities.map((f) => f.abbreviation).join(" · ")}</dd>
                </div>
              </dl>
            </GlassPanel>
            <GlassPanel>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Professional profiles</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>ORCID — {site.placeholder.profile}</li>
                <li>NASA ADS — {site.placeholder.profile}</li>
                <li>Google Scholar — {site.placeholder.profile}</li>
                <li>ResearchGate — {site.placeholder.profile}</li>
                <li>LinkedIn — {site.placeholder.profile}</li>
              </ul>
            </GlassPanel>
          </aside>
        </div>
      </Section>
    </>
  );
}
