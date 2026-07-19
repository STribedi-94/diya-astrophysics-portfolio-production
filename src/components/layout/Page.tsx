import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20", className)}>
      <div className="absolute inset-0 bg-grad-hero opacity-70" aria-hidden />
      <div className="absolute inset-0 starfield anim-drift opacity-70" aria-hidden />
      <div className="absolute inset-0 grid-cosmic opacity-40" aria-hidden />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--nebula), transparent 70%)" }}
        aria-hidden
      />
      <div className="container-page relative">
        {eyebrow && (
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-primary/90">
            <span className="h-1.5 w-1.5 rounded-full bg-primary anim-pulse-slow" />
            {eyebrow}
          </div>
        )}
        <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.05] md:text-6xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">{intro}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  intro,
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("py-16 md:py-24 scroll-mt-24", className)}>
      <div className="container-page">
        {(eyebrow || title || intro) && (
          <div className="mb-10 max-w-3xl">
            {eyebrow && (
              <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-primary/80">
                {eyebrow}
              </div>
            )}
            {title && (
              <h2 className="font-display text-3xl font-semibold md:text-4xl">{title}</h2>
            )}
            {intro && <p className="mt-4 text-muted-foreground md:text-lg">{intro}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}


export function GlassPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("glass rounded-2xl p-6", className)}>{children}</div>;
}

export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <div className="glass rounded-xl border-dashed border-white/10 p-6 text-sm text-muted-foreground">
      {children}
    </div>
  );
}
