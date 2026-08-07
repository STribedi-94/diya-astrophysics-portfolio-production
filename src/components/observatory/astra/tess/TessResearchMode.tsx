import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  FileText,
  Orbit,
  Radio,
  Satellite,
  Telescope,
  Target,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  facilities,
  type Facility,
} from "@/data/facilities";
import {
  projects,
  type ProjectSummary,
} from "@/data/misc";
import {
  publicationsArchive,
  type PublicationRecord,
} from "@/data/publications-archive";
import { documentService } from "@/services/documents";
import { cn } from "@/lib/utils";

import {
  TESS_RESEARCH_TARGETS,
  TESS_RESEARCH_TIMELINE,
  TESS_SECTORS,
  type TessResearchTarget,
  type TessSectorRecord,
} from "./tess-research-data";

type ResearchTab =
  | "targets"
  | "sectors"
  | "timeline";

type TargetResearchContext = {
  publications: PublicationRecord[];
  projects: ProjectSummary[];
  facilities: Facility[];
};

type PendingNavigation =
  | {
      kind: "target";
      id: string;
    }
  | {
      kind: "sector";
      id: number;
    };

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

function uniqueById<
  T extends {
    id: string;
  },
>(
  items: T[],
): T[] {
  const map =
    new Map<string, T>();

  items.forEach(
    (item) => {
      map.set(
        item.id,
        item,
      );
    },
  );

  return Array.from(
    map.values(),
  );
}

function getPublicationBySlug(
  slug: string,
):
  | PublicationRecord
  | undefined {
  return publicationsArchive.find(
    (publication) =>
      publication.slug ===
      slug,
  );
}

function getProjectBySlug(
  slug: string,
):
  | ProjectSummary
  | undefined {
  return projects.find(
    (project) =>
      project.slug ===
      slug,
  );
}

function publicationUsesFacility(
  publication: PublicationRecord,
  facility: Facility,
) {
  const searchTerms = [
    facility.abbreviation,
    facility.fullName,
  ]
    .filter(Boolean)
    .map((value) =>
      value.toLowerCase(),
    );

  return publication.instruments.some(
    (instrument) => {
      const normalized =
        instrument.toLowerCase();

      return searchTerms.some(
        (term) =>
          normalized.includes(
            term,
          ) ||
          term.includes(
            normalized,
          ),
      );
    },
  );
}

function getTargetResearchContext(
  target: TessResearchTarget,
): TargetResearchContext {
  const linkedPublications =
    target.publicationSlugs
      .map(
        getPublicationBySlug,
      )
      .filter(
        (
          publication,
        ): publication is PublicationRecord =>
          Boolean(
            publication,
          ),
      );

  const linkedProjects =
    target.projectSlugs
      .map(
        getProjectBySlug,
      )
      .filter(
        (
          project,
        ): project is ProjectSummary =>
          Boolean(
            project,
          ),
      );

  const projectFacilityIds =
    linkedProjects.flatMap(
      (project) =>
        project.facilities,
    );

  const linkedFacilities =
    facilities.filter(
      (facility) =>
        projectFacilityIds.includes(
          facility.slug,
        ) ||
        linkedPublications.some(
          (publication) =>
            publicationUsesFacility(
              publication,
              facility,
            ),
        ),
    );

  /*
   * Every record in this registry has already been verified as TESS-linked.
   * Preserve TESS itself as scientific context even when a project's
   * additional facility list contains only the ground-based follow-up.
   */
  const tessFacility =
    facilities.find(
      (facility) =>
        facility.slug ===
        "tess",
    );

  return {
    publications:
      linkedPublications,
    projects:
      linkedProjects,
    facilities:
      uniqueById([
        ...(tessFacility
          ? [
              tessFacility,
            ]
          : []),
        ...linkedFacilities,
      ]),
  };
}

function getSectorPublications(
  sector: TessSectorRecord,
) {
  return sector.publicationSlugs
    .map(
      getPublicationBySlug,
    )
    .filter(
      (
        publication,
      ): publication is PublicationRecord =>
        Boolean(
          publication,
        ),
    );
}

function getPublicationSectors(
  publicationSlug: string,
) {
  return TESS_SECTORS.filter(
    (sector) =>
      sector.publicationSlugs.includes(
        publicationSlug,
      ),
  );
}

function getPublicationFacilities(
  publication: PublicationRecord,
) {
  return facilities.filter(
    (facility) =>
      publicationUsesFacility(
        publication,
        facility,
      ),
  );
}

function FacilityBadge({
  facility,
}: {
  facility: Facility;
}) {
  const isSpace =
    facility.type ===
    "space";

  const Icon =
    isSpace
      ? Satellite
      : Telescope;

  return (
    <Link
      to="/facilities/$slug"
      params={{
        slug:
          facility.slug,
      }}
      onClick={(event) =>
        event.stopPropagation()
      }
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] px-2 py-1 text-[9px] text-foreground/80 transition-colors hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      title={`${facility.fullName} · ${facility.band}`}
    >
      <Icon
        className="h-2.5 w-2.5 text-primary/75"
        aria-hidden
      />

      {
        facility.abbreviation
      }
    </Link>
  );
}

function PublicationBadge({
  publication,
}: {
  publication: PublicationRecord;
}) {
  const document =
    documentService
      .getByPublicationId(
        publication.id,
      );

  return (
    <Link
      to="/publications/$slug"
      params={{
        slug:
          publication.slug,
      }}
      onClick={(event) =>
        event.stopPropagation()
      }
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] px-2 py-1 text-[9px] text-foreground/80 transition-colors hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
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
}

