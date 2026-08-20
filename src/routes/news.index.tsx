import { createFileRoute, Link } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Globe2,
  Newspaper,
  Orbit,
  RadioTower,
  RefreshCw,
  Rocket,
  Satellite,
  Search,
  Signal,
  Sparkles,
  Telescope,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_URL, siteUrl } from "@/data/site";
import { isDemoMode, newsConfig } from "@/config/newsConfig";
import { getNews } from "@/services/newsService";
import {
  MULTI_FILTER_KEYS,
  type MultiFilterKey,
  type NewsQuery,
  type NewsSort,
} from "@/types/news";
import { NewsCard, NewsCompactCard, NewsLeadCard } from "@/components/news/NewsCard";
import {
  ActiveFilterChips,
  NewsFilterPanel,
  NewsFilterSheet,
  type ActiveFilters,
} from "@/components/news/NewsFilters";
import { NewsPagination } from "@/components/news/NewsPagination";
import {
  NewsEmptyState,
  NewsErrorState,
  NewsFeedNotice,
  NewsGridSkeleton,
} from "@/components/news/NewsStates";
import { formatNewsDateTime } from "@/components/news/NewsBadges";

const TITLE = "Astrophysics News Hub — Global Astronomy & Space Science | Diya Ram";
const DESCRIPTION =
  "A curated hub of astrophysics, astronomy and space-science news from trusted observatories, space agencies and research institutions, with a Research Orbit spotlight on stellar activity and radio astronomy.";

/* ------------------------------------------------------------ url search */

type NewsSearch = {
  q?: string;
  page?: number;
  sort?: NewsSort;
  orbit?: boolean;
} & Partial<Record<MultiFilterKey, string[]>>;

const SORTS: NewsSort[] = ["newest", "oldest", "relevance", "featured"];

function toStringArray(value: unknown): string[] | undefined {
  const arr = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  const clean = arr.filter((v): v is string => typeof v === "string" && v.length > 0).slice(0, 20);
  return clean.length ? clean : undefined;
}

function validateSearch(raw: Record<string, unknown>): NewsSearch {
  const search: NewsSearch = {};
  if (typeof raw.q === "string" && raw.q.trim()) search.q = raw.q.slice(0, 120);
  const page = Number(raw.page);
  if (Number.isFinite(page) && page > 1) search.page = Math.min(Math.floor(page), 999);
  if (typeof raw.sort === "string" && SORTS.includes(raw.sort as NewsSort)) {
    search.sort = raw.sort as NewsSort;
  }
  if (raw.orbit === true || raw.orbit === "true") search.orbit = true;
  for (const key of MULTI_FILTER_KEYS) {
    const values = toStringArray(raw[key]);
    if (values) search[key] = values;
  }
  return search;
}

export const Route = createFileRoute("/news/")({
  validateSearch,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: siteUrl("/news") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: siteUrl("/news") }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Astrophysics News Hub",
          description: DESCRIPTION,
          url: siteUrl("/news"),
          isPartOf: { "@type": "WebSite", name: "Diya Ram — Observational Astrophysicist", url: SITE_URL },
          about: [
            { "@type": "Thing", name: "Astrophysics" },
            { "@type": "Thing", name: "Astronomy" },
            { "@type": "Thing", name: "Space science" },
          ],
        }),
      },
    ],
  }),
  component: NewsHubPage,
});

/* ------------------------------------------------------------- utilities */

function useDebounced<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/* ------------------------------------------------------------------ hero */

