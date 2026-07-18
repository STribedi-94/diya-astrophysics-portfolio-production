import { createFileRoute } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";
import { downloads } from "@/data/misc";
import { Download } from "lucide-react";

export const Route = createFileRoute("/downloads")({
  head: () => ({ meta: [{ title: "Downloads — Diya Ram" }] }),
  component: () => (
    <>
      <PageHero
        eyebrow="Downloads"
        title={<>CV, research statement and <span className="text-grad-accent">document library</span></>}
        intro="Download files will be activated after document upload."
      />
      <Section>
        <div className="grid gap-4 md:grid-cols-2">
          {downloads.map((d) => (
            <GlassPanel key={d.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">{d.category}</div>
                  <h3 className="mt-2 font-display text-lg font-semibold">{d.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>
                </div>
                <button
                  disabled
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground opacity-70"
                >
                  <Download className="h-3.5 w-3.5" /> Pending upload
                </button>
              </div>
            </GlassPanel>
          ))}
        </div>
      </Section>
    </>
  ),
});
