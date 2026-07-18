import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";
import { news } from "@/data/misc";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/news")({
  head: () => ({ meta: [{ title: "News & Updates — Diya Ram" }] }),
  component: () => (
    <>
      <PageHero
        eyebrow="News"
        title={<>Latest <span className="text-grad-accent">research updates</span></>}
        intro="Notes on new results, observing runs, publications and website updates."
      />
      <Section>
        <div className="grid gap-4">
          {news.map((n) => (
            <Link
              key={n.id}
              to="/news/$slug"
              params={{ slug: n.slug }}
              className="glass group rounded-2xl p-6 hover:bg-white/5"
            >
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.24em]">
                <span className="text-primary/80">{n.category}</span>
                <span className="text-muted-foreground">{n.date}</span>
              </div>
              <h3 className="mt-2 font-display text-lg font-semibold">{n.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{n.summary}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary">
                Read <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <GlassPanel>
            Additional news items will be added as the research programme evolves.
          </GlassPanel>
        </div>
      </Section>
    </>
  ),
});
