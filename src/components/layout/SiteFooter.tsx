import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { site } from "@/data/site";
import { profileLinks } from "@/data/about";
import { CreatorCard } from "@/components/creator/CreatorCard";
import { ResearchStatistics } from "@/components/layout/ResearchStatistics";
import { VisualPerformanceControl } from "@/components/layout/VisualPerformanceControl";
import { COPYRIGHT_SECTION_ID } from "@/data/legal";


const cols = [
  {
    title: "Research",
    links: [
      { label: "Research Universe", to: "/research-universe" },
      { label: "Research Areas", to: "/research" },
      { label: "Projects", to: "/projects" },
      { label: "Facilities", to: "/facilities" },
    ],
  },
  {
    title: "Scholarship",
    links: [
      { label: "Publications", to: "/publications" },
      { label: "Observations", to: "/observations" },
      { label: "Academic Journey", to: "/academic-journey" },
      { label: "Conferences", to: "/conferences" },
    ],
  },
  {
    title: "More",
    links: [
      { label: "Teaching", to: "/teaching" },
      { label: "Gallery", to: "/gallery" },
      { label: "Downloads", to: "/downloads" },
      { label: "Scientific Mission Log", to: "/mission-log" },
      { label: "Astrophysics News", to: "/news" },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "Contact", to: "/contact" },
      { label: "Sitemap", to: "/sitemap" },
      { label: "Privacy", to: "/privacy" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-white/10 bg-[oklch(0.10_0.04_265_/_0.85)]">
      <div className="absolute inset-0 starfield-sparse opacity-40" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-px bg-grad-spectral opacity-60" />
      <div className="container-page relative grid gap-10 py-14 md:grid-cols-6 lg:grid-cols-8">
        <div className="md:col-span-6 lg:col-span-2">
          <div className="font-display text-lg font-semibold">{site.name}</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">
            {site.title}
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">{site.tagline}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {profileLinks.map((p) => (
              <a
                key={p.url}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label={p.ariaLabel}
                title={p.label}
                className="group inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                {p.label}
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
              {c.title}
            </div>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="space-y-8 md:col-span-2 lg:col-span-2">
          <ResearchStatistics />
          <VisualPerformanceControl />
        </div>
      </div>
      <div className="container-page relative flex flex-col gap-3 border-t border-white/5 py-6 text-xs text-muted-foreground">
        <p className="max-w-4xl leading-relaxed">
          © {new Date().getFullYear()} {site.name}. Research Copyright &amp; Intellectual Property.
          Original scientific content is protected under applicable copyright and international
          intellectual-property laws. Proper academic citation and attribution are required.
          Unauthorised reproduction or redistribution may violate legal, licensing and
          academic-integrity requirements.{" "}
          <Link
            to="/privacy"
            hash={COPYRIGHT_SECTION_ID}
            className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Read the Privacy, Copyright &amp; Citation Policy
          </Link>
        </p>
        <div className="font-mono uppercase tracking-[0.18em]">
          Observational Astrophysics · M-dwarf magnetic activity · Multi-wavelength research
        </div>
      </div>
      <div className="container-page relative isolate z-20 flex justify-center overflow-visible border-t border-primary/20 px-3 py-8 sm:px-6 sm:py-10">
        <CreatorCard />
      </div>

    </footer>
  );
}

