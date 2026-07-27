import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, Compass, PanelRightClose, X } from "lucide-react";

export type NavSection = { id: string; label: string };

/**
 * Chronicle Navigator — a compact floating glass rail on desktop that expands
 * on hover/focus/click, and a bottom sheet on tablet and mobile.
 * Tracks the section currently in view via IntersectionObserver.
 */
export function ChronicleNavigator({ sections }: { sections: NavSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [open, setOpen] = useState(false);
  const railRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
        let best = "";
        let bestRatio = 0;
        sections.forEach((s) => {
          const r = ratios.get(s.id) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            best = s.id;
          }
        });
        if (best) setActive(best);
      },
      { rootMargin: "-15% 0px -45% 0px", threshold: [0, 0.15, 0.35, 0.6, 1] },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  // Collapse the desktop rail on Escape or on an outside click while pinned.
  useEffect(() => {
    if (!pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPinned(false);
        setExpanded(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (railRef.current && !railRef.current.contains(e.target as Node)) {
        setPinned(false);
        setExpanded(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onClick);
    };
  }, [pinned]);

  const go = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    setActive(id);
    setOpen(false);
  }, []);

  const showLabels = expanded || pinned;
  const activeLabel = sections.find((s) => s.id === active)?.label ?? "Sections";
  const activeIndex = Math.max(0, sections.findIndex((s) => s.id === active));

  return (
    <>
      {/* ------------------------------------------------- desktop floating rail */}
      <nav
        ref={railRef}
        aria-label="Chronicle sections"
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => !pinned && setExpanded(false)}
        onFocusCapture={() => setExpanded(true)}
        onBlurCapture={(e) => {
          if (!pinned && !e.currentTarget.contains(e.relatedTarget as Node)) setExpanded(false);
        }}
        className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
      >
        <div
          className={cn(
            "glass-strong relative rounded-2xl p-2 shadow-[0_10px_40px_-18px_oklch(0_0_0/0.9)] transition-[width,box-shadow] duration-300 ease-out",
            showLabels
              ? "w-60 shadow-[0_18px_60px_-20px_color-mix(in_oklab,var(--nebula)_60%,transparent)]"
              : "w-12",
          )}
        >
          <span
            className="pointer-events-none absolute -inset-px rounded-2xl opacity-40"
            style={{ background: "radial-gradient(120px 120px at 100% 0%, var(--nebula), transparent 70%)" }}
            aria-hidden
          />
          <div className="relative flex items-center justify-between px-1 pb-1">
            {showLabels && (
              <span className="truncate font-mono text-[9px] uppercase tracking-[0.22em] text-primary/80">
                Chronicle
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setPinned((p) => !p);
                setExpanded(true);
              }}
              aria-expanded={showLabels}
              aria-label={pinned ? "Collapse chronicle navigator" : "Keep chronicle navigator open"}
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
                pinned && "text-primary",
              )}
            >
              {pinned ? <PanelRightClose className="h-4 w-4" /> : <Compass className="h-4 w-4" />}
            </button>
          </div>

          <ul className="relative">
            {sections.map((s, i) => {
              const isActive = active === s.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => go(s.id)}
                    aria-current={isActive ? "true" : undefined}
                    title={showLabels ? undefined : s.label}
                    className={cn(
                      "group flex w-full items-center gap-2.5 rounded-xl py-2 text-left text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60",
                      showLabels ? "px-2.5" : "justify-center px-0",
                      isActive ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5",
                    )}
                  >
                    <span className="relative grid h-4 w-4 shrink-0 place-items-center">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full transition-all duration-300",
                          isActive
                            ? "scale-125 bg-primary shadow-[0_0_10px_2px_color-mix(in_oklab,var(--primary)_45%,transparent)]"
                            : "bg-white/25 group-hover:bg-primary/60",
                        )}
                      />
                      {isActive && (
                        <span className="absolute inset-0 rounded-full border border-primary/40 anim-pulse-slow" />
                      )}
                    </span>
                    {showLabels && <span className="truncate">{s.label}</span>}
                    <span className="sr-only">{showLabels ? "" : s.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          {!showLabels && (
            <p className="relative mt-1 text-center font-mono text-[9px] text-muted-foreground">
              {activeIndex + 1}/{sections.length}
            </p>
          )}
        </div>
      </nav>

      {/* ------------------------------------------- tablet + mobile bottom sheet */}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 lg:hidden">
        {open ? (
          <div className="glass-strong pointer-events-auto w-full max-w-md rounded-2xl p-3 anim-fade-in">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">
                Chronicle sections
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close section navigator"
                className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="max-h-[50dvh] overflow-y-auto overscroll-contain">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => go(s.id)}
                    aria-current={active === s.id ? "true" : undefined}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-left text-sm",
                      active === s.id ? "bg-white/10 text-foreground" : "text-muted-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        active === s.id ? "bg-primary" : "bg-white/25",
                      )}
                    />
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
            aria-expanded={false}
            className="glass-strong pointer-events-auto inline-flex min-h-11 max-w-[92vw] items-center gap-2 rounded-full px-4 text-xs text-foreground shadow-[0_10px_30px_-14px_oklch(0_0_0/0.9)]"
          >
            <Compass className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{activeLabel}</span>
            <ChevronUp className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </button>
        )}
      </div>
    </>
  );
}
