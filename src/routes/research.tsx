import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHero, Section } from "@/components/layout/Page";
import { ResearchNavigator, ChapterFooterNav } from "@/components/research/ResearchNavigator";
import { researchAreas, type ResearchArea } from "@/data/research";
import { facilities } from "@/data/facilities";
import { projects } from "@/data/misc";
import { publicationsArchive } from "@/data/publications-archive";
import { ArrowRight, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Areas — Diya Ram" },
      {
        name: "description",
        content:
          "Domains of stellar discovery: M-dwarf magnetic activity, stellar flares, rotation and starspots, spectroscopy, radio astronomy and habitability.",
      },
      { property: "og:title", content: "Research Areas — Diya Ram" },
      {
        property: "og:description",
        content:
          "Six research domains spanning optical, spectroscopic and radio characterisation of low-mass stars.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://astro-diya-portfolio.lovable.app/research" }],
  }),
  component: ResearchAreasPage,
});

function ResearchAreasPage() {
  const sections = researchAreas.map((a) => ({ id: a.slug, label: a.shortTitle }));

  return (
    <>
      <ResearchNavigator chapterIndex={1} sections={sections} />

      <PageHero
        eyebrow="Chapter 02 · Research Areas"
        title={
          <>
            Domains of <span className="text-grad-accent">stellar discovery</span>
          </>
        }
        intro="Six connected worlds of research — each with its own scientific question, method, wavelength and telescope facilities. Progressive disclosure keeps the overview readable; expand for scientific detail."
      >
        <nav aria-label="Jump to research area" className="flex flex-wrap gap-2">
          {researchAreas.map((a) => (
            <a
              key={a.id}
              href={`#${a.slug}`}
              className="glass rounded-full border border-white/10 px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              style={{ borderColor: `color-mix(in oklab, var(--${a.accent}) 40%, transparent)` }}
            >
              {a.shortTitle}
            </a>
          ))}
        </nav>
      </PageHero>

      <div className="relative">
        {researchAreas.map((area, i) => (
          <AreaWorld key={area.id} area={area} index={i} />
        ))}
      </div>

      <ChapterFooterNav chapterIndex={1} />
    </>
  );
}

