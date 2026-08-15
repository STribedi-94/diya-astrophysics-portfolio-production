import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";
import { NavigationAtlas } from "@/components/sitemap/NavigationAtlas";
import { Map, MessageSquare } from "lucide-react";
import { siteUrl } from "@/data/site";

export const Route = createFileRoute("/sitemap")({
  head: () => ({
    meta: [
      { title: "Website Sitemap | Diya Ram — Observational Astrophysicist" },
      {
        name: "description",
        content:
          "Explore the complete structure of Diya Ram's astrophysics portfolio through an interactive, accessible website navigation atlas.",
      },
      { property: "og:title", content: "Website Sitemap | Diya Ram — Observational Astrophysicist" },
      {
        property: "og:description",
        content:
          "Explore the complete structure of Diya Ram's astrophysics portfolio through an interactive, accessible website navigation atlas.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl("/sitemap") },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: siteUrl("/sitemap") }],
  }),
  component: SitemapPage,
});

function SitemapPage() {
  return (
    <main>
      <PageHero
        eyebrow="Explore the Research Universe"
        title="Website Sitemap"
        intro="Navigate every major section of Diya Ram's astrophysics portfolio through a connected and interactive website atlas."
      >
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Map className="h-4 w-4 text-primary/80" aria-hidden />
          Select any node to open that page.
        </p>
      </PageHero>

      <Section>
        <nav aria-label="Website navigation atlas">
          <NavigationAtlas />
        </nav>
      </Section>

      <Section>
        <GlassPanel className="max-w-3xl">
          <h2 className="font-display text-xl font-semibold">About This Sitemap</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              This is the human-readable navigation map for visitors, providing direct access to
              every major public section of the research portfolio.
            </p>
            <p>
              Individual publications, mission-log records, news articles and research-detail
              records are reached through their relevant parent pages, where they are listed,
              filtered and searchable.
            </p>
          </div>
          <Link
            to="/contact"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <MessageSquare className="h-4 w-4 text-primary/80" aria-hidden />
            Cannot find something? Contact Diya
          </Link>
        </GlassPanel>
      </Section>
    </main>
  );
}