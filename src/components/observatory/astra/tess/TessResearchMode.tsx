import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  FileText,
  Orbit,
  Radio,
  Target,
} from "lucide-react";
import { useMemo, useState } from "react";

import { projects } from "@/data/misc";
import { publicationsArchive } from "@/data/publications-archive";
import { documentService } from "@/services/documents";
import { cn } from "@/lib/utils";

import {
  TESS_RESEARCH_TARGETS,
  TESS_RESEARCH_TIMELINE,
  TESS_SECTORS,
} from "./tess-research-data";

type ResearchTab =
  | "targets"
  | "sectors"
  | "timeline";

const tabs: Array<{
  id: ResearchTab;
  label: string;
  icon: typeof Target;
}> = [
  {
    id: "targets",
    label: "Targets",
    icon: Target,
  },
  {
    id: "sectors",
    label: "Sectors",
    icon: Orbit,
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: CalendarDays,
  },
];

export function TessResearchMode() {
  const [tab, setTab] =
    useState<ResearchTab>("targets");
  const [selectedTargetId, setSelectedTargetId] =
    useState<string | null>(null);
  const [selectedSectorId, setSelectedSectorId] =
    useState<number | null>(null);

  const targetById = useMemo(
    () =>
      new Map(
        TESS_RESEARCH_TARGETS.map(
          (target) => [
            target.id,
            target,
          ],
        ),
      ),
    [],
  );

  return (
    <div className="space-y-3">
      <div
        className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-black/15 p-1"
        role="tablist"
        aria-label="TESS research mode"
      >
        {tabs.map((item) => {
          const Icon = item.icon;
          const active =
            tab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() =>
                setTab(item.id)
              }
              className={cn(
                "flex min-h-9 items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-medium transition-colors",
                active
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <Icon
                className="h-3 w-3"
                aria-hidden
              />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "targets" && (
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-primary/75">
                Verified Target Registry
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                Targets are included only where the current Production research records explicitly connect them to TESS.
              </p>
            </div>
            <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
              {TESS_RESEARCH_TARGETS.length}
            </span>
          </div>

          {TESS_RESEARCH_TARGETS.map(
            (target) => {
              const publications =
                target.publicationSlugs
                  .map((slug) =>
                    publicationsArchive.find(
                      (publication) =>
                        publication.slug ===
                        slug,
                    ),
                  )
                  .filter(Boolean);

              const linkedProjects =
                target.projectSlugs
                  .map((slug) =>
                    projects.find(
                      (project) =>
                        project.slug ===
                        slug,
                    ),
                  )
                  .filter(Boolean);

              return (
                <article
                  key={target.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedTargetId === target.id}
                  onClick={() =>
                    setSelectedTargetId((current) =>
                      current === target.id ? null : target.id,
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedTargetId((current) =>
                        current === target.id ? null : target.id,
                      );
                    }
                  }}
                  className={cn(
                    "cursor-pointer rounded-xl border p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    selectedTargetId === target.id
                      ? "border-primary/30 bg-primary/[0.075]"
                      : "border-white/8 bg-white/[0.025] hover:bg-white/[0.045]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-display text-sm font-semibold text-foreground">
                        {target.name}
                      </h5>
                      <div className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground/70">
                        {target.category}
                      </div>
                    </div>

                    {target.sectorIds.length >
                      0 && (
                      <div className="flex max-w-[45%] flex-wrap justify-end gap-1">
                        {target.sectorIds.map(
                          (sector) => (
                            <span
                              key={sector}
                              className="rounded-full border border-primary/15 bg-primary/[0.055] px-1.5 py-0.5 text-[9px] text-primary/80"
                            >
                              S{sector}
                            </span>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                    {target.researchFocus}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {linkedProjects.map(
                      (project) =>
                        project && (
                          <Link
                            key={
                              project.slug
                            }
                            to="/projects/$slug"
                            params={{
                              slug: project.slug,
                            }}
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] text-foreground/75 hover:bg-white/[0.07]"
                          >
                            <Radio
                              className="h-2.5 w-2.5 text-primary/75"
                              aria-hidden
                            />
                            Project
                          </Link>
                        ),
                    )}

                    {publications.map(
                      (publication) => {
                        if (!publication) {
                          return null;
                        }

                        const document =
                          documentService
                            .getByPublicationId(
                              publication.id,
                            );

                        return (
                          <Link
                            key={
                              publication.slug
                            }
                            to="/publications/$slug"
                            params={{
                              slug:
                                publication.slug,
                            }}
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] text-foreground/75 hover:bg-white/[0.07]"
                            title={
                              document
                                ? "Publication with AMP-managed document"
                                : "Publication record"
                            }
                          >
                            {document ? (
                              <FileText
                                className="h-2.5 w-2.5 text-primary/75"
                                aria-hidden
                              />
                            ) : (
                              <BookOpen
                                className="h-2.5 w-2.5 text-primary/75"
                                aria-hidden
                              />
                            )}
                            Publication
                          </Link>
                        );
                      },
                    )}
                  </div>

                  {selectedTargetId === target.id && (
                    <div className="mt-3 border-t border-white/8 pt-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-medium uppercase tracking-[0.17em] text-primary/75">
                          Research relationship
                        </span>
                        <ChevronRight className="h-3 w-3 rotate-90 text-primary/70" aria-hidden />
                      </div>
                      <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
                        {target.sectorIds.length > 0
                          ? `Verified TESS coverage: ${target.sectorIds
                              .map((sector) => `Sector ${sector}`)
                              .join(", ")}.`
                          : "The current portfolio records verify a TESS research relationship but do not expose a sector number for this target."}
                      </p>
                      <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground/75">
                        {target.publicationSlugs.length} linked publication
                        {target.publicationSlugs.length === 1 ? "" : "s"}
                        {target.projectSlugs.length > 0
                          ? ` · ${target.projectSlugs.length} linked project${target.projectSlugs.length === 1 ? "" : "s"}`
                          : ""}
                      </p>
                    </div>
                  )}
                </article>
              );
            },
          )}
        </div>
      )}

      {tab === "sectors" && (
        <div className="space-y-2">
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-primary/75">
              Verified Sector Registry
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              Only sector numbers explicitly stated in the current publication records are shown.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {TESS_SECTORS.map(
              (sector) => (
                <article
                  key={sector.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedSectorId === sector.id}
                  onClick={() =>
                    setSelectedSectorId((current) =>
                      current === sector.id ? null : sector.id,
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedSectorId((current) =>
                        current === sector.id ? null : sector.id,
                      );
                    }
                  }}
                  className={cn(
                    "cursor-pointer rounded-xl border p-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    selectedSectorId === sector.id
                      ? "border-primary/30 bg-primary/[0.075]"
                      : "border-white/8 bg-white/[0.025] hover:bg-white/[0.045]",
                  )}
                >
                  <div className="text-[9px] uppercase tracking-[0.16em] text-primary/70">
                    TESS
                  </div>
                  <div className="mt-0.5 font-display text-sm font-semibold text-foreground">
                    {sector.label}
                  </div>

                  <div className="mt-2 space-y-1">
                    {sector.targetIds.map(
                      (targetId) => {
                        const target =
                          targetById.get(
                            targetId,
                          );

                        return target ? (
                          <div
                            key={targetId}
                            className="text-[10px] text-foreground/75"
                          >
                            {target.name}
                          </div>
                        ) : null;
                      },
                    )}
                  </div>

                  <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground/75">
                    {sector.evidence}
                  </p>

                  {selectedSectorId === sector.id && (
                    <div className="mt-2 border-t border-white/8 pt-2">
                      <div className="text-[9px] font-medium uppercase tracking-[0.16em] text-primary/75">
                        Verified relationship
                      </div>
                      <div className="mt-1 text-[9px] leading-relaxed text-muted-foreground">
                        {sector.targetIds.length} linked target
                        {sector.targetIds.length === 1 ? "" : "s"} ·{" "}
                        {sector.publicationSlugs.length} linked publication
                        {sector.publicationSlugs.length === 1 ? "" : "s"}
                      </div>
                    </div>
                  )}
                </article>
              ),
            )}
          </div>
        </div>
      )}

      {tab === "timeline" && (
        <div className="space-y-2">
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-primary/75">
              Research Timeline
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              Publication-year chronology of the TESS-linked research represented in the current portfolio.
            </p>
          </div>

          <ol className="relative space-y-2 border-l border-white/10 pl-4">
            {TESS_RESEARCH_TIMELINE.map(
              (record) => {
                const publication =
                  record.publicationSlugs
                    .map((slug) =>
                      publicationsArchive.find(
                        (item) =>
                          item.slug ===
                          slug,
                      ),
                    )
                    .find(Boolean);

                return (
                  <li
                    key={record.id}
                    className="relative"
                  >
                    <span
                      className="absolute -left-[18px] top-2 h-2 w-2 rounded-full border border-primary/40 bg-primary/70"
                      aria-hidden
                    />
                    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-2.5">
                      <div className="text-[9px] font-medium uppercase tracking-[0.16em] text-primary/75">
                        {record.year}
                      </div>
                      <div className="mt-0.5 text-[11px] font-medium leading-snug text-foreground/90">
                        {record.label}
                      </div>

                      {publication && (
                        <Link
                          to="/publications/$slug"
                          params={{
                            slug:
                              publication.slug,
                          }}
                          className="mt-1.5 inline-flex items-center gap-1 text-[9px] text-primary hover:underline"
                        >
                          Publication
                          <BookOpen
                            className="h-2.5 w-2.5"
                            aria-hidden
                          />
                        </Link>
                      )}
                    </div>
                  </li>
                );
              },
            )}
          </ol>
        </div>
      )}

      <div className="rounded-xl border border-white/8 bg-black/10 px-3 py-2 text-[9px] leading-relaxed text-muted-foreground/75">
        This research view uses verified portfolio records. It does not represent live TESS telemetry or a complete public mission catalogue.
      </div>
    </div>
  );
}
