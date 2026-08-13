import {
  researchAreas,
  type ResearchArea,
} from "@/data/research";

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

import {
  gallery,
  type GalleryRecord,
} from "@/data/gallery";

import {
  TESS_RESEARCH_TARGETS,
  TESS_SECTORS,
  TESS_RESEARCH_TIMELINE,
  type TessResearchTarget,
  type TessSectorRecord,
  type TessTimelineRecord,
} from "./tess/tess-research-data";

import {
  GROUND_OBSERVATORY_IDS,
  getGroundObservatoryEntry,
  type GroundObservatoryId,
  type GroundObservatoryProfile,
} from "./observatory-registry";


/*
 * ------------------------------------------------------------------
 * PROJECT DIYA ASTRA
 * Scientific Relationship Engine — Unified Observatory Knowledge Graph
 * ------------------------------------------------------------------
 *
 * This module does NOT create a second scientific database.
 *
 * It derives relationships from the existing canonical Production
 * records:
 *
 * - src/data/research.ts
 * - src/data/facilities.ts
 * - src/data/misc.ts
 * - src/data/publications-archive.ts
 * - src/data/gallery.ts
 * - tess/tess-research-data.ts
 * - observatory-registry.ts
 *
 * The relationship graph is therefore assembled dynamically from the
 * existing records instead of hard-coding duplicate scientific facts.
 *
 *
 * Canonical relationship architecture:
 *
 * Observatory
 *      ↓
 * Facility / Telescope / Array
 *      ↓
 * Instrument / Backend
 *      ↓
 * Data Product
 *      ↓
 * Reduction / Analysis
 *      ↓
 * Research Area
 *      ↓
 * Project
 *      ↓
 * Target
 *      ↓
 * Publication
 *      ↓
 * Document
 *      ↓
 * Gallery
 *      ↓
 * TESS Research Relationships
 *
 *
 * Important:
 *
 * Existing source files remain authoritative for their own domains.
 * This module only resolves and exposes their relationships.
 */


/*
 * ------------------------------------------------------------------
 * SHARED RELATIONSHIP TYPES
 * ------------------------------------------------------------------
 */

export type ObservatoryResearchRelationship = {
  observatoryId:
    GroundObservatoryId;

  profile:
    GroundObservatoryProfile;

  facility:
    Facility | null;

  researchAreas:
    readonly ResearchArea[];

  projects:
    readonly ProjectSummary[];

  publications:
    readonly PublicationRecord[];

  galleryRecords:
    readonly GalleryRecord[];

  tessTargets:
    readonly TessResearchTarget[];

  tessSectors:
    readonly TessSectorRecord[];

  tessTimeline:
    readonly TessTimelineRecord[];
};


export type ObservatoryTargetRelationship = {
  name:
    string;

  projectSlugs:
    readonly string[];

  publicationSlugs:
    readonly string[];

  tessTargetId?:
    string;
};


export type ObservatoryDocumentRelationship = {
  publicationSlug:
    string;

  publicationTitle:
    string;

  pdfUrl:
    string;
};


export type ObservatoryScienceChain = {
  observatoryId:
    GroundObservatoryId;

  facility:
    string;

  instrument:
    string;

  observingMode:
    string;

  dataProduct:
    string;

  reductionPath:
    readonly string[];

  facilityRecord:
    Facility | null;

  researchAreas:
    readonly {
      id: string;
      slug: string;
      title: string;
      shortTitle: string;
    }[];

  projects:
    readonly {
      id: string;
      slug: string;
      title: string;
      shortTitle: string;
      status: ProjectSummary["status"];
      target: string;
      wavelength: string;
    }[];

  researchTargets:
    readonly string[];

  targetRelationships:
    readonly ObservatoryTargetRelationship[];

  publications:
    readonly {
      id: string;
      slug: string;
      title: string;
      year: number;
      status: PublicationRecord["status"];
      journal: string;
      role: PublicationRecord["role"];
      targets: readonly string[];
      pdfUrl?: string;
    }[];

  documents:
    readonly ObservatoryDocumentRelationship[];

  gallery:
    readonly {
      id: string;
      title: string;
      shortCaption: string;
      category: GalleryRecord["category"];
      src: string;
      facility?: string;
      relatedRoute?: GalleryRecord["relatedRoute"];
    }[];

  tess:
    {
      targets:
        readonly {
          id: string;
          name: string;
          category: TessResearchTarget["category"];
          researchFocus: string;
          sectorIds: readonly number[];
          projectSlugs: readonly string[];
          publicationSlugs: readonly string[];
        }[];

      sectors:
        readonly {
          id: number;
          label: string;
          targetIds: readonly string[];
          publicationSlugs: readonly string[];
          evidence: string;
        }[];

      timeline:
        readonly {
          id: string;
          year: number;
          label: string;
          publicationSlugs: readonly string[];
        }[];
    };

  scienceFocus:
    string;
};


