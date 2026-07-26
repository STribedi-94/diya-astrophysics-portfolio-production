import { useRef, useState } from "react";
import {
  Download,
  Eye,
  ExternalLink,
  Quote,
  Check,
  Star,
  Users,
  BookMarked,
  Presentation,
  Frame,
  IdCard,
  Camera,
  Shield,
} from "lucide-react";
import {
  ACCESS_LABEL,
  RECORD_TYPE_LABEL,
  citationFor,
  formatBytes,
  type ArchiveRecord,
  type RecordType,
} from "@/data/downloads";
import { RelatedLink } from "./ArchiveNavigator";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<RecordType, typeof Star> = {
  cv: IdCard,
  "first-author": Star,
  collaborative: Users,
  thesis: BookMarked,
  presentation: Presentation,
  poster: Frame,
  image: Camera,
};

const TYPE_ACCENT: Record<RecordType, string> = {
  cv: "text-primary",
  "first-author": "text-stellar-gold",
  collaborative: "text-radio-teal",
  thesis: "text-uv-violet",
  presentation: "text-magenta",
  poster: "text-magenta",
  image: "text-habitable-aqua",
};

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | null>(null);
  const copy = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(null), 2200);
    } catch {
      setCopied(null);
    }
  };
  return { copied, copy };
}

