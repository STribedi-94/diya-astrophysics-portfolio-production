import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageHero, Section, GlassPanel, Placeholder } from "@/components/layout/Page";
import { news } from "@/data/misc";

export const Route = createFileRoute("/news/$slug")({
  head: ({ params }) => {
    const n = news.find((x) => x.slug === params.slug);
    return { meta: [{ title: n ? `${n.title} — Diya Ram` : "News — Diya Ram" }] };
  },
  loader: ({ params }) => {
    const item = news.find((n) => n.slug === params.slug);
    if (!item) throw notFound();
    return { item };
  },
  component: NewsDetail,
  notFoundComponent: () => <Section><p className="text-muted-foreground">News item not found.</p></Section>,
});

function NewsDetail() {
  const { item } = Route.useLoaderData();
  return (
    <>
      <PageHero eyebrow={`${item.category} · ${item.date}`} title={item.title} intro={item.summary} />
      <Section>
        <GlassPanel>
          <Placeholder>Full news article content will be added when the update is finalised.</Placeholder>
        </GlassPanel>
      </Section>
    </>
  );
}