/*
 * ------------------------------------------------------------------
 * INTERNAL HELPERS
 * ------------------------------------------------------------------
 */

function uniqueBy<T>(
  values: readonly T[],
  getKey: (value: T) => string,
): T[] {
  const seen =
    new Set<string>();

  return values.filter(
    (value) => {
      const key =
        getKey(value);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    },
  );
}


function normalizeRelationshipText(
  value: string | undefined,
): string {
  return (
    value
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim() ?? ""
  );
}


function getFacilityRecordForObservatory(
  observatoryId:
    GroundObservatoryId,
): Facility | null {
  return (
    facilities.find(
      (facility) =>
        facility.id ===
          observatoryId ||
        facility.slug ===
          observatoryId,
    ) ?? null
  );
}


/*
 * ------------------------------------------------------------------
 * RESEARCH LOOKUP
 * ------------------------------------------------------------------
 *
 * research.ts remains authoritative for direct research membership.
 */

export function getResearchAreasForObservatory(
  observatoryId:
    GroundObservatoryId,
): ResearchArea[] {
  return researchAreas.filter(
    (researchArea) =>
      researchArea.facilities.includes(
        observatoryId,
      ),
  );
}


/*
 * ------------------------------------------------------------------
 * PROJECT LOOKUP
 * ------------------------------------------------------------------
 *
 * Project membership comes from ProjectSummary.facilities.
 */

export function getProjectsForObservatory(
  observatoryId:
    GroundObservatoryId,
): ProjectSummary[] {
  return projects.filter(
    (project) =>
      project.facilities.includes(
        observatoryId,
      ),
  );
}


/*
 * ------------------------------------------------------------------
 * PUBLICATION LOOKUP
 * ------------------------------------------------------------------
 *
 * The canonical Facility record already contains
 * relatedPublications. Project publication links are also included so
 * the graph remains complete if a project exposes an additional
 * verified publication relationship.
 */

export function getPublicationsForObservatory(
  observatoryId:
    GroundObservatoryId,
): PublicationRecord[] {
  const facility =
    getFacilityRecordForObservatory(
      observatoryId,
    );

  const connectedProjects =
    getProjectsForObservatory(
      observatoryId,
    );

  const publicationSlugs =
    new Set<string>([
      ...(
        facility
          ?.relatedPublications ??
        []
      ),

      ...connectedProjects.flatMap(
        (project) =>
          project.publications,
      ),
    ]);

  return publicationsArchive.filter(
    (publication) =>
      publicationSlugs.has(
        publication.slug,
      ),
  );
}


/*
 * ------------------------------------------------------------------
 * TARGET LOOKUP
 * ------------------------------------------------------------------
 *
 * Target names remain sourced from canonical project, publication and
 * research records. No separate target catalogue is created here.
 */

export function getTargetsForObservatory(
  observatoryId:
    GroundObservatoryId,
): string[] {
  const connectedResearchAreas =
    getResearchAreasForObservatory(
      observatoryId,
    );

  const connectedProjects =
    getProjectsForObservatory(
      observatoryId,
    );

  const connectedPublications =
    getPublicationsForObservatory(
      observatoryId,
    );

  return Array.from(
    new Set(
      [
        ...connectedResearchAreas.flatMap(
          (researchArea) =>
            researchArea.targets,
        ),

        ...connectedProjects.map(
          (project) =>
            project.target,
        ),

        ...connectedPublications.flatMap(
          (publication) =>
            publication.targets,
        ),
      ].filter(Boolean),
    ),
  );
}


