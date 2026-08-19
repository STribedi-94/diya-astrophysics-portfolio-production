import { useEffect, useState } from "react";
import { ArrowUp, ChevronRight, Compass } from "lucide-react";
import { chapterNav } from "@/data/journey";

/**
 * Sticky chapter navigator. Desktop: right-side glass rail with labels.
 * Mobile: horizontally scrollable pill bar pinned above the content
 * (rendered by the page separately). Handles smooth-scroll on click and
 * tracks active chapter via IntersectionObserver.
 */
export function JourneyProgress({ ids }: { ids: readonly string[] }) {
  const [active, setActive] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = ids.indexOf(visible.target.id);
          if (idx >= 0) setActive(idx);
        }
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    els.forEach((el) => observer.observe(el));

    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [ids]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* Progress line (top) */}
      <div
        aria-hidden
        className="fixed left-0 right-0 top-0 z-40 h-[2px] bg-transparent"
      >
        <div
          className="h-full bg-gradient-to-r from-spectral-cyan via-stellar-gold to-mdwarf transition-[width] duration-200"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Desktop rail */}
      <nav
        className="pointer-events-none fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 lg:flex"
        aria-label="Academic journey chapters"
      >
        {collapsed ? (
          <div className="pointer-events-auto relative flex w-12 flex-col items-center gap-2 overflow-hidden rounded-2xl border border-primary/20 bg-[oklch(0.08_0.035_270/0.94)] p-2 shadow-[0_0_40px_-16px_var(--spectral-cyan)] backdrop-blur-2xl">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-transparent to-uv-violet/[0.08]"
            />
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-primary transition-all hover:border-primary/30 hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label="Expand academic journey navigator"
              title="Expand journey navigator"
            >
              <Compass className="h-4 w-4" />
            </button>

            <div
              className="relative my-1 h-28 w-1 overflow-hidden rounded-full bg-white/[0.06]"
              aria-hidden
            >
              <div
                className="absolute bottom-0 left-0 w-full rounded-full bg-gradient-to-t from-spectral-cyan via-stellar-gold to-mdwarf transition-[height] duration-200"
                style={{ height: `${Math.max(6, progress * 100)}%` }}
              />
            </div>

            <span className="relative font-mono text-[9px] tabular-nums text-primary/85">
              {String(active + 1).padStart(2, "0")}
            </span>
          </div>
        ) : (
          <div className="pointer-events-auto relative w-64 overflow-hidden rounded-3xl border border-white/10 bg-[oklch(0.08_0.035_270/0.94)] p-3 shadow-[0_0_50px_-20px_var(--spectral-cyan)] backdrop-blur-2xl">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.07] via-transparent to-uv-violet/[0.08]"
            />

            <div className="relative mb-3 flex items-center justify-between gap-3 px-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                  <Compass className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-primary/80">
                    Journey Navigator
                  </div>
                  <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {chapterNav[active]?.label}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label="Collapse academic journey navigator"
                title="Collapse journey navigator"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="relative mb-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-spectral-cyan via-stellar-gold to-mdwarf transition-[width] duration-200"
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            <ol className="relative flex flex-col gap-1">
              {chapterNav.map((c, i) => {
                const isActive = i === active;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => scrollTo(c.id)}
                      className={`group flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                        isActive
                          ? "border-primary/20 bg-primary/[0.10] text-foreground shadow-[inset_0_0_18px_-12px_var(--spectral-cyan)]"
                          : "border-transparent text-white/50 hover:border-white/5 hover:bg-white/[0.04] hover:text-white/80"
                      }`}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <span className="w-5 shrink-0 font-mono text-[9px] tabular-nums text-primary/65">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full transition-all ${
                          isActive
                            ? "scale-150 bg-primary shadow-[0_0_12px_var(--spectral-cyan)]"
                            : "bg-white/25 group-hover:bg-white/55"
                        }`}
                      />
                      <span className="truncate text-[10px] uppercase tracking-[0.17em]">
                        {c.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="relative mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:border-white/15 hover:bg-white/[0.07] hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <ArrowUp className="h-3 w-3" />
              Back to top
            </button>
          </div>
        )}
      </nav>
      {/* Mobile compact bar */}
      <nav
        className="lg:hidden sticky top-16 z-30 -mx-5 mb-4 px-5"
        aria-label="Academic journey chapters"
      >
        <div className="glass rounded-full border border-white/10 px-2 py-1.5 overflow-x-auto">
          <ol className="flex items-center gap-1 whitespace-nowrap">
            {chapterNav.map((c, i) => {
              const isActive = i === active;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(c.id)}
                    className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-colors ${
                      isActive
                        ? "bg-primary/20 text-foreground border border-primary/40"
                        : "text-white/60"
                    }`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {c.label}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}
