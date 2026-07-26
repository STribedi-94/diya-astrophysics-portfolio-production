import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Archive,
  ChevronRight,
  X,
  Star,
  Users,
  BookMarked,
  Presentation,
  IdCard,
  Images,
  Database,
  Quote,
  Compass,
  LayoutGrid,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NavSection = { id: string; label: string; icon: typeof Star; count?: number };

export const buildSections = (counts: Record<string, number | undefined>): NavSection[] => [
  { id: "overview", label: "Archive Overview", icon: LayoutGrid },
  { id: "featured", label: "Featured Records", icon: Sparkles, count: counts.featured },
  { id: "first-author", label: "First-Author Papers", icon: Star, count: counts.firstAuthor },
  { id: "collaborative", label: "Collaborative Research", icon: Users, count: counts.collaborative },
  { id: "thesis", label: "Doctoral Thesis", icon: BookMarked },
  { id: "presentations", label: "Posters & Presentations", icon: Presentation, count: counts.presentations },
  { id: "dossier", label: "Professional Dossier", icon: IdCard },
  { id: "documents", label: "Academic Documents", icon: Archive },
  { id: "visual", label: "Visual Archive", icon: Images, count: counts.images },
  { id: "repository", label: "Complete Repository", icon: Database, count: counts.total },
  { id: "citation", label: "Citation & Usage", icon: Quote },
  { id: "destinations", label: "Related Destinations", icon: Compass },
];

export function ArchiveNavigator({ sections }: { sections: NavSection[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: 0 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.history.replaceState) window.history.replaceState(null, "", `#${id}`);
    setActive(id);
    setOpen(false);
  };

  const activeLabel = sections.find((s) => s.id === active)?.label ?? sections[0]?.label;
  const progress = ((sections.findIndex((s) => s.id === active) + 1) / sections.length) * 100;

  const list = (
    <ul className="space-y-1" role="list">
      {sections.map((s) => {
        const Icon = s.icon;
        const isActive = s.id === active;
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => go(s.id)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                isActive
                  ? "bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} aria-hidden />
              <span className="min-w-0 flex-1 truncate">{s.label}</span>
              {typeof s.count === "number" && (
                <span className="font-mono text-[10px] text-muted-foreground">{s.count}</span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop / tablet rail */}
      <div className="pointer-events-none fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 md:block">
        {open ? (
          <nav
            aria-label="Research Vault sections"
            className="pointer-events-auto mr-3 w-72 rounded-2xl border border-white/10 bg-[oklch(0.12_0.04_265_/_0.92)] p-4 shadow-panel backdrop-blur-xl"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">
                  Research Vault
                </div>
                <div className="mt-1 font-display text-sm font-semibold">Archive console</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close archive navigator"
                className="rounded-full border border-white/10 p-1.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
            <div className="mb-3 h-px w-full bg-white/10">
              <div
                className="h-px bg-primary transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto pr-1">{list}</div>
          </nav>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={false}
            aria-label={`Open archive navigator. Current section: ${activeLabel}`}
            className="pointer-events-auto mr-2 flex flex-col items-center gap-3 rounded-full border border-white/10 bg-[oklch(0.12_0.04_265_/_0.85)] px-2.5 py-5 backdrop-blur-xl transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Archive className="h-4 w-4 text-primary" aria-hidden />
            <span className="h-1.5 w-1.5 rounded-full bg-primary anim-pulse-slow" aria-hidden />
            <span
              className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground"
              style={{ writingMode: "vertical-rl" }}
            >
              Research Vault
            </span>
            <ChevronRight className="h-3.5 w-3.5 rotate-180 text-muted-foreground" aria-hidden />
          </button>
        )}
      </div>

      {/* Mobile floating button + bottom sheet */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open archive navigator"
          className="fixed bottom-5 right-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-primary/30 bg-[oklch(0.12_0.04_265_/_0.92)] px-4 py-3 text-xs backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <Archive className="h-4 w-4 text-primary" aria-hidden />
          Vault
        </button>
        {open && (
          <div className="fixed inset-0 z-50">
            <button
              type="button"
              aria-label="Close archive navigator"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/70"
            />
            <nav
              aria-label="Research Vault sections"
              className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-2xl border-t border-white/10 bg-[oklch(0.12_0.04_265_/_0.97)] p-4 pb-8 backdrop-blur-xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">
                  Research Vault
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close archive navigator"
                  className="min-h-11 min-w-11 rounded-full border border-white/10 p-2 text-muted-foreground"
                >
                  <X className="mx-auto h-4 w-4" aria-hidden />
                </button>
              </div>
              {list}
            </nav>
          </div>
        )}
      </div>
    </>
  );
}

export function RelatedLink({
  to,
  slug,
  label,
}: {
  to: string;
  slug?: string;
  label: string;
}) {
  const className =
    "inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";
  if (to === "/publications/$slug" && slug) {
    return (
      <Link to="/publications/$slug" params={{ slug }} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <Link to={to} className={className}>
      {label}
    </Link>
  );
}
