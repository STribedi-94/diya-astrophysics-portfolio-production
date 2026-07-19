import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, ArrowRight, ChevronDown } from "lucide-react";
import { Section, GlassPanel } from "@/components/layout/Page";
import { MStarHero } from "@/components/visuals/MStarHero";
import { ResearchUniverseMap } from "@/components/visuals/ResearchUniverseMap";
import { SpectralDivider } from "@/components/layout/SpectralDivider";
import {
  aboutIdentity,
  profileLinks,
  selectedOutputs,
  acceptedManuscript,
  facilityAllocations,
  milestones,
  snapshotPanels,
  toolkitGroups,
  expertiseGroups,
  researchDirections,
  activityIndicators,
  contributions,
  audiencePathways,
} from "@/data/about";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Diya Ram | Observational Astrophysicist" },
      {
        name: "description",
        content:
          "Learn about Diya Ram, an observational astrophysicist investigating magnetic activity, flares, starspots and radio emission from M-dwarf stars through TESS photometry, optical and near-infrared spectroscopy, and uGMRT observations.",
      },
      { property: "og:title", content: "Diya Ram — Observational Astrophysicist" },
      {
        property: "og:description",
        content:
          "Multi-wavelength research on the magnetic activity of M-dwarf stars and the environments of the planets that orbit them.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Diya Ram — Observational Astrophysicist",
      },
      {
        name: "twitter:description",
        content:
          "Multi-wavelength research on the magnetic activity of M-dwarf stars and the environments of the planets that orbit them.",
      },
    ],
    links: [
      { rel: "canonical", href: "https://astro-diya-portfolio.lovable.app/about" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Diya Ram",
          jobTitle: "Bridge Fellow",
          affiliation: {
            "@type": "CollegeOrUniversity",
            name: "S. N. Bose National Centre for Basic Sciences",
            department: "Department of Astrophysics and High Energy Physics",
          },
          identifier: {
            "@type": "PropertyValue",
            propertyID: "ORCID",
            value: "0009-0008-7884-3741",
            url: "https://orcid.org/0009-0008-7884-3741",
          },
          sameAs: ["https://orcid.org/0009-0008-7884-3741"],
          knowsAbout: [
            "M-dwarf magnetic activity",
            "Stellar flares",
            "Starspots",
            "Chromospheric diagnostics",
            "TESS photometry",
            "Optical spectroscopy",
            "Near-infrared spectroscopy",
            "Low-frequency radio astronomy",
            "Star–planet interaction",
          ],
        }),
      },
    ],
  }),
  component: About,
});

/* ------------------------------------------------------------------ */
/* Local presentational primitives (kept file-local to avoid           */
/* proliferation of tiny components).                                  */
/* ------------------------------------------------------------------ */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-primary/90">
      <span className="h-1.5 w-1.5 rounded-full bg-primary anim-pulse-slow" />
      {children}
    </div>
  );
}

