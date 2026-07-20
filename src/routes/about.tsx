import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ExternalLink,
  ArrowRight,
  ChevronDown,
  Download,
  BookOpen,
} from "lucide-react";
import { Section, GlassPanel } from "@/components/layout/Page";
import diyaPortrait from "@/assets/diya-ram-portrait.png.asset.json";
import { SpectralDivider } from "@/components/layout/SpectralDivider";
import {
  aboutIdentity,
  aboutSections,
  activityIndicators,
  acceptedManuscript,
  audiencePathways,
  biography,
  contributions,
  credentialRail,
  currentQuestions,
  cvDownloadUrl,
  facilityAllocations,
  milestones,
  profileLinks,
  researchThemes,
  selectedOutputs,
  snapshotPanels,
  thesis,
  toolkitGroups,
} from "@/data/about";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Diya Ram | Observational Astrophysicist" },
      {
        name: "description",
        content:
          "Diya Ram is an observational astrophysicist studying magnetic activity in M-dwarf stars through TESS photometry, optical and near-infrared spectroscopy, and uGMRT low-frequency radio observations.",
      },
      { property: "og:title", content: "Diya Ram — Observational Astrophysicist" },
      {
        property: "og:description",
        content:
          "Bridge Fellow at the S. N. Bose National Centre for Basic Sciences. Multi-wavelength research on M-dwarf magnetic activity and exoplanetary environments.",
      },
      { property: "og:type", content: "profile" },
      {
        property: "og:url",
        content: "https://astro-diya-portfolio.lovable.app/about",
      },
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
      {
        property: "og:image",
        content: `https://astro-diya-portfolio.lovable.app${diyaPortrait.url}`,
      },
      {
        name: "twitter:image",
        content: `https://astro-diya-portfolio.lovable.app${diyaPortrait.url}`,
      },
      {
        property: "og:image:alt",
        content: "Portrait of Diya Ram, observational astrophysicist.",
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
          alumniOf: [
            {
              "@type": "CollegeOrUniversity",
              name: "St. Xavier's College, Kolkata (University of Calcutta)",
            },
            {
              "@type": "CollegeOrUniversity",
              name: "Bangabasi Morning College (University of Calcutta)",
            },
          ],
          identifier: {
            "@type": "PropertyValue",
            propertyID: "ORCID",
            value: "0009-0008-7884-3741",
            url: "https://orcid.org/0009-0008-7884-3741",
          },
          sameAs: [
            "https://orcid.org/0009-0008-7884-3741",
            "https://ui.adsabs.harvard.edu/search/q=author%3A%22ram%2Cdiya%22&sort=date%20desc",
            "https://scholar.google.com/scholar?q=Diya+Ram",
            "https://www.researchgate.net/profile/Diya-Ram-2",
            "https://www.linkedin.com/in/diya-ram-638854172/",
          ],
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
/* Local presentational primitives                                     */
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
      rel="noopener noreferrer me"
      aria-label={ariaLabel}
      title={label}
      className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
    >
      {label}
      <ExternalLink className="h-3 w-3 opacity-70 transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

/* --- Sticky "On this page" navigation ----------------------------- */

function OnThisPage() {
  const [active, setActive] = useState<string>(aboutSections[0].id);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = aboutSections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop,
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* Desktop rail */}
      <nav
        aria-label="On this page"
        className="pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 xl:block"
      >
        <div className="pointer-events-auto glass rounded-2xl border border-white/10 p-3">
          <div className="mb-2 px-2 font-mono text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground/70">
            On this page
          </div>
          <ul className="space-y-0.5">
            {aboutSections.map((s) => {
              const isActive = active === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`block rounded-lg px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                      isActive
                        ? "bg-primary/15 text-foreground"
                        : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile / tablet horizontal strip */}
      <div className="sticky top-16 z-20 -mx-4 mb-6 border-y border-white/5 bg-[oklch(0.08_0.03_265_/_0.85)] backdrop-blur xl:hidden">
        <nav
          aria-label="On this page"
          className="scrollbar-none flex gap-1 overflow-x-auto px-4 py-2"
        >
          {aboutSections.map((s) => {
            const isActive = active === s.id;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`whitespace-nowrap rounded-full border px-3 py-1 text-[11px] transition-colors ${
                  isActive
                    ? "border-primary/40 bg-primary/15 text-foreground"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground"
                }`}
              >
                {s.label}
              </a>
            );
          })}
        </nav>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

function About() {
  return (
    <>
      <OnThisPage />

      {/* ================= 1. PROFILE HERO ================= */}
      <section
        id="profile"
        className="relative overflow-hidden pt-28 md:min-h-[92vh] md:pt-36 md:pb-16"
        aria-labelledby="about-heading"
      >
        <div className="absolute inset-0 bg-grad-hero opacity-85" aria-hidden />
        <div className="absolute inset-0 starfield anim-drift opacity-70" aria-hidden />
        <div className="absolute inset-0 grid-cosmic opacity-25" aria-hidden />
        <div
          className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[960px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, var(--nebula), transparent 70%)",
          }}
          aria-hidden
        />
        {/* Bottom fade so portrait & hero blend into next section */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[oklch(0.08_0.03_265)]"
          aria-hidden
        />

        <div className="container-page relative grid items-center gap-10 pb-16 md:grid-cols-[1.1fr_0.9fr] md:gap-14 md:pb-0">
          {/* Left: identity */}
          <div>
            <Eyebrow>{aboutIdentity.eyebrow}</Eyebrow>
            <h1
              id="about-heading"
              className="mt-5 font-display text-4xl font-semibold leading-[1.05] md:text-6xl"
            >
              {aboutIdentity.headline}
            </h1>
            <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.22em] text-primary/80">
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
                Explore Research
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
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm text-foreground transition-all hover:border-white/30 hover:bg-white/[0.08]"
              >
                Academic Journey
              </Link>
              <a
                href={cvDownloadUrl}
                download="Diya-Ram-CV.pdf"
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm text-foreground transition-all hover:border-primary/50 hover:bg-primary/20"
              >
                <Download className="h-4 w-4" />
                Download CV
              </a>
            </div>

            {profileLinks.length > 0 && (
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
            )}
          </div>

          {/* Right: portrait — premium frame, taller crop, deep halo */}
          <div className="relative">
            <div className="relative mx-auto w-full max-w-[440px]">
              {/* Multi-layer halo */}
              <div
                className="pointer-events-none absolute -inset-16 rounded-full opacity-70 blur-3xl anim-pulse-slow"
                style={{
                  background:
                    "radial-gradient(closest-side, oklch(0.55 0.18 285 / 0.55), oklch(0.45 0.16 25 / 0.28) 55%, transparent 78%)",
                }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -inset-4 rounded-[2rem] opacity-40 blur-2xl"
                style={{
                  background:
                    "radial-gradient(closest-side, var(--mdwarf), transparent 70%)",
                }}
                aria-hidden
              />

              {/* Frame */}
              <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[oklch(0.08_0.03_265_/_0.55)] p-1.5 backdrop-blur-md shadow-[0_30px_80px_-30px_oklch(0.05_0.02_265_/_0.9)]">
                <div
                  className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-60"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.85 0.10 240 / 0.35), transparent 40%, transparent 60%, oklch(0.85 0.14 320 / 0.30))",
                    WebkitMask:
                      "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                    WebkitMaskComposite: "xor",
                    padding: "1px",
                  }}
                  aria-hidden
                />
                <div className="relative overflow-hidden rounded-[1.65rem] bg-[oklch(0.06_0.03_265)]">
                  {/* Subtle starfield behind portrait */}
                  <div
                    className="absolute inset-0 starfield-sparse opacity-40"
                    aria-hidden
                  />
                  {/* Aspect ratio holder — taller portrait crop */}
                  <div className="relative aspect-[4/5]">
                    <img
                      src={diyaPortrait.url}
                      alt="Portrait of Diya Ram, observational astrophysicist and Bridge Fellow at S. N. Bose National Centre for Basic Sciences."
                      loading="eager"
                      decoding="async"
                      className="absolute inset-0 h-full w-full select-none object-cover object-[50%_20%]"
                      style={{
                        filter:
                          "drop-shadow(0 8px 24px oklch(0.05 0.02 265 / 0.55))",
                      }}
                    />
                    {/* Lower-edge fade blending into page */}
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[oklch(0.06_0.03_265)]"
                      aria-hidden
                    />
                  </div>
                </div>
              </div>

              {/* Caption */}
              <figcaption className="mt-4 text-center">
                <div className="font-display text-sm text-foreground/90">
                  Diya Ram · Observational Astrophysicist
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                  Bridge Fellow · S. N. Bose National Centre
                </div>
              </figcaption>
            </div>
          </div>
        </div>
      </section>

      <SpectralDivider />

      {/* ================= 2. BIOGRAPHY ================= */}
      <Section id="biography" eyebrow="Biography" title="A Scientific Portrait">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-5 text-base leading-relaxed text-foreground/85 md:text-lg">
            {biography.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <aside>
            <GlassPanel>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                Credentials at a glance
              </div>
              <dl className="mt-5 space-y-4">
                {credentialRail.map((c) => (
                  <div key={c.label}>
                    <dt className="text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground/70">
                      {c.label}
                    </dt>
                    <dd className="mt-0.5 text-sm text-foreground/90">
                      {c.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </GlassPanel>
          </aside>
        </div>
      </Section>

      {/* ================= 3. WHY THIS RESEARCH MATTERS ================= */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-[oklch(0.08_0.03_265)]" aria-hidden />
        <div className="absolute inset-0 starfield opacity-40" aria-hidden />
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-[440px] max-w-5xl -translate-y-1/2 rounded-[50%] opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, var(--nebula), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="container-page relative max-w-3xl">
          <Eyebrow>Why this research matters</Eyebrow>
          <h2 className="mt-5 font-display text-3xl font-semibold leading-tight md:text-4xl">
            The Magnetic Lives of the Galaxy's Smallest Stars
          </h2>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            <p>
              M dwarfs are among the most abundant stars in the Milky Way, and
              many of them host the planetary systems we can most readily
              observe. Their small sizes and long lifetimes make them central
              targets in the search for nearby planets — but their magnetic
              behaviour can be intense and long-lived.
            </p>
            <p>
              Starspots reshape stellar light curves, flares release bursts of
              radiation, chromospheric emission traces the response of the
              upper atmosphere, and low-frequency radio emission can reveal
              magnetic processes invisible at other wavelengths. Each window
              alone is incomplete; combined, they begin to describe a
              consistent physical picture.
            </p>
            <p>
              How magnetic activity in a host star may influence the
              atmospheres, habitability and long-term evolution of its
              planets remains an active area of research — and one of the
              scientific motivations behind Diya's observational programme.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 4. RESEARCH IDENTITY ================= */}
      <Section
        id="research"
        eyebrow="Research identity"
        title="Six Themes, One Programme"
        intro="Diya's research organises around six interconnected themes, each anchored in observation and reduction from a specific instrument family."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {researchThemes.map((t) => (
            <Link
              key={t.slug}
              to="/research/$slug"
              params={{ slug: t.slug }}
              className="group glass flex h-full flex-col rounded-2xl border border-white/10 p-6 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_10px_40px_-20px_var(--mdwarf)]"
            >
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: `var(--${t.accent})` }}
                  aria-hidden
                />
                {t.method}
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold leading-snug">
                {t.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                {t.summary}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-primary/90">
                Read more
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* ================= 5. CURRENT QUESTIONS ================= */}
      <Section
        id="questions"
        eyebrow="Open scientific questions"
        title="Questions Guiding the Current Programme"
      >
        <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:overflow-visible md:px-0 xl:grid-cols-3">
          {currentQuestions.map((q, i) => (
            <article
              key={i}
              className="glass min-w-[82%] snap-start rounded-2xl border border-white/10 p-6 md:min-w-0"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                Question {String(i + 1).padStart(2, "0")}
              </div>
              <p className="mt-3 text-base leading-relaxed text-foreground/90">
                {q}
              </p>
            </article>
          ))}
        </div>
      </Section>

      {/* ================= 6. METHODS & TOOLKIT ================= */}
      <Section
        id="methods"
        eyebrow="Methods, datasets & toolkit"
        title="How the Data Becomes Science"
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
          <GlassPanel className="h-full">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
              Computational Toolkit
            </div>
            <div className="mt-4 space-y-2">
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

      {/* ================= 7. PI FACILITIES ================= */}
      <Section
        id="facilities"
        eyebrow="Principal Investigator experience"
        title="From Scientific Question to Telescope Proposal"
        intro="Across multiple observing cycles, Diya has been awarded optical and radio telescope time as Principal Investigator for programmes on M-dwarf magnetic activity."
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
                {/* Facility image with credit overlay */}
                <figure className="relative min-h-[240px] overflow-hidden md:min-h-[340px]">
                  <img
                    src={f.image}
                    alt={`Artistic visualisation of ${f.fullName} (${f.shortName}) at ${f.location}.`}
                    loading="lazy"
                    width={1280}
                    height={800}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[oklch(0.06_0.03_265_/_0.75)] via-transparent to-transparent"
                    aria-hidden
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
                    <div>
                      <div className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/70">
                        {f.observatory} · {f.location}
                      </div>
                      <div className="mt-1 font-display text-3xl font-bold text-white md:text-4xl">
                        {f.shortName}
                      </div>
                    </div>
                    <div className="text-right font-mono text-[9px] uppercase tracking-[0.18em] text-white/55">
                      {f.imageCredit}
                    </div>
                  </figcaption>
                </figure>

                {/* Content */}
                <div className="p-6 md:p-8">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                    {f.fullName}
                  </div>
                  <div className="mt-3 font-display text-2xl font-semibold">
                    {f.allocation}
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      {f.allocationDetail}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{f.role}</p>

                  <div className="mt-5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                      Proposal codes ({f.proposalCodes.length})
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {f.proposalCodes.map((c) => (
                        <span
                          key={c}
                          className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[11px] text-foreground/85"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <Link
                      to="/facilities/$slug"
                      params={{ slug: f.slug }}
                      className="group inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary"
                    >
                      {f.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                    <a
                      href={f.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
                      aria-label={`Official ${f.shortName} website (opens in new tab)`}
                    >
                      Official website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* ================= 8. THESIS SPOTLIGHT ================= */}
      <section
        id="thesis"
        className="relative overflow-hidden py-20 md:py-28"
        aria-labelledby="thesis-heading"
      >
        <div className="absolute inset-0 bg-grad-hero opacity-70" aria-hidden />
        <div className="absolute inset-0 starfield-sparse opacity-40" aria-hidden />
        <div
          className="pointer-events-none absolute -top-32 right-0 h-[420px] w-[720px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, var(--uv-violet), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="container-page relative grid items-start gap-10 md:grid-cols-[0.85fr_1.15fr]">
          {/* Thesis cover-inspired panel */}
          <div className="relative">
            <div
              className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/15 shadow-[0_30px_80px_-30px_oklch(0.05_0.02_265_/_0.9)]"
              style={{
                background:
                  "linear-gradient(160deg, oklch(0.14 0.06 265) 0%, oklch(0.10 0.05 285) 45%, oklch(0.16 0.10 25) 100%)",
              }}
            >
              <div className="absolute inset-0 starfield opacity-50" aria-hidden />
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-60 blur-2xl"
                style={{
                  background:
                    "radial-gradient(closest-side, var(--mdwarf), transparent 70%)",
                }}
                aria-hidden
              />
              <div className="relative flex h-full flex-col justify-between p-6">
                <div>
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.24em] text-white/60">
                    PhD Thesis · 2026
                  </div>
                  <div className="mt-6 font-display text-2xl font-semibold leading-snug text-white md:text-3xl">
                    {thesis.title}
                  </div>
                  <div className="mt-3 text-xs text-white/70">
                    {thesis.degree}
                  </div>
                </div>
                <div className="text-xs text-white/70">
                  <div className="font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/50">
                    Author
                  </div>
                  <div className="mt-1">{thesis.author}</div>
                  <div className="mt-3 font-mono text-[9.5px] uppercase tracking-[0.22em] text-white/50">
                    {thesis.department}
                  </div>
                  <div className="mt-1">{thesis.university}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Eyebrow>PhD thesis spotlight</Eyebrow>
            <h2
              id="thesis-heading"
              className="mt-4 font-display text-3xl font-semibold leading-tight md:text-4xl"
            >
              {thesis.title}
            </h2>
            <div className="mt-3 grid gap-x-6 gap-y-1 text-sm text-muted-foreground sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground/60">Supervisor · </span>
                {thesis.supervisor}
              </div>
              <div>
                <span className="text-muted-foreground/60">Institution · </span>
                {thesis.institution}
              </div>
              <div>
                <span className="text-muted-foreground/60">University · </span>
                {thesis.university}
              </div>
              <div>
                <span className="text-muted-foreground/60">Submitted · </span>
                {thesis.submitted}
              </div>
            </div>
            <p className="mt-5 text-base leading-relaxed text-foreground/85">
              {thesis.overview}
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                  Stellar targets
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {thesis.targets.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-foreground/85"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                  Facilities & datasets
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {thesis.facilities.map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-foreground/85"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <details className="group mt-5 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-foreground/85">
                <span>Thesis chapter structure</span>
                <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
              </summary>
              <ol className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {thesis.chapters.map((c, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/70">
                      Ch {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{c}</span>
                  </li>
                ))}
              </ol>
            </details>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/research"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                <BookOpen className="h-4 w-4" />
                Explore Thesis Research
              </Link>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                {thesis.status}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 9. ACADEMIC TRAJECTORY ================= */}
      <Section
        id="journey"
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
              <div className="mt-1 font-display text-lg font-semibold">
                {m.title}
              </div>
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

      {/* ================= 10. SELECTED PUBLICATIONS ================= */}
      <Section
        id="publications"
        eyebrow="Selected scholarly contributions"
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
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                {p.context}
              </p>
              <div className="mt-4 text-[11px] text-muted-foreground/80">
                {p.volume}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary/90">
                  {p.role}
                </span>
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
              {acceptedManuscript.status}
            </div>
            <h3 className="mt-3 font-display text-base font-semibold leading-snug">
              {acceptedManuscript.title}
            </h3>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">
              {acceptedManuscript.note}
            </p>
            <div className="mt-4 inline-flex items-center gap-2">
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] text-primary/90">
                First author
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted-foreground">
                Accepted manuscript
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

      {/* ================= 11. RESEARCH METRICS ================= */}
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

      {/* ================= 12. TEACHING & SERVICE ================= */}
      <Section
        id="teaching"
        eyebrow="Beyond research outputs"
        title="Teaching, Mentorship and Professional Service"
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

      {/* ================= 13. COLLABORATION ================= */}
      <section
        id="collaboration"
        className="relative overflow-hidden py-24 md:py-32"
      >
        <div className="absolute inset-0 bg-grad-hero opacity-70" aria-hidden />
        <div className="absolute inset-0 starfield-sparse opacity-50" aria-hidden />
        <div
          className="pointer-events-none absolute -bottom-40 right-0 h-[420px] w-[720px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, var(--mdwarf), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="container-page relative max-w-3xl">
          <Eyebrow>Collaboration</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight md:text-4xl">
            Building a Multi-Wavelength View of Active Small Stars
          </h2>
          <p className="mt-5 text-base text-muted-foreground md:text-lg">
            Diya welcomes conversations around M-dwarf magnetic activity,
            stellar flares, optical spectroscopy, radio astronomy, time-domain
            surveys, exoplanet environments and collaborative observing
            programmes.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/publications"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm text-foreground transition-all hover:border-white/30 hover:bg-white/[0.08]"
            >
              Explore Publications
            </Link>
            <Link
              to="/research"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm text-foreground transition-all hover:border-white/30 hover:bg-white/[0.08]"
            >
              View Research Areas
            </Link>
            <Link
              to="/academic-journey"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm text-foreground transition-all hover:border-white/30 hover:bg-white/[0.08]"
            >
              Academic Journey
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
            >
              Contact Diya
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 14. AUDIENCE PATHWAYS ================= */}
      <Section title="Continue Exploring">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {audiencePathways.map((p) => (
            <GlassPanel key={p.title} className="flex h-full flex-col">
              <div className="font-display text-lg font-semibold">
                {p.title}
              </div>
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
