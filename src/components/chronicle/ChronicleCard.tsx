import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import type { ChronicleRecord, ChronicleStatus, RelatedLink } from "@/data/chronicle";

const STATUS_STYLES: Record<ChronicleStatus, string> = {
  Published: "border-primary/40 text-primary",
  Accepted: "border-amber-400/40 text-amber-300",
  Completed: "border-emerald-400/40 text-emerald-300",
  Active: "border-sky-400/40 text-sky-300",
  "In Progress": "border-violet-400/40 text-violet-300",
  Confirmed: "border-emerald-400/40 text-emerald-300",
  "Long-Term Vision": "border-white/20 text-muted-foreground",
};

export function StatusBadge({ status }: { status: ChronicleStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em]",
        STATUS_STYLES[status],
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function SourceTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
      <ShieldCheck className="h-3 w-3 text-primary/70" />
      {label}
    </span>
  );
}

export function RelatedLinks({ links }: { links: RelatedLink[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {links.map((l) => (
        <li key={`${l.to}-${l.label}`}>
          <Link
            to={l.to}
            params={l.params as never}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-foreground hover:bg-white/10"
          >
            {l.label}
            <ArrowUpRight className="h-3 w-3 text-primary" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Editorial record card used across the story feed and archive grid. */
export function ChronicleCard({
  record,
  variant = "default",
}: {
  record: ChronicleRecord;
  variant?: "default" | "feature" | "compact";
}) {
  const feature = variant === "feature";

  return (
    <article
      className={cn(
        "glass group relative overflow-hidden rounded-2xl transition-colors hover:bg-white/[0.06]",
        feature ? "md:grid md:grid-cols-2" : "",
      )}
    >
      {record.image && variant !== "compact" && (
        <div className={cn("relative overflow-hidden", feature ? "min-h-[260px]" : "aspect-[16/9]")}>
          <img
            src={record.image}
            alt={record.imageAlt ?? record.title}
            loading="lazy"
            decoding="async"
            className={cn(
              "h-full w-full transition-transform duration-700 group-hover:scale-[1.03]",
              record.imageOrientation === "portrait" && !feature
                ? "object-contain bg-black/40 object-top"
                : "object-cover",
            )}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        </div>
      )}

      <div className={cn("p-5 md:p-6", feature && "flex flex-col justify-center")}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-[10px] uppercase tracking-[0.24em] text-primary/80">
            {record.category}
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {record.dateLabel}
          </span>
          <StatusBadge status={record.status} />
        </div>

        <h3
          className={cn(
            "mt-3 font-display font-semibold leading-snug",
            feature ? "text-2xl md:text-3xl" : "text-lg",
          )}
        >
          <Link to="/news/$slug" params={{ slug: record.slug }} className="hover:text-primary">
            <span className="absolute inset-0" aria-hidden />
            {record.title}
          </Link>
        </h3>

        <p className="mt-3 text-sm text-muted-foreground">{record.summary}</p>

        {(record.institution || record.facility?.length) && (
          <p className="mt-3 text-[11px] text-muted-foreground/80">
            {[record.institution, record.facility?.slice(0, 3).join(" · ")]
              .filter(Boolean)
              .join(" — ")}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <SourceTag label={record.sourceLabel} />
          <span className="relative z-10 inline-flex items-center gap-1 text-xs text-primary">
            Open entry <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}
