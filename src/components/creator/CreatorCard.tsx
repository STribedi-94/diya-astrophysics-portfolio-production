import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import { creator } from "@/data/creator";
import { STLogo } from "./STLogo";
import { QRCode } from "./QRCode";
import { cn } from "@/lib/utils";

/**
 * Compact premium creator card. Trigger renders the ST monogram +
 * "Designed & Developed by Sandipani Tribedi" credit — clickable,
 * keyboard-accessible, opens a dialog with a QR to the portfolio.
 */
export function CreatorCard({
  className,
  trigger,
  compact = false,
}: {
  className?: string;
  trigger?: ReactNode;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const defaultTrigger = (
    <button
      type="button"
      aria-label={creator.a11yLabel}
      className={cn(
        "group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground transition-all",
        "hover:border-white/20 hover:bg-white/[0.06] hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
      )}
    >
      <span className="transition-transform duration-500 group-hover:rotate-[8deg]">
        <STLogo size={compact ? 18 : 22} decorative />
      </span>
      <span className="tracking-[0.02em]">
        {compact ? (
          <>
            <span className="text-foreground/70">Design & Dev by</span>{" "}
            <span className="text-foreground/90">{creator.name}</span>
          </>
        ) : (
          <>
            <span className="text-muted-foreground">
              Concept, Design and Development by{" "}
            </span>
            <span className="text-foreground/90">{creator.name}</span>
          </>
        )}
      </span>
      <ExternalLink className="h-3 w-3 opacity-60 transition-transform group-hover:translate-x-0.5" />
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <span className={cn("inline-block", className)}>{trigger ?? defaultTrigger}</span>
      </DialogTrigger>
      <DialogContent className="max-w-md border-white/10 bg-[oklch(0.10_0.04_265_/_0.95)] backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-2">
              <STLogo size={40} />
            </div>
            <div>
              <DialogTitle className="font-display text-lg">
                {creator.name}
              </DialogTitle>
              <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80">
                Website Creator · Designer · Developer
              </div>
            </div>
          </div>
          <DialogDescription className="pt-3 text-sm text-muted-foreground">
            {creator.description}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <QRCode
            value={creator.portfolioUrl}
            size={180}
            ariaLabel={`Scan to visit ${creator.name}'s portfolio`}
          />
          <p className="text-center text-xs text-muted-foreground">
            Scan to visit {creator.name}'s portfolio
          </p>
          <a
            href={creator.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-medium text-foreground transition-all hover:border-primary/70 hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            {creator.portfolioLabel}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <a
            href={creator.portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-center text-[10px] font-mono text-muted-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
          >
            {creator.portfolioUrl}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
