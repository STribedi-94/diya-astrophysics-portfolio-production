import { AlertTriangle, Info, RefreshCw, SearchX, SignalHigh } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NewsSystemStatus } from "@/types/news";
import { formatNewsDateTime } from "./NewsBadges";

/* --------------------------------------------------------------- skeleton */

export function NewsCardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-2xl" aria-hidden>
      <div className="aspect-[16/9] w-full animate-pulse bg-white/[0.05] motion-reduce:animate-none" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06] motion-reduce:animate-none" />
        <div className="h-4 w-full animate-pulse rounded bg-white/[0.08] motion-reduce:animate-none" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-white/[0.08] motion-reduce:animate-none" />
        <div className="h-3 w-full animate-pulse rounded bg-white/[0.05] motion-reduce:animate-none" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-white/[0.05] motion-reduce:animate-none" />
      </div>
    </div>
  );
}

export function NewsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ empty state */

export function NewsEmptyState({
  variant,
  onClearSearch,
  onClearFilters,
}: {
  variant: "no-articles" | "no-search-results" | "no-filter-matches";
  onClearSearch?: () => void;
  onClearFilters?: () => void;
}) {
  const copy = {
    "no-articles": {
      title: "No stories available yet",
      body: "The feed is connected but has not returned any stories for this view. Please check back shortly.",
    },
    "no-search-results": {
      title: "No stories match that search",
      body: "Try a broader term — for example a topic, mission or observatory name.",
    },
    "no-filter-matches": {
      title: "No stories match these filters",
      body: "The combination of filters is too narrow. Remove one or clear them all to widen the view.",
    },
  }[variant];

  return (
    <div className="glass flex flex-col items-center rounded-2xl px-6 py-14 text-center">
      <SearchX className="h-7 w-7 text-primary/70" aria-hidden />
      <h3 className="mt-4 font-display text-lg font-semibold">{copy.title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{copy.body}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="inline-flex min-h-10 items-center rounded-full border border-white/15 bg-white/[0.04] px-4 text-xs transition-colors hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Clear search
          </button>
        )}
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex min-h-10 items-center rounded-full border border-white/15 bg-white/[0.04] px-4 text-xs transition-colors hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ error state */

export function NewsErrorState({
  onRetry,
  lastUpdated,
  hasCachedContent,
}: {
  onRetry: () => void;
  lastUpdated?: string;
  hasCachedContent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-destructive/35 bg-destructive/10 p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold">The news feed could not be loaded</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {hasCachedContent
              ? "The latest update did not complete, so the most recent stories already retrieved are shown below."
              : "The service is temporarily unreachable. Everything else on this site is unaffected."}
          </p>
          {lastUpdated && (
            <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              Last successful update · {formatNewsDateTime(lastUpdated)}
            </p>
          )}
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-white/[0.05] px-4 text-xs transition-colors hover:border-primary/40 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------- partial / cached / notices */

export function NewsFeedNotice({
  status,
  failedSourceCount,
  lastUpdated,
  message,
}: {
  status: NewsSystemStatus;
  failedSourceCount?: number;
  lastUpdated?: string;
  message?: string;
}) {
  if (status !== "partial" && status !== "cached" && status !== "demo") return null;

  const config = {
    partial: {
      icon: SignalHigh,
      tone: "border-amber-300/25 bg-amber-200/[0.07] text-amber-100/90",
      text:
        failedSourceCount && failedSourceCount > 0
          ? `Some sources are temporarily unavailable (${failedSourceCount} not reachable). Available stories are still shown.`
          : "Some sources are temporarily unavailable. Available stories are still shown.",
    },
    cached: {
      icon: Info,
      tone: "border-white/12 bg-white/[0.04] text-muted-foreground",
      text: `Cached update served while the next refresh completes${
        lastUpdated ? ` · last updated ${formatNewsDateTime(lastUpdated)}` : ""
      }.`,
    },
    demo: {
      icon: Info,
      tone: "border-amber-300/25 bg-amber-200/[0.07] text-amber-100/90",
      text:
        message ??
        "Demonstration data. Automated ingestion from trusted observatories and agencies is not yet connected.",
    },
  }[status];

  const Icon = config.icon;
  return (
    <div className={cn("flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs", config.tone)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p className="min-w-0">{config.text}</p>
    </div>
  );
}
