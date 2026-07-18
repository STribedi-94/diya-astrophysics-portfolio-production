import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";
import { journey } from "@/data/journey";

export const Route = createFileRoute("/academic-journey")({
  head: () => ({
    meta: [
      { title: "Academic Journey — Diya Ram" },
      { name: "description", content: "Academic and observational timeline of Diya Ram." },
    ],
  }),
  component: () => (
    <>
      <PageHero
        eyebrow="Academic Journey"
        title={<>A timeline of <span className="text-grad-accent">research and observing</span></>}
        intro="Verified degrees, appointments and observing programmes will be added progressively from Diya Ram's curriculum vitae and telescope records."
      />
      <Section>
        <ol className="relative border-l border-white/10 pl-6">
          {journey.map((j, i) => (
            <li key={j.id} className="mb-8 anim-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-grad-accent shadow-[0_0_16px_var(--aurora)]" />
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">
                {j.period} · {j.category}
              </div>
              <GlassPanel className="mt-2">
                <h3 className="font-display text-lg font-semibold">{j.title}</h3>
                <div className="mt-1 text-sm text-muted-foreground">{j.institution}</div>
                <p className="mt-3 text-sm text-muted-foreground">{j.description}</p>
              </GlassPanel>
            </li>
          ))}
        </ol>
      </Section>
    </>
  ),
});
