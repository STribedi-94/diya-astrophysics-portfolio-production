import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/layout/Page";
import { CosmicBackground } from "@/components/layout/CosmicBackground";
import { JourneyProgress } from "@/components/journey/JourneyProgress";
import { ChapterScene, FacilityScene } from "@/components/journey/ChapterScene";
import { CountUp } from "@/components/journey/CountUp";
import {
  journeyChapters,
  observingConstellation,
  methodsRibbon,
  currentPosition,
  thesisMilestone,
  chapterNav,
  progressLabels,
} from "@/data/journey";
import { profileSameAs } from "@/data/about";

const SITE_URL = "https://astro-diya-portfolio.lovable.app";
const CANONICAL = `${SITE_URL}/academic-journey`;

const chapterIds = chapterNav.map((c) => c.id);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Diya Ram",
  jobTitle: "Bridge Fellow, Observational Astrophysics",
  description:
    "Observational astrophysicist studying magnetic activity in nearby M-dwarf stars through multi-wavelength observations.",
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
      name: "S. N. Bose National Centre for Basic Sciences (University of Calcutta)",
    },
  ],
  sameAs: profileSameAs,
  url: CANONICAL,
};

export const Route = createFileRoute("/academic-journey")({
  head: () => ({
    meta: [
      {
        title:
          "Academic Journey of Diya Ram | Observational Astrophysicist",
      },
      {
        name: "description",
        content:
          "Explore the academic journey of observational astrophysicist Diya Ram, from physics and astrophysics training to CSIR-UGC NET qualification, doctoral research on M-dwarf magnetic activity, telescope programmes and her current Bridge Fellowship.",
      },
      {
        property: "og:title",
        content: "Academic Journey of Diya Ram | Observational Astrophysicist",
      },
      {
        property: "og:description",
        content:
          "A voyage through scientific time — from the foundations of physics to multi-wavelength investigations of magnetically active M-dwarf stars.",
      },
      { property: "og:type", content: "profile" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(jsonLd) },
    ],
  }),
  component: AcademicJourneyPage,
});

function AcademicJourneyPage() {
  return (
    <>
      <CosmicBackground />
      <JourneyProgress ids={chapterIds} />

      <HeroSection />

      {/* Chapters (1–4) */}
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/12 to-transparent md:left-1/2"
        />
        {journeyChapters.map((chapter, i) => (
          <ChapterSection key={chapter.id} chapter={chapter} alignRight={i % 2 === 1} />
        ))}
      </div>

      <ObservingSection />
      <MethodsSection />
      <ThesisSection />
      <TodaySection />
      <FinaleSection />
    </>
  );
}

