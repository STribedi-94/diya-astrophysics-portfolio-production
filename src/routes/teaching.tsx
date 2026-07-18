import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel, Placeholder } from "@/components/layout/Page";
import { teaching } from "@/data/misc";

export const Route = createFileRoute("/teaching")({
  head: () => ({ meta: [{ title: "Teaching & Mentoring — Diya Ram" }] }),
  component: () => (
    <>
      <PageHero
        eyebrow="Teaching & Mentoring"
        title={<>Sharing the <span className="text-grad-accent">craft of observation</span></>}
        intro="Verified teaching, tutoring and mentoring records will be added when available."
      />
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {teaching.map((t) => (
            <GlassPanel key={t.id}>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">{t.type}</div>
              <h3 className="mt-2 font-display text-lg font-semibold">{t.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.description}</p>
            </GlassPanel>
          ))}
        </div>
        <div className="mt-6">
          <Placeholder>Course names, roles, levels and mentoring records will be populated after verification.</Placeholder>
        </div>
      </Section>
    </>
  ),
});
