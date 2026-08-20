import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { researchAreas } from "@/data/research";
import { facilities } from "@/data/facilities";
import { projects, publications } from "@/data/misc";
import { chronicleRecords } from "@/data/chronicle";
import { siteUrl } from "@/data/site";


export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticPaths = [
          "/", "/about", "/research-universe", "/research", "/publications",
          "/observations", "/facilities", "/projects", "/academic-journey",
          "/teaching", "/conferences", "/gallery", "/downloads", "/news",
          "/contact", "/privacy", "/sitemap", "/mission-log",
        ];
        const entries = [
          ...staticPaths.map((path) => ({ path, changefreq: "weekly", priority: "0.8" })),
          ...researchAreas.map((a) => ({ path: `/research/${a.slug}` })),
          ...facilities.map((f) => ({ path: `/facilities/${f.slug}` })),
          ...projects.map((p) => ({ path: `/projects/${p.slug}` })),
          ...chronicleRecords.map((n) => ({ path: `/mission-log/${n.slug}` })),
          ...publications.map((p) => ({ path: `/publications/${p.slug}` })),
        ];
        const urls = entries.map((e) =>
          [`  <url>`, `    <loc>${siteUrl(e.path)}</loc>`, `  </url>`].join("\n"),
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});