import { Gauge } from "lucide-react";
import { usePerf, type PerfPreference } from "@/lib/performance";
import { cn } from "@/lib/utils";

const options: { value: PerfPreference; label: string; hint: string }[] = [
  { value: "auto", label: "Auto", hint: "Adapts to your device automatically" },
  { value: "cinematic", label: "Full visuals", hint: "All cinematic effects enabled" },
  { value: "performance", label: "Performance", hint: "Lighter rendering, same content" },
  { value: "reduced-motion", label: "Reduced motion", hint: "No decorative motion" },
];

/** Unobtrusive visitor control for the site-wide visual performance mode. */
export function VisualPerformanceControl() {
  const { preference, setPreference, mode } = usePerf();

  return (
    <section aria-labelledby="visual-performance-heading">
      <h2
        id="visual-performance-heading"
        className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80"
      >
        <Gauge className="h-3 w-3" aria-hidden /> Visual Performance
      </h2>
      <div
        role="radiogroup"
        aria-label="Visual performance mode"
        className="mt-3 flex flex-wrap gap-1.5"
      >
        {options.map((o) => {
          const selected = preference === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              title={o.hint}
              onClick={() => setPreference(o.value)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                selected
                  ? "border-primary/50 bg-primary/15 text-foreground"
                  : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
        Currently running in <span className="text-foreground/80">{mode.replace("-", " ")}</span> mode.
        Your choice is stored on this device only.
      </p>
    </section>
  );
}
