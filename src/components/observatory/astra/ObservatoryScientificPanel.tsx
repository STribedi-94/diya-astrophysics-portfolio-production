import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  FlaskConical,
  Images,
  MapPin,
  Sparkles,
  Telescope,
  X,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
} from "@tanstack/react-router";

import {
  cn,
} from "@/lib/utils";

import {
  getObservatoryInformation,
} from "./observatory-information";

import type {
  GroundObservatoryId,
} from "./observatory-registry";

import type {
  NetworkNode,
} from "@/data/observatory-network";


/*
 * ------------------------------------------------------------------
 * PROJECT DIYA ASTRA
 * Ground Observatory Scientific Information Panel
 * ------------------------------------------------------------------
 *
 * Purpose:
 *
 * Provide the visitor-facing scientific information experience for
 * uGMRT, HCT and DOT without placing React/UI responsibilities inside
 * the accepted Three.js Observatory runtime.
 *
 *
 * SCIENTIFIC SOURCE RULE
 *
 * Scientific relationships are derived through:
 *
 * observatory-information.ts
 *        ↓
 * observatory-relationships.ts
 *        ↓
 * canonical website scientific records
 *
 * This component does not create scientific relationships itself.
 *
 *
 * INTERACTION RULE
 *
 * Verified relationship records should be navigable where the existing
 * website already provides a real destination:
 *
 * - Project → /projects/$slug
 * - Publication → /publications/$slug
 * - Publication document → resolved PDF/document URL
 * - Gallery record → canonical relatedRoute when available, otherwise
 *   the main Gallery page
 * - TESS target → first verified related Project or Publication;
 *   otherwise the canonical TESS facility profile
 *
 * No fake TESS target route is invented here because the existing
 * TESS scientific experience is state-driven inside TessMissionPanel.
 *
 *
 * PROVENANCE RULE
 *
 * uGMRT, HCT and DOT are real scientific facilities.
 *
 * The Project Astra local 3D destination is an AI-assisted scientific
 * visualization.
 *
 * The compact pre-Explore state describes the real facility only.
 * The expanded Explore state reveals the richer scientific story and
 * the provenance of the reconstructed visual environment.
 *
 * The provenance disclosure therefore describes the VISUAL
 * REPRESENTATION, not the real telescope / array.
 * ------------------------------------------------------------------
 */


export type ObservatoryScientificPanelProps = {
  node:
    NetworkNode;

  observatoryId:
    GroundObservatoryId;

  isFullscreen:
    boolean;

  exploreActive:
    boolean;

  onClose:
    () => void;
};


/*
 * ------------------------------------------------------------------
 * SMALL PRESENTATION HELPERS
 * ------------------------------------------------------------------
 */

function CountBadge({
  label,
  value,
}: {
  label:
    string;

  value:
    number;
}) {
  if (value <= 0) {
    return null;
  }

  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] text-foreground/80">
      {value} {label}
    </span>
  );
}


function CountButton({
  label,
  value,
  onClick,
}: {
  label:
    string;

  value:
    number;

  onClick:
    () => void;
}) {
  if (value <= 0) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="group inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/[0.07] px-2 py-0.5 text-[9px] text-primary transition-colors hover:border-primary/40 hover:bg-primary/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      title={`Open ${value} related ${label} image${value === 1 ? "" : "s"}`}
    >
      <Images
        className="h-2.5 w-2.5"
        aria-hidden
      />
      <span>
        {value} {label}
      </span>
      <ArrowRight
        className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </button>
  );
}