function AreaWorld({ area, index }: { area: ResearchArea; index: number }) {
  const [open, setOpen] = useState(false);
  const flip = index % 2 === 1;
  const facs = facilities.filter((f) => area.facilities.includes(f.slug));
  const projs = projects.filter((p) => area.projects.includes(p.slug));
  const pubs = publicationsArchive.filter((p) => area.publications.includes(p.slug));

  return (
    <Section id={area.slug} className="!py-16 md:!py-24">
      <div className="relative">
        {/* Distinct nebular background per area */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 rounded-[2.5rem] opacity-70"
          style={{
            background: `radial-gradient(60% 50% at ${flip ? "80%" : "20%"} 30%, color-mix(in oklab, var(--${area.accent}) 22%, transparent), transparent 70%)`,
          }}
          aria-hidden
        />
        <div
          className={cn(
            "relative grid items-start gap-8 rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 md:grid-cols-[1.1fr_1fr] md:gap-12 md:p-10",
            flip && "md:[&>*:first-child]:order-2",
          )}
        >
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.24em]"
              style={{
                color: `var(--${area.accent})`,
                borderColor: `color-mix(in oklab, var(--${area.accent}) 40%, transparent)`,
                background: `color-mix(in oklab, var(--${area.accent}) 10%, transparent)`,
              }}
            >
              Domain {String(index + 1).padStart(2, "0")}
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">{area.title}</h2>
            <p className="mt-3 text-muted-foreground">{area.scientificSummary}</p>
            <p className="mt-2 text-sm text-muted-foreground/80">{area.accessibleSummary}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <MicroStat label="Central question" value={area.question} />
              <MicroStat label="Status" value={area.status} />
            </div>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-primary hover:text-foreground"
              aria-expanded={open}
              aria-controls={`${area.slug}-details`}
            >
              {open ? "Hide scientific detail" : "Show scientific detail"}
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {open && (
              <div id={`${area.slug}-details`} className="mt-4 space-y-4 border-t border-white/10 pt-4">
                <Block label="Motivation">{area.motivation}</Block>
                <Block label="Methodology">
                  <ul className="mt-1 grid gap-1.5 sm:grid-cols-2">
                    {area.methodology.map((m) => (
                      <li key={m} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: `var(--${area.accent})` }}
                        />
                        {m}
                      </li>
                    ))}
                  </ul>
                </Block>
                {area.targets.length > 0 && (
                  <Block label="Stellar targets">
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {area.targets.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </Block>
                )}
                <Block label="Future directions">{area.future}</Block>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/research/$slug"
                params={{ slug: area.slug }}
                className="glass inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs text-primary hover:bg-white/5"
              >
                Full research page <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/research-universe"
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ← Back to Research Universe
              </Link>
            </div>
          </div>

          {/* Right column: related items */}
          <aside className="space-y-4">
            <AreaMotif motif={area.motif} accent={area.accent} />

            {facs.length > 0 && (
              <RelatedBlock label="Facilities used">
                <div className="flex flex-wrap gap-2">
                  {facs.map((f) => (
                    <Link
                      key={f.id}
                      to="/facilities/$slug"
                      params={{ slug: f.slug }}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {f.abbreviation}
                    </Link>
                  ))}
                </div>
              </RelatedBlock>
            )}

            {projs.length > 0 && (
              <RelatedBlock label="Connected projects">
                <ul className="space-y-1.5">
                  {projs.map((p) => (
                    <li key={p.id}>
                      <Link
                        to="/projects/$slug"
                        params={{ slug: p.slug }}
                        className="flex items-center justify-between gap-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <span className="truncate">{p.shortTitle}</span>
                        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </RelatedBlock>
            )}

            {pubs.length > 0 && (
              <RelatedBlock label="Related publications">
                <ul className="space-y-1.5">
                  {pubs.slice(0, 4).map((p) => (
                    <li key={p.id}>
                      <Link
                        to="/publications"
                        hash={p.slug}
                        className="flex items-start gap-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span className="line-clamp-2">{p.shortTitle ?? p.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </RelatedBlock>
            )}
          </aside>
        </div>
      </div>
    </Section>
  );
}

function MicroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-xl border border-white/10 p-3">
      <div className="text-[10px] uppercase tracking-[0.24em] text-primary/70">{label}</div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">{label}</div>
      <div className="mt-1 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

function RelatedBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl border border-white/10 p-4">
      <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">{label}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** Subtle scientific motif for each area — pure SVG, static, respects reduced motion. */
function AreaMotif({ motif, accent }: { motif: ResearchArea["motif"]; accent: string }) {
  const color = `var(--${accent})`;
  return (
    <div
      className="relative h-40 overflow-hidden rounded-2xl border border-white/10 bg-black/40"
      aria-hidden
    >
      <svg viewBox="0 0 400 160" className="h-full w-full">
        {motif === "lightcurve" && (
          <>
            <path
              d="M0 110 Q40 108 80 105 T160 100 L170 40 L180 100 T260 90 T400 80"
              stroke={color}
              strokeWidth="1.5"
              fill="none"
            />
            <circle cx="170" cy="40" r="3" fill={color} />
          </>
        )}
        {motif === "spectrum" && (
          <>
            {Array.from({ length: 40 }).map((_, i) => (
              <rect
                key={i}
                x={10 + i * 9.5}
                y="40"
                width="3"
                height="80"
                fill={color}
                opacity={0.15 + 0.6 * Math.abs(Math.sin(i * 0.6))}
              />
            ))}
          </>
        )}
        {motif === "radio" && (
          <>
            {[30, 60, 90, 120, 150].map((r) => (
              <circle key={r} cx="80" cy="80" r={r} fill="none" stroke={color} strokeOpacity={0.5 - r / 400} />
            ))}
            <circle cx="80" cy="80" r="4" fill={color} />
            <path d="M200 130 L240 60 L280 130" stroke={color} strokeWidth="1.5" fill="none" />
            <line x1="200" y1="130" x2="280" y2="130" stroke={color} strokeWidth="1.5" />
          </>
        )}
        {motif === "starspots" && (
          <>
            <circle cx="200" cy="80" r="55" fill={color} opacity="0.15" />
            <circle cx="200" cy="80" r="55" stroke={color} fill="none" strokeOpacity="0.5" />
            <circle cx="185" cy="65" r="10" fill={color} opacity="0.5" />
            <circle cx="215" cy="95" r="7" fill={color} opacity="0.4" />
            <circle cx="220" cy="60" r="5" fill={color} opacity="0.3" />
          </>
        )}
        {motif === "magnetic" && (
          <>
            <circle cx="200" cy="80" r="18" fill={color} opacity="0.6" />
            {[0, 1, 2, 3].map((k) => (
              <ellipse
                key={k}
                cx="200"
                cy="80"
                rx={40 + k * 25}
                ry={20 + k * 12}
                fill="none"
                stroke={color}
                strokeOpacity={0.5 - k * 0.1}
                transform={`rotate(${k * 20} 200 80)`}
              />
            ))}
          </>
        )}
        {motif === "habitable" && (
          <>
            <circle cx="120" cy="80" r="26" fill={color} opacity="0.7" />
            <ellipse cx="120" cy="80" rx="120" ry="45" fill="none" stroke={color} strokeOpacity="0.4" strokeDasharray="3 4" />
            <circle cx="240" cy="72" r="6" fill="oklch(0.85 0.05 220)" />
            <circle cx="240" cy="72" r="12" fill="none" stroke="oklch(0.85 0.05 220 / 0.4)" />
          </>
        )}
      </svg>
    </div>
  );
}