function HubHero({
  lastUpdated,
  statusLabel,
  sourceCount,
  totalItems,
  orbitCount,
}: {
  lastUpdated?: string;
  statusLabel: string;
  sourceCount: number;
  totalItems: number;
  orbitCount: number;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/8">
      <div className="absolute inset-0 bg-grad-hero" aria-hidden />
      <div className="absolute inset-0 starfield opacity-60" aria-hidden />
      <div className="absolute inset-0 grid-cosmic opacity-[0.18]" aria-hidden />
      <svg
        className="pointer-events-none absolute -right-24 -top-24 h-[28rem] w-[28rem] opacity-40 motion-safe:anim-rotate-slow"
        viewBox="0 0 400 400"
        aria-hidden
      >
        <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-primary/40" />
        <circle cx="200" cy="200" r="110" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/25" />
        <circle cx="200" cy="200" r="70" fill="none" stroke="currentColor" strokeWidth="0.4" className="text-primary/20" />
        <circle cx="350" cy="200" r="3" className="fill-primary/70" />
        <circle cx="200" cy="90" r="2" className="fill-primary/50" />
      </svg>
      <div className="absolute inset-0 vignette" aria-hidden />

      <div className="container-page relative py-16 md:py-24">
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
          <Satellite className="h-3 w-3" aria-hidden />
          Global science feed
        </p>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.08] md:text-6xl">
          Astrophysics <span className="text-grad-accent">News Hub</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Astronomy, astrophysics and space-science stories gathered from trusted observatories,
          space agencies and research institutions worldwide — with a spotlight on the discoveries
          closest to Diya Ram's own research.
        </p>

        <dl className="mt-9 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Stories in feed", value: totalItems, icon: Newspaper },
            { label: "Trusted sources", value: sourceCount, icon: Globe2 },
            { label: "Topics tracked", value: orbitCount, icon: Orbit },
            { label: "Feed status", value: statusLabel, icon: Signal },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl px-4 py-3">
              <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <stat.icon className="h-3 w-3 shrink-0" aria-hidden />
                <span className="truncate">{stat.label}</span>
              </dt>
              <dd className="mt-1 font-display text-lg font-semibold text-foreground">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Last updated · {lastUpdated ? formatNewsLastUpdated(lastUpdated) : "synchronising…"}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#news-feed"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-grad-accent px-5 text-sm font-medium text-[oklch(0.12_0.04_265)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Compass className="h-4 w-4" aria-hidden />
            Browse the feed
          </a>
          <Link
            to="/mission-log"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 text-sm transition-colors hover:border-primary/45 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Rocket className="h-4 w-4" aria-hidden />
            Diya's Scientific Mission Log
          </Link>
        </div>
        <p className="mt-3 max-w-2xl text-xs text-muted-foreground">
          This hub carries external astronomy news only. Diya Ram's own research updates,
          publications and milestones live in the Scientific Mission Log.
        </p>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- page */

