import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel, Placeholder } from "@/components/layout/Page";
import { publications } from "@/data/misc";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/publications")({
  head: () => ({
    meta: [
      { title: "Publications — Diya Ram" },
      { name: "description", content: "Publications by Diya Ram — verified journal and NASA ADS records will be added." },
    ],
  }),
  component: Publications,
});

function Publications() {
  const featured = publications.find((p) => p.featured);
  return (
    <>
      <PageHero
        eyebrow="Publications"
        title={<>Peer-reviewed <span className="text-grad-accent">observational research</span></>}
        intro="Publications will be populated from verified journal and NASA ADS records with DOI, ADS, arXiv and journal links."
      />
      <Section>
        {featured && (
          <div className="glass mb-8 rounded-3xl p-8">
            <div className="text-[10px] uppercase tracking-[0.24em] text-primary/80">Featured publication</div>
            <h3 className="mt-3 font-display text-2xl font-semibold">{featured.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{featured.authors} · {featured.journal} · {featured.year}</p>
            <p className="mt-4 text-muted-foreground">{featured.summary}</p>
          </div>
        )}
        <div className="grid gap-4">
          {publications.map((p) => (
            <Link
              key={p.id}
              to="/publications/$slug"
              params={{ slug: p.slug }}
              className="glass group flex items-start justify-between rounded-2xl p-6 hover:bg-white/5"
            >
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-primary/70">{p.status}</div>
                <h4 className="mt-2 font-display text-lg font-semibold">{p.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{p.authors} · {p.journal} · {p.year}</p>
              </div>
              <ArrowRight className="mt-1 h-4 w-4 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </div>
        <div className="mt-6">
          <Placeholder>
            Publication metadata, links (DOI · NASA ADS · arXiv · Journal), abstracts,
            figures and BibTeX will be added as verified records become available.
          </Placeholder>
        </div>
      </Section>
    </>
  );
}
