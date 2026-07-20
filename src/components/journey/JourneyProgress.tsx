import { useEffect, useState } from "react";
import { chapterNav } from "@/data/journey";

/**
 * Sticky chapter navigator. Desktop: right-side glass rail with labels.
 * Mobile: horizontally scrollable pill bar pinned above the content
 * (rendered by the page separately). Handles smooth-scroll on click and
 * tracks active chapter via IntersectionObserver.
 */
export function JourneyProgress({ ids }: { ids: readonly string[] }) {
  const [active, setActive] = useState(0);
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
        className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 z-30"
        aria-label="Academic journey chapters"
      >
        <ol className="glass rounded-2xl px-3 py-4 flex flex-col gap-2 border border-white/10">
          {chapterNav.map((c, i) => {
            const isActive = i === active;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(c.id)}
                  className="group flex items-center gap-3 rounded-md px-2 py-1.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  aria-current={isActive ? "true" : undefined}
                >
                  <span
                    className={`inline-block h-1.5 w-1.5 rounded-full transition-all ${
                      isActive
                        ? "bg-primary shadow-[0_0_12px_var(--spectral-cyan)] scale-150"
                        : "bg-white/30 group-hover:bg-white/60"
                    }`}
                  />
                  <span
                    className={`text-[10px] uppercase tracking-[0.22em] transition-colors ${
                      isActive ? "text-foreground" : "text-white/50 group-hover:text-white/80"
                    }`}
                  >
                    {c.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
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
