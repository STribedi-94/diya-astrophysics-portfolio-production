import { useEffect, useState } from "react";
import { progressLabels } from "@/data/journey";

/**
 * Compact chapter-progress pill shown on desktop.
 * Tracks the currently visible chapter via IntersectionObserver.
 */
export function JourneyProgress({ ids }: { ids: readonly string[] }) {
  const [active, setActive] = useState(0);

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
    return () => observer.disconnect();
  }, [ids]);

  return (
    <div
      className="hidden lg:block fixed right-6 top-1/2 -translate-y-1/2 z-30"
      aria-label="Journey progress"
    >
      <ol className="glass rounded-full px-2 py-3 flex flex-col gap-3 items-center border border-white/10">
        {progressLabels.map((label, i) => {
          const isActive = i === Math.min(active, progressLabels.length - 1);
          return (
            <li key={label} className="group relative">
              <span
                className={`block h-2 w-2 rounded-full transition-all ${
                  isActive
                    ? "bg-primary shadow-[0_0_12px_var(--aurora)] scale-125"
                    : "bg-white/25"
                }`}
              />
              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-black/70 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