/* ─── Hero ───────────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-40 md:pb-32">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Base deep-space gradient */}
        <div className="absolute inset-0 bg-grad-hero opacity-90" />
        {/* Nebula washes */}
        <div
          className="absolute -left-40 top-10 h-[560px] w-[720px] rounded-full blur-3xl opacity-60 anim-pulse-slow"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.55 0.22 300 / 0.6), transparent 70%)",
          }}
        />
        <div
          className="absolute right-[-10%] top-[20%] h-[520px] w-[640px] rounded-full blur-3xl opacity-55"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.65 0.20 28 / 0.45), transparent 70%)",
          }}
        />
        <div
          className="absolute left-1/3 bottom-[-15%] h-[540px] w-[640px] rounded-full blur-3xl opacity-50"
          style={{
            background:
              "radial-gradient(closest-side, oklch(0.70 0.13 195 / 0.35), transparent 70%)",
          }}
        />
        {/* Distant galaxy */}
        <svg
          className="absolute -right-8 top-14 h-[240px] w-[380px] opacity-70 anim-rotate-slow md:h-[320px] md:w-[520px]"
          viewBox="0 0 500 260"
          aria-hidden
        >
          <defs>
            <radialGradient id="hero-gal" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="oklch(0.96 0.04 260)" stopOpacity="0.9" />
              <stop offset="35%" stopColor="oklch(0.55 0.18 285)" stopOpacity="0.6" />
              <stop offset="100%" stopColor="oklch(0.08 0.04 265)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g transform="translate(250 130) rotate(-14)">
            <ellipse rx="220" ry="60" fill="url(#hero-gal)" />
            <ellipse rx="120" ry="26" fill="oklch(0.98 0.04 260)" opacity="0.65" />
            <ellipse rx="40" ry="12" fill="oklch(0.99 0.02 250)" />
          </g>
        </svg>
        {/* Star layers */}
        <div className="absolute inset-0 starfield anim-drift opacity-90" />
        <div className="absolute inset-0 starfield-sparse opacity-70" />
        {/* Journey path */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1200 700"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="hero-path" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="oklch(0.80 0.14 210)" stopOpacity="0" />
              <stop offset="45%" stopColor="oklch(0.80 0.14 210)" stopOpacity="0.55" />
              <stop offset="70%" stopColor="oklch(0.82 0.16 88)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="oklch(0.65 0.20 28)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M -20 620 Q 260 500 500 520 T 900 380 T 1240 260"
            fill="none"
            stroke="url(#hero-path)"
            strokeWidth="1.6"
            className="anim-draw"
            style={{ animationDuration: "4s" }}
          />
        </svg>
        {/* Bottom text scrim */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[oklch(0.06_0.03_265/0.75)] via-[oklch(0.06_0.03_265/0.35)] to-transparent" />
      </div>

      <div className="container-page relative">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-primary/90">
          <span className="h-1.5 w-1.5 rounded-full bg-primary anim-pulse-slow" />
          Academic Journey · A Voyage Through Scientific Time
        </div>
        <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
          The Making of an{" "}
          <span className="text-grad-accent">Observational Astrophysicist</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
          From the foundations of physics to multi-wavelength investigations of
          magnetically active M-dwarf stars, this journey traces the questions,
          training, observations and discoveries that shaped Diya Ram's
          scientific path.
        </p>
        <p className="mt-3 max-w-2xl text-sm italic text-muted-foreground/80">
          Every scientific journey begins with a question — and grows through
          curiosity, discipline, observation and persistence.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#foundation"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("foundation")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center gap-2 rounded-full bg-primary/90 px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary transition-colors"
          >
            Begin the Journey
            <span aria-hidden>↓</span>
          </a>
          <Link
            to="/research"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-white/5 transition-colors"
          >
            View Current Research
          </Link>
        </div>

        <ol
          className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] uppercase tracking-[0.24em] text-muted-foreground/80"
          aria-label="Journey stages"
        >
          {progressLabels.map((label, i) => (
            <li key={label} className="flex items-center gap-3">
              <span>{label}</span>
              {i < progressLabels.length - 1 && (
                <span aria-hidden className="text-primary/50">→</span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ─── Chapter section (1–4) ─────────────────────────────────────────── */
function ChapterSection({
  chapter,
  alignRight,
}: {
  chapter: (typeof journeyChapters)[number];
  alignRight: boolean;
}) {
  return (
    <Section id={chapter.id} className="!py-14 md:!py-24">
      <div
        className={`relative grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 ${
          alignRight ? "md:[&>*:first-child]:col-start-2" : ""
        }`}
      >
        <span
          aria-hidden
          className="absolute -left-[6px] top-3 h-3 w-3 rounded-full bg-primary shadow-[0_0_18px_var(--spectral-cyan)] md:left-1/2 md:-translate-x-1/2"
        />

        {/* Card */}
        <article
          className={`glass rounded-2xl border border-white/10 p-6 md:p-8 anim-fade-up ${
            alignRight ? "md:col-start-1 md:row-start-1" : ""
          }`}
        >
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary/80">
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
            <div className="text-xs text-muted-foreground">{chapter.location}</div>
          )}
          {chapter.supervisor && (
            <div className="mt-1 text-xs text-muted-foreground">
              Supervisor · {chapter.supervisor}
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
                    className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full"
                    style={{ background: `var(--${chapter.accent})` }}
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

        {/* Scene */}
        <div
          className={`relative min-h-[280px] md:min-h-[420px] ${
            alignRight ? "md:col-start-2 md:row-start-1" : ""
          }`}
        >
          <div className="absolute inset-0 rounded-3xl border border-white/10 shadow-panel">
            <ChapterScene name={chapter.scene} />
            {chapter.scene === "mdwarf" && (
              <div className="absolute bottom-3 right-4 text-[9px] uppercase tracking-[0.22em] text-white/50">
                Scientific visualisation · Not to physical scale
              </div>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── Observing constellation ──────────────────────────────────────── */
function ObservingSection() {
  return (
    <Section
      id="observing"
      eyebrow="Chapter Five · Observing"
      title="From Questions to Observations"
      intro="The doctoral journey expanded from analysing space-based photometry to designing and leading observations at major optical, near-infrared and radio facilities."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {observingConstellation.map((f) => (
          <article
            key={f.slug}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] anim-fade-up"
          >
            <div className="relative h-40 md:h-48">
              <FacilityScene name={f.scene} />
            </div>
            <div className="p-6">
              <div className="flex items-baseline justify-between gap-4">
                <div>
                  <div className="font-display text-xl font-semibold">
                    {f.shortName}
                  </div>
                  <div className="text-xs text-muted-foreground">{f.fullName}</div>
                </div>
                {f.totalValue > 0 ? (
                  <div className="text-right">
                    <div
                      className="font-display text-2xl font-semibold"
                      style={{ color: `var(--${f.accent})` }}
                    >
                      <CountUp value={f.totalValue} />
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      {f.totalUnit}
                    </div>
                  </div>
                ) : null}
              </div>
              <div
                className="mt-3 text-[10px] uppercase tracking-[0.22em]"
                style={{ color: `var(--${f.accent})` }}
              >
                {f.wavelength}
              </div>
              <ul className="mt-3 space-y-1.5">
                {f.role.map((r) => (
                  <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span
                      aria-hidden
                      className="mt-1.5 h-1 w-1 flex-none rounded-full"
                      style={{ background: `var(--${f.accent})` }}
                    />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <Link
                  to={f.href}
                  className="inline-flex items-center gap-2 text-sm text-foreground/90 hover:text-foreground"
                >
                  Explore facility
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-6 text-xs text-muted-foreground/70">
        Verified observing totals as recorded in the PI observing programmes.
      </p>
    </Section>
  );
}

/* ─── Methods (wavelengths) ────────────────────────────────────────── */
function MethodsSection() {
  return (
    <Section
      id="methods"
      eyebrow="Wavelengths · Methods"
      title="Learning to Read a Star Across Wavelengths"
      intro="Each observational method reveals a different layer of stellar behaviour. Combined, they form a more complete physical picture."
    >
      <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {methodsRibbon.map((m, i) => (
          <li
            key={m.code}
            className="group relative overflow-hidden rounded-2xl border border-white/10 p-6 anim-fade-up"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.16 0.05 265 / 0.7), oklch(0.10 0.04 265 / 0.7))",
              animationDelay: `${i * 0.06}s`,
            }}
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-[2px] opacity-70"
              style={{ background: `var(--${m.accent})` }}
            />
            <div className="flex items-baseline justify-between">
              <div
                className="font-mono text-[10px] uppercase tracking-[0.24em]"
                style={{ color: `var(--${m.accent})` }}
              >
                Method {m.code}
              </div>
              <span
                aria-hidden
                className="h-2 w-2 rounded-full"
                style={{ background: `var(--${m.accent})` }}
              />
            </div>
            <div className="mt-3 font-display text-lg font-semibold">
              {m.label}
            </div>
            <ul className="mt-3 space-y-1.5">
              {m.detail.map((d) => (
                <li
                  key={d}
                  className="text-xs text-muted-foreground before:mr-2 before:content-['·']"
                >
                  {d}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ─── Thesis milestone ─────────────────────────────────────────────── */
function ThesisSection() {
  return (
    <Section id="thesis" className="!py-16 md:!py-24">
      <div className="relative overflow-hidden rounded-3xl border border-white/10">
        <div className="relative h-56 md:h-72">
          <ChapterScene name="thesis" />
        </div>
        <div className="relative p-6 md:p-10">
          <div className="text-[11px] uppercase tracking-[0.28em] text-primary/90">
            {thesisMilestone.eyebrow} · {thesisMilestone.submitted}
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
            {thesisMilestone.title}
          </h2>
          <dl className="mt-5 grid gap-x-8 gap-y-2 text-sm md:grid-cols-2">
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Author</dt>
              <dd className="text-foreground/90">{thesisMilestone.author}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Supervisor</dt>
              <dd className="text-foreground/90">{thesisMilestone.supervisor}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">Institution</dt>
              <dd className="text-foreground/90">{thesisMilestone.institution}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-muted-foreground">University</dt>
              <dd className="text-foreground/90">{thesisMilestone.university}</dd>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <dt className="text-muted-foreground">Programme</dt>
              <dd className="text-foreground/90">{thesisMilestone.programme}</dd>
            </div>
          </dl>
          <p className="mt-5 max-w-3xl text-sm text-muted-foreground md:text-base">
            {thesisMilestone.description}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {thesisMilestone.themes.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-foreground/80"
              >
                {t}
              </span>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {thesisMilestone.targets.map((t) => (
              <span
                key={t}
                className="rounded-full px-3 py-1 text-xs"
                style={{
                  background: "oklch(0.65 0.20 28 / 0.15)",
                  color: "oklch(0.85 0.14 40)",
                  border: "1px solid oklch(0.65 0.20 28 / 0.35)",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <div
            className="mt-6 rounded-xl border p-4 text-sm"
            style={{
              borderColor: "oklch(0.80 0.14 210 / 0.35)",
              background: "oklch(0.80 0.14 210 / 0.06)",
            }}
          >
            {thesisMilestone.status}
          </div>

          <div className="mt-6">
            <Link
              to="/research"
              className="inline-flex items-center gap-2 rounded-full bg-primary/90 px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary transition-colors"
            >
              Explore Thesis Research
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── Where I am today ──────────────────────────────────────────────── */
function TodaySection() {
  return (
    <Section id="today" className="!py-14 md:!py-20">
      <div className="relative overflow-hidden rounded-3xl border border-white/10">
        <div className="absolute inset-0">
          <ChapterScene name="horizon" />
        </div>
        <div className="relative p-8 md:p-12">
          <div className="text-[11px] uppercase tracking-[0.28em] text-primary/90">
            Current Scientific Chapter
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-4xl">
            {currentPosition.role} ·{" "}
            <span className="text-grad-accent">{currentPosition.institution}</span>
          </h2>
          <div className="mt-2 text-sm text-muted-foreground">
            {currentPosition.department} · {currentPosition.since} – Present
          </div>
          <p className="mt-5 max-w-3xl text-sm text-muted-foreground md:text-base">
            {currentPosition.narrative}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {currentPosition.directions.map((d) => (
              <span
                key={d}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-foreground/85"
              >
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── Final ─────────────────────────────────────────────────────────── */
function FinaleSection() {
  return (
    <Section className="!pt-6 !pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 p-8 md:p-14 text-center">
        <div className="absolute inset-0">
          <ChapterScene name="horizon" />
        </div>
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, oklch(0.10 0.04 265 / 0.35), oklch(0.06 0.03 265 / 0.75) 75%)",
          }}
        />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-[0.28em] text-primary/90">
            Final Chapter
          </div>
          <h2 className="mt-3 font-display text-3xl font-semibold md:text-5xl">
            The Journey Continues
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm text-muted-foreground md:text-base">
            From the foundations of physics to multi-wavelength investigations
            of nearby M dwarfs, each stage of this journey has opened a new
            scientific question. The next chapter continues through
            observation, analysis and collaboration.
          </p>
          <p className="mt-4 text-xs italic text-muted-foreground/80">
            There is always another question beyond the horizon.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/research"
              className="inline-flex items-center gap-2 rounded-full bg-primary/90 px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary transition-colors"
            >
              Explore Research
            </Link>
            <Link
              to="/publications"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-white/5 transition-colors"
            >
              View Publications
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-foreground hover:bg-white/5 transition-colors"
            >
              Contact Diya
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}
