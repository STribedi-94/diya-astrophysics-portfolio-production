import { Orbit } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NewsArticle } from "@/types/news";

export function NewsSourceBadge({
  article,
  className,
}: {
  article: Pick<NewsArticle, "sourceName" | "sourceLogoUrl" | "sourceType">;
  className?: string;
}) {
  const initials = article.sourceName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.06] font-mono text-[9px] tracking-tight text-primary/90">
        {article.sourceLogoUrl ? (
          <img src={article.sourceLogoUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </span>
      <span className="min-w-0 truncate text-[11px] text-muted-foreground">{article.sourceName}</span>
    </span>
  );
}

export function ResearchOrbitBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      title="External stories closely aligned with Diya Ram's research areas."
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-primary"
    >
      <Orbit className="h-3 w-3 shrink-0" aria-hidden />
      <span className="truncate">{compact ? "Research Orbit" : "Diya's Research Orbit"}</span>
    </span>
  );
}

export function NewsTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex max-w-full items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
      <span className="truncate">{children}</span>
    </span>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-amber-300/30 bg-amber-200/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-amber-200/90">
      Demo record
    </span>
  );
}

export function formatNewsDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatNewsDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }) + " UTC";
}