function ExtLink({
  href,
  label,
  ariaLabel,
}: {
  href: string;
  label: string;
  ariaLabel: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      {label}
      <ExternalLink className="h-3 w-3 opacity-70 transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

/* ------------------------------------------------------------------ */

function About() {
  return (
    <>
      {/* ================= 10. HERO ================= */}
      <section
        className="relative overflow-hidden pt-28 md:min-h-[88vh] md:pt-36 md:pb-16"
        aria-labelledby="about-heading"
      >
        <div className="absolute inset-0 bg-grad-hero opacity-80" aria-hidden />
        <div className="absolute inset-0 starfield anim-drift opacity-70" aria-hidden />
        <div className="absolute inset-0 grid-cosmic opacity-30" aria-hidden />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[960px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--nebula), transparent 70%)" }}
          aria-hidden
        />

        <div className="container-page relative grid items-center gap-10 pb-16 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:pb-0">
          {/* Left: identity */}
          <div>
            <Eyebrow>{aboutIdentity.eyebrow}</Eyebrow>
            <h1
              id="about-heading"
              className="mt-5 font-display text-4xl font-semibold leading-[1.05] md:text-6xl"
            >
              {aboutIdentity.name}
            </h1>
            <div className="mt-3 font-display text-lg text-foreground/85 md:text-xl">
              {aboutIdentity.primaryTitle}
            </div>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-primary/80">
              {aboutIdentity.position}
            </div>
            <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
              {aboutIdentity.primaryStatement}
            </p>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground/85 md:text-base">
              {aboutIdentity.supportingStatement}
            </p>

            {/* Research tags */}
            <ul className="mt-6 flex flex-wrap gap-1.5">
              {aboutIdentity.researchTags.map((t) => (
                <li
                  key={t}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-foreground/75"
                >
                  {t}
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/research"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                Explore Her Research
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/publications"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm text-foreground transition-all hover:border-white/30 hover:bg-white/[0.08]"
              >
                View Publications
              </Link>
              <Link
                to="/academic-journey"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Academic Journey →
              </Link>
            </div>

            {/* Verified profile links only */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/60">
                Verified profiles ·
              </span>
              {profileLinks.map((p) => (
                <ExtLink
                  key={p.url}
                  href={p.url}
                  label={p.label}
                  ariaLabel={p.ariaLabel}
                />
              ))}
            </div>
          </div>

          {/* Right: portrait area (portrait pending) */}
          <div className="relative">
            <div className="glass relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border border-white/10">
              <div className="absolute inset-0 flex items-center justify-center">
                <MStarHero className="w-full opacity-90" />
              </div>
              <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[oklch(0.10_0.04_265_/_0.75)] p-4 backdrop-blur-md">
                <div className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-primary/80">
                  Portrait pending
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Awaiting the verified portrait upload. In the interim, a
                  scientific illustration of an active M-dwarf — the class of
                  star at the centre of Diya Ram's research — is shown here.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 hidden justify-center md:flex">
          <div className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-muted-foreground/60">
            <span>Explore the research profile</span>
            <span className="h-8 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />
          </div>
        </div>
      </section>

      <SpectralDivider />

      {/* ================= 12. SCIENTIFIC MISSION ================= */}
      <Section
        eyebrow="Why this research matters"
        title="Understanding the Magnetic Lives of Low-Mass Stars"
      >
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="glass rounded-3xl border border-white/10 p-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[oklch(0.10_0.04_265)]">
              <MStarHero className="absolute inset-0 h-full w-full" />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-white/10 bg-[oklch(0.08_0.03_265_/_0.75)] px-3 py-2 backdrop-blur">
                <span className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground/80">
                  Conceptual illustration · Active M-dwarf with orbiting planet
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              M-dwarf stars are the smallest and among the most numerous stars in
              the Galaxy. Their small sizes and long lifetimes make them
              important targets in the search for nearby planetary systems, but
              their magnetic behaviour can be intense. Starspots, chromospheric
              emission, energetic flares and radio bursts reveal how magnetic
              fields store and release energy in their atmospheres.
            </p>
            <p>
              Diya Ram's research investigates these processes through a
              multi-wavelength observational approach. Time-series photometry
              from the Transiting Exoplanet Survey Satellite is used to trace
              rotational modulation, starspot evolution, flares and
              quasiperiodic signatures. Optical and near-infrared spectroscopy
              provide complementary diagnostics of chromospheric activity —
              including Hα, Hβ and Ca II H and K. Low-frequency radio
              observations with the upgraded Giant Metrewave Radio Telescope
              probe magnetic processes that may not be visible at optical
              wavelengths.
            </p>
            <p>
              Combining these observational windows helps build a more complete
              physical picture of active low-mass stars, and contributes to a
              broader question: how does the magnetic activity of a host star
              shape the atmospheres, habitability and long-term evolution of
              the planets around it?
            </p>
          </div>
        </div>
      </Section>

      {/* ================= 13. RESEARCH CONSTELLATION ================= */}
      <Section
        eyebrow="A connected research universe"
        title="Interconnected Themes, One Observational Programme"
        intro="Diya's research themes form an interconnected observational programme centred on the magnetic behaviour of M-dwarf stars."
      >
        <div className="glass rounded-3xl border border-white/10 p-4 md:p-8">
          <ResearchUniverseMap />
        </div>
      </Section>

      {/* ================= 14. RESEARCH SNAPSHOT ================= */}
      <Section
        eyebrow="At a glance"
        title="One Research Programme, Multiple Windows on the Universe"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {snapshotPanels.map((p) => (
            <GlassPanel key={p.title} className="h-full">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                {p.title}
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {p.items.map((i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </GlassPanel>
          ))}
          {/* Panel 4 — Computational Toolkit */}
          <GlassPanel className="h-full">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
              Computational Toolkit
            </div>
            <div className="mt-4 space-y-3">
              {toolkitGroups.map((g) => (
                <details
                  key={g.label}
                  className="group rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between text-xs text-foreground/85">
                    <span>{g.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {g.items.map((it) => (
                      <span
                        key={it}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </GlassPanel>
        </div>
      </Section>

      {/* ================= 15. OBSERVING LEADERSHIP ================= */}
      <Section
        eyebrow="Principal Investigator experience"
        title="From Scientific Question to Telescope Proposal"
        intro="Across multiple observing cycles, Diya Ram has been awarded optical and radio telescope time as Principal Investigator for studies of stellar magnetic activity."
      >
        <div className="space-y-6">
          {facilityAllocations.map((f, idx) => (
            <article
              key={f.slug}
              className="glass overflow-hidden rounded-3xl border border-white/10"
            >
              <div
                className={`grid gap-0 md:grid-cols-2 ${
                  idx % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                {/* Facility visual — labelled fallback (official image pending) */}
                <div
                  className="relative min-h-[220px] overflow-hidden md:min-h-[320px]"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, var(--${f.accent}) 0%, transparent 55%), linear-gradient(135deg, var(--cosmos-deep), var(--space-void))`,
                  }}
                >
                  <div className="absolute inset-0 starfield-sparse opacity-40" aria-hidden />
                  <div className="absolute inset-0 grid-cosmic opacity-20" aria-hidden />
                  <div className="relative flex h-full flex-col justify-between p-6">
                    <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/70">
                      {f.observatory}
                    </div>
                    <div>
                      <div className="font-display text-5xl font-bold text-white/95 md:text-6xl">
                        {f.shortName}
                      </div>
                      <div className="mt-1 text-xs text-white/60">{f.fullName}</div>
                    </div>
                    <div className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/50">
                      Official facility photograph pending
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                    Observing allocation
                  </div>
                  <div className="mt-2 font-display text-2xl font-semibold">
                    {f.allocation}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {f.allocationDetail}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{f.context}</p>

                  <details className="group mt-5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-xs text-foreground/85">
                      <span>Proposal codes ({f.proposalCodes.length})</span>
                      <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {f.proposalCodes.map((c) => (
                        <code
                          key={c}
                          className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                        >
                          {c}
                        </code>
                      ))}
                    </div>
                  </details>

                  <Link
                    to="/facilities/$slug"
                    params={{ slug: f.slug }}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
                  >
                    {f.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* ================= 16. CAREER TRAJECTORY ================= */}
      <Section
        eyebrow="Academic trajectory"
        title="A Journey Shaped by Curiosity and Persistence"
      >
        <ol className="relative space-y-6 border-l border-white/10 pl-6 md:pl-10">
          {milestones.map((m) => (
            <li key={m.period + m.title} className="relative">
              <span
                className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border border-primary/50 bg-primary/70 shadow-[0_0_18px_var(--flare-amber)] md:-left-[43px]"
                aria-hidden
              />
              <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-primary/80">
                {m.period}
              </div>
              <div className="mt-1 font-display text-lg font-semibold">{m.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{m.detail}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <Link
            to="/academic-journey"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm text-foreground transition-all hover:border-white/30 hover:bg-white/[0.08]"
          >
            Explore the Full Academic Journey
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* ================= 17. RESEARCH PHILOSOPHY ================= */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-[oklch(0.08_0.03_265)]" aria-hidden />
        <div className="absolute inset-0 starfield opacity-40" aria-hidden />
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-[440px] max-w-5xl -translate-y-1/2 rounded-[50%] opacity-30 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--nebula), transparent 70%)" }}
          aria-hidden
        />
        <div className="container-page relative max-w-3xl">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">
            Research approach
          </div>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight md:text-4xl">
            Research Philosophy
          </h2>
          <p className="mt-8 text-lg leading-relaxed text-foreground/90 md:text-xl">
            No single wavelength reveals the complete magnetic life of a star.
            A deeper understanding emerges when photometric variability,
            spectral diagnostics and radio emission are examined as connected
            expressions of the same underlying activity.
          </p>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Diya's approach combines observations across multiple wavelengths
            with careful time-series analysis. The aim is not only to identify
            activity signatures, but to understand how different diagnostics
            complement one another and what they reveal about the physical
            environments around active low-mass stars.
          </p>
        </div>
      </section>

      {/* ================= 18. SCIENTIFIC EXPERTISE ================= */}
      <Section eyebrow="Capabilities" title="Scientific Expertise">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {expertiseGroups.map((g) => (
            <GlassPanel key={g.title}>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                {g.title}
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {g.items.map((it) => (
                  <li key={it} className="flex gap-2">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </GlassPanel>
          ))}
        </div>
      </Section>

      {/* ================= 19. RESEARCH DIRECTIONS ================= */}
      <Section
        eyebrow="Research directions"
        title="Questions Guiding the Current Programme"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {researchDirections.map((d) => (
            <Link
              key={d.title}
              to={d.to}
              className="group glass rounded-2xl border border-white/10 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_10px_40px_-20px_var(--mdwarf)]"
            >
              <div className="flex flex-wrap gap-1.5">
                {d.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold">{d.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary/90">
                Read more
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ================= 20. SELECTED RESEARCH OUTPUTS ================= */}
      <Section
        eyebrow="Selected research outputs"
        title="Research Through Observation and Analysis"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {selectedOutputs.map((p) => (
            <article
              key={p.doi}
              className="glass flex h-full flex-col rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                <span>{p.journal}</span>
                <span>{p.year}</span>
              </div>
              <h3 className="mt-3 font-display text-base font-semibold leading-snug">
                {p.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.context}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {p.firstAuthor && (
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary/90">
                    First author
                  </span>
                )}
                <a
                  href={p.doi}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open DOI for ${p.title} (opens in new tab)`}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-foreground transition-all hover:border-primary/40 hover:bg-primary/10"
                >
                  Open DOI
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </article>
          ))}

          {/* Accepted manuscript */}
          <article className="glass flex h-full flex-col rounded-2xl border border-dashed border-white/15 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
              Accepted manuscript
            </div>
            <h3 className="mt-3 font-display text-base font-semibold leading-snug">
              {acceptedManuscript.title}
            </h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              First-author manuscript accepted for publication. The final DOI will
              be linked once the article is released.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground/80">
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px]">
                First author
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px]">
                DOI pending
              </span>
            </div>
          </article>
        </div>

        <div className="mt-8">
          <Link
            to="/publications"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm text-foreground transition-all hover:border-white/30 hover:bg-white/[0.08]"
          >
            View Complete Publication Record
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* ================= 21. ACTIVITY INDICATORS ================= */}
      <Section eyebrow="Profile in numbers" title="Research Activity at a Glance">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {activityIndicators.map((i) => (
            <div
              key={i.label}
              className="glass rounded-2xl border border-white/10 p-5 text-center"
            >
              <div className="font-display text-2xl font-bold text-foreground md:text-3xl">
                {i.value}
              </div>
              <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {i.label}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ================= 22. PROFESSIONAL CONTRIBUTIONS ================= */}
      <Section
        eyebrow="Beyond research outputs"
        title="Teaching, Service and Mentorship"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {contributions.map((c) => (
            <GlassPanel key={c.title}>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                {c.title}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{c.body}</p>
            </GlassPanel>
          ))}
        </div>
        <div className="mt-8">
          <Link
            to="/teaching"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm text-foreground transition-all hover:border-white/30 hover:bg-white/[0.08]"
          >
            Explore Teaching & Mentorship
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* ================= 23. COLLABORATION ================= */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-grad-hero opacity-70" aria-hidden />
        <div className="absolute inset-0 starfield-sparse opacity-50" aria-hidden />
        <div
          className="pointer-events-none absolute -bottom-40 right-0 h-[420px] w-[720px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--mdwarf), transparent 70%)" }}
          aria-hidden
        />
        <div className="container-page relative grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">
              Collaboration
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold leading-tight md:text-4xl">
              Exploring Stellar Activity Across Wavelengths
            </h2>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
              Diya welcomes research conversations and potential collaborations
              in stellar magnetic activity, M-dwarf systems, time-domain
              photometry, optical and near-infrared spectroscopy, low-frequency
              radio astronomy and the influence of stellar activity on planetary
              environments.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                Start a Research Conversation
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/publications"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm text-foreground transition-all hover:border-white/30 hover:bg-white/[0.08]"
              >
                Explore Publications
              </Link>
              <Link
                to="/research"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                View Research Areas →
              </Link>
            </div>
          </div>
          <div className="glass relative aspect-square overflow-hidden rounded-3xl border border-white/10">
            <MStarHero className="absolute inset-0 h-full w-full opacity-90" />
          </div>
        </div>
      </section>

      {/* ================= 24. AUDIENCE PATHWAYS ================= */}
      <Section title="Continue Exploring">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {audiencePathways.map((p) => (
            <GlassPanel key={p.title} className="flex h-full flex-col">
              <div className="font-display text-lg font-semibold">{p.title}</div>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                {p.description}
              </p>
              <ul className="mt-4 space-y-1.5">
                {p.links.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      className="group inline-flex items-center gap-1.5 text-sm text-foreground/85 hover:text-primary"
                    >
                      {l.label}
                      <ArrowRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </GlassPanel>
          ))}
        </div>
      </Section>
    </>
  );
}