/*
 * ------------------------------------------------------------------
 * TESS RELATIONSHIP LOOKUP
 * ------------------------------------------------------------------
 *
 * TESS relationships are included only where the verified TESS
 * registry intersects with an Observatory's canonical projects or
 * publications.
 */

export function getTessTargetsForObservatory(
  observatoryId:
    GroundObservatoryId,
): TessResearchTarget[] {
  const projectSlugs =
    new Set(
      getProjectsForObservatory(
        observatoryId,
      ).map(
        (project) =>
          project.slug,
      ),
    );

  const publicationSlugs =
    new Set(
      getPublicationsForObservatory(
        observatoryId,
      ).map(
        (publication) =>
          publication.slug,
      ),
    );

  return TESS_RESEARCH_TARGETS.filter(
    (target) =>
      target.projectSlugs.some(
        (projectSlug) =>
          projectSlugs.has(
            projectSlug,
          ),
      ) ||
      target.publicationSlugs.some(
        (publicationSlug) =>
          publicationSlugs.has(
            publicationSlug,
          ),
      ),
  );
}


export function getTessSectorsForObservatory(
  observatoryId:
    GroundObservatoryId,
): TessSectorRecord[] {
  const connectedTargets =
    getTessTargetsForObservatory(
      observatoryId,
    );

  const targetIds =
    new Set(
      connectedTargets.map(
        (target) =>
          target.id,
      ),
    );

  const publicationSlugs =
    new Set(
      getPublicationsForObservatory(
        observatoryId,
      ).map(
        (publication) =>
          publication.slug,
      ),
    );

  return TESS_SECTORS.filter(
    (sector) =>
      sector.targetIds.some(
        (targetId) =>
          targetIds.has(
            targetId,
          ),
      ) ||
      sector.publicationSlugs.some(
        (publicationSlug) =>
          publicationSlugs.has(
            publicationSlug,
          ),
      ),
  );
}


export function getTessTimelineForObservatory(
  observatoryId:
    GroundObservatoryId,
): TessTimelineRecord[] {
  const publicationSlugs =
    new Set(
      getPublicationsForObservatory(
        observatoryId,
      ).map(
        (publication) =>
          publication.slug,
      ),
    );

  return TESS_RESEARCH_TIMELINE.filter(
    (timelineRecord) =>
      timelineRecord.publicationSlugs.some(
        (publicationSlug) =>
          publicationSlugs.has(
            publicationSlug,
          ),
      ),
  );
}


/*
 * ------------------------------------------------------------------
 * GALLERY LOOKUP
 * ------------------------------------------------------------------
 *
 * Gallery relationships are derived from the existing gallery record
 * metadata. No gallery IDs are hard-coded here.
 *
 * Strong facility signals are:
 *
 * - GalleryRecord.facility
 * - GalleryRecord.tags
 * - GalleryRecord.institution
 * - GalleryRecord.title
 *
 * The canonical facility abbreviation, full name and observatory
 * operator are used as matching keys.
 */

