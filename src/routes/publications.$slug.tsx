import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";
import { publicationsArchive } from "@/data/publications-archive";
import { ExternalLink } from "lucide-react";

export const Route = createFileRoute("/publications/$slug")({
  head: ({ params }) => {
    const p = publicationsArchive.find((x) => x.slug === params.slug);
    const title = p ? `${p.title} — Diya Ram` : "Publication — Diya Ram";
    const description = p?.shortSummary ?? "Peer-reviewed publication record.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  loader: ({ params }) => {
    const pub = publicationsArchive.find((p) => p.slug === params.slug);
    if (!pub) throw notFound();
    return { pub };
  },
  component: PubDetail,
  notFoundComponent: () => (
    <Section>
      <p className="text-muted-foreground">Publication not found.</p>
      <Link to="/publications" className="text-primary">
        ← Back to Publications
      </Link>
    </Section>
  ),
});

function PubDetail() {
  const { pub } = Route.useLoaderData();
  const links = [
    { label: "DOI", url: pub.doiUrl },
    { label: "NASA ADS", url: pub.adsUrl },
    { label: "arXiv", url: pub.arxivUrl },
  ].filter((l) => Boolean(l.url));

  return (
    <>
      <PageHero
        eyebrow={`${pub.status} · ${pub.role}`}
        title={pub.title}
        intro={pub.shortSummary}
      />
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            {pub.abstract && (
              <GlassPanel>
                <h3 className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Abstract</h3>
                <p className="mt-3 text-muted-foreground">{pub.abstract}</p>
              </GlassPanel>
            )}
            {pub.keyFindings && pub.keyFindings.length > 0 && (
              <GlassPanel>
                <h3 className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Main results</h3>
                <ul className="mt-3 space-y-1.5">
                  {pub.keyFindings.map((k) => (
                    <li key={k} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                      {k}
                    </li>
                  ))}
                </ul>
              </GlassPanel>
            )}
            <GlassPanel>
              <h3 className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Authors</h3>
              <p className="mt-3 text-sm text-muted-foreground">{pub.authors.join(", ")}</p>
            </GlassPanel>
          </div>
          <aside className="space-y-3 text-sm">
            <GlassPanel>
              <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Journal</div>
              <div className="mt-2">
                {pub.journal} · {pub.month} {pub.year}
              </div>
            </GlassPanel>
            {(pub.instruments.length > 0 || pub.targets.length > 0) && (
              <GlassPanel>
                <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Instruments & targets</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {[...pub.instruments, ...pub.targets].map((t) => (
                    <span
                      key={t}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </GlassPanel>
            )}
            {links.length > 0 && (
              <GlassPanel>
                <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Links</div>
                <ul className="mt-2 space-y-1.5">
                  {links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                      >
                        {l.label}
                        <ExternalLink className="h-3.5 w-3.5 text-primary/60" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </GlassPanel>
            )}
            <Link to="/publications" className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-foreground">
              ← All publications
            </Link>
          </aside>
        </div>
      </Section>
    </>
  );
}
