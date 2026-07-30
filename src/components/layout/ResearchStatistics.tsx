import { Eye, Globe2, Activity } from "lucide-react";

/**
 * Data contract for the global Research Statistics block.
 * The project has no persistent analytics source, so the hook reports an
 * honest "unavailable" state. When a real aggregate-statistics source is
 * connected, return { status: "ready", data } from here — the UI needs no change.
 */
export type ResearchStatsData = {
  visitors: number;
  countries: number;
  sessions: number;
};

export type ResearchStatsState =
  | { status: "loading" }
  | { status: "ready"; data: ResearchStatsData }
  | { status: "unavailable" };

function useResearchStatistics(): ResearchStatsState {
  return { status: "unavailable" };
}

const metrics = [
  {
    key: "visitors" as const,
    label: "Visitors",
    icon: Eye,
    descriptor: "Aggregate website visits",
    help: "Total aggregate visits recorded by the website statistics source.",
  },
  {
    key: "countries" as const,
    label: "Countries",
    icon: Globe2,
    descriptor: "Broad regions represented",
    help: "Number of broad visitor countries represented in aggregate statistics.",
  },
  {
    key: "sessions" as const,
    label: "Research Sessions",
    icon: Activity,
    descriptor: "Aggregate browsing sessions",
    help: "Aggregate website sessions as defined by the statistics source.",
  },
];

export function ResearchStatistics() {
  const state = useResearchStatistics();
  const unavailable = state.status === "unavailable";

  return (
    <section aria-labelledby="research-statistics-heading">
      <h2
        id="research-statistics-heading"
        className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80"
      >
        Research Statistics
      </h2>
      <ul className="mt-3 space-y-2">
        {metrics.map((m) => {
          const Icon = m.icon;
          const helpId = `stat-help-${m.key}`;
          const value =
            state.status === "ready"
              ? state.data[m.key].toLocaleString()
              : state.status === "loading"
                ? null
                : "—";
          return (
            <li
              key={m.key}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
            >
              <Icon className="h-3.5 w-3.5 shrink-0 text-primary/80" aria-hidden />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs text-foreground">{m.label}</div>
                <div className="truncate text-[10px] text-muted-foreground">{m.descriptor}</div>
              </div>
              <div
                className="min-w-[3ch] text-right font-mono text-sm tabular-nums text-foreground"
                aria-describedby={helpId}
              >
                {value ?? (
                  <span
                    className="inline-block h-4 w-10 rounded bg-white/10 align-middle"
                    aria-hidden
                  />
                )}
              </div>
              <span id={helpId} className="sr-only">
                {unavailable ? `${m.label}: statistics currently unavailable.` : m.help}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
        Aggregate website metrics. These figures do not identify individual visitors.
      </p>
    </section>
  );
}
