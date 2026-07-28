import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NewsPagination as Pagination } from "@/types/news";

function pageWindow(page: number, totalPages: number): (number | "gap")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - (sorted[i - 1] as number) > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

const btn =
  "inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:cursor-not-allowed disabled:opacity-40";

export function NewsPagination({
  pagination,
  onPageChange,
}: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}) {
  const { page, totalPages, hasNextPage, hasPreviousPage } = pagination;
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Story pages" className="flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPreviousPage}
        aria-label="Previous page"
        className={cn(btn, "border-white/12 bg-white/[0.03] hover:border-primary/40")}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>

      {pageWindow(page, totalPages).map((entry, i) =>
        entry === "gap" ? (
          <span key={`gap-${i}`} className="px-1 text-xs text-muted-foreground" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={entry}
            type="button"
            onClick={() => onPageChange(entry)}
            aria-label={`Page ${entry}`}
            aria-current={entry === page ? "page" : undefined}
            className={cn(
              btn,
              entry === page
                ? "border-primary/50 bg-primary/15 font-medium text-foreground"
                : "border-white/12 bg-white/[0.03] text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {entry}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        aria-label="Next page"
        className={cn(btn, "border-white/12 bg-white/[0.03] hover:border-primary/40")}
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </nav>
  );
}
