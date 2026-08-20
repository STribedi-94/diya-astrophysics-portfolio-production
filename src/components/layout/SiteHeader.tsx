import {
  Link,
  useRouterState,
} from "@tanstack/react-router";
import {
  useEffect,
  useState,
} from "react";
import {
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from "lucide-react";

import { nav } from "@/data/site";
import { cn } from "@/lib/utils";
import { AstraPortal } from "@/components/observatory/astra/AstraPortal";

type NavChild = {
  label: string;
  to: string;
};

type NavItem = {
  label: string;
  to?: string;
  children?: readonly NavChild[];
};

export function SiteHeader() {
  const [
    scrolled,
    setScrolled,
  ] = useState(false);

  const [
    openMenu,
    setOpenMenu,
  ] =
    useState<string | null>(
      null,
    );

  const [
    mobileOpen,
    setMobileOpen,
  ] =
    useState(false);

  const path =
    useRouterState({
      select: (
        state,
      ) =>
        state.location
          .pathname,
    });

  useEffect(() => {
    const onScroll = () =>
      setScrolled(
        window.scrollY >
          24,
      );

    onScroll();

    window.addEventListener(
      "scroll",
      onScroll,
      {
        passive: true,
      },
    );

    return () =>
      window.removeEventListener(
        "scroll",
        onScroll,
      );
  }, []);

  useEffect(() => {
    setMobileOpen(
      false,
    );

    setOpenMenu(null);
  }, [path]);

  useEffect(() => {
    document.body.style.overflow =
      mobileOpen
        ? "hidden"
        : "";

    const onKey = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        setMobileOpen(
          false,
        );

        setOpenMenu(
          null,
        );
      }
    };

    window.addEventListener(
      "keydown",
      onKey,
    );

    return () => {
      document.body.style.overflow =
        "";

      window.removeEventListener(
        "keydown",
        onKey,
      );
    };
  }, [mobileOpen]);

  const isActive = (
    to?: string,
  ) =>
    to &&
    (to === "/"
      ? path === "/"
      : path === to ||
        path.startsWith(
          `${to}/`,
        ));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-white/10 bg-[oklch(0.105_0.035_265/0.82)] shadow-[0_12px_36px_-24px_rgba(0,0,0,0.9)] backdrop-blur-xl"
            : "bg-[oklch(0.055_0.02_265/0.46)] backdrop-blur-sm",
        )}
      >
        <div className="container-page flex h-[72px] items-center gap-3">
          {/* ====================================================== */}
          {/* Diya identity                                           */}
          {/* ====================================================== */}

          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2.5"
            aria-label="Diya Ram — home"
          >
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-grad-accent shadow-[0_0_22px_-6px_rgba(50,180,255,0.9)]">
              <Sparkles className="h-4 w-4 text-[oklch(0.12_0.04_265)]" />

              <span
                className="absolute inset-0 -z-10 rounded-full bg-grad-accent opacity-45 blur-md anim-pulse-slow"
                aria-hidden
              />
            </span>

            <span className="flex flex-col leading-tight">
              <span className="whitespace-nowrap font-display text-sm font-semibold tracking-tight">
                Diya Ram
              </span>

              <span className="whitespace-nowrap text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                Astrophysics
              </span>
            </span>
          </Link>

          {/* ====================================================== */}
          {/* Main navigation                                         */}
          {/* ====================================================== */}

          <nav
            className="ml-auto hidden min-w-0 items-center gap-0 lg:flex"
            aria-label="Primary navigation"
          >
            {(
              nav.primary as readonly NavItem[]
            ).map(
              (
                item,
              ) => {
                if (
                  item.children
                ) {
                  const active =
                    item.children.some(
                      (
                        child,
                      ) =>
                        isActive(
                          child.to,
                        ),
                    );

                  return (
                    <div
                      key={
                        item.label
                      }
                      className="relative shrink-0"
                      onMouseEnter={() =>
                        setOpenMenu(
                          item.label,
                        )
                      }
                      onMouseLeave={() =>
                        setOpenMenu(
                          null,
                        )
                      }
                    >
                      <button
                        type="button"
                        className={cn(
                          /*
                           * whitespace-nowrap is deliberately locked.
                           * Academic Journey and every other nav label
                           * remain one line.
                           */
                          "flex whitespace-nowrap items-center gap-1 rounded-md px-2 py-2 text-[12px] transition-colors xl:px-2.5 xl:text-[13px] 2xl:px-3 2xl:text-sm",
                          active ||
                            openMenu ===
                              item.label
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                        onClick={() =>
                          setOpenMenu(
                            openMenu ===
                              item.label
                              ? null
                              : item.label,
                          )
                        }
                        aria-expanded={
                          openMenu ===
                          item.label
                        }
                        aria-haspopup="menu"
                      >
                        {
                          item.label
                        }

                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 opacity-65 transition-transform",
                            openMenu ===
                              item.label &&
                              "rotate-180",
                          )}
                        />
                      </button>

                      {openMenu ===
                        item.label && (
                        <div className="absolute left-1/2 top-full min-w-[280px] -translate-x-1/2 pt-2">
                          <div
                            role="menu"
                            className="rounded-2xl border border-white/10 bg-[oklch(0.075_0.03_265/0.97)] p-2 shadow-[0_24px_70px_-16px_rgba(0,0,0,0.82)] backdrop-blur-2xl ring-1 ring-primary/10"
                          >
                            {item.children.map(
                              (
                                child,
                              ) => {
                                const childActive =
                                  isActive(
                                    child.to,
                                  );

                                return (
                                  <Link
                                    key={
                                      child.to
                                    }
                                    to={
                                      child.to
                                    }
                                    role="menuitem"
                                    className={cn(
                                      "group flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                                      childActive
                                        ? "bg-primary/15 text-foreground"
                                        : "text-muted-foreground hover:bg-white/10 hover:text-foreground",
                                    )}
                                  >
                                    {childActive && (
                                      <span
                                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_oklch(0.78_0.15_210/0.8)]"
                                        aria-hidden
                                      />
                                    )}

                                    <span
                                      className={cn(
                                        "whitespace-nowrap",
                                        !childActive &&
                                          "ml-3.5",
                                      )}
                                    >
                                      {
                                        child.label
                                      }
                                    </span>
                                  </Link>
                                );
                              },
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <Link
                    key={
                      item.to
                    }
                    to={
                      item.to!
                    }
                    className={cn(
                      /*
                       * This prevents "Academic Journey"
                       * from ever breaking into two lines.
                       */
                      "relative shrink-0 whitespace-nowrap rounded-md px-2 py-2 text-[12px] transition-colors xl:px-2.5 xl:text-[13px] 2xl:px-3 2xl:text-sm",
                      isActive(
                        item.to,
                      )
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {
                      item.label
                    }

                    {isActive(
                      item.to,
                    ) && (
                      <span
                        className="absolute inset-x-2 -bottom-[2px] h-px bg-grad-accent xl:inset-x-2.5 2xl:inset-x-3"
                        aria-hidden
                      />
                    )}
                  </Link>
                );
              },
            )}
          </nav>

          {/* ====================================================== */}
          {/* Astra + right-side actions                              */}
          {/* ====================================================== */}

          <div className="ml-1 flex shrink-0 items-center gap-3">
            {/*
             * Transparent Astra lock-up.
             *
             * Full identity appears at XL and above.
             * Compact identity remains available on smaller layouts.
             */}

            <AstraPortal
              className="hidden xl:inline-flex"
            />

            <AstraPortal
              compact
              className="hidden lg:inline-flex xl:hidden"
            />

            {/* divider matching the approved visual target */}
            <span
              className="hidden h-9 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent xl:block"
              aria-hidden
            />

            <Link
              to="/news"
              className={cn(
                "hidden shrink-0 items-center whitespace-nowrap rounded-full lg:inline-flex",
                "bg-gradient-to-r from-[#22c6ff] via-[#2799ff] to-[#9969ff]",
                "px-2.5 py-2 text-[10px] font-semibold text-[#06101e]",
                "xl:px-3 xl:text-[11px] 2xl:px-4",
                "shadow-[0_0_22px_-7px_rgba(60,177,255,0.92)]",
                "transition-all duration-300",
                "hover:scale-[1.025] hover:shadow-[0_0_30px_-7px_rgba(88,150,255,1)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70",
              )}
            >
              <span className="xl:hidden">News</span>
              <span className="hidden xl:inline">News & Updates</span>
            </Link>

            {/*
             * Mobile/tablet Astra remains permanently visible
             * beside the menu control.
             */}

            <AstraPortal
              compact
              className="inline-flex lg:hidden"
            />

            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-white/5 lg:hidden"
              aria-label="Open menu"
              onClick={() =>
                setMobileOpen(
                  true,
                )
              }
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================== */}
      {/* Mobile drawer                                              */}
      {/* ========================================================== */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-[60] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Website navigation"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() =>
              setMobileOpen(
                false,
              )
            }
          />

          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-white/10 bg-[oklch(0.075_0.03_265/0.97)] backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <span className="font-display text-sm">
                Menu
              </span>

              <button
                type="button"
                onClick={() =>
                  setMobileOpen(
                    false,
                  )
                }
                aria-label="Close menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-white/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Astra stays visually transparent here too */}
            <div className="border-b border-white/10 px-4 py-5">
              <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.22em] text-primary/70">
                Interactive Science
              </div>

              <AstraPortal
                className="justify-start"
                onNavigate={() =>
                  setMobileOpen(
                    false,
                  )
                }
              />
            </div>

            <nav
              className="flex-1 overflow-y-auto p-4"
              aria-label="Mobile navigation"
            >
              <ul className="space-y-1">
                {(
                  nav.primary as readonly NavItem[]
                ).map(
                  (
                    item,
                  ) => (
                    <li
                      key={
                        item.label
                      }
                    >
                      {item.children ? (
                        <details
                          className="group rounded-lg"
                          open={item.children.some(
                            (
                              child,
                            ) =>
                              isActive(
                                child.to,
                              ),
                          )}
                        >
                          <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-3 text-sm hover:bg-white/5">
                            <span className="whitespace-nowrap">
                              {
                                item.label
                              }
                            </span>

                            <ChevronDown className="h-4 w-4 shrink-0 opacity-60 transition-transform group-open:rotate-180" />
                          </summary>

                          <ul className="ml-2 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                            {item.children.map(
                              (
                                child,
                              ) => (
                                <li
                                  key={
                                    child.to
                                  }
                                >
                                  <Link
                                    to={
                                      child.to
                                    }
                                    className={cn(
                                      "block whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground",
                                      isActive(
                                        child.to,
                                      ) &&
                                        "bg-white/5 text-foreground",
                                    )}
                                  >
                                    {
                                      child.label
                                    }
                                  </Link>
                                </li>
                              ),
                            )}
                          </ul>
                        </details>
                      ) : (
                        <Link
                          to={
                            item.to!
                          }
                          className={cn(
                            "block whitespace-nowrap rounded-lg px-3 py-3 text-sm hover:bg-white/5",
                            isActive(
                              item.to,
                            )
                              ? "bg-white/5 text-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {
                            item.label
                          }
                        </Link>
                      )}
                    </li>
                  ),
                )}
              </ul>

              <Link
                to="/news"
                className="mt-6 flex items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-[#22c6ff] via-[#2799ff] to-[#9969ff] px-4 py-3 text-sm font-semibold text-[#06101e]"
              >
                News & Updates
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}