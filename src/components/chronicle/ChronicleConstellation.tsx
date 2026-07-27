import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { constellationNodes, constellationEdges, type ConstellationNode } from "@/data/chronicle";

/**
 * Chronicle Constellation — verified relationships between observing
 * programmes, publications, presentations and doctoral milestones.
 */
export function ChronicleConstellation() {
  const [hover, setHover] = useState<ConstellationNode | null>(null);
  const byId = new Map(constellationNodes.map((n) => [n.id, n]));

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4 md:p-6">
      <svg
        viewBox="0 0 100 100"
        className="h-[420px] w-full md:h-[520px]"
        role="img"
        aria-label="Network diagram connecting Diya Ram's observing programmes, publications, conference presentations and doctoral milestones."
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="chr-node" cx="50%" cy="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
          </radialGradient>
        </defs>

        {constellationEdges.map(([a, b, label]) => {
          const from = byId.get(a);
          const to = byId.get(b);
          if (!from || !to) return null;
          const lit = hover && (hover.id === a || hover.id === b);
          return (
            <line
              key={`${a}-${b}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="currentColor"
              className={lit ? "text-primary" : "text-foreground"}
              strokeOpacity={lit ? 0.7 : 0.16}
              strokeWidth={lit ? 0.45 : 0.25}
            >
              <title>{label}</title>
            </line>
          );
        })}

        {constellationNodes.map((n) => {
          const lit = hover?.id === n.id;
          return (
            <g
              key={n.id}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(null)}
              tabIndex={0}
              className="cursor-pointer outline-none"
            >
              <circle cx={n.x} cy={n.y} r={lit ? 3.2 : 2.4} className="fill-primary" fillOpacity={lit ? 0.9 : 0.55} />
              <circle cx={n.x} cy={n.y} r={lit ? 6 : 4.5} className="fill-primary" fillOpacity={0.1} />
              <title>{n.label}</title>
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 md:inset-x-6">
        {hover ? (
          <div className="glass-strong pointer-events-auto rounded-xl p-3">
            <p className="text-[10px] uppercase tracking-[0.24em] text-primary/80">{hover.category}</p>
            <p className="mt-1 text-sm text-foreground">{hover.label}</p>
            <Link
              to="/news/$slug"
              params={{ slug: hover.slug }}
              className="mt-1 inline-block text-xs text-primary underline-offset-4 hover:underline"
            >
              Open chronicle entry
            </Link>
          </div>
        ) : (
          <p className="text-center text-[11px] text-muted-foreground">
            Hover or focus a node to trace how observations became publications, presentations and thesis chapters.
          </p>
        )}
      </div>
    </div>
  );
}
