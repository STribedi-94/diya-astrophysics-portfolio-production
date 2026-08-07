import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Orbit,
  Satellite,
  Sparkles,
  X,
} from "lucide-react";

import type { NetworkNode } from "@/data/observatory-network";
import { cn } from "@/lib/utils";

import { TESS_MISSION_PRESENTATION } from "./tess-mission-data";
import { TessResearchMode } from "./TessResearchMode";

type TessMissionPanelProps = {
  node: NetworkNode;
  isFullscreen: boolean;
  onClose: () => void;
};

export function TessMissionPanel({
  node,
  isFullscreen,
  onClose,
}: TessMissionPanelProps) {
  const mission =
    TESS_MISSION_PRESENTATION;

  const [researchOpen, setResearchOpen] =
    useState(false);

  return (
    <aside
      className={cn(
        "absolute z-20 overflow-y-auto rounded-2xl border border-white/10 bg-[oklch(0.085_0.035_275/0.91)] shadow-2xl backdrop-blur-xl",
        "max-h-[calc(100%-5.5rem)]",
        isFullscreen
          ? "bottom-16 left-3 right-3 sm:bottom-5 sm:left-5 sm:right-auto sm:w-[420px] sm:max-w-[calc(100vw-2.5rem)]"
          : "bottom-3 left-3 right-3 sm:right-auto sm:w-[390px] sm:max-w-[calc(100%-1.5rem)]",
      )}
      aria-label="TESS mission information"
    >
      <div className="relative overflow-hidden border-b border-white/10 p-4">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          aria-hidden
          style={{
            background:
              "radial-gradient(circle at 12% 0%, oklch(0.64 0.15 300 / 0.18), transparent 44%)",
          }}
        />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-primary"
              >
                <Satellite className="h-3 w-3" aria-hidden />
                {node.kindLabel}
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.18em] text-foreground/65">
                {mission.eyebrow}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full shadow-[0_0_14px_currentColor]"
                style={{ color: node.color, background: node.color }}
                aria-hidden
              />

              <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                {node.shortName}
              </h3>
            </div>

            <p className="mt-0.5 text-[11px] text-foreground/65">
              {node.fullName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${node.shortName} mission information`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.03] text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>

        <p className="relative mt-3 text-xs leading-relaxed text-muted-foreground">
          {mission.missionRole}
        </p>
      </div>

      <div className="space-y-4 p-4">
        {researchOpen ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setResearchOpen(false)}
                className="inline-flex items-center gap-1.5 text-[10px] font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <ArrowLeft className="h-3 w-3" aria-hidden />
                Mission overview
              </button>

              <span className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground/65">
                TESS Research Mode
              </span>
            </div>

            <TessResearchMode />
          </>
        ) : (
          <>
        <section aria-labelledby="tess-orbit-heading">
          <div className="mb-2 flex items-center gap-1.5">
            <Orbit className="h-3.5 w-3.5 text-primary" aria-hidden />
            <h4
              id="tess-orbit-heading"
              className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/80"
            >
              Mission & Orbit
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {mission.metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-white/8 bg-white/[0.035] px-3 py-2.5"
              >
                <div className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/75">
                  {metric.label}
                </div>
                <div className="mt-1 text-[11px] font-medium leading-snug text-foreground/90">
                  {metric.value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
            {node.location}
            {node.coordsLabel ? ` · ${node.coordsLabel}` : ""}
          </div>
        </section>

        <section
          aria-labelledby="tess-research-heading"
          className="rounded-xl border border-primary/15 bg-primary/[0.055] p-3"
        >
          <div className="text-[9px] font-medium uppercase tracking-[0.2em] text-primary/80">
            Diya's TESS Research
          </div>

          <h4
            id="tess-research-heading"
            className="mt-1 font-display text-sm font-semibold text-foreground"
          >
            Stellar activity through precision light curves
          </h4>

          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            {mission.researchConnection}
          </p>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {mission.researchThemes.map((theme) => (
              <span
                key={theme}
                className="rounded-full border border-white/10 bg-black/10 px-2 py-1 text-[9px] text-foreground/75"
              >
                {theme}
              </span>
            ))}
          </div>
        </section>

        <section aria-labelledby="tess-astra-heading">
          <h4
            id="tess-astra-heading"
            className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/80"
          >
            Astra Research Context
          </h4>

          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            {mission.researchContext}
          </p>
        </section>

        <button
          type="button"
          onClick={() => setResearchOpen(true)}
          className="group flex w-full items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/[0.07] px-3 py-2.5 text-left transition-colors hover:bg-primary/[0.11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <span>
            <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-primary/85">
              <Sparkles className="h-3 w-3" aria-hidden />
              Explore TESS Research
            </span>
            <span className="mt-1 block text-[10px] leading-relaxed text-muted-foreground">
              Verified targets, observing sectors and publication timeline.
            </span>
          </span>

          <ArrowRight
            className="h-4 w-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </button>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3">
          <div className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground/70">
            TESS Mission Presentation
          </div>

          <Link
            to="/facilities/$slug"
            params={{ slug: node.slug }}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            Facility profile
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
          </>
        )}
      </div>
    </aside>
  );
}
