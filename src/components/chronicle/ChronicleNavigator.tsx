import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, Compass, X } from "lucide-react";

export type NavSection = { id: string; label: string };

/**
 * Chronicle Navigator — persistent side rail on desktop, bottom sheet on mobile.
 * Highlights the section currently in view.
 */
export function ChronicleNavigator({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.2] },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  };

  return (
    <>
      {/* Desktop rail */}
      <nav
        aria-label="Chronicle sections"
        className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 2xl:block"
      >
        <ul className="pointer-events-auto glass rounded-2xl p-2">
          {sections.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => go(s.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[11px] transition-colors",
                    isActive ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full transition-colors",
                      isActive ? "bg-primary" : "bg-white/25 group-hover:bg-primary/60",
                    )}
                  />
                  <span className="max-w-[9.5rem] truncate">{s.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile bottom sheet */}
      <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 2xl:hidden">
        {open ? (
          <div className="glass-strong w-full max-w-md rounded-2xl p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[10px] uppercase tracking-[0.24em] text-primary/80">
                Chronicle sections
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close section navigator"
                className="rounded-full p-1 text-muted-foreground hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="max-h-64 overflow-y-auto">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => go(s.id)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm",
                      active === s.id ? "bg-white/10 text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="glass-strong inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-foreground"
          >
            <Compass className="h-4 w-4 text-primary" />
            {sections.find((s) => s.id === active)?.label ?? "Sections"}
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>
    </>
  );
}