function formatNewsLastUpdated(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const istDateTime = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  const utcTime = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

  return `${istDateTime} IST (${utcTime} UTC)`;
}
function NewsHubPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const [searchInput, setSearchInput] = useState(search.q ?? "");
  const debouncedSearch = useDebounced(searchInput);
  const feedRef = useRef<HTMLDivElement>(null);
  const skipScrollRef = useRef(true);

  // Keep the input in step with back/forward navigation.
  useEffect(() => {
    setSearchInput(search.q ?? "");
  }, [search.q]);

  // Push the debounced term into the URL (single source of truth).
  useEffect(() => {
    const next = debouncedSearch.trim() || undefined;
    if (next === (search.q ?? undefined)) return;
    navigate({ resetScroll: false, search: (prev: NewsSearch) => ({ ...prev, q: next, page: undefined }), replace: true });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeFilters: ActiveFilters = useMemo(() => {
    const out: ActiveFilters = {};
    for (const key of MULTI_FILTER_KEYS) if (search[key]?.length) out[key] = search[key];
    return out;
  }, [search]);

  const activeCount = useMemo(
    () => Object.values(activeFilters).reduce((sum, arr) => sum + (arr?.length ?? 0), 0),
    [activeFilters],
  );

  const query: NewsQuery = useMemo(
    () => ({
      page: search.page ?? 1,
      pageSize: newsConfig.pageSize,
      search: search.q,
      sort: search.sort ?? "newest",
      researchOrbit: search.orbit || undefined,
      ...activeFilters,
    }),
    [search.page, search.q, search.sort, search.orbit, activeFilters],
  );

  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: ["news", query],
    queryFn: ({ signal }) => getNews(query, signal),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const setPage = useCallback(
    (page: number) => {
      skipScrollRef.current = false;
      navigate({ search: (prev: NewsSearch) => ({ ...prev, page: page > 1 ? page : undefined }) });
    },
    [navigate],
  );

  // Scroll to the feed only after an explicit page change.
  useEffect(() => {
    if (skipScrollRef.current) return;
    skipScrollRef.current = true;
    feedRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [search.page]);

  const toggleFilter = useCallback(
    (key: MultiFilterKey, value: string) => {
      navigate({ resetScroll: false,
        search: (prev: NewsSearch) => {
          const current = (prev[key] as string[] | undefined) ?? [];
          const next = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];
          return { ...prev, [key]: next.length ? next : undefined, page: undefined };
        },
      });
    },
    [navigate],
  );

  const clearFilters = useCallback(() => {
    navigate({ resetScroll: false,
      search: (prev: NewsSearch) => ({ q: prev.q, sort: prev.sort, orbit: prev.orbit }),
    });
  }, [navigate]);

  const setSort = useCallback(
    (sort: NewsSort) =>
      navigate({ resetScroll: false, search: (prev: NewsSearch) => ({ ...prev, sort: sort === "newest" ? undefined : sort, page: undefined }) }),
    [navigate],
  );

  const toggleOrbit = useCallback(
    () => navigate({ resetScroll: false, search: (prev: NewsSearch) => ({ ...prev, orbit: prev.orbit ? undefined : true, page: undefined }) }),
    [navigate],
  );

  const options = data?.availableFilters;
  const items = data?.items ?? [];
  const featured = data?.featuredItems ?? [];
  const [lead, ...supporting] = featured;

  const orbitStories = useMemo(
    () => items.filter((a) => a.isResearchOrbit).slice(0, 3),
    [items],
  );

  const hasQuery = Boolean(search.q?.trim());
  const statusLabel =
    data?.status === "demo"
      ? "Demonstration"
      : data?.status === "partial"
        ? "Partial update"
        : data?.status === "cached"
          ? "Cached"
          : error || data?.status === "error"
            ? "Unavailable"
            : "Live";


  return (
    <div className="pb-24">
      <HubHero
        lastUpdated={data?.lastUpdated}
        statusLabel={statusLabel}
        sourceCount={data ? (data.activeSourceCount ?? 0) + (data.failedSourceCount ?? 0) : (options?.sources.length ?? 0)}
        totalItems={data?.pagination.totalItems ?? 0}
        orbitCount={options?.topics.length ?? 0}
      />

      {/* ---------------------------------------------------- system strip */}
      <section aria-label="Feed system status" className="border-b border-white/8 bg-white/[0.02]">
        <div className="container-page flex flex-wrap items-center gap-x-6 gap-y-2 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                error ? "bg-destructive" : "bg-primary motion-safe:anim-pulse-slow",
              )}
              aria-hidden
            />
            Feed {statusLabel}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <RadioTower className="h-3 w-3" aria-hidden />
            {data?.activeSourceCount ?? 0} sources active
          </span>
          {typeof data?.failedSourceCount === "number" && data.failedSourceCount > 0 && (
            <span className="text-amber-200/90">{data.failedSourceCount} sources unavailable</span>
          )}
          <span>Mode · {isDemoMode ? "Demonstration" : "Live ingestion"}</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-auto inline-flex items-center gap-1.5 uppercase tracking-[0.16em] text-primary transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <RefreshCw className={cn("h-3 w-3", isFetching && "motion-safe:animate-spin")} aria-hidden />
            Refresh
          </button>
        </div>
      </section>

      <div className="container-page mt-10 space-y-6">
        {data && (
          <NewsFeedNotice
            status={data.status}
            failedSourceCount={data.failedSourceCount}
            lastUpdated={data.lastUpdated}
            message={data.message}
          />
        )}
        {error && (
          <NewsErrorState
            onRetry={() => refetch()}
            lastUpdated={data?.lastUpdated}
            hasCachedContent={items.length > 0}
          />
        )}
      </div>

      {/* ------------------------------------------------ cosmic briefing */}
      {lead && (
        <section aria-labelledby="briefing-heading" className="container-page mt-12">
          <header className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                Cosmic briefing
              </p>
              <h2 id="briefing-heading" className="mt-2 font-display text-2xl font-semibold md:text-3xl">
                Today's leading stories
              </h2>
            </div>
            <p className="max-w-md text-xs text-muted-foreground">
              Editorially weighted highlights from across the world's observatories and space agencies.
            </p>
          </header>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.55fr_1fr]">
            <NewsLeadCard article={lead} isDemo={isDemoMode} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {supporting.slice(0, 3).map((article) => (
                <NewsCompactCard key={article.id} article={article} isDemo={isDemoMode} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------- research orbit */}
      {orbitStories.length > 0 && (
        <section aria-labelledby="orbit-heading" className="container-page mt-16">
          <div className="glass relative overflow-hidden rounded-3xl p-6 md:p-8">
            <div className="absolute inset-0 starfield-sparse opacity-50" aria-hidden />
            <div className="relative">
              <header className="flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                    <Orbit className="h-3 w-3" aria-hidden />
                    Diya's Research Orbit
                  </p>
                  <h2 id="orbit-heading" className="mt-2 font-display text-2xl font-semibold md:text-3xl">
                    Stories closest to this research
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    External news touching M-dwarf activity, stellar flares and starspots,
                    radio astronomy and the uGMRT, time-domain surveys, and exoplanet
                    space-weather environments — the same questions Diya Ram studies.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleOrbit}
                  aria-pressed={Boolean(search.orbit)}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    search.orbit
                      ? "border-primary/50 bg-primary/15 text-foreground"
                      : "border-white/15 bg-white/[0.04] hover:border-primary/40",
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  {search.orbit ? "Showing Research Orbit only" : "Filter feed to Research Orbit"}
                </button>
              </header>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {orbitStories.map((article) => (
                  <NewsCompactCard key={article.id} article={article} isDemo={isDemoMode} />
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-4 text-xs">
                <Link
                  to="/research"
                  className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
                >
                  Explore Diya's research areas
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
                <Link
                  to="/publications"
                  className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
                >
                  Read the publications
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --------------------------------------------------------- feed */}
      <section id="news-feed" ref={feedRef} aria-labelledby="feed-heading" className="container-page mt-16 scroll-mt-24">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">All transmissions</p>
            <h2 id="feed-heading" className="mt-2 font-display text-2xl font-semibold md:text-3xl">
              The full news feed
            </h2>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            {data ? `${data.pagination.totalItems} stories` : "loading…"}
          </p>
        </header>

        {/* toolbar */}
        <div className="glass sticky top-16 z-30 mt-6 rounded-2xl p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <label htmlFor="news-search" className="sr-only">
                Search astronomy stories
              </label>
              <input
                id="news-search"
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search stories, missions, observatories, topics…"
                maxLength={120}
                className="min-h-11 w-full rounded-full border border-white/10 bg-white/[0.04] pl-11 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label htmlFor="news-sort" className="sr-only">
                Sort stories
              </label>
              <select
                id="news-sort"
                value={search.sort ?? "newest"}
                onChange={(e) => setSort(e.target.value as NewsSort)}
                className="min-h-11 appearance-none rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs text-foreground focus:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <option value="newest" className="bg-background">Newest first</option>
                <option value="oldest" className="bg-background">Oldest first</option>
                <option value="relevance" className="bg-background">Research relevance</option>
                <option value="featured" className="bg-background">Featured first</option>
              </select>
              <div className="flex-1 md:hidden">
                <NewsFilterSheet
                  options={options ?? emptyOptions}
                  active={activeFilters}
                  onToggle={toggleFilter}
                  onClearAll={clearFilters}
                  activeCount={activeCount}
                />
              </div>
            </div>
          </div>

          {activeCount > 0 && options && (
            <div className="mt-3">
              <ActiveFilterChips
                active={activeFilters}
                options={options}
                onToggle={toggleFilter}
                onClearAll={clearFilters}
              />
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_1fr]">
          <NewsFilterPanel
            options={options ?? emptyOptions}
            active={activeFilters}
            onToggle={toggleFilter}
            onClearAll={clearFilters}
            activeCount={activeCount}
          />

          <div aria-live="polite" aria-busy={isFetching}>
            {isPending ? (
              <NewsGridSkeleton />
            ) : error && items.length === 0 ? null : items.length === 0 ? (
              <NewsEmptyState
                variant={hasQuery ? "no-search-results" : activeCount > 0 ? "no-filter-matches" : "no-articles"}
                onClearSearch={hasQuery ? () => setSearchInput("") : undefined}
                onClearFilters={activeCount > 0 ? clearFilters : undefined}
              />
            ) : (
              <>
                <div className={cn("grid gap-5 sm:grid-cols-2 xl:grid-cols-3", isFetching && "opacity-60 transition-opacity")}>
                  {items.map((article) => (
                    <NewsCard key={article.id} article={article} isDemo={isDemoMode} />
                  ))}
                </div>
                {data && (
                  <div className="mt-10">
                    <NewsPagination pagination={data.pagination} onPageChange={setPage} />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ trusted sources */}
      {options?.sources.length ? (
        <section aria-labelledby="sources-heading" className="container-page mt-20">
          <header>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">Provenance</p>
            <h2 id="sources-heading" className="mt-2 font-display text-2xl font-semibold md:text-3xl">
              Trusted sources
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Every story links back to its original publisher. Nothing is reproduced in full:
              headlines and short summaries are shown for attribution and context only.
            </p>
          </header>
          <div className="mt-7 grid gap-6 md:grid-cols-2">
            {[
              {
                label: "International",
                ids: ["nasa", "esa", "eso"],
              },
              {
                label: "National",
                ids: ["aries", "iia", "isro", "ncra"],
              },
            ].map((group) => {
              const sources = options.sources.filter((source) =>
                group.ids.includes(source.id.toLowerCase()),
              );

              if (sources.length === 0) return null;

              return (
                <div
                  key={group.label}
                  className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
                >
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    {group.label}
                  </h3>

                  <ul className="mt-3 flex flex-wrap gap-2.5">
                    {sources.map((source) => (
                      <li key={source.id}>
                        <button
                          type="button"
                          onClick={() => toggleFilter("source", source.id)}
                          aria-pressed={(activeFilters.source ?? []).includes(source.id)}
                          className={cn(
                            "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                            (activeFilters.source ?? []).includes(source.id)
                              ? "border-primary/50 bg-primary/15"
                              : "border-white/12 bg-white/[0.03] text-muted-foreground hover:border-primary/40 hover:text-foreground",
                          )}
                        >
                          <Telescope
                            className="h-3.5 w-3.5 shrink-0"
                            aria-hidden
                          />

                          <span className="truncate">
                            {source.label}
                          </span>

                          {typeof source.count === "number" && (
                            <span className="font-mono text-[10px] opacity-70">
                              {source.count}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------ mission log */}
      <section className="container-page mt-20">
        <div className="glass flex flex-col gap-4 rounded-2xl p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-xl font-semibold">
              Looking for Diya Ram's own research updates?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Publications, observing runs, conference talks, thesis milestones and academic service
              are documented separately in the Scientific Mission Log.
            </p>
          </div>
          <Link
            to="/mission-log"
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-grad-accent px-5 text-sm font-medium text-[oklch(0.12_0.04_265)] transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Open the Mission Log
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </div>
  );
}

const emptyOptions = {
  sources: [],
  categories: [],
  topics: [],
  countries: [],
  missions: [],
  observatories: [],
  telescopes: [],
  newsTypes: [],
};