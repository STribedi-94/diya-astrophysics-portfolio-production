import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/Page";
import { researchAreas } from "@/data/research";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Areas — Diya Ram" },
      { name: "description", content: "Research areas: M-dwarf magnetic activity, stellar flares, rotation, spectroscopy, radio astronomy and habitability." },
    ],
  }),
  component: ResearchIndex,
});

function ResearchIndex() {
  return (
    <>
      <PageHero
        eyebrow="Research"
        title={<>Research areas across <span className="text-grad-accent">optical, spectra and radio</span></>}
        intro="Six research directions that together characterise magnetic activity in M-dwarf stars and its consequences."
      />
      <Section>
        <div className="grid gap-5 md:grid-cols-2">
          {researchAreas.map((a) => (
            <Link
              key={a.id}
              to="/research/$slug"
              params={{ slug: a.slug }}
              className="glass group relative overflow-hidden rounded-2xl p-7 transition-transform hover:-translate-y-1"
            >
              <div
                className="absolute inset-y-0 left-0 w-1"
                style={{ background: `var(--${a.accent})` }}
              />
              <div className="text-[10px] uppercase tracking-[0.24em]" style={{ color: `var(--${a.accent})` }}>
                {a.shortTitle}
              </div>
              <h3 className="mt-2 font-display text-2xl font-semibold">{a.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{a.scientificSummary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {a.methodology.slice(0, 3).map((m) => (
                  <span key={m} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                    {m}
                  </span>
                ))}
              </div>
              <div className="mt-5 inline-flex items-center gap-1.5 text-xs text-primary">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
