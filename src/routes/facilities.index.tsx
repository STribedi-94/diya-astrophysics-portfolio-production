import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section } from "@/components/layout/Page";
import { ResearchNavigator, ChapterFooterNav } from "@/components/research/ResearchNavigator";
import { facilities, facilityGroups, type Facility } from "@/data/facilities";
import { researchAreas } from "@/data/research";
import { projects } from "@/data/misc";
import { publicationsArchive } from "@/data/publications-archive";
import { ArrowRight, ExternalLink, Globe2, Radio, Satellite, Telescope } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/facilities/")({
  head: () => ({
    meta: [
      { title: "Research Facilities — Diya Ram" },
      {
        name: "description",
        content:
          "The observatory network powering Diya Ram's research: uGMRT, HCT, DOT and the TESS mission.",
      },
      { property: "og:title", content: "Research Facilities — Diya Ram" },
      {
        property: "og:description",
        content:
          "Ground-to-space telescope facilities across radio, optical, near-infrared and space photometry.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://astro-diya-portfolio.lovable.app/facilities" }],
  }),
  component: ResearchFacilitiesPage,
});

const sections = [
  { id: "network", label: "Network Overview" },
  { id: "radio", label: "Radio Observatories" },
  { id: "optical-nir", label: "Optical & NIR" },
  { id: "space-mission", label: "Space Missions" },
  { id: "onward", label: "Continue" },
];

function ResearchFacilitiesPage() {
  return (
    <>
      <ResearchNavigator chapterIndex={3} sections={sections} />

      <PageHero
        eyebrow="Chapter 04 · Observatory Network"
        title={
          <>
            From <span className="text-grad-accent">Earth to orbit</span> — the observatory network
          </>
        }
        intro="A verified atlas of the telescopes and space missions that power this research programme, from metre-wavelength radio interferometry to space-based photometry."
      >
        <div className="mt-6">
          <SpectrumAxis />
        </div>
      </PageHero>

      <Section id="network" eyebrow="Network" title="Ground-to-space observing capability"
        intro="Four verified facilities span three categories, each with a distinct scientific role in the M-dwarf activity programme.">
        <div className="grid gap-3 md:grid-cols-4">
          {facilities.map((f) => (
            <a
              key={f.id}
              href={`#${f.slug}`}
              className="glass group rounded-2xl border border-white/10 p-4 transition-colors hover:bg-white/5"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl font-semibold text-grad-accent">
                  {f.abbreviation}
                </span>
                <FacilityBadge f={f} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{f.location}</div>
              <div className="mt-1 text-xs text-primary/80">{f.band}</div>
            </a>
          ))}
        </div>
      </Section>

      {facilityGroups.map((g) => {
        const items = facilities.filter((f) => f.category === g.id);
        if (items.length === 0) return null;
        return (
          <Section
            key={g.id}
            id={g.id}
            eyebrow={g.label}
            title={g.label}
            intro={g.description}
            className="!pt-4"
          >
            <div className="space-y-6">
              {items.map((f) => (
                <FacilityProfile key={f.id} facility={f} />
              ))}
            </div>
          </Section>
        );
      })}

      <Section id="onward" className="pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          <OnwardLink to="/publications" label="Explore publications from these facilities" />
          <OnwardLink to="/academic-journey" label="See the academic journey behind this network" />
          <OnwardLink to="/contact" label="Collaboration and contact" />
        </div>
        <div className="mt-6 text-center">
          <Link
            to="/research-universe"
            className="glass inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            ← Return to Research Universe
          </Link>
        </div>
      </Section>

      <ChapterFooterNav chapterIndex={3} />
    </>
  );
}

