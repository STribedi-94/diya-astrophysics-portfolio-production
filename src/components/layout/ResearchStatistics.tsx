import { useEffect, useState } from "react";
import { Eye, Globe2, Activity } from "lucide-react";

export type ResearchStatsData = {
  visitors: number;
  countries: number;
  sessions: number;
};

export type ResearchStatsState =
  | { status: "loading" }
  | { status: "ready"; data: ResearchStatsData }
  | { status: "unavailable" };

const VISITOR_STORAGE_KEY = "diya-research-visitor-id";
const SESSION_STORAGE_KEY = "diya-research-session-id";

function createAnonymousId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random()
    .toString(36)
    .slice(2)}`;
}

function getOrCreateId(storage: Storage, key: string): string {
  const existing = storage.getItem(key);

  if (existing && /^[A-Za-z0-9_-]{16,128}$/.test(existing)) {
    return existing;
  }

  const created = createAnonymousId();
  storage.setItem(key, created);
  return created;
}

function isResearchStatsData(value: unknown): value is ResearchStatsData {
  if (!value || typeof value !== "object") return false;

  const data = value as Partial<ResearchStatsData>;

  return (
    typeof data.visitors === "number" &&
    Number.isFinite(data.visitors) &&
    typeof data.countries === "number" &&
    Number.isFinite(data.countries) &&
    typeof data.sessions === "number" &&
    Number.isFinite(data.sessions)
  );
}

function useResearchStatistics(): ResearchStatsState {
  const [state, setState] = useState<ResearchStatsState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const visitorId = getOrCreateId(localStorage, VISITOR_STORAGE_KEY);
        const sessionId = getOrCreateId(sessionStorage, SESSION_STORAGE_KEY);

        const response = await fetch("/api/statistics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ visitorId, sessionId }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Statistics request failed with HTTP ${response.status}`);
        }

        const data = (await response.json()) as unknown;

        if (!isResearchStatsData(data)) {
          throw new Error("Statistics response was invalid.");
        }

        if (!controller.signal.aborted) {
          setState({ status: "ready", data });
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("[statistics] Unable to load aggregate research statistics.", error);
        setState({ status: "unavailable" });
      }
    }

    void load();

    return () => controller.abort();
  }, []);

  return state;
}

const metrics = [
  {
    key: "visitors" as const,
    label: "Visitors",
    icon: Eye,
    descriptor: "Unique anonymous browsers",
    help: "Distinct anonymous browser identifiers recorded by the portfolio statistics service.",
  },
  {
    key: "countries" as const,
    label: "Countries",
    icon: Globe2,
    descriptor: "Countries represented",
    help: "Distinct broad visitor countries observed by Cloudflare at the server edge.",
  },
  {
    key: "sessions" as const,
    label: "Research Sessions",
    icon: Activity,
    descriptor: "Anonymous browsing sessions",
    help: "Distinct anonymous browser sessions recorded by the portfolio statistics service.",
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
        Anonymous aggregate website metrics. No personally identifying visitor information is shown.
      </p>
    </section>
  );
}
