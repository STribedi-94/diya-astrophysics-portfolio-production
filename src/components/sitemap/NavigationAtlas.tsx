import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { atlasRoot, atlasBranches, type AtlasNode } from "@/data/navigation-atlas";

function Node({
  node,
  onActive,
  active,
  root,
}: {
  node: AtlasNode;
  onActive: (id: string | null) => void;
  active: boolean;
  root?: boolean;
}) {
  const Icon = node.icon;
  return (
    <Link
      to={node.to}
      onMouseEnter={() => onActive(node.to)}
      onMouseLeave={() => onActive(null)}
      onFocus={() => onActive(node.to)}
      onBlur={() => onActive(null)}
      className={cn(
        "group relative flex min-h-14 w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-3.5 py-3 text-left transition-all duration-200 motion-reduce:transition-none",
        "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 motion-reduce:hover:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        active && "border-primary/40",
        root && "border-primary/40 bg-primary/10",
      )}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-primary">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-sm font-semibold leading-snug text-foreground">
          {node.label}
        </span>
        <span className="block text-[11px] leading-snug text-muted-foreground">
          {node.descriptor}
        </span>
      </span>
      <ArrowUpRight
        className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
        aria-hidden
      />
    </Link>
  );
}

export function NavigationAtlas() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="relative">
      {/* Root */}
      <div className="mx-auto w-full max-w-sm">
        <Node node={atlasRoot} onActive={setActive} active={active === atlasRoot.to} root />
      </div>

      {/* Trunk connectors — decorative */}
      <svg
        className="pointer-events-none mx-auto hidden h-16 w-full max-w-6xl lg:block"
        viewBox="0 0 1000 64"
        preserveAspectRatio="none"
        aria-hidden
        focusable="false"
      >
        <g fill="none" stroke="currentColor" className="text-primary/35" strokeWidth="1.5">
          <path d="M500 0 V22" />
          <path d="M500 22 H125 V64" />
          <path d="M500 22 H375 V64" />
          <path d="M500 22 H625 V64" />
          <path d="M500 22 H875 V64" />
        </g>
      </svg>
      <div className="mx-auto h-8 w-px bg-primary/35 lg:hidden" aria-hidden />

      {/* Branches */}
      <div className="grid gap-8 lg:grid-cols-4 lg:gap-6">
        {atlasBranches.map((branch) => (
          <section key={branch.id} aria-labelledby={`atlas-${branch.id}`} className="relative">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5">
              <h3
                id={`atlas-${branch.id}`}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary/85"
              >
                {branch.title}
              </h3>
              <p className="mt-1 text-[11px] text-muted-foreground">{branch.summary}</p>
            </div>
            <ul className="relative mt-3 space-y-3 pl-5">
              <span
                className="absolute left-1.5 top-0 bottom-4 w-px bg-white/10"
                aria-hidden
              />
              {branch.nodes.map((node) => (
                <li key={node.to} className="relative">
                  <span
                    className={cn(
                      "absolute -left-3.5 top-7 h-px w-3.5 transition-colors",
                      active === node.to ? "bg-primary/70" : "bg-white/10",
                    )}
                    aria-hidden
                  />
                  <Node node={node} onActive={setActive} active={active === node.to} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
