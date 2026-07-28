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
          {!loaded && (
            <span
              className="absolute inset-0 animate-pulse bg-[oklch(0.18_0.05_265)] motion-reduce:animate-none"
              aria-hidden
            />
          )}
          <img
            src={src}
            alt={alt ?? ""}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            // Cached / SSR-complete images never fire onLoad after hydration.
            ref={(node) => {
              if (node?.complete && node.naturalWidth > 0) setLoaded(true);
            }}
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