export function getGalleryRecordsForObservatory(
  observatoryId:
    GroundObservatoryId,
): GalleryRecord[] {
  const facility =
    getFacilityRecordForObservatory(
      observatoryId,
    );

  if (!facility) {
    return [];
  }

  const abbreviation =
    normalizeRelationshipText(
      facility.abbreviation,
    );

  const fullName =
    normalizeRelationshipText(
      facility.fullName,
    );

  const observatory =
    normalizeRelationshipText(
      facility.observatory,
    );

  return gallery.filter(
    (record) => {
      const recordFacility =
        normalizeRelationshipText(
          record.facility,
        );

      const recordInstitution =
        normalizeRelationshipText(
          record.institution,
        );

      const recordTitle =
        normalizeRelationshipText(
          record.title,
        );

      const normalizedTags =
        record.tags.map(
          normalizeRelationshipText,
        );

      const abbreviationMatch =
        Boolean(abbreviation) &&
        (
          normalizedTags.includes(
            abbreviation,
          ) ||
          recordFacility
            .split(" ")
            .includes(
              abbreviation,
            ) ||
          recordTitle
            .split(" ")
            .includes(
              abbreviation,
            )
        );

      const fullNameMatch =
        Boolean(fullName) &&
        (
          recordFacility.includes(
            fullName,
          ) ||
          recordTitle.includes(
            fullName,
          )
        );

      const observatoryMatch =
        Boolean(observatory) &&
        Boolean(recordInstitution) &&
        (
          recordInstitution ===
            observatory ||
          recordInstitution.includes(
            observatory,
          ) ||
          observatory.includes(
            recordInstitution,
          )
        );

      return (
        abbreviationMatch ||
        fullNameMatch ||
        observatoryMatch
      );
    },
  );
}


/*
 * ------------------------------------------------------------------
 * DOCUMENT LOOKUP
 * ------------------------------------------------------------------
 *
 * Publication PDF URLs are already resolved by publications-archive.ts
 * through documentService. This graph consumes those resolved URLs
 * instead of creating a second document registry.
 */

export function getDocumentsForObservatory(
  observatoryId:
    GroundObservatoryId,
): ObservatoryDocumentRelationship[] {
  return getPublicationsForObservatory(
    observatoryId,
  )
    .filter(
      (
        publication,
      ): publication is PublicationRecord & {
        pdfUrl: string;
      } =>
        Boolean(
          publication.pdfUrl,
        ),
    )
    .map(
      (publication) => ({
        publicationSlug:
          publication.slug,

        publicationTitle:
          publication.title,

        pdfUrl:
          publication.pdfUrl,
      }),
    );
}


/*
 * ------------------------------------------------------------------
 * TARGET RELATIONSHIP GRAPH
 * ------------------------------------------------------------------
 */

export function getTargetRelationshipsForObservatory(
  observatoryId:
    GroundObservatoryId,
): ObservatoryTargetRelationship[] {
  const connectedProjects =
    getProjectsForObservatory(
      observatoryId,
    );

  const connectedPublications =
    getPublicationsForObservatory(
      observatoryId,
    );

  const connectedTessTargets =
    getTessTargetsForObservatory(
      observatoryId,
    );

  const targetNames =
    getTargetsForObservatory(
      observatoryId,
    );

  return targetNames.map(
    (targetName) => {
      const normalizedTarget =
        normalizeRelationshipText(
          targetName,
        );

      const relatedProjects =
        connectedProjects.filter(
          (project) => {
            const normalizedProjectTarget =
              normalizeRelationshipText(
                project.target,
              );

            return (
              normalizedProjectTarget ===
                normalizedTarget ||
              normalizedProjectTarget.includes(
                normalizedTarget,
              ) ||
              normalizedTarget.includes(
                normalizedProjectTarget,
              )
            );
          },
        );

      const relatedPublications =
        connectedPublications.filter(
          (publication) =>
            publication.targets.some(
              (publicationTarget) => {
                const normalizedPublicationTarget =
                  normalizeRelationshipText(
                    publicationTarget,
                  );

                return (
                  normalizedPublicationTarget ===
                    normalizedTarget ||
                  normalizedPublicationTarget.includes(
                    normalizedTarget,
                  ) ||
                  normalizedTarget.includes(
                    normalizedPublicationTarget,
                  )
                );
              },
            ),
        );

      const tessTarget =
        connectedTessTargets.find(
          (target) => {
            const normalizedTessTarget =
              normalizeRelationshipText(
                target.name,
              );

            return (
              normalizedTessTarget ===
                normalizedTarget ||
              normalizedTessTarget.includes(
                normalizedTarget,
              ) ||
              normalizedTarget.includes(
                normalizedTessTarget,
              )
            );
          },
        );

      return {
        name:
          targetName,

        projectSlugs:
          relatedProjects.map(
            (project) =>
              project.slug,
          ),

        publicationSlugs:
          relatedPublications.map(
            (publication) =>
              publication.slug,
          ),

        tessTargetId:
          tessTarget?.id,
      };
    },
  );
}