function ObservatoryGalleryViewer({
  records,
  activeIndex,
  onIndexChange,
  onClose,
}: {
  records:
    readonly {
      id:
        string;

      title:
        string;

      shortCaption:
        string;

      src:
        string;
    }[];

  activeIndex:
    number;

  onIndexChange:
    (
      nextIndex:
        number,
    ) => void;

  onClose:
    () => void;
}) {
  if (
    records.length ===
    0
  ) {
    return null;
  }

  const safeIndex =
    Math.min(
      Math.max(
        activeIndex,
        0,
      ),
      records.length -
        1,
    );

  const activeRecord =
    records[
      safeIndex
    ];

  const previous = () =>
    onIndexChange(
      (
        safeIndex -
        1 +
        records.length
      ) %
        records.length,
    );

  const next = () =>
    onIndexChange(
      (
        safeIndex +
        1
      ) %
        records.length,
    );

  return (
    <div
      className="absolute inset-3 z-[90] flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-[oklch(0.055_0.025_265/0.97)] shadow-2xl backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label="Related Observatory Gallery images"
    >
      <div className="flex items-start justify-between gap-3 border-b border-white/10 px-3 py-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.18em] text-primary/80">
            <Images
              className="h-3 w-3"
              aria-hidden
            />
            Observatory Gallery Story
          </div>

          <div className="mt-0.5 text-[10px] text-muted-foreground">
            {safeIndex + 1} of {records.length} verified related images
          </div>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          aria-label="Close Observatory Gallery"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <X
            className="h-3.5 w-3.5"
            aria-hidden
          />
        </button>
      </div>

      <div className="relative min-h-0 flex-1 bg-black/35">
        <img
          src={
            activeRecord.src
          }
          alt={
            activeRecord.title
          }
          className="h-full w-full object-contain"
        />

        {records.length > 1 && (
          <>
            <button
              type="button"
              onClick={
                previous
              }
              aria-label="Previous related image"
              className="absolute left-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/55 text-white/85 backdrop-blur transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <ChevronLeft
                className="h-4 w-4"
                aria-hidden
              />
            </button>

            <button
              type="button"
              onClick={
                next
              }
              aria-label="Next related image"
              className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-black/55 text-white/85 backdrop-blur transition-colors hover:bg-black/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <ChevronRight
                className="h-4 w-4"
                aria-hidden
              />
            </button>
          </>
        )}
      </div>

      <div className="border-t border-white/10 px-3 py-2.5">
        <div className="text-[11px] font-medium leading-relaxed text-foreground/90">
          {
            activeRecord.title
          }
        </div>

        <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
          {
            activeRecord.shortCaption
          }
        </p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[9px] text-muted-foreground/70">
            Image source resolved through the website Image Service.
          </span>

          <Link
            to="/gallery"
            className="inline-flex shrink-0 items-center gap-1 text-[10px] text-primary hover:underline"
          >
            Full Gallery
            <ArrowRight
              className="h-3 w-3"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </div>
  );
}


function SectionTitle({
  icon,
  children,
}: {
  icon:
    React.ReactNode;

  children:
    React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-primary/80">
      {icon}
      <span>
        {children}
      </span>
    </div>
  );
}


const INTERACTIVE_ROW_CLASS =
  "group flex w-full items-start justify-between gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";


/*
 * ------------------------------------------------------------------
 * COMPONENT
 * ------------------------------------------------------------------
 */

