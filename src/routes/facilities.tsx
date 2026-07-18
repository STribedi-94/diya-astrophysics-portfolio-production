import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/Page";
import { facilities } from "@/data/facilities";
import { Telescope, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/facilities")({
  head: () => ({
    meta: [
      { title: "Facilities — Diya Ram" },
      { name: "description", content: "Telescope facilities: uGMRT, HCT and DOT." },
    ],
  }),
  component: () => (
    <>
      <PageHero
        eyebrow="Facilities"
        title={<>Telescopes across <span className="text-grad-accent">the electromagnetic spectrum</span></>}
        intro="Diya Ram observes with three flagship Indian facilities that together enable optical, spectroscopic and radio characterisation of M-dwarf stars."
      />
      <Section>
        <div className="grid gap-4 md:grid-cols-3">
          {facilities.map((f) => (
            <Link
              key={f.id}
              to="/facilities/$slug"
              params={{ slug: f.slug }}
              className="glass group relative overflow-hidden rounded-2xl p-7 transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl font-semibold text-grad-accent">{f.abbreviation}</span>
                <Telescope className="h-6 w-6 text-primary/70" />
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold">{f.fullName}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{f.observatory} · {f.location}, {f.country}</p>
              <p className="mt-4 text-sm text-muted-foreground">{f.purpose}</p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-xs text-primary">
                Facility profile <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </>
  ),
});
