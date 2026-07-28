import { useState } from "react";
import { Telescope } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Resilient article image. External publisher images are unreliable, so a
 * missing, broken or slow image degrades to a calm astronomy-neutral panel
 * with no layout shift. Works equally with R2-hosted URLs later.
 */
export function NewsImage({
  src,
  alt,
  category,
  className,
  eager = false,
}: {
  src?: string;
  alt?: string;
  category?: string;
  className?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const showFallback = !src || failed;

  return (
    <div className={cn("relative overflow-hidden bg-[oklch(0.16_0.05_265)]", className)}>
      {showFallback ? (
        <NewsImageFallback category={category} />
      ) : (
        <>
          <span
            className={cn(
              "absolute inset-0 bg-[oklch(0.18_0.05_265)] transition-opacity duration-500",
              loaded ? "opacity-0" : "opacity-100",
            )}
            aria-hidden
          />
          <img
            src={src}
            alt={alt ?? ""}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-700 motion-reduce:transition-none",
              loaded ? "opacity-100" : "opacity-0",
            )}
          />
        </>
      )}
    </div>
  );
}

export function NewsImageFallback({ category }: { category?: string }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(closest-side,var(--nebula),transparent_78%)]"
      aria-hidden
    >
      <span className="absolute inset-0 starfield-sparse opacity-50" />
      <Telescope className="relative h-6 w-6 text-primary/70" />
      {category && (
        <span className="relative px-3 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {category}
        </span>
      )}
    </div>
  );
}