export function ObservatoryScientificPanel({
  node,
  observatoryId,
  isFullscreen,
  exploreActive,
  onClose,
}: ObservatoryScientificPanelProps) {
  const information =
    getObservatoryInformation(
      observatoryId,
    );

  const [
    galleryOpen,
    setGalleryOpen,
  ] =
    useState(false);

  const [
    galleryIndex,
    setGalleryIndex,
  ] =
    useState(0);

  const openGalleryAt =
    (
      index:
        number,
    ) => {
      setGalleryIndex(
        index,
      );

      setGalleryOpen(
        true,
      );
    };


  const projectPreview =
    information.projects.slice(
      0,
      3,
    );


  const publicationPreview =
    information.publications.slice(
      0,
      3,
    );


  const galleryPreview =
    information.gallery.slice(
      0,
      3,
    );


  const tessPreview =
    information.tess.targets.slice(
      0,
      3,
    );


  /*
   * --------------------------------------------------------------
   * COMPACT REAL-FACILITY STATE
   * --------------------------------------------------------------
   */

  if (!exploreActive) {
    return (
      <>
      <div
        className={cn(
          "absolute left-3 z-[55] max-h-[38%] overflow-y-auto rounded-xl border border-white/10 bg-[oklch(0.10_0.03_265/0.90)] p-3 shadow-xl backdrop-blur-md sm:max-h-none sm:overflow-visible",
          isFullscreen
            ? "bottom-16 right-3 sm:bottom-5 sm:left-5 sm:right-auto sm:w-[21rem] sm:max-w-[calc(100vw-2.5rem)]"
            : "bottom-12 right-3 sm:bottom-3 sm:max-w-xs",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                  background:
                    node.color,
                }}
                aria-hidden
              />

              <span className="font-display text-sm font-semibold">
                {information.shortName}
              </span>
            </div>

            <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              {information.fullName}
            </div>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            aria-label={`Close ${information.shortName} information`}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <X
              className="h-3.5 w-3.5"
              aria-hidden
            />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
            {node.kindLabel}
          </span>

          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
            {information.domain}
          </span>
        </div>

        <div className="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-muted-foreground">
          <MapPin
            className="mt-0.5 h-3 w-3 shrink-0 text-primary/70"
            aria-hidden
          />

          <span>
            {information.location}

            {information.coordinates
              ? ` · ${information.coordinates}`
              : ""}
          </span>
        </div>

        <div className="mt-3 border-t border-white/10 pt-3">
          <SectionTitle
            icon={
              <FlaskConical
                className="h-3 w-3"
                aria-hidden
              />
            }
          >
            Science
          </SectionTitle>

          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {
              information.sections.find(
                (section) =>
                  section.id ===
                  "science",
              )?.summary
            }
          </p>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <CountBadge
            label="project"
            value={
              information.projects.length
            }
          />

          <CountBadge
            label="target"
            value={
              information.targets.length
            }
          />

          <CountBadge
            label="publication"
            value={
              information.publications.length
            }
          />

          <CountButton
            label="gallery"
            value={
              information.gallery.length
            }
            onClick={
              () =>
                openGalleryAt(
                  0,
                )
            }
          />

          <CountBadge
            label="TESS link"
            value={
              information.tess.targets.length
            }
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
          <span>
            Select <span className="text-foreground/85">Explore Observatory</span> for the full scientific story and visualization provenance.
          </span>
        </div>

        <Link
          to="/facilities/$slug"
          params={{
            slug:
              node.slug,
          }}
          className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Facility profile

          <ArrowRight
            className="h-3 w-3"
            aria-hidden
          />
        </Link>
      </div>

      {galleryOpen && (
        <ObservatoryGalleryViewer
          records={
            information.gallery
          }
          activeIndex={
            galleryIndex
          }
          onIndexChange={
            setGalleryIndex
          }
          onClose={
            () =>
              setGalleryOpen(
                false,
              )
          }
        />
      )}
      </>
    );
  }


  /*
   * --------------------------------------------------------------
   * EXPANDED EXPLORE STATE
   * --------------------------------------------------------------
   */

  return (
    <>
    <div
      className={cn(
        "absolute left-3 z-[55] max-h-[45%] overflow-y-auto rounded-xl border border-white/10 bg-[oklch(0.10_0.03_265/0.90)] p-3 shadow-xl backdrop-blur-md sm:max-h-[calc(100%-5.5rem)]",
        isFullscreen
          ? "bottom-16 right-3 sm:bottom-5 sm:left-5 sm:right-auto sm:w-[24rem] sm:max-w-[calc(100vw-2.5rem)]"
          : "bottom-12 right-3 sm:bottom-3 sm:w-[20rem] sm:max-w-[calc(100%-1.5rem)]",
      )}
    >

      {/* ---------------------------------------------------------- */}
      {/* IDENTITY                                                    */}
      {/* ---------------------------------------------------------- */}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{
                background:
                  node.color,
              }}
              aria-hidden
            />

            <span className="font-display text-sm font-semibold">
              {information.shortName}
            </span>
          </div>

          <div className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
            {information.fullName}
          </div>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          aria-label={`Close ${information.shortName} information`}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <X
            className="h-3.5 w-3.5"
            aria-hidden
          />
        </button>
      </div>


      {/* ---------------------------------------------------------- */}
      {/* FACILITY META                                               */}
      {/* ---------------------------------------------------------- */}

      <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
          {node.kindLabel}
        </span>

        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
          {information.domain}
        </span>
      </div>


      <div className="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-muted-foreground">
        <MapPin
          className="mt-0.5 h-3 w-3 shrink-0 text-primary/70"
          aria-hidden
        />

        <span>
          {information.location}

          {information.coordinates
            ? ` · ${information.coordinates}`
            : ""}
        </span>
      </div>


      {/* ---------------------------------------------------------- */}
      {/* FACILITY / INSTRUMENT / DATA                               */}
      {/* ---------------------------------------------------------- */}

      <div className="mt-3 grid gap-2 border-t border-white/10 pt-3">

        <div>
          <SectionTitle
            icon={
              <Telescope
                className="h-3 w-3"
                aria-hidden
              />
            }
          >
            Facility
          </SectionTitle>

          <p className="mt-1 text-[11px] leading-relaxed text-foreground/80">
            {
              information.sections.find(
                (section) =>
                  section.id ===
                  "facility",
              )?.summary
            }
          </p>
        </div>


        <div>
          <SectionTitle
            icon={
              <Database
                className="h-3 w-3"
                aria-hidden
              />
            }
          >
            Instrument & Data
          </SectionTitle>

          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {
              information.sections.find(
                (section) =>
                  section.id ===
                  "instrument",
              )?.headline
            }
            {" · "}
            {
              information.sections.find(
                (section) =>
                  section.id ===
                  "data",
              )?.headline
            }
          </p>
        </div>


        <div>
          <SectionTitle
            icon={
              <FlaskConical
                className="h-3 w-3"
                aria-hidden
              />
            }
          >
            Science
          </SectionTitle>

          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {
              information.sections.find(
                (section) =>
                  section.id ===
                  "science",
              )?.summary
            }
          </p>
        </div>

      </div>


      {/* ---------------------------------------------------------- */}
      {/* RELATIONSHIP COUNTS                                        */}
      {/* ---------------------------------------------------------- */}

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
        <CountBadge
          label="project"
          value={
            information.projects.length
          }
        />

        <CountBadge
          label="target"
          value={
            information.targets.length
          }
        />

        <CountBadge
          label="publication"
          value={
            information.publications.length
          }
        />

        <CountButton
          label="gallery"
          value={
            information.gallery.length
          }
          onClick={
            () =>
              openGalleryAt(
                0,
              )
          }
        />

        <CountBadge
          label="TESS link"
          value={
            information.tess.targets.length
          }
        />
      </div>


      {/* ---------------------------------------------------------- */}
      {/* PROJECTS — CLICKABLE                                        */}
      {/* ---------------------------------------------------------- */}

      {projectPreview.length > 0 && (
        <div className="mt-3">
          <SectionTitle
            icon={
              <FlaskConical
                className="h-3 w-3"
                aria-hidden
              />
            }
          >
            Research Projects
          </SectionTitle>

          <div className="mt-1 space-y-0.5">
            {projectPreview.map(
              (project) => (
                <Link
                  key={
                    project.id
                  }
                  to="/projects/$slug"
                  params={{
                    slug:
                      project.slug,
                  }}
                  className={INTERACTIVE_ROW_CLASS}
                >
                  <span className="min-w-0 text-[10px] leading-relaxed text-muted-foreground">
                    <span className="text-foreground/90 transition-colors group-hover:text-primary">
                      {
                        project.shortTitle
                      }
                    </span>

                    <span>
                      {" · "}
                      {
                        project.target
                      }
                    </span>
                  </span>

                  <ArrowRight
                    className="mt-0.5 h-3 w-3 shrink-0 text-primary/70 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              ),
            )}
          </div>
        </div>
      )}


      {/* ---------------------------------------------------------- */}
      {/* PUBLICATIONS — CLICKABLE                                    */}
      {/* ---------------------------------------------------------- */}

      {publicationPreview.length > 0 && (
        <div className="mt-3">
          <SectionTitle
            icon={
              <BookOpen
                className="h-3 w-3"
                aria-hidden
              />
            }
          >
            Publications
          </SectionTitle>

          <div className="mt-1 space-y-0.5">
            {publicationPreview.map(
              (publication) => (
                <Link
                  key={
                    publication.id
                  }
                  to="/publications/$slug"
                  params={{
                    slug:
                      publication.slug,
                  }}
                  className={INTERACTIVE_ROW_CLASS}
                >
                  <span className="min-w-0 text-[10px] leading-relaxed">
                    <span className="block text-foreground/90 transition-colors group-hover:text-primary">
                      {
                        publication.year
                      }
                      {" · "}
                      {
                        publication.title
                      }
                    </span>

                    <span className="block text-muted-foreground">
                      {
                        publication.journal
                      }
                      {" · "}
                      {
                        publication.role
                      }
                    </span>
                  </span>

                  <ArrowRight
                    className="mt-0.5 h-3 w-3 shrink-0 text-primary/70 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              ),
            )}
          </div>
        </div>
      )}


      {/* ---------------------------------------------------------- */}
      {/* DOCUMENTS — CLICKABLE                                       */}
      {/* ---------------------------------------------------------- */}

      {information.documents.length > 0 && (
        <div className="mt-3">
          <SectionTitle
            icon={
              <FileText
                className="h-3 w-3"
                aria-hidden
              />
            }
          >
            Publication Documents
          </SectionTitle>

          <div className="mt-1 space-y-0.5">
            {information.documents
              .slice(
                0,
                3,
              )
              .map(
                (document) => (
                  <a
                    key={
                      document.publicationSlug
                    }
                    href={
                      document.pdfUrl
                    }
                    target="_blank"
                    rel="noreferrer noopener"
                    className={INTERACTIVE_ROW_CLASS}
                  >
                    <span className="min-w-0 text-[10px] leading-relaxed text-foreground/85 transition-colors group-hover:text-primary">
                      {
                        document.publicationTitle
                      }
                    </span>

                    <ArrowUpRight
                      className="mt-0.5 h-3 w-3 shrink-0 text-primary/70 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </a>
                ),
              )}
          </div>
        </div>
      )}


      {/* ---------------------------------------------------------- */}
      {/* GALLERY — DIRECT RELATED IMAGE STORY                         */}
      {/* ---------------------------------------------------------- */}

      {galleryPreview.length > 0 && (
        <div className="mt-3">
          <SectionTitle
            icon={
              <Images
                className="h-3 w-3"
                aria-hidden
              />
            }
          >
            Diya's Research Archive
          </SectionTitle>

          <div className="mt-1 space-y-0.5">
            {galleryPreview.map(
              (
                record,
                previewIndex,
              ) => (
                <button
                  key={
                    record.id
                  }
                  type="button"
                  onClick={
                    () =>
                      openGalleryAt(
                        previewIndex,
                      )
                  }
                  className={INTERACTIVE_ROW_CLASS}
                >
                  <span className="min-w-0 text-[10px] leading-relaxed text-foreground/85 transition-colors group-hover:text-primary">
                    {
                      record.title
                    }
                  </span>

                  <Images
                    className="mt-0.5 h-3 w-3 shrink-0 text-primary/70"
                    aria-hidden
                  />
                </button>
              ),
            )}
          </div>

          <button
            type="button"
            onClick={
              () =>
                openGalleryAt(
                  0,
                )
            }
            className="mt-1.5 inline-flex items-center gap-1 rounded px-1 text-[10px] text-primary/85 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            View all {information.gallery.length} related images
            <ArrowRight
              className="h-3 w-3"
              aria-hidden
            />
          </button>
        </div>
      )}


      {/* ---------------------------------------------------------- */}
      {/* TESS CONNECTION — CLICKABLE                                 */}
      {/* ---------------------------------------------------------- */}

      {tessPreview.length > 0 && (
        <div className="mt-3">
          <SectionTitle
            icon={
              <Database
                className="h-3 w-3"
                aria-hidden
              />
            }
          >
            TESS Connection
          </SectionTitle>

          <div className="mt-1 space-y-0.5">
            {tessPreview.map(
              (target) => {
                const projectSlug =
                  target.projectSlugs[0];

                const publicationSlug =
                  target.publicationSlugs[0];

                const targetLabel = (
                  <>
                    <span className="text-foreground/90 transition-colors group-hover:text-primary">
                      {
                        target.name
                      }
                    </span>

                    {target.sectorIds.length >
                      0 && (
                      <span>
                        {" · "}
                        Sector{" "}
                        {
                          target.sectorIds.join(
                            ", ",
                          )
                        }
                      </span>
                    )}
                  </>
                );


                if (projectSlug) {
                  return (
                    <Link
                      key={
                        target.id
                      }
                      to="/projects/$slug"
                      params={{
                        slug:
                          projectSlug,
                      }}
                      className={INTERACTIVE_ROW_CLASS}
                    >
                      <span className="min-w-0 text-[10px] leading-relaxed text-muted-foreground">
                        {targetLabel}
                      </span>

                      <ArrowRight
                        className="mt-0.5 h-3 w-3 shrink-0 text-primary/70 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </Link>
                  );
                }


                if (publicationSlug) {
                  return (
                    <Link
                      key={
                        target.id
                      }
                      to="/publications/$slug"
                      params={{
                        slug:
                          publicationSlug,
                      }}
                      className={INTERACTIVE_ROW_CLASS}
                    >
                      <span className="min-w-0 text-[10px] leading-relaxed text-muted-foreground">
                        {targetLabel}
                      </span>

                      <ArrowRight
                        className="mt-0.5 h-3 w-3 shrink-0 text-primary/70 transition-transform group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </Link>
                  );
                }


                return (
                  <Link
                    key={
                      target.id
                    }
                    to="/facilities/$slug"
                    params={{
                      slug:
                        "tess",
                    }}
                    className={INTERACTIVE_ROW_CLASS}
                  >
                    <span className="min-w-0 text-[10px] leading-relaxed text-muted-foreground">
                      {targetLabel}
                    </span>

                    <ArrowRight
                      className="mt-0.5 h-3 w-3 shrink-0 text-primary/70 transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                );
              },
            )}
          </div>

          <p className="mt-1.5 px-1 text-[9px] leading-relaxed text-muted-foreground/75">
            TESS target rows open a verified related Project or Publication when available. The interactive target/sector Research Mode remains inside the TESS mission panel.
          </p>
        </div>
      )}


      {/* ---------------------------------------------------------- */}
      {/* PROVENANCE                                                  */}
      {/* ---------------------------------------------------------- */}

      <div className="mt-3 rounded-lg border border-primary/20 bg-primary/[0.06] p-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-primary">
          <Sparkles
            className="h-3 w-3"
            aria-hidden
          />

          <span>
            {
              information.provenance.label
            }
          </span>
        </div>

        <p className="mt-1.5 text-[9px] leading-relaxed text-muted-foreground">
          {
            information.provenance
              .description
          }
        </p>

        {information.provenance
          .disclaimer && (
          <p className="mt-1 text-[9px] leading-relaxed text-muted-foreground/80">
            {
              information.provenance
                .disclaimer
            }
          </p>
        )}
      </div>


      {/* ---------------------------------------------------------- */}
      {/* FACILITY PROFILE                                            */}
      {/* ---------------------------------------------------------- */}

      <Link
        to="/facilities/$slug"
        params={{
          slug:
            node.slug,
        }}
        className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        Facility profile

        <ArrowRight
          className="h-3 w-3"
          aria-hidden
        />
      </Link>

    </div>

    {galleryOpen && (
      <ObservatoryGalleryViewer
        records={
          information.gallery
        }
        activeIndex={
          galleryIndex
        }
        onIndexChange={
          setGalleryIndex
        }
        onClose={
          () =>
            setGalleryOpen(
              false,
            )
        }
      />
    )}
    </>
  );
}