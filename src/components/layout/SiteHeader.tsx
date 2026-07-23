import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown, Sparkles } from "lucide-react";
import { nav } from "@/data/site";
import { cn } from "@/lib/utils";

type NavChild = { label: string; to: string };
type NavItem = { label: string; to?: string; children?: readonly NavChild[] };

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [path]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setOpenMenu(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const isActive = (to?: string) =>
    to && (to === "/" ? path === "/" : path === to || path.startsWith(to + "/"));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-white/10 bg-[oklch(0.14_0.04_265_/_0.75)] backdrop-blur-xl"
            : "bg-transparent",
        )}
      >
        <div className="container-page flex h-16 items-center justify-between md:h-18">
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-grad-accent">
              <Sparkles className="h-4 w-4 text-[oklch(0.12_0.04_265)]" />
              <span className="absolute inset-0 rounded-full anim-pulse-slow opacity-40 bg-grad-accent blur-md -z-10" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-display text-sm font-semibold tracking-tight">Diya Ram</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Astrophysics
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {(nav.primary as readonly NavItem[]).map((item) => {
              if (item.children) {
                const active = item.children.some((c) => isActive(c.to));
                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenMenu(item.label)}
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    <button
                      className={cn(
                        "flex items-center gap-1 rounded-md px-3 py-2 text-sm transition-colors",
                        active || openMenu === item.label
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      onClick={() =>
                        setOpenMenu(openMenu === item.label ? null : item.label)
                      }
                      aria-expanded={openMenu === item.label}
                      aria-haspopup="menu"
                    >
                      {item.label}
                      <ChevronDown className={cn("h-3.5 w-3.5 opacity-70 transition-transform", openMenu === item.label && "rotate-180")} />
                    </button>
                    {openMenu === item.label && (
                      <div className="absolute left-1/2 top-full min-w-[280px] -translate-x-1/2 pt-2">
                        <div
                          role="menu"
                          className="rounded-2xl border border-white/10 bg-[oklch(0.09_0.03_265_/_0.96)] p-2 shadow-[0_20px_60px_-10px_oklch(0_0_0_/_0.7),_0_0_0_1px_oklch(0.6_0.15_220_/_0.08)_inset] backdrop-blur-2xl ring-1 ring-primary/10"
                        >
                          {item.children.map((c) => {
                            const childActive = isActive(c.to);
                            return (
                              <Link
                                key={c.to}
                                to={c.to}
                                role="menuitem"
                                className={cn(
                                  "group flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                                  childActive
                                    ? "bg-primary/15 text-foreground"
                                    : "text-muted-foreground hover:bg-white/10 hover:text-foreground",
                                )}
                              >
                                {childActive && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.78_0.15_210_/_0.8)]" aria-hidden />
                                )}
                                <span className={cn(!childActive && "ml-3.5")}>{c.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link
                  key={item.to}
                  to={item.to!}
                  className={cn(
                    "relative rounded-md px-3 py-2 text-sm transition-colors",
                    isActive(item.to)
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                  {isActive(item.to) && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-px bg-grad-accent" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/contact"
              className="hidden rounded-full bg-grad-accent px-4 py-2 text-xs font-medium text-[oklch(0.12_0.04_265)] shadow-[0_0_20px_-6px_oklch(0.78_0.15_210_/_0.6)] transition-transform hover:scale-[1.02] md:inline-flex"
            >
              Contact Diya
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground lg:hidden"
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col glass border-l border-white/10">
            <div className="flex items-center justify-between p-4">
              <span className="font-display text-sm">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {(nav.primary as readonly NavItem[]).map((item) => (
                  <li key={item.label}>
                    {item.children ? (
                      <details className="group rounded-lg" open={item.children.some((c) => isActive(c.to))}>
                        <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-3 text-sm hover:bg-white/5">
                          {item.label}
                          <ChevronDown className="h-4 w-4 opacity-60 transition-transform group-open:rotate-180" />
                        </summary>
                        <ul className="ml-2 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                          {item.children.map((c) => (
                            <li key={c.to}>
                              <Link
                                to={c.to}
                                className={cn(
                                  "block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground",
                                  isActive(c.to) && "text-foreground bg-white/5",
                                )}
                              >
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : (
                      <Link
                        to={item.to!}
                        className={cn(
                          "block rounded-lg px-3 py-3 text-sm hover:bg-white/5",
                          isActive(item.to) ? "text-foreground bg-white/5" : "text-muted-foreground",
                        )}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className="mt-6 flex items-center justify-center rounded-full bg-grad-accent px-4 py-3 text-sm font-medium text-[oklch(0.12_0.04_265)]"
              >
                Contact Diya
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
