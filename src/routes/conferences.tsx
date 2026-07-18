import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel, Placeholder } from "@/components/layout/Page";
import { conferences } from "@/data/misc";

export const Route = createFileRoute("/conferences")({
  head: () => ({ meta: [{ title: "Conferences & Presentations — Diya Ram" }] }),
  component: () => (
    <>
      <PageHero
        eyebrow="Conferences"
        title={<>Talks, posters and <span className="text-grad-accent">scientific gatherings</span></>}
        intro="Verified conference presentations, workshops and invited talks will be added when documentation is available."
      />
      <Section>
        <div className="grid gap-4">
          {conferences.map((c) => (
            <GlassPanel key={c.id}>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">{c.type}</div>
              <h3 className="mt-2 font-display text-lg font-semibold">{c.title}</h3>
              <div className="mt-1 text-sm text-muted-foreground">{c.event} · {c.location} · {c.date}</div>
            </GlassPanel>
          ))}
        </div>
        <div className="mt-6">
          <Placeholder>Individual conference records with abstracts, slides and posters will be populated after verification.</Placeholder>
        </div>
      </Section>
    </>
  ),
});
