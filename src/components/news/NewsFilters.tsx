import { useState } from "react";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FILTER_FACET_MAP,
  FILTER_LABELS,
  MULTI_FILTER_KEYS,
  type MultiFilterKey,
  type NewsFilterOptions,
} from "@/types/news";

export type ActiveFilters = Partial<Record<MultiFilterKey, string[]>>;

type PanelProps = {
  options: NewsFilterOptions;
  active: ActiveFilters;
  onToggle: (key: MultiFilterKey, value: string) => void;
  onClearAll: () => void;
  activeCount: number;
};

const MAX_VISIBLE = 6;

function FilterGroup({
  groupKey,
  options,
  active,
  onToggle,
}: {
  groupKey: MultiFilterKey;
  options: NewsFilterOptions;
  active: ActiveFilters;
  onToggle: PanelProps["onToggle"];
}) {
  const [expanded, setExpanded] = useState(false);
  const facets = options[FILTER_FACET_MAP[groupKey]];
  if (!facets.length) return null;

  const selected = active[groupKey] ?? [];
  const visible = expanded ? facets : facets.slice(0, MAX_VISIBLE);

  return (
    <fieldset className="border-t border-white/8 py-4 first:border-t-0 first:pt-0">
      <legend className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {FILTER_LABELS[groupKey]}
      </legend>
      <div className="flex flex-wrap gap-2">
        {visible.map((facet) => {
          const isOn = selected.includes(facet.id);
          return (
            <button
              key={facet.id}
              type="button"
              aria-pressed={isOn}
              onClick={() => onToggle(groupKey, facet.id)}
              className={cn(
                "inline-flex min-h-9 max-w-full items-center gap-1.5 rounded-full border px-3 text-[11px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                isOn
                  ? "border-primary/50 bg-primary/15 text-foreground"
                  : "border-white/12 bg-white/[0.03] text-muted-foreground hover:border-primary/35 hover:text-foreground",
              )}
            >
              <span className="truncate">{facet.label}</span>
              {typeof facet.count === "number" && (
                <span className="font-mono text-[10px] opacity-70">{facet.count}</span>
              )}
            </button>
          );
        })}
      </div>
      {facets.length > MAX_VISIBLE && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          {expanded ? "Show fewer" : `Show all ${facets.length}`}
          <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} aria-hidden />
        </button>
      )}
    </fieldset>
  );
}

function SourceFilterGroups({
  options,
  active,
  onToggle,
}: Pick<PanelProps, "options" | "active" | "onToggle">) {
  const groups = [
    {
      label: "International",
      ids: ["nasa", "esa", "eso"],
    },
    {
      label: "National",
      ids: ["aries", "iia", "isro", "ncra"],
    },
  ];

  const selected = active.source ?? [];

  return (
    <fieldset className="border-t border-white/10 py-4 first:border-t-0 first:pt-0">
      <legend className="font-display text-xs font-semibold text-foreground">
        Sources
      </legend>

      <div className="mt-3 space-y-4">
        {groups.map((group) => {
          const sources = options.sources.filter((source) =>
            group.ids.includes(source.id.toLowerCase()),
          );

          if (sources.length === 0) return null;

          return (
            <div key={group.label}>
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-primary/90">
                {group.label}
              </p>

              <div className="space-y-1.5">
                {sources.map((source) => {
                  const checked = selected.includes(source.id);

                  return (
                    <label
                      key={source.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle("source", source.id)}
                        className="h-3.5 w-3.5 rounded border-white/20 bg-white/[0.04] accent-[oklch(0.72_0.17_220)]"
                      />

                      <span className="min-w-0 flex-1 truncate">
                        {source.label}
                      </span>

                      {typeof source.count === "number" && (
                        <span className="font-mono text-[10px] opacity-60">
                          {source.count}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
}
function PanelBody({ options, active, onToggle, onClearAll, activeCount }: PanelProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 pb-4">
        <h2 className="font-display text-sm font-semibold">Refine the feed</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>
            {MULTI_FILTER_KEYS.map((key) =>
        key === "source" ? (
          <SourceFilterGroups
            key={key}
            options={options}
            active={active}
            onToggle={onToggle}
          />
        ) : (
          <FilterGroup
            key={key}
            groupKey={key}
            options={options}
            active={active}
            onToggle={onToggle}
          />
        ),
      )}
    </div>
  );
}

/** Desktop sidebar. */
export function NewsFilterPanel(props: PanelProps) {
  return (
    <aside
      aria-label="Filter astronomy stories"
      className="glass sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl p-5 lg:block"
    >
      <PanelBody {...props} />
    </aside>
  );
}

/** Mobile bottom sheet. */
export function NewsFilterSheet(props: PanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 text-xs transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden />
        Filters
        {props.activeCount > 0 && (
          <span className="rounded-full bg-primary/20 px-2 py-0.5 font-mono text-[10px] text-primary">
            {props.activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <div className="glass-strong relative max-h-[82vh] w-full overflow-y-auto rounded-t-3xl p-5 pb-8">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Feed filters
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <PanelBody {...props} />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-grad-accent px-5 text-sm font-medium text-[oklch(0.12_0.04_265)]"
            >
              Show results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Removable chips summarising the active filter set. */
export function ActiveFilterChips({
  active,
  options,
  onToggle,
  onClearAll,
}: {
  active: ActiveFilters;
  options: NewsFilterOptions;
  onToggle: PanelProps["onToggle"];
  onClearAll: () => void;
}) {
  const chips = MULTI_FILTER_KEYS.flatMap((key) =>
    (active[key] ?? []).map((value) => ({
      key,
      value,
      label:
        options[FILTER_FACET_MAP[key]].find((f) => f.id === value)?.label ?? value,
    })),
  );
  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={`${chip.key}-${chip.value}`}
          type="button"
          onClick={() => onToggle(chip.key, chip.value)}
          aria-label={`Remove filter ${FILTER_LABELS[chip.key]}: ${chip.label}`}
          className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-3 text-[11px] text-foreground transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <span className="truncate">
            <span className="text-muted-foreground">{FILTER_LABELS[chip.key]}:</span> {chip.label}
          </span>
          <X className="h-3 w-3 shrink-0" aria-hidden />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-[11px] text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        Clear all
      </button>
    </div>
  );
}