function SpectrumAxis() {
  const stops = [
    { label: "Radio", sub: "decimetre λ (550–1460 MHz)", pos: 10, color: "var(--aurora)" },
    { label: "Optical", sub: "≈ 350–900 nm", pos: 58, color: "var(--electric)" },
    { label: "Near-Infrared", sub: "to ≈ 2.5 µm", pos: 88, color: "var(--magenta)" },
  ];
  return (
    <div className="glass max-w-2xl rounded-2xl border border-white/10 p-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.24em] text-primary/70">
          Combined wavelength coverage
        </div>
        <div className="text-[10px] text-muted-foreground">4 facilities</div>
      </div>
      <div
        className="relative mt-3 h-2 rounded-full bg-gradient-to-r from-[oklch(0.6_0.16_210)] via-[oklch(0.75_0.14_60)] to-[oklch(0.5_0.18_20)]"
        role="img"
        aria-label="Combined wavelength coverage across facilities: radio metre wavelengths, optical visible wavelengths, and near-infrared extending to approximately 2.5 micrometres."
      >
        {stops.map((s) => (
          <div
            key={s.label}
            className="absolute -top-1 h-4 w-1 rounded-full"
            style={{ left: `${s.pos}%`, background: s.color }}
            aria-hidden
          />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
        <div>
          <div className="text-foreground">Radio</div>
          <div className="text-[9px] opacity-80">metre λ · MHz</div>
        </div>
        <div className="text-center">
          <div className="text-foreground">Optical</div>
          <div className="text-[9px] opacity-80">visible · nm</div>
        </div>
        <div className="text-right">
          <div className="text-foreground">Near-Infrared</div>
          <div className="text-[9px] opacity-80">to ≈ 2.5 µm</div>
        </div>
      </div>
      <p className="sr-only">
        Radio metre wavelengths, through optical visible wavelengths, to near-infrared out to approximately 2.5 micrometres. Each facility covers a subset of this combined range.
      </p>
    </div>
  );
}

function FacilityBadge({ f }: { f: Facility }) {
  const Icon =
    f.category === "radio" ? Radio : f.category === "space-mission" ? Satellite : Telescope;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
      <Icon className="h-3 w-3" aria-hidden />
      {f.type === "space" ? "Space" : "Ground"}
    </span>
  );
}

function FacilityProfile({ facility: f }: { facility: Facility }) {
  const areas = researchAreas.filter((a) => f.relatedAreas.includes(a.slug));
  const projs = projects.filter((p) => f.relatedProjects.includes(p.slug));
  const pubs = publicationsArchive.filter((p) => f.relatedPublications.includes(p.slug));

  return (
    <article
      id={f.slug}
      className="glass overflow-hidden rounded-3xl border border-white/10 scroll-mt-24"
    >
      <div className="grid gap-6 p-6 md:grid-cols-[1fr_1.2fr] md:gap-8 md:p-8">
        {/* Left: identity & scene */}
        <div>
          <div className="flex items-center gap-3">
            <span className="font-display text-5xl font-semibold text-grad-accent">
              {f.abbreviation}
            </span>
            <FacilityBadge f={f} />
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold">{f.fullName}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe2 className="h-3.5 w-3.5" aria-hidden />
            {f.observatory} · {f.location}, {f.country}
          </div>
          <FacilityScene category={f.category} />
        </div>

        {/* Right: content */}
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">{f.purpose}</p>

          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <FacilityStat label="Band" value={f.band} />
            <FacilityStat label="Wavelength" value={f.wavelength} />
            <FacilityStat label="Aperture / Array" value={f.aperture} />
            <FacilityStat label="Type" value={f.type === "space" ? "Space-based" : "Ground-based"} />
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">
              Primary capability
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{f.capability}</p>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">
              Role in Diya Ram&apos;s research
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{f.role}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {areas.length > 0 && (
              <RelatedList label="Areas">
                {areas.map((a) => (
                  <Link
                    key={a.id}
                    to="/research/$slug"
                    params={{ slug: a.slug }}
                    className={chip}
                  >
                    {a.shortTitle}
                  </Link>
                ))}
              </RelatedList>
            )}
            {projs.length > 0 && (
              <RelatedList label="Projects">
                {projs.map((p) => (
                  <Link
                    key={p.id}
                    to="/projects/$slug"
                    params={{ slug: p.slug }}
                    className={chip}
                  >
                    {p.shortTitle}
                  </Link>
                ))}
              </RelatedList>
            )}
            {pubs.length > 0 && (
              <RelatedList label="Publications">
                {pubs.map((p) => (
                  <Link key={p.id} to="/publications" hash={`pub-${p.id}`} className={chip}>
                    {p.title.length > 42 ? p.title.slice(0, 40) + "…" : p.title}
                  </Link>
                ))}
              </RelatedList>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              to="/facilities/$slug"
              params={{ slug: f.slug }}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/25"
            >
              Full facility profile <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href={f.officialWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground hover:bg-white/10 hover:text-foreground"
              aria-label={`Visit official ${f.abbreviation} website at ${f.officialWebsiteLabel} (opens in new tab)`}
            >
              Official website · {f.officialWebsiteLabel} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

const chip =
  "rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-muted-foreground hover:text-foreground";

function FacilityStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
      <div className="text-[10px] uppercase tracking-[0.24em] text-primary/70">{label}</div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}

function RelatedList({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
      <div className="text-[10px] uppercase tracking-[0.24em] text-primary/70">{label}</div>
      <div className="mt-2 flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function OnwardLink({
  to,
  label,
}: {
  to: "/publications" | "/academic-journey" | "/contact";
  label: string;
}) {
  return (
    <Link
      to={to}
      className="glass flex items-center justify-between gap-3 rounded-2xl border border-white/10 p-4 hover:bg-white/5"
    >
      <span className="text-sm text-foreground">{label}</span>
      <ArrowRight className="h-4 w-4 text-primary" />
    </Link>
  );
}

/** Scientifically-suggestive scene per facility category — static SVG. */
function FacilityScene({ category }: { category: Facility["category"] }) {
  return (
    <div
      className={cn(
        "mt-4 h-40 overflow-hidden rounded-2xl border border-white/10",
        category === "space-mission"
          ? "bg-gradient-to-b from-[oklch(0.14_0.04_265)] to-black"
          : category === "radio"
            ? "bg-gradient-to-b from-[oklch(0.16_0.03_210)] to-black"
            : "bg-gradient-to-b from-[oklch(0.18_0.05_60)] to-black",
      )}
      aria-hidden
    >
      <svg viewBox="0 0 400 160" className="h-full w-full">
        {category === "radio" && (
          <>
            {/* Ground line */}
            <line x1="0" y1="130" x2="400" y2="130" stroke="oklch(0.4 0.02 200 / 0.6)" />
            {/* Dish silhouettes */}
            {[60, 160, 260, 360].map((x, i) => (
              <g key={x}>
                <path
                  d={`M${x - 20} 130 Q${x} ${100 - (i % 2) * 10} ${x + 20} 130`}
                  fill="none"
                  stroke="var(--aurora)"
                  strokeWidth="1.5"
                />
                <line x1={x} y1={110} x2={x} y2={130} stroke="var(--aurora)" />
              </g>
            ))}
            {/* Radio waves */}
            {[30, 55, 80].map((r) => (
              <circle
                key={r}
                cx="200"
                cy="40"
                r={r}
                fill="none"
                stroke="var(--aurora)"
                strokeOpacity={0.5 - r / 200}
              />
            ))}
          </>
        )}
        {category === "optical-nir" && (
          <>
            {/* Mountain */}
            <path d="M0 130 L120 60 L200 100 L280 40 L400 130 Z" fill="oklch(0.2 0.02 250)" />
            {/* Dome */}
            <ellipse cx="280" cy="45" rx="26" ry="18" fill="oklch(0.85 0.02 60 / 0.9)" />
            <rect x="254" y="45" width="52" height="18" fill="oklch(0.85 0.02 60 / 0.7)" />
            <line x1="280" y1="27" x2="280" y2="10" stroke="var(--electric)" strokeDasharray="3 3" />
            {/* Stars */}
            {[[30,20],[110,15],[350,25],[220,10]].map(([x,y],i)=>(
              <circle key={i} cx={x} cy={y} r="1.5" fill="white" opacity="0.8"/>
            ))}
          </>
        )}
        {category === "space-mission" && (
          <>
            {/* Earth arc */}
            <path
              d="M-40 200 A 260 260 0 0 1 440 200"
              fill="none"
              stroke="oklch(0.5 0.12 220 / 0.6)"
              strokeWidth="2"
            />
            {/* Orbit */}
            <ellipse
              cx="200"
              cy="80"
              rx="180"
              ry="40"
              fill="none"
              stroke="oklch(0.85 0.05 60 / 0.4)"
              strokeDasharray="3 6"
            />
            {/* Satellite */}
            <g transform="translate(320,70)">
              <rect x="-6" y="-6" width="12" height="12" fill="var(--electric)" />
              <rect x="-24" y="-3" width="14" height="6" fill="oklch(0.6 0.15 220)" />
              <rect x="10" y="-3" width="14" height="6" fill="oklch(0.6 0.15 220)" />
            </g>
            {/* Stars */}
            {[[40,20],[80,50],[300,20],[380,90]].map(([x,y],i)=>(
              <circle key={i} cx={x} cy={y} r="1.2" fill="white" opacity="0.8"/>
            ))}
          </>
        )}
      </svg>
    </div>
  );
}
