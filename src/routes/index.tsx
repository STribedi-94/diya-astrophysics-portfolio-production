import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Download, Sparkles, Telescope, Radio, LineChart } from "lucide-react";
import { site } from "@/data/site";
import { researchAreas } from "@/data/research";
import { facilities } from "@/data/facilities";
import { MultiWavelengthFlow } from "@/components/visuals/MultiWavelengthFlow";
import { ResearchUniverseMap } from "@/components/visuals/ResearchUniverseMap";
import { Section } from "@/components/layout/Page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Diya Ram — Observational Astrophysicist" },
      {
        name: "description",
        content:
          "Diya Ram: observational astrophysicist studying magnetic activity of M-dwarf stars with uGMRT, HCT and DOT across optical, spectroscopic and radio wavelengths.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="absolute inset-0 bg-grad-hero" aria-hidden />
        <div className="absolute inset-0 starfield anim-drift opacity-80" aria-hidden />
        <div className="absolute inset-0 grid-cosmic opacity-40" aria-hidden />

        <div className="container-page relative grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div className="anim-fade-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-primary/90">
              <Sparkles className="h-3 w-3" /> Observational Astrophysicist
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[1.02] md:text-7xl">
              <span className="block">Diya Ram</span>
              <span className="mt-3 block text-grad-accent">Magnetic lives of low-mass stars</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
              {site.tagline}
            </p>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground/80">{site.summary}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/research-universe"
                className="group inline-flex items-center gap-2 rounded-full bg-grad-accent px-5 py-3 text-sm font-medium text-[oklch(0.12_0.04_265)] shadow-[0_0_30px_-8px_oklch(0.78_0.15_210_/_0.7)] transition-transform hover:scale-[1.02]"
              >
                Explore the Research Universe
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/publications"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-foreground hover:bg-white/10"
              >
                View Publications
              </Link>
              <Link
                to="/downloads"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-muted-foreground hover:text-foreground"
              >
                <Download className="h-4 w-4" /> Download CV
              </Link>
            </div>

            <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[
                { icon: LineChart, label: "Optical & TESS" },
                { icon: Telescope, label: "Spectroscopy" },
                { icon: Radio, label: "uGMRT radio" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="glass rounded-xl p-3 text-center">
                  <Icon className="mx-auto h-4 w-4 text-primary" />
                  <div className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Portrait / signature visual */}
          <div className="relative anim-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="relative mx-auto max-w-md">
              <div
                className="absolute -inset-8 rounded-3xl opacity-70 blur-3xl"
                style={{ background: "conic-gradient(from 120deg, var(--nebula), var(--electric), var(--aurora), var(--magenta), var(--nebula))" }}
                aria-hidden
              />
              <div className="glass relative overflow-hidden rounded-3xl">
                <div className="relative aspect-[4/5] bg-grad-panel">
                  <div className="absolute inset-0 starfield opacity-60" />
                  {/* Editorial portrait placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg viewBox="0 0 200 260" className="h-3/4 w-auto text-white/25">
                      <circle cx="100" cy="90" r="42" fill="currentColor" />
                      <path d="M30 250 C 30 180, 170 180, 170 250 Z" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[oklch(0.10_0.04_265)] to-transparent p-6">
                    <div className="text-xs uppercase tracking-[0.2em] text-primary/90">Portrait placeholder</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      A verified professional portrait will be added.
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/10 p-4">
                  <MultiWavelengthFlow />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research areas preview */}
      <Section
        eyebrow="Research Areas"
        title="A connected scientific universe"
        intro="Six threads of observational astrophysics — from starspots and flares to radio emission and habitability — woven around one central question."
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {researchAreas.map((a) => (
            <Link
              key={a.id}
              to="/research/$slug"
              params={{ slug: a.slug }}
              className="glass group relative overflow-hidden rounded-2xl p-6 transition-transform hover:-translate-y-1"
            >
              <div
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40 blur-2xl transition-opacity group-hover:opacity-80"
                style={{ background: `var(--${a.accent})` }}
              />
              <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                {a.shortTitle}
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold">{a.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{a.accessibleSummary}</p>
              <div className="mt-5 inline-flex items-center gap-1.5 text-xs text-primary">
                Explore <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Universe map preview */}
      <Section
        eyebrow="Research Universe"
        title="Diya Ram at the centre of an expanding universe"
        intro="Each research area is a node in one interconnected observational programme."
      >
        <div className="glass overflow-hidden rounded-3xl p-6 md:p-10">
          <ResearchUniverseMap />
          <div className="mt-6 flex justify-center">
            <Link
              to="/research-universe"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm hover:bg-white/10"
            >
              Enter the full universe <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Section>

      {/* Facilities strip */}
      <Section
        eyebrow="Telescope Facilities"
        title="Optical, spectroscopic and radio observatories"
        intro="Diya Ram observes with three world-class facilities that together enable a multi-wavelength view of M-dwarf activity."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {facilities.map((f) => (
            <Link
              key={f.id}
              to="/facilities/$slug"
              params={{ slug: f.slug }}
              className="glass group rounded-2xl p-6 transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl font-semibold text-grad-accent">
                  {f.abbreviation}
                </span>
                <Telescope className="h-5 w-5 text-primary/70" />
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">{f.fullName}</div>
              <div className="mt-1 text-xs text-muted-foreground">{f.observatory} · {f.location}</div>
              <div className="mt-4 text-xs uppercase tracking-[0.18em] text-primary/80">{f.band}</div>
              <p className="mt-2 text-sm text-muted-foreground">{f.purpose}</p>
            </Link>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section>
        <div className="glass relative overflow-hidden rounded-3xl p-10 md:p-14">
          <div className="absolute inset-0 bg-grad-hero opacity-50" aria-hidden />
          <div className="relative grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center">
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Collaborate</div>
              <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
                Interested in multi-wavelength M-dwarf science?
              </h2>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Diya Ram welcomes collaboration on stellar magnetic activity, time-domain campaigns and radio follow-up of cool stars.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-grad-accent px-5 py-3 text-sm font-medium text-[oklch(0.12_0.04_265)]"
              >
                Contact Diya <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/research"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm hover:bg-white/10"
              >
                Browse research
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