export function TessResearchMode() {
  const [
    tab,
    setTab,
  ] =
    useState<ResearchTab>(
      "targets",
    );

  const [
    selectedTargetId,
    setSelectedTargetId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    selectedSectorId,
    setSelectedSectorId,
  ] =
    useState<number | null>(
      null,
    );

  const [
    pendingNavigation,
    setPendingNavigation,
  ] =
    useState<
      PendingNavigation | null
    >(null);

  const targetById =
    useMemo(
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

  const changeTab = (
    nextTab: ResearchTab,
  ) => {
    setTab(
      nextTab,
    );
  };

  const openSector = (
    sectorId: number,
  ) => {
    setSelectedSectorId(
      sectorId,
    );

    setPendingNavigation({
      kind: "sector",
      id: sectorId,
    });

    setTab(
      "sectors",
    );
  };

  const openTarget = (
    targetId: string,
  ) => {
    setSelectedTargetId(
      targetId,
    );

    setPendingNavigation({
      kind: "target",
      id: targetId,
    });

    setTab(
      "targets",
    );
  };

  /*
   * Cross-navigation between Targets, Sectors and Timeline changes both
   * the visible tab and the selected record.
   *
   * Once React has rendered the destination tab, move that selected record
   * into the visible centre of the scrollable TESS Mission Panel and place
   * keyboard focus on it.
   *
   * This is deliberately UI-only behaviour. It does not imply celestial
   * positioning, sector geometry or spacecraft pointing.
   */
  useEffect(() => {
    if (
      !pendingNavigation
    ) {
      return;
    }

    const expectedTab =
      pendingNavigation.kind ===
      "sector"
        ? "sectors"
        : "targets";

    if (
      tab !==
      expectedTab
    ) {
      return;
    }

    const frame =
      window.requestAnimationFrame(
        () => {
          const element =
            document.getElementById(
              pendingNavigation.kind ===
                "sector"
                ? `tess-sector-${pendingNavigation.id}`
                : `tess-target-${pendingNavigation.id}`,
            );

          if (!element) {
            return;
          }

          const reducedMotion =
            window.matchMedia(
              "(prefers-reduced-motion: reduce)",
            ).matches;

          element.scrollIntoView({
            behavior:
              reducedMotion
                ? "auto"
                : "smooth",
            block: "center",
            inline: "nearest",
          });

          if (
            element instanceof
            HTMLElement
          ) {
            element.focus({
              preventScroll:
                true,
            });
          }

          setPendingNavigation(
            null,
          );
        },
      );

    return () =>
      window.cancelAnimationFrame(
        frame,
      );
  }, [
    pendingNavigation,
    tab,
  ]);

  return (
    <div className="space-y-3">
      <div
        className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-black/15 p-1"
        role="tablist"
        aria-label="TESS research mode"
      >
        {tabs.map(
          (item) => {
            const Icon =
              item.icon;

            const active =
              tab ===
              item.id;

            return (
              <button
                key={
                  item.id
                }
                type="button"
                role="tab"
                aria-selected={
                  active
                }
                tabIndex={
                  active
                    ? 0
                    : -1
                }
                onClick={() =>
                  changeTab(
                    item.id,
                  )
                }
                className={cn(
                  "flex min-h-9 items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                <Icon
                  className="h-3 w-3"
                  aria-hidden
                />

                {
                  item.label
                }
              </button>
            );
          },
        )}
      </div>

      {tab ===
        "targets" && (
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-2">
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-primary/75">
                Verified Target
                Registry
              </div>

              <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                Targets are
                included only where
                the current
                Production research
                records explicitly
                connect them to
                TESS.
              </p>
            </div>

            <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
              {
                TESS_RESEARCH_TARGETS.length
              }
            </span>
          </div>

          {TESS_RESEARCH_TARGETS.map(
            (target) => {
              const {
                publications,
                projects:
                  linkedProjects,
                facilities:
                  linkedFacilities,
              } =
                getTargetResearchContext(
                  target,
                );

              const selected =
                selectedTargetId ===
                target.id;

              return (
                <article
                  key={
                    target.id
                  }
                  id={`tess-target-${target.id}`}
                  role="button"
                  tabIndex={0}
                  aria-pressed={
                    selected
                  }
                  aria-label={`Explore TESS research relationship for ${target.name}`}
                  onClick={() =>
                    setSelectedTargetId(
                      (
                        current,
                      ) =>
                        current ===
                        target.id
                          ? null
                          : target.id,
                    )
                  }
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                        "Enter" ||
                      event.key ===
                        " "
                    ) {
                      event.preventDefault();

                      setSelectedTargetId(
                        (
                          current,
                        ) =>
                          current ===
                          target.id
                            ? null
                            : target.id,
                      );
                    }
                  }}
                  className={cn(
                    "cursor-pointer rounded-xl border p-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    selected
                      ? "border-primary/30 bg-primary/[0.075]"
                      : "border-white/8 bg-white/[0.025] hover:bg-white/[0.045]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h5 className="font-display text-sm font-semibold text-foreground">
                        {
                          target.name
                        }
                      </h5>

                      <div className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-muted-foreground/70">
                        {
                          target.category
                        }
                      </div>
                    </div>

                    {target
                      .sectorIds
                      .length >
                      0 && (
                      <div className="flex max-w-[48%] flex-wrap justify-end gap-1">
                        {target.sectorIds.map(
                          (
                            sector,
                          ) => (
                            <button
                              key={
                                sector
                              }
                              type="button"
                              onClick={(
                                event,
                              ) => {
                                event.stopPropagation();

                                openSector(
                                  sector,
                                );
                              }}
                              className="rounded-full border border-primary/15 bg-primary/[0.055] px-1.5 py-0.5 text-[9px] text-primary/80 transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                              aria-label={`Open TESS Sector ${sector}`}
                            >
                              S
                              {
                                sector
                              }
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
                    {
                      target.researchFocus
                    }
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {linkedProjects.map(
                      (
                        project,
                      ) => (
                        <Link
                          key={
                            project.slug
                          }
                          to="/projects/$slug"
                          params={{
                            slug:
                              project.slug,
                          }}
                          onClick={(
                            event,
                          ) =>
                            event.stopPropagation()
                          }
                          className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] text-foreground/75 transition-colors hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
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
                      (
                        publication,
                      ) => (
                        <PublicationBadge
                          key={
                            publication.slug
                          }
                          publication={
                            publication
                          }
                        />
                      ),
                    )}
                  </div>

                  {selected && (
                    <div className="mt-3 space-y-3 border-t border-white/8 pt-2.5">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-medium uppercase tracking-[0.17em] text-primary/75">
                            Verified
                            research
                            relationship
                          </span>

                          <ChevronRight
                            className="h-3 w-3 rotate-90 text-primary/70"
                            aria-hidden
                          />
                        </div>

                        <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
                          {target
                            .sectorIds
                            .length >
                          0
                            ? `Verified TESS coverage: ${target.sectorIds
                                .map(
                                  (
                                    sector,
                                  ) =>
                                    `Sector ${sector}`,
                                )
                                .join(
                                  ", ",
                                )}.`
                            : "The current portfolio records verify a TESS research relationship but do not expose a sector number for this target."}
                        </p>
                      </div>

                      <div className="rounded-lg border border-white/8 bg-black/10 p-2.5">
                        <div className="text-[9px] font-medium uppercase tracking-[0.16em] text-foreground/65">
                          Multi-wavelength
                          observing
                          context
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {linkedFacilities.map(
                            (
                              facility,
                            ) => (
                              <FacilityBadge
                                key={
                                  facility.id
                                }
                                facility={
                                  facility
                                }
                              />
                            ),
                          )}
                        </div>

                        <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground/75">
                          Facility
                          relationships are
                          derived from the
                          verified project
                          and publication
                          records associated
                          with this target.
                        </p>
                      </div>

                      {linkedProjects.length >
                        0 && (
                        <div className="space-y-2">
                          {linkedProjects.map(
                            (
                              project,
                            ) => (
                              <div
                                key={
                                  project.id
                                }
                                className="rounded-lg border border-white/8 bg-white/[0.02] p-2.5"
                              >
                                <div className="text-[9px] uppercase tracking-[0.15em] text-primary/70">
                                  {
                                    project.wavelength
                                  }
                                </div>

                                <div className="mt-1 text-[10px] font-medium leading-snug text-foreground/85">
                                  {
                                    project.shortTitle
                                  }
                                </div>

                                <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground/75">
                                  {
                                    project.outcome
                                  }
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      )}

                      <div className="text-[9px] leading-relaxed text-muted-foreground/75">
                        {
                          publications.length
                        }{" "}
                        linked publication
                        {publications.length ===
                        1
                          ? ""
                          : "s"}

                        {linkedProjects.length >
                        0
                          ? ` · ${linkedProjects.length} linked project${linkedProjects.length === 1 ? "" : "s"}`
                          : ""}

                        {linkedFacilities.length >
                        0
                          ? ` · ${linkedFacilities.length} verified observing context${linkedFacilities.length === 1 ? "" : "s"}`
                          : ""}
                      </div>
                    </div>
                  )}
                </article>
              );
            },
          )}
        </div>
      )}

      {tab ===
        "sectors" && (
        <div className="space-y-2">
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-primary/75">
              Verified Sector
              Registry
            </div>

            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              Only sector numbers
              explicitly stated in
              the current
              publication records
              are shown.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 min-[430px]:grid-cols-2">
            {TESS_SECTORS.map(
              (sector) => {
                const publications =
                  getSectorPublications(
                    sector,
                  );

                const selected =
                  selectedSectorId ===
                  sector.id;

                return (
                  <article
                    key={
                      sector.id
                    }
                    id={`tess-sector-${sector.id}`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={
                      selected
                    }
                    aria-label={`Explore verified relationships for ${sector.label}`}
                    onClick={() =>
                      setSelectedSectorId(
                        (
                          current,
                        ) =>
                          current ===
                          sector.id
                            ? null
                            : sector.id,
                      )
                    }
                    onKeyDown={(
                      event,
                    ) => {
                      if (
                        event.key ===
                          "Enter" ||
                        event.key ===
                          " "
                      ) {
                        event.preventDefault();

                        setSelectedSectorId(
                          (
                            current,
                          ) =>
                            current ===
                            sector.id
                              ? null
                              : sector.id,
                        );
                      }
                    }}
                    className={cn(
                      "cursor-pointer rounded-xl border p-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                      selected
                        ? "border-primary/30 bg-primary/[0.075]"
                        : "border-white/8 bg-white/[0.025] hover:bg-white/[0.045]",
                    )}
                  >
                    <div className="text-[9px] uppercase tracking-[0.16em] text-primary/70">
                      TESS
                    </div>

                    <div className="mt-0.5 font-display text-sm font-semibold text-foreground">
                      {
                        sector.label
                      }
                    </div>

                    <div className="mt-2 space-y-1">
                      {sector.targetIds.map(
                        (
                          targetId,
                        ) => {
                          const target =
                            targetById.get(
                              targetId,
                            );

                          return target ? (
                            <button
                              key={
                                targetId
                              }
                              type="button"
                              onClick={(
                                event,
                              ) => {
                                event.stopPropagation();

                                openTarget(
                                  targetId,
                                );
                              }}
                              className="block text-left text-[10px] text-foreground/75 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                              aria-label={`Open ${target.name} in the TESS target registry`}
                            >
                              {
                                target.name
                              }
                            </button>
                          ) : null;
                        },
                      )}
                    </div>

                    <p className="mt-2 text-[9px] leading-relaxed text-muted-foreground/75">
                      {
                        sector.evidence
                      }
                    </p>

                    {selected && (
                      <div className="mt-2 space-y-2 border-t border-white/8 pt-2">
                        <div>
                          <div className="text-[9px] font-medium uppercase tracking-[0.16em] text-primary/75">
                            Verified
                            relationship
                          </div>

                          <div className="mt-1 text-[9px] leading-relaxed text-muted-foreground">
                            {
                              sector
                                .targetIds
                                .length
                            }{" "}
                            linked target
                            {sector
                              .targetIds
                              .length ===
                            1
                              ? ""
                              : "s"}{" "}
                            ·{" "}
                            {
                              publications.length
                            }{" "}
                            linked publication
                            {publications.length ===
                            1
                              ? ""
                              : "s"}
                          </div>
                        </div>

                        {publications.length >
                          0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {publications.map(
                              (
                                publication,
                              ) => (
                                <PublicationBadge
                                  key={
                                    publication.slug
                                  }
                                  publication={
                                    publication
                                  }
                                />
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              },
            )}
          </div>
        </div>
      )}

      {tab ===
        "timeline" && (
        <div className="space-y-2">
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-primary/75">
              TESS Research
              Timeline
            </div>

            <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
              Portfolio-science
              chronology connecting
              TESS-linked research,
              verified sectors,
              observing facilities
              and publications.
            </p>
          </div>

          <ol className="relative space-y-2 border-l border-white/10 pl-4">
            {TESS_RESEARCH_TIMELINE.map(
              (record) => {
                const publications =
                  record.publicationSlugs
                    .map(
                      getPublicationBySlug,
                    )
                    .filter(
                      (
                        publication,
                      ): publication is PublicationRecord =>
                        Boolean(
                          publication,
                        ),
                    );

                const sectors =
                  uniqueById(
                    publications
                      .flatMap(
                        (
                          publication,
                        ) =>
                          getPublicationSectors(
                            publication.slug,
                          ).map(
                            (
                              sector,
                            ) => ({
                              id: String(
                                sector.id,
                              ),
                              sector,
                            }),
                          ),
                      ),
                  ).map(
                    (
                      item,
                    ) =>
                      item.sector,
                  );

                const linkedFacilities =
                  uniqueById(
                    publications.flatMap(
                      (
                        publication,
                      ) =>
                        getPublicationFacilities(
                          publication,
                        ),
                    ),
                  );

                return (
                  <li
                    key={
                      record.id
                    }
                    className="relative"
                  >
                    <span
                      className="absolute -left-[18px] top-2 h-2 w-2 rounded-full border border-primary/40 bg-primary/70"
                      aria-hidden
                    />

                    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-2.5">
                      <div className="text-[9px] font-medium uppercase tracking-[0.16em] text-primary/75">
                        {
                          record.year
                        }
                      </div>

                      <div className="mt-0.5 text-[11px] font-medium leading-snug text-foreground/90">
                        {
                          record.label
                        }
                      </div>

                      {sectors.length >
                        0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {sectors.map(
                            (
                              sector,
                            ) => (
                              <button
                                key={
                                  sector.id
                                }
                                type="button"
                                onClick={() =>
                                  openSector(
                                    sector.id,
                                  )
                                }
                                className="rounded-full border border-primary/15 bg-primary/[0.05] px-1.5 py-0.5 text-[9px] text-primary/75 transition-colors hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                              >
                                S
                                {
                                  sector.id
                                }
                              </button>
                            ),
                          )}
                        </div>
                      )}

                      {linkedFacilities.length >
                        0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {linkedFacilities.map(
                            (
                              facility,
                            ) => (
                              <FacilityBadge
                                key={
                                  facility.id
                                }
                                facility={
                                  facility
                                }
                              />
                            ),
                          )}
                        </div>
                      )}

                      {publications.length >
                        0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {publications.map(
                            (
                              publication,
                            ) => (
                              <PublicationBadge
                                key={
                                  publication.slug
                                }
                                publication={
                                  publication
                                }
                              />
                            ),
                          )}
                        </div>
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
        This research view uses
        verified portfolio records.
        Sector numbers, facility
        relationships, projects and
        publications are shown only
        where supported by the
        current Production data. It
        does not represent live TESS
        telemetry, spacecraft
        pointing or a complete public
        mission catalogue.
      </div>
    </div>
  );
}