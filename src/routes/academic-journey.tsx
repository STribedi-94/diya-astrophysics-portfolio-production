import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/layout/Page";
import { CosmicBackground } from "@/components/layout/CosmicBackground";
import { JourneyProgress } from "@/components/journey/JourneyProgress";
import { FacilityMotif } from "@/components/journey/FacilityMotif";
import {
  journeyChapters,
  observingConstellation,
  methodsRibbon,
  currentPosition,
  progressLabels,
} from "@/data/journey";
import { profileSameAs } from "@/data/about";

const SITE_URL = "https://astro-diya-portfolio.lovable.app";
const CANONICAL = `${SITE_URL}/academic-journey`;

const chapterIds = [
  ...journeyChapters.map((c) => c.id),
  "observing",
  "methods",
  "today",
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Diya Ram",
  jobTitle: "Bridge Fellow, Observational Astrophysics",
  affiliation: {
    "@type": "Organization",
    name: "S. N. Bose National Centre for Basic Sciences",
  },
  alumniOf: [
    {
      "@type": "CollegeOrUniversity",
      name: "Bangabasi Morning College, University of Calcutta",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "St. Xavier's College, University of Calcutta",
    },
    {
      "@type": "CollegeOrUniversity",
      name: "S. N. Bose National Centre for Basic Sciences, University of Calcutta",
    },
  ],
  sameAs: profileSameAs,
  url: CANONICAL,
};

export const Route = createFileRoute("/academic-journey")({
  head: () => ({
    meta: [
      { title: "Academic Journey | Diya Ram — Observational Astrophysicist" },
      {
        name: "description",
        content:
          "Explore Diya Ram's academic journey from her early education and physics training to doctoral research in observational stellar astrophysics, multi-wavelength astronomy and M-dwarf magnetic activity.",
      },
      { property: "og:title", content: "Academic Journey | Diya Ram" },
      {
        property: "og:description",
        content:
          "The making of an observational astrophysicist — a scroll-driven scientific story.",
      },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: CANONICAL },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(jsonLd),
      },
    ],
  }),
  component: AcademicJourneyPage,
});

function AcademicJourneyPage() {
  return (
    <>
      <CosmicBackground />
      <JourneyProgress ids={chapterIds} />

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
          <div className="absolute inset-0 bg-grad-hero opacity-60" />
          <div className="absolute inset-0 starfield anim-drift opacity-70" />
          <div className="absolute inset-0 starfield-sparse opacity-60" />
          <div
            className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-30 anim-pulse-slow"
            style={{
              background:
                "radial-gradient(closest-side, oklch(0.55 0.18 265 / 0.9), transparent 70%)",
            }}
          />
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1200 600"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="path-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--spectral-cyan)" stopOpacity="0" />
                <stop offset="50%" stopColor="var(--aurora)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="var(--stellar-gold)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M -20 480 Q 300 380 600 420 T 1220 300"
              fill="none"
              stroke="url(#path-grad)"
              strokeWidth="1.2"
            />
          </svg>
        </div>

        <div className="container-page relative">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-primary/90">
            <span className="h-1.5 w-1.5 rounded-full bg-primary anim-pulse-slow" />
            Academic Journey
          </div>
          <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
            The Making of an{" "}
            <span className="text-grad-accent">Observational Astrophysicist</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            A journey shaped by curiosity, rigorous training and the exploration
            of magnetic activity in low-mass stars across optical, near-infrared
            and radio wavelengths.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground/80 italic">
            Every scientific journey begins with a question.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={`#${journeyChapters[0].id}`}
              className="inline-flex items-center gap-2 rounded-full bg-primary/90 px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary transition-colors"
            >
              Begin the Journey
              <span aria-hidden>↓</span>
            </a>
            <ol
              className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground/80"
              aria-label="Journey stages"
            >
              {progressLabels.map((label, i) => (
                <li key={label} className="flex items-center gap-2">
                  <span>{label}</span>
                  {i < progressLabels.length - 1 && (
                    <span aria-hidden className="text-primary/50">→</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Chapters — cosmic timeline */}
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/15 to-transparent md:left-1/2"
        />

        {journeyChapters.map((chapter, i) => {
          const alignRight = i % 2 === 1;
          return (
            <Section id={chapter.id} key={chapter.id} className="!py-14 md:!py-20">
              <div
                className={`relative grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-12 ${
                  alignRight ? "md:[&>*:first-child]:col-start-2" : ""
                }`}
              >
                {/* Node marker */}
                <span
                  aria-hidden
                  className="absolute -left-[6px] top-2 h-3 w-3 rounded-full bg-primary shadow-[0_0_18px_var(--aurora)] md:left-1/2 md:-translate-x-1/2"
                />

                <article
                  className={`glass rounded-2xl border border-white/10 p-6 md:p-8 anim-fade-up ${
                    alignRight ? "md:col-start-1 md:row-start-1" : ""
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span
                      className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary/80"
                    >
                      {chapter.eyebrow}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {chapter.index}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    {chapter.period}
                  </div>
                  <h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">
                    {chapter.title}
                  </h2>
                  {chapter.institution && (
                    <div className="mt-2 text-sm text-foreground/85">
                      {chapter.institution}
                    </div>
                  )}
                  {chapter.location && (
                    <div className="text-xs text-muted-foreground">
                      {chapter.location}
                    </div>
                  )}
                  <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {chapter.summary}
                  </p>

                  {chapter.achievements && (
                    <ul className="mt-5 space-y-2">
                      {chapter.achievements.map((a) => (
                        <li
                          key={a}
                          className="flex items-start gap-2 text-sm text-foreground/90"
                        >
                          <span
                            aria-hidden
                            className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-primary/80"
                          />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">
                      Scientific Development
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {chapter.development}
                    </p>
                  </div>
                </article>

                {/* Decorative counterpart */}
                <div
                  aria-hidden
                  className={`hidden md:block relative min-h-[220px] ${
                    alignRight ? "md:col-start-2 md:row-start-1" : ""
                  }`}
                >
                  <div className="absolute inset-4 rounded-3xl border border-white/5 bg-white/[0.02] overflow-hidden">
                    <div className="absolute inset-0 starfield opacity-50" />
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{
                        background: `radial-gradient(closest-side at 60% 40%, var(--${chapter.accent}) / 0.35, transparent 70%)`,
                      }}
                    />
                    <div
                      className="absolute right-8 top-1/2 -translate-y-1/2 h-24 w-24 rounded-full opacity-70 blur-2xl"
                      style={{ background: `var(--${chapter.accent})` }}
                    />
                  </div>
                </div>
              </div>
            </Section>
          );
        })}

        {/* Observing constellation */}
        <Section
          id="observing"
          eyebrow="Chapter Five"
          title="From Questions to Observations"
          intro="Learning to observe the universe across space and ground — from the Transiting Exoplanet Survey Satellite in orbit to the largest low-frequency radio array in Asia and premier Himalayan optical facilities."
        >
          <div className="grid gap-5 md:grid-cols-2">
            {observingConstellation.map((f) => (
              <article
                key={f.slug}
                className="glass group rounded-2xl border border-white/10 p-6 anim-fade-up"
                style={{ color: `var(--${f.accent})` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-display text-xl font-semibold text-foreground">
                      {f.shortName}
                    </div>
                    <div className="text-xs text-muted-foreground">{f.fullName}</div>
                  </div>
                  <div className="h-14 w-24 opacity-90 transition-opacity group-hover:opacity-100">
                    <FacilityMotif motif={f.motif} className="h-full w-full" />
                  </div>
                </div>
                <div className="mt-4 text-[10px] uppercase tracking-[0.24em] text-primary/80">
                  {f.wavelength}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{f.role}</p>
              </article>
            ))}
          </div>
        </Section>

        {/* Methods ribbon */}
        <Section
          id="methods"
          eyebrow="Research Methods"
          title="Learning to Read a Star Across Wavelengths"
          intro="The academic journey matured into a coordinated observational methodology — every wavelength contributing a distinct piece of one physical picture."
        >
          <ol className="grid gap-3 md:grid-cols-3">
            {methodsRibbon.map((m, i) => (
              <li
                key={m.label}
                className="glass rounded-xl border border-white/10 p-5 anim-fade-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                  Method {String(i + 1).padStart(2, "0")}
                </div>
                <div className="mt-2 font-display text-lg font-semibold">{m.label}</div>
                <div className="mt-1 text-xs text-muted-foreground">{m.note}</div>
              </li>
            ))}
          </ol>
        </Section>

        {/* Where I am today */}
        <Section id="today" className="!pb-10">
          <div className="glass-strong rounded-3xl border border-white/10 p-8 md:p-12 relative overflow-hidden">
            <div
              aria-hidden
              className="absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-30 blur-3xl"
              style={{ background: "var(--aurora)" }}
            />
            <div className="text-[11px] uppercase tracking-[0.28em] text-primary/80">
              Where I Am Today
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
              {currentPosition.role} · {currentPosition.institution}
            </h2>
            <div className="mt-2 text-sm text-muted-foreground">
              {currentPosition.department} · Since {currentPosition.since}
            </div>
            <p className="mt-6 max-w-3xl text-sm text-muted-foreground md:text-base">
              {currentPosition.thesisStatus}
            </p>
          </div>
        </Section>

        {/* The journey continues */}
        <Section className="!pt-6">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 p-8 md:p-14 text-center">
            <div aria-hidden className="absolute inset-0 starfield opacity-60" />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, oklch(0.30 0.10 265 / 0.55), transparent 70%)",
              }}
            />
            <div className="relative">
              <div className="text-[11px] uppercase tracking-[0.28em] text-primary/80">
                Final Chapter
              </div>
              <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">
                The Journey Continues…
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-sm text-muted-foreground md:text-base">
                From investigating the magnetic lives of nearby low-mass stars
                to exploring wider questions in stellar evolution, exoplanet
                environments and time-domain astrophysics, this scientific
                journey continues — one observation, one analysis and one
                collaboration at a time.
              </p>
              <p className="mt-4 text-xs italic text-muted-foreground/80">
                There is always another question beyond the horizon.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/research"
                  className="inline-flex items-center gap-2 rounded-full bg-primary/90 px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary transition-colors"
                >
                  Explore My Research
                </Link>
                <Link
                  to="/publications"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-white/5 transition-colors"
                >
                  View Publications
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
