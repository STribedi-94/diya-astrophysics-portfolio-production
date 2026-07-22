/**
 * Shared right-side "Mission Navigator" for the Research ecosystem.
 * - Desktop/large tablet: sticky vertical rail on the right side of the viewport.
 * - Mobile: compact floating chapter button that opens a bottom sheet.
 *
 * Tracks scroll position and highlights the active section anchor.
 */
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ArrowUp,
  BookOpen,
  ChevronRight,
  Compass,
  Layers,
  Rocket,
  Telescope,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export type NavigatorSection = { id: string; label: string };

const chapters = [
  { to: "/research-universe", label: "Research Universe", icon: Compass, chapter: "01" },
  { to: "/research", label: "Research Areas", icon: Layers, chapter: "02" },
  { to: "/projects", label: "Research Projects", icon: Rocket, chapter: "03" },
  { to: "/facilities", label: "Research Facilities", icon: Telescope, chapter: "04" },
] as const;

export function ResearchNavigator({
  sections = [],
  chapterIndex,
}: {
  sections?: NavigatorSection[];
  chapterIndex: 0 | 1 | 2 | 3;
}) {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | undefined>(sections[0]?.id);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sections.length === 0) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = window.scrollY;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, scrolled / max)) : 0);
      let current = sections[0]?.id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top - 120 <= 0) current = s.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const prev = chapters[chapterIndex - 1];
  const next = chapters[chapterIndex + 1];

  const railTop = useMemo(() => 96, []);

  return (
    <>
      {/* Desktop rail */}
      <nav
        aria-label="Research navigator"
        className="pointer-events-none fixed right-4 z-30 hidden xl:block"
        style={{ top: railTop }}
      >
        <div className="pointer-events-auto glass w-64 rounded-2xl border border-white/10 p-4 shadow-lg backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/80">
              Mission Navigator
            </div>
            <span className="text-[10px] text-muted-foreground">
              {String(chapterIndex + 1).padStart(2, "0")}/04
            </span>
          </div>

          <div className="mb-3 h-1 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary/80 to-white/60 transition-[width] duration-150"
              style={{ width: `${Math.max(6, progress * 100)}%` }}
              aria-hidden
            />
          </div>

          <ul className="space-y-1">
            {chapters.map((c, i) => {
              const active = currentPath === c.to;
              const Icon = c.icon;
              return (
                <li key={c.to}>
                  <Link
                    to={c.to}
                    className={cn(
                      "group flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors",
                      active
                        ? "bg-primary/15 text-foreground"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                    )}
                  >
                    <span className="w-6 text-[10px] tabular-nums text-primary/70">{c.chapter}</span>
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    <span className="truncate">{c.label}</span>
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />}
                    {!active && i === chapterIndex + 1 && (
                      <ChevronRight className="ml-auto h-3 w-3 opacity-40" aria-hidden />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {sections.length > 0 && (
            <>
              <div className="mt-4 mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/60">
                On this page
              </div>
              <ul className="space-y-0.5 border-l border-white/10 pl-3">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={cn(
                        "block truncate rounded px-1.5 py-1 text-[11px] transition-colors",
                        activeId === s.id
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      aria-current={activeId === s.id ? "location" : undefined}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-4 space-y-1 border-t border-white/5 pt-3">
            <Link
              to="/publications"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden />
              Related Publications
            </Link>
            <button
              type="button"
              onClick={scrollToTop}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground"
            >
              <ArrowUp className="h-3.5 w-3.5" aria-hidden />
              Back to top
            </button>
          </div>
        </div>

        {(prev || next) && (
          <div className="pointer-events-auto mt-3 flex w-64 justify-between gap-2">
            {prev ? (
              <Link
                to={prev.to}
                className="glass flex-1 rounded-xl px-2 py-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
              >
                ← {prev.label}
              </Link>
            ) : (
              <span className="flex-1" />
            )}
            {next && (
              <Link
                to={next.to}
                className="glass flex-1 rounded-xl px-2 py-1.5 text-right text-[10px] uppercase tracking-[0.2em] text-primary hover:text-foreground"
              >
                {next.label} →
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Mobile / tablet floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-xs font-medium text-foreground shadow-lg backdrop-blur-xl xl:hidden"
        aria-label="Open research navigator"
      >
        <Compass className="h-4 w-4 text-primary" aria-hidden />
        Navigator
        <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-[10px] text-primary">
          {String(chapterIndex + 1).padStart(2, "0")}/04
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Research navigator">
          <button
            type="button"
            aria-label="Close navigator"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="glass absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-white/10 p-5 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/80">
                  Mission Navigator
                </div>
                <div className="text-sm text-foreground">Research Expedition</div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 p-2 text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ul className="mb-4 grid grid-cols-2 gap-2">
              {chapters.map((c) => {
                const active = currentPath === c.to;
                const Icon = c.icon;
                return (
                  <li key={c.to}>
                    <Link
                      to={c.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex flex-col gap-1 rounded-xl border p-3 text-left",
                        active
                          ? "border-primary/40 bg-primary/10 text-foreground"
                          : "border-white/10 bg-white/[0.02] text-muted-foreground",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" aria-hidden />
                        <span className="text-[10px] tabular-nums text-primary/70">{c.chapter}</span>
                      </div>
                      <span className="text-sm text-foreground">{c.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {sections.length > 0 && (
              <div className="mb-4">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/60">
                  On this page
                </div>
                <ul className="space-y-1">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
              <Link
                to="/publications"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <BookOpen className="h-4 w-4" aria-hidden />
                Publications
              </Link>
              <button
                type="button"
                onClick={() => {
                  scrollToTop();
                  setOpen(false);
                }}
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <ArrowUp className="h-4 w-4" aria-hidden />
                Back to top
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function ChapterFooterNav({ chapterIndex }: { chapterIndex: 0 | 1 | 2 | 3 }) {
  const prev = chapters[chapterIndex - 1];
  const next = chapters[chapterIndex + 1];
  return (
    <div className="container-page pb-24 pt-4">
      <div className="glass flex flex-col gap-3 rounded-2xl border border-white/10 p-4 md:flex-row md:items-center md:justify-between">
        {prev ? (
          <Link
            to={prev.to}
            className="group flex flex-col text-left"
            aria-label={`Previous chapter: ${prev.label}`}
          >
            <span className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              ← Previous chapter
            </span>
            <span className="text-base font-semibold text-foreground group-hover:text-primary">
              {prev.label}
            </span>
          </Link>
        ) : (
          <div />
        )}
        {next && (
          <Link
            to={next.to}
            className="group flex flex-col md:text-right"
            aria-label={`Next chapter: ${next.label}`}
          >
            <span className="text-[10px] uppercase tracking-[0.24em] text-primary/80">
              Continue the expedition →
            </span>
            <span className="text-base font-semibold text-foreground group-hover:text-primary">
              {next.label}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}