/*
 * ------------------------------------------------------------------
 * COMPLETE OBSERVATORY RELATIONSHIP
 * ------------------------------------------------------------------
 */

export function getObservatoryResearchRelationship(
  observatoryId:
    GroundObservatoryId,
): ObservatoryResearchRelationship {
  const {
    profile,
  } =
    getGroundObservatoryEntry(
      observatoryId,
    );

  return {
    observatoryId,

    profile,

    facility:
      getFacilityRecordForObservatory(
        observatoryId,
      ),

    researchAreas:
      getResearchAreasForObservatory(
        observatoryId,
      ),

    projects:
      getProjectsForObservatory(
        observatoryId,
      ),

    publications:
      getPublicationsForObservatory(
        observatoryId,
      ),

    galleryRecords:
      getGalleryRecordsForObservatory(
        observatoryId,
      ),

    tessTargets:
      getTessTargetsForObservatory(
        observatoryId,
      ),

    tessSectors:
      getTessSectorsForObservatory(
        observatoryId,
      ),

    tessTimeline:
      getTessTimelineForObservatory(
        observatoryId,
      ),
  };
}


/*
 * ------------------------------------------------------------------
 * SCIENTIFIC CHAIN
 * ------------------------------------------------------------------
 */

export function createObservatoryScienceChain(
  observatoryId:
    GroundObservatoryId,
): ObservatoryScienceChain {
  const relationship =
    getObservatoryResearchRelationship(
      observatoryId,
    );

  const {
    profile,
    facility:
      facilityRecord,
    researchAreas:
      connectedResearchAreas,
    projects:
      connectedProjects,
    publications:
      connectedPublications,
    galleryRecords:
      connectedGallery,
    tessTargets:
      connectedTessTargets,
    tessSectors:
      connectedTessSectors,
    tessTimeline:
      connectedTessTimeline,
  } = relationship;

  const researchTargets =
    getTargetsForObservatory(
      observatoryId,
    );

  const targetRelationships =
    getTargetRelationshipsForObservatory(
      observatoryId,
    );

  const documents =
    getDocumentsForObservatory(
      observatoryId,
    );


  return {
    observatoryId,

    facility:
      profile.scientific
        .facilityLabel,

    instrument:
      profile.scientific
        .instrumentLabel,

    observingMode:
      profile.scientific
        .observingMode,

    dataProduct:
      profile.scientific
        .dataProduct,

    reductionPath:
      profile.scientific
        .reductionPath,

    facilityRecord,

    researchAreas:
      connectedResearchAreas.map(
        (researchArea) => ({
          id:
            researchArea.id,

          slug:
            researchArea.slug,

          title:
            researchArea.title,

          shortTitle:
            researchArea.shortTitle,
        }),
      ),

    projects:
      connectedProjects.map(
        (project) => ({
          id:
            project.id,

          slug:
            project.slug,

          title:
            project.title,

          shortTitle:
            project.shortTitle,

          status:
            project.status,

          target:
            project.target,

          wavelength:
            project.wavelength,
        }),
      ),

    researchTargets,

    targetRelationships,

    publications:
      connectedPublications.map(
        (publication) => ({
          id:
            publication.id,

          slug:
            publication.slug,

          title:
            publication.title,

          year:
            publication.year,

          status:
            publication.status,

          journal:
            publication.journal,

          role:
            publication.role,

          targets:
            publication.targets,

          pdfUrl:
            publication.pdfUrl,
        }),
      ),

    documents,

    gallery:
      uniqueBy(
        connectedGallery,
        (record) =>
          record.id,
      ).map(
        (record) => ({
          id:
            record.id,

          title:
            record.title,

          shortCaption:
            record.shortCaption,

          category:
            record.category,

          src:
            record.src,

          facility:
            record.facility,

          relatedRoute:
            record.relatedRoute,
        }),
      ),

    tess: {
      targets:
        connectedTessTargets.map(
          (target) => ({
            id:
              target.id,

            name:
              target.name,

            category:
              target.category,

            researchFocus:
              target.researchFocus,

            sectorIds:
              target.sectorIds,

            projectSlugs:
              target.projectSlugs,

            publicationSlugs:
              target.publicationSlugs,
          }),
        ),

      sectors:
        connectedTessSectors.map(
          (sector) => ({
            id:
              sector.id,

            label:
              sector.label,

            targetIds:
              sector.targetIds,

            publicationSlugs:
              sector.publicationSlugs,

            evidence:
              sector.evidence,
          }),
        ),

      timeline:
        connectedTessTimeline.map(
          (timelineRecord) => ({
            id:
              timelineRecord.id,

            year:
              timelineRecord.year,

            label:
              timelineRecord.label,

            publicationSlugs:
              timelineRecord.publicationSlugs,
          }),
        ),
    },

    scienceFocus:
      profile.scientific
        .scienceFocus,
  };
}


/*
 * ------------------------------------------------------------------
 * COMPLETE GROUND-OBSERVATORY SCIENCE GRAPH
 * ------------------------------------------------------------------
 */

export const GROUND_OBSERVATORY_SCIENCE_GRAPH =
  Object.freeze(
    Object.fromEntries(
      GROUND_OBSERVATORY_IDS.map(
        (observatoryId) => [
          observatoryId,

          createObservatoryScienceChain(
            observatoryId,
          ),
        ],
      ),
    ),
  ) as Readonly<
    Record<
      GroundObservatoryId,
      ObservatoryScienceChain
    >
  >;


/*
 * ------------------------------------------------------------------
 * VALIDATION
 * ------------------------------------------------------------------
 *
 * Validation now checks both the original Astra Observatory foundation
 * and the newly connected canonical scientific records.
 */

export type ObservatoryRelationshipValidation = {
  valid: boolean;

  observatoryId:
    GroundObservatoryId;

  hasNetworkNode:
    boolean;

  hasFacilityRecord:
    boolean;

  hasResearchRelationship:
    boolean;

  researchAreaCount:
    number;

  projectCount:
    number;

  publicationCount:
    number;

  targetCount:
    number;

  documentCount:
    number;

  galleryCount:
    number;

  tessTargetCount:
    number;

  tessSectorCount:
    number;

  tessTimelineCount:
    number;
};


export function validateObservatoryRelationship(
  observatoryId:
    GroundObservatoryId,
): ObservatoryRelationshipValidation {
  const entry =
    getGroundObservatoryEntry(
      observatoryId,
    );

  const relationship =
    getObservatoryResearchRelationship(
      observatoryId,
    );

  const targets =
    getTargetsForObservatory(
      observatoryId,
    );

  const documents =
    getDocumentsForObservatory(
      observatoryId,
    );

  const hasNetworkNode =
    Boolean(
      entry.networkNode,
    );

  const hasFacilityRecord =
    Boolean(
      relationship.facility,
    );

  const hasResearchRelationship =
    relationship.researchAreas.length >
    0;


  return {
    valid:
      hasNetworkNode &&
      hasFacilityRecord &&
      hasResearchRelationship,

    observatoryId,

    hasNetworkNode,

    hasFacilityRecord,

    hasResearchRelationship,

    researchAreaCount:
      relationship.researchAreas.length,

    projectCount:
      relationship.projects.length,

    publicationCount:
      relationship.publications.length,

    targetCount:
      targets.length,

    documentCount:
      documents.length,

    galleryCount:
      relationship.galleryRecords.length,

    tessTargetCount:
      relationship.tessTargets.length,

    tessSectorCount:
      relationship.tessSectors.length,

    tessTimelineCount:
      relationship.tessTimeline.length,
  };
}


export function validateGroundObservatoryScienceGraph() {
  return GROUND_OBSERVATORY_IDS.map(
    (observatoryId) =>
      validateObservatoryRelationship(
        observatoryId,
      ),
  );
}