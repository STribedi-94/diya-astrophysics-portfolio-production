import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel } from "@/components/layout/Page";
import { nav } from "@/data/site";

type NavChild = { label: string; to: string };
type NavItem = { label: string; to?: string; children?: readonly NavChild[] };

export const Route = createFileRoute("/sitemap")({
  head: () => ({ meta: [{ title: "Sitemap — Diya Ram" }] }),
  component: () => (
    <>
      <PageHero eyebrow="Sitemap" title="Human-readable sitemap" intro="A structured index of every page on this research website." />
      <Section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(nav.primary as readonly NavItem[]).map((item) => (
            <GlassPanel key={item.label}>
              <div className="font-display text-sm font-semibold">
                {item.to ? (
                  <Link to={item.to} className="hover:text-primary">{item.label}</Link>
                ) : (
                  item.label
                )}
              </div>
              {item.children && (
                <ul className="mt-3 space-y-1.5">
                  {item.children.map((c) => (
                    <li key={c.to}>
                      <Link to={c.to} className="text-sm text-muted-foreground hover:text-foreground">
                        {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </GlassPanel>
          ))}
        </div>
      </Section>
    </>
  ),
});
