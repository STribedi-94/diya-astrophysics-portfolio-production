import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Section, GlassPanel } from "@/components/layout/Page";
import { StatusBadge, SourceTag, RelatedLinks, ChronicleCard } from "@/components/chronicle/ChronicleCard";
import {
  chronicleBySlug,
  chronicleById,
  chronicleRecords,
  chronicleCitation,
  chronicleBibtex,
  neighbours,
  glossary,
  phaseForYear,
} from "@/data/chronicle";
import type { ChronicleRecord } from "@/data/chronicle";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { siteUrl } from "@/data/site";

type EntryLoaderData = {
  record: ChronicleRecord;
  previous?: ChronicleRecord;
  next?: ChronicleRecord;
};

export const Route = createFileRoute("/mission-log/$slug")({
  loader: ({ params }): EntryLoaderData => {
    const record = chronicleBySlug.get(params.slug);
    if (!record) throw notFound();
    return { record, ...neighbours(params.slug) };
  },

  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Chronicle entry unavailable — Diya Ram" }, { name: "robots", content: "noindex" }],
      };
    }
    const r = loaderData.record;
    const title = `${r.title} — Scientific Mission Log | Diya Ram`;
    const description = r.summary.slice(0, 155);
    const url = siteUrl(`/mission-log/${params.slug}`);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: r.title,
            description,
            datePublished: r.eventDate,
            url,
            author: { "@type": "Person", name: "Diya Ram" },
            about: r.researchTheme,
            isPartOf: { "@type": "CollectionPage", name: "Scientific Mission Log", url: siteUrl("/mission-log") },
          }),
        },
      ],
    };
  },
  component: ChronicleEntry,
  notFoundComponent: NotFoundEntry,
});

function NotFoundEntry() {
  return (
    <Section eyebrow="Scientific Mission Log" title="Chronicle entry not found">
      <GlassPanel>
        <p className="text-sm text-muted-foreground">
          This chronicle entry does not exist. It may have been renamed as the archive grew.
        </p>
        <div className="mt-4">
          <RelatedLinks links={[{ to: "/mission-log", label: "Return to the Scientific Mission Log" }]} />
        </div>
      </GlassPanel>
    </Section>
  );
}

function ChronicleEntry() {
  const { record, previous, next }: EntryLoaderData = Route.useLoaderData();
  const citation = chronicleCitation(record);
  const bibtex = chronicleBibtex(record);
  const phase = record.year ? phaseForYear(record.year) : undefined;
  const connected = (record.connections ?? [])
    .map((id) => chronicleById.get(id))
    .filter(Boolean);
  const sameCategory = chronicleRecords
    .filter((r) => r.category === record.category && r.id !== record.id)
    .slice(0, 3);
  const haystack = `${record.title} ${record.summary} ${(record.fullStory ?? []).join(" ")}`.toLowerCase();
  const seenDefinitions = new Set<string>();
  const terms = Object.entries(glossary).filter(([term, definition]) => {
    if (!haystack.includes(term.toLowerCase())) return false;
    if (seenDefinitions.has(definition)) return false;
    seenDefinitions.add(definition);
    return true;
  });

  return (
    <article>
      <header className="relative overflow-hidden pt-32 pb-12 md:pt-40 md:pb-16">
        <div className="absolute inset-0 bg-grad-hero opacity-70" aria-hidden />
        <div className="absolute inset-0 starfield anim-drift opacity-60" aria-hidden />
        <div className="container-page relative">
          <Link
            to="/mission-log"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.22em] text-primary/90 hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Scientific Mission Log
          </Link>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.24em] text-primary/80">{record.category}</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              {record.dateLabel}
            </span>
            <StatusBadge status={record.status} />
          </div>
          <h1 className="mt-4 max-w-4xl font-display text-3xl font-semibold leading-[1.1] md:text-5xl">
            {record.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">{record.summary}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <SourceTag label={record.sourceLabel} />
            {phase && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Career phase · {phase.label}
              </span>
            )}
          </div>
        </div>
      </header>

      <Section className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            {record.image && (
              <figure className="glass overflow-hidden rounded-2xl">
                <img
                  src={record.image}
                  alt={record.imageAlt ?? record.title}
                  loading="lazy"
                  decoding="async"
                  className={
                    record.imageOrientation === "portrait"
                      ? "mx-auto max-h-[640px] w-auto object-contain"
                      : "w-full object-cover"
                  }
                />
                {(record.imageCredit || record.imageAlt) && (
                  <figcaption className="px-5 py-3 text-[11px] text-muted-foreground">
                    {record.imageAlt} {record.imageCredit ? `— ${record.imageCredit}` : ""}
                  </figcaption>
                )}
              </figure>
            )}

            {record.fullStory?.map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}

            {record.plainLanguageSummary && (
              <GlassPanel>
                <h2 className="font-display text-lg font-semibold">In plain language</h2>
                <p className="mt-2 text-sm text-muted-foreground">{record.plainLanguageSummary}</p>
              </GlassPanel>
            )}

            {record.whyItMatters && (
              <GlassPanel>
                <h2 className="font-display text-lg font-semibold">Why this matters</h2>
                <p className="mt-2 text-sm text-muted-foreground">{record.whyItMatters}</p>
              </GlassPanel>
            )}

            {terms.length > 0 && (
              <GlassPanel>
                <h2 className="font-display text-lg font-semibold">Terms used here</h2>
                <dl className="mt-3 space-y-3">
                  {terms.map(([term, definition]) => (
                    <div key={term}>
                      <dt className="text-sm text-foreground">{term}</dt>
                      <dd className="text-sm text-muted-foreground">{definition}</dd>
                    </div>
                  ))}
                </dl>
              </GlassPanel>
            )}

            {(citation || bibtex) && (
              <GlassPanel>
                <h2 className="font-display text-lg font-semibold">Citation</h2>
                {citation && (
                  <p className="mt-2 text-sm text-muted-foreground">{citation}</p>
                )}
                {bibtex && (
                  <pre className="mt-4 overflow-x-auto rounded-xl bg-black/40 p-4 text-[11px] leading-relaxed text-muted-foreground">
                    {bibtex}
                  </pre>
                )}
              </GlassPanel>
            )}

            {connected.length > 0 && (
              <div>
                <h2 className="mb-3 font-display text-lg font-semibold">Connected records</h2>
                <ul className="glass divide-y divide-white/5 overflow-hidden rounded-2xl">
                  {connected.map((c) => (
                    <li key={c!.id}>
                      <Link
                        to="/mission-log/$slug"
                        params={{ slug: c!.slug }}
                        className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm hover:bg-white/5"
                      >
                        <span className="font-mono text-[11px] text-muted-foreground">{c!.dateLabel}</span>
                        <span className="flex-1 text-foreground">{c!.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ------------------------------------------------------ aside */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="glass rounded-2xl p-5">
              <h2 className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Record details</h2>
              <dl className="mt-3 space-y-3 text-sm">
                <Detail label="Date" value={record.dateLabel} />
                <Detail label="Status" value={record.status} />
                {record.institution && <Detail label="Institution" value={record.institution} />}
                {record.location && <Detail label="Location" value={record.location} />}
                {record.facility?.length ? (
                  <Detail label="Facilities & instruments" value={record.facility.join(" · ")} />
                ) : null}
                {record.researchTheme?.length ? (
                  <Detail label="Research themes" value={record.researchTheme.join(" · ")} />
                ) : null}
                {record.collaborators?.length ? (
                  <Detail label="Collaborators" value={record.collaborators.join(", ")} />
                ) : null}
                {record.doi && <Detail label="DOI" value={record.doi} />}
                {record.accessStatus && <Detail label="Access" value={record.accessStatus} />}
                <Detail label="Source" value={record.sourceLabel} />
              </dl>
              {record.officialExternalLink && (
                <a
                  href={record.officialExternalLink.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-foreground hover:bg-white/10"
                >
                  {record.officialExternalLink.label}
                  <ExternalLink className="h-3 w-3 text-primary" />
                </a>
              )}
            </div>

            <div className="glass rounded-2xl p-5">
              <h2 className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Explore further</h2>
              <div className="mt-3">
                <RelatedLinks links={record.related} />
              </div>
            </div>

            {record.tags.length > 0 && (
              <div className="glass rounded-2xl p-5">
                <h2 className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Tags</h2>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {record.tags.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-muted-foreground"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Section>

      {sameCategory.length > 0 && (
        <Section eyebrow="Continue reading" title={`More from ${record.category}`}>
          <div className="grid gap-5 md:grid-cols-3">
            {sameCategory.map((r) => (
              <ChronicleCard key={r.id} record={r} variant="compact" />
            ))}
          </div>
        </Section>
      )}

      <Section className="pt-0">
        <nav aria-label="Chronicle navigation" className="grid gap-4 md:grid-cols-2">
          {previous ? (
            <Link to="/mission-log/$slug" params={{ slug: previous.slug }} className="glass rounded-2xl p-5 hover:bg-white/5">
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                <ArrowLeft className="h-3 w-3" /> Later entry
              </span>
              <p className="mt-2 text-sm text-foreground">{previous.title}</p>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link
              to="/mission-log/$slug"
              params={{ slug: next.slug }}
              className="glass rounded-2xl p-5 text-right hover:bg-white/5"
            >
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Earlier entry <ArrowRight className="h-3 w-3" />
              </span>
              <p className="mt-2 text-sm text-foreground">{next.title}</p>
            </Link>
          )}
        </nav>
      </Section>
    </article>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
    </div>
  );
}