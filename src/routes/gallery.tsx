import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/Page";
import { gallery } from "@/data/misc";

export const Route = createFileRoute("/gallery")({
  head: () => ({ meta: [{ title: "Scientific Gallery — Diya Ram" }] }),
  component: () => (
    <>
      <PageHero
        eyebrow="Gallery"
        title={<>Illustrations, diagrams and <span className="text-grad-accent">scientific imagery</span></>}
        intro="Placeholder illustrations that establish the visual grammar. Authentic photographs and research figures will replace these when available."
      />
      <Section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((g, i) => (
            <figure key={g.id} className="glass overflow-hidden rounded-2xl">
              <div
                className="relative aspect-[4/3]"
                style={{
                  background: `linear-gradient(135deg, oklch(0.24 0.07 268), oklch(0.14 0.04 265))`,
                }}
              >
                <div className="absolute inset-0 starfield opacity-70" />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle at ${20 + (i * 15) % 60}% ${30 + (i * 20) % 50}%, var(--${["nebula", "electric", "aurora", "magenta", "solar", "teal"][i % 6]}) 0%, transparent 55%)`,
                    opacity: 0.55,
                  }}
                />
              </div>
              <figcaption className="p-4">
                <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">{g.category}</div>
                <div className="mt-1 font-display text-sm font-semibold">{g.title}</div>
                <p className="mt-1 text-xs text-muted-foreground">{g.caption}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </>
  ),
});