export function RecordCard({
  record,
  onPreview,
  variant = "default",
}: {
  record: ArchiveRecord;
  onPreview: (r: ArchiveRecord) => void;
  variant?: "default" | "featured" | "compact";
}) {
  const [showAbstract, setShowAbstract] = useState(false);
  const { copied, copy } = useCopy();
  const Icon = TYPE_ICON[record.type];
  const size = formatBytes(record.fileSize);
  const citation = citationFor(record);
  const restricted = record.access === "metadata-only";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.16_0.05_265_/_0.55)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/35",
        variant === "featured" && "md:flex-row",
      )}
    >
      {/* Classification strip */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 bg-gradient-to-b from-black/50 to-transparent px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em]">
        <Icon className={cn("h-3.5 w-3.5", TYPE_ACCENT[record.type])} aria-hidden />
        <span className="text-muted-foreground">{RECORD_TYPE_LABEL[record.type]}</span>
        {record.year && <span className="text-muted-foreground/70">· {record.year}</span>}
        <span className="ml-auto flex items-center gap-1 text-muted-foreground/80">
          {restricted && <Shield className="h-3 w-3" aria-hidden />}
          {ACCESS_LABEL[record.access]}
        </span>
      </div>

      {/* Thumbnail */}
      <div
        className={cn(
          "relative shrink-0 overflow-hidden border-b border-white/10 bg-black/40",
          variant === "featured" ? "md:w-64 md:border-b-0 md:border-r" : "",
        )}
      >
        {record.thumbnail ? (
          <img
            src={record.thumbnail}
            alt={record.thumbnailAlt ?? record.title}
            loading="lazy"
            decoding="async"
            width={760}
            height={record.fileKind === "PDF" ? 983 : 507}
            className={cn(
              "w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]",
              record.fileKind === "PDF" ? "aspect-[3/4] max-h-72" : "aspect-[16/10]",
              variant === "featured" && "md:h-full md:max-h-none",
            )}
          />
        ) : (
          <div className="flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_30%,oklch(0.30_0.10_300/0.5),transparent_70%)] p-6 text-center">
            <BookMarked className="h-7 w-7 text-uv-violet" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Preview unavailable
            </span>
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5 pt-4">
        <h3
          className={cn(
            "font-display font-semibold leading-snug",
            variant === "featured" ? "text-lg md:text-xl" : "text-base",
          )}
        >
          {record.title}
        </h3>

        {record.authorshipLabel && (
          <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-primary/80">
            {record.authorshipLabel}
          </div>
        )}
        {record.venue && (
          <p className="mt-1.5 text-xs text-muted-foreground">
            {record.venue}
            {record.date ? ` · ${record.date}` : ""}
          </p>
        )}

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{record.summary}</p>

        {record.abstract && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setShowAbstract((v) => !v)}
              aria-expanded={showAbstract}
              className="text-xs text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {showAbstract ? "Hide abstract" : "Read more"}
            </button>
            {showAbstract && (
              <p className="mt-2 max-h-56 overflow-y-auto text-xs leading-relaxed text-muted-foreground">
                {record.abstract}
              </p>
            )}
          </div>
        )}

        {/* Technical strip */}
        <dl className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground/85">
          {record.fileKind && (
            <div>
              <dt className="sr-only">Format</dt>
              <dd>
                {record.fileKind}
                {size ? ` · ${size}` : ""}
              </dd>
            </div>
          )}
          {record.pageCount && (
            <div>
              <dt className="sr-only">Pages</dt>
              <dd>{record.pageCount} pages</dd>
            </div>
          )}
          {record.wavelength && (
            <div>
              <dt className="sr-only">Wavelength domain</dt>
              <dd>{record.wavelength}</dd>
            </div>
          )}
        </dl>

        {record.doi && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <code className="rounded bg-white/5 px-2 py-1 font-mono text-[10.5px] text-muted-foreground">
              DOI {record.doi}
            </code>
            <button
              type="button"
              onClick={() => copy(record.doi!, "doi")}
              className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-primary/90 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {copied === "doi" ? "DOI copied" : "Copy DOI"}
            </button>
          </div>
        )}

        {record.themes.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5" role="list">
            {record.themes.slice(0, 4).map((t) => (
              <li
                key={t}
                className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[10.5px] text-muted-foreground"
              >
                {t}
              </li>
            ))}
          </ul>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {record.fileUrl ? (
            <>
              <a
                href={record.fileUrl}
                download={record.downloadName}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-primary/35 bg-primary/15 px-4 py-2 text-xs font-medium transition-all hover:-translate-y-0.5 hover:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label={`Download ${record.title}, ${record.fileKind}${size ? `, ${size}` : ""}`}
              >
                <Download className="h-3.5 w-3.5" aria-hidden /> Download
              </a>
              <button
                type="button"
                onClick={() => onPreview(record)}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs transition-colors hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label={`Preview ${record.title}`}
              >
                <Eye className="h-3.5 w-3.5" aria-hidden /> Preview
              </button>
            </>
          ) : (
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-muted-foreground">
              Metadata is publicly available. Full document access is restricted.
            </span>
          )}

          {citation && (
            <button
              type="button"
              onClick={() => copy(citation, "cite")}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs transition-colors hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {copied === "cite" ? (
                <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
              ) : (
                <Quote className="h-3.5 w-3.5" aria-hidden />
              )}
              {copied === "cite" ? "Citation copied" : "Copy citation"}
            </button>
          )}

          {record.doiUrl && (
            <a
              href={record.doiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs transition-colors hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label={`Open DOI record for ${record.title} (opens in a new tab)`}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Open DOI
            </a>
          )}
          {record.adsUrl && (
            <a
              href={record.adsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs transition-colors hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label={`Open the NASA ADS record for ${record.title} (opens in a new tab)`}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden /> NASA ADS
            </a>
          )}
        </div>

        {record.related.length > 0 && (
          <nav aria-label={`Related pages for ${record.title}`} className="mt-4 flex flex-wrap gap-1.5">
            {record.related.map((r) => (
              <RelatedLink key={`${r.to}-${r.label}`} to={r.to} slug={r.hash} label={r.label} />
            ))}
          </nav>
        )}

        {record.credit && (
          <p className="mt-3 text-[10.5px] text-muted-foreground/70">{record.credit}</p>
        )}

        <span aria-live="polite" className="sr-only">
          {copied === "cite" ? "Citation copied to research clipboard" : ""}
          {copied === "doi" ? "DOI copied to research clipboard" : ""}
        </span>
      </div>
    </article>
  );
}
