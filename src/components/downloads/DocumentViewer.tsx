import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  ExternalLink,
  Maximize2,
  Minimize2,
  Quote,
  Check,
  FileWarning,
} from "lucide-react";
import {
  formatBytes,
  citationFor,
  bibtexFor,
  RECORD_TYPE_LABEL,
  type ArchiveRecord,
} from "@/data/downloads";
import { cn } from "@/lib/utils";

type Props = {
  record: ArchiveRecord | null;
  onOpenChange: (open: boolean) => void;
};

/**
 * Premium document viewer. The heavy document itself (PDF iframe / full-size
 * image) is only mounted once the dialog is open, so nothing is preloaded.
 */
export function DocumentViewer({ record, onOpenChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setExpanded(false);
    setFailed(false);
  }, [record?.id]);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  if (!record) return null;

  const citation = citationFor(record);
  const bibtex = bibtexFor(record);
  const size = formatBytes(record.fileSize);

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(null), 2200);
    } catch {
      setCopied(null);
    }
  };

  return (
    <Dialog open={Boolean(record)} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "gap-0 overflow-hidden border-white/10 bg-[oklch(0.12_0.04_265_/_0.96)] p-0 backdrop-blur-xl",
          expanded
            ? "h-[100dvh] w-screen max-w-none rounded-none sm:max-w-none"
            : "h-[92dvh] w-[96vw] max-w-5xl rounded-2xl",
        )}
      >
        <DialogHeader className="space-y-1 border-b border-white/10 px-4 py-3 text-left sm:px-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary/80">
            {RECORD_TYPE_LABEL[record.type]}
            {record.year ? ` · ${record.year}` : ""}
            {record.pageCount ? ` · ${record.pageCount} pages` : ""}
            {size ? ` · ${record.fileKind} · ${size}` : ""}
          </div>
          <DialogTitle className="pr-10 font-display text-base leading-snug sm:text-lg">
            {record.title}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Document viewer for {record.title}. Press Escape to close.
          </DialogDescription>
        </DialogHeader>

        <div className="relative min-h-0 flex-1 bg-black/40">
          {!record.fileUrl || failed ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
              <FileWarning className="h-8 w-8 text-muted-foreground" aria-hidden />
              <p className="max-w-md text-sm text-muted-foreground">
                {record.fileUrl
                  ? "Preview unavailable in this browser — the original public document remains downloadable."
                  : "Metadata is publicly available. The full document is not distributed from this archive."}
              </p>
              {record.fileUrl && (
                <a
                  href={record.fileUrl}
                  download={record.downloadName}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-2 text-xs font-medium"
                >
                  <Download className="h-3.5 w-3.5" aria-hidden /> Download instead
                </a>
              )}
            </div>
          ) : record.fileKind === "JPEG" ? (
            <img
              src={record.fileUrl}
              alt={record.thumbnailAlt ?? record.title}
              className="h-full w-full object-contain"
              onError={() => setFailed(true)}
            />
          ) : (
            <iframe
              key={record.id}
              src={`${record.fileUrl}#view=FitH`}
              title={`${record.title} — document preview`}
              className="h-full w-full border-0 bg-white"
              onError={() => setFailed(true)}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-4 py-3 sm:px-6">
          {record.fileUrl && (
            <a
              href={record.fileUrl}
              download={record.downloadName}
              className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-4 py-2 text-xs font-medium transition-colors hover:bg-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label={`Download ${record.title}, ${record.fileKind}${size ? `, ${size}` : ""}`}
            >
              <Download className="h-3.5 w-3.5" aria-hidden /> Download
            </a>
          )}
          {citation && (
            <button
              type="button"
              onClick={() => copy(citation, "citation")}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs transition-colors hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {copied === "citation" ? (
                <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
              ) : (
                <Quote className="h-3.5 w-3.5" aria-hidden />
              )}
              Copy citation
            </button>
          )}
          {bibtex && (
            <button
              type="button"
              onClick={() => copy(bibtex, "bibtex")}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs transition-colors hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {copied === "bibtex" ? <Check className="h-3.5 w-3.5 text-primary" aria-hidden /> : null}
              Copy BibTeX
            </button>
          )}
          {record.doiUrl && (
            <a
              href={record.doiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs transition-colors hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              aria-label={`Open the DOI record for ${record.title} (opens in a new tab)`}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Open DOI
            </a>
          )}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="ml-auto inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs transition-colors hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            aria-pressed={expanded}
          >
            {expanded ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" aria-hidden /> Exit reading mode
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" aria-hidden /> Reading mode
              </>
            )}
          </button>
          <span aria-live="polite" className="sr-only">
            {copied === "citation"
              ? "Citation copied to research clipboard"
              : copied === "bibtex"
                ? "BibTeX copied to research clipboard"
                : ""}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
