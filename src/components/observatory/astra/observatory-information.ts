import {
  GROUND_OBSERVATORY_IDS,
  getGroundObservatoryEntry,
  type GroundObservatoryId,
} from "./observatory-registry";

import {
  createObservatoryScienceChain,
} from "./observatory-relationships";

import {
  ASTRA_OBSERVATORY_SIMULATION_PROVENANCE,
  type ProvenanceRecord,
} from "@/data/provenance";


/*
 * ------------------------------------------------------------------
 * PROJECT DIYA ASTRA
 * Observatory Information System
 * ------------------------------------------------------------------
 *
 * Purpose:
 *
 * Convert the canonical Observatory Registry and unified Scientific
 * Relationship Engine into concise structured information that can be
 * consumed later by:
 *
 * - Observatory information panels;
 * - cinematic overlays;
 * - scientific cards;
 * - facility journey transitions;
 * - Gallery Story;
 * - Research Story;
 * - publication / document connections;
 * - TESS research connections;
 * - provenance / transparency interfaces.
 *
 *
 * IMPORTANT ARCHITECTURE RULE:
 *
 * This module does not create a second scientific database.
 *
 * Scientific relationships remain derived from the canonical website
 * records through observatory-relationships.ts.
 *
 *
 * IMPORTANT PROVENANCE RULE:
 *
 * DOT, HCT and uGMRT are real scientific facilities.
 *
 * Their Project Astra 3D environments are reconstructed scientific
 * visualisations.
 *
 * Provenance therefore describes the VISUAL REPRESENTATION, not the
 * scientific authenticity or physical existence of the facility.
 *
 *
 * This module intentionally contains:
 *
 * - no React;
 * - no Three.js;
 * - no camera logic;
 * - no GLB logic;
 * - no environment-rendering logic.
 */


/*
 * ------------------------------------------------------------------
 * TYPES
 * ------------------------------------------------------------------
 */

export type ObservatoryInformationSectionId =
  | "facility"
  | "instrument"
  | "data"
  | "pipeline"
  | "science"
  | "research"
  | "projects"
  | "publications"
  | "gallery"
  | "tess";


export type ObservatoryInformationSection = {
  id:
    ObservatoryInformationSectionId;

  label:
    string;

  headline:
    string;

  summary:
    string;

  items:
    readonly string[];
};


export type ObservatoryInformationProject = {
  id:
    string;

  slug:
    string;

  title:
    string;

  shortTitle:
    string;

  status:
    string;

  target:
    string;

  wavelength:
    string;
};


export type ObservatoryInformationPublication = {
  id:
    string;

  slug:
    string;

  title:
    string;

  year:
    number;

  status:
    string;

  journal:
    string;

  role:
    string;

  targets:
    readonly string[];

  pdfUrl?:
    string;
};


export type ObservatoryInformationDocument = {
  publicationSlug:
    string;

  publicationTitle:
    string;

  pdfUrl:
    string;
};


export type ObservatoryInformationGalleryRecord = {
  id:
    string;

  title:
    string;

  shortCaption:
    string;

  category:
    string;

  src:
    string;

  facility?:
    string;

    relatedRoute?:
    {
      to:
        string;

      label:
        string;
    };
};


export type ObservatoryInformationTessTarget = {
  id:
    string;

  name:
    string;

  category:
    string;

  researchFocus:
    string;

  sectorIds:
    readonly number[];

  projectSlugs:
    readonly string[];

  publicationSlugs:
    readonly string[];
};


export type ObservatoryInformationTessSector = {
  id:
    number;

  label:
    string;

  targetIds:
    readonly string[];

  publicationSlugs:
    readonly string[];

  evidence:
    string;
};


export type ObservatoryInformationTessTimelineRecord = {
  id:
    string;

  year:
    number;

  label:
    string;

  publicationSlugs:
    readonly string[];
};


export type ObservatoryInformationProfile = {
  observatoryId:
    GroundObservatoryId;

  shortName:
    string;

  fullName:
    string;

  location:
    string;

  coordinates:
    string | null;

  domain:
    string;

  environment:
    string;

  /*
   * Visitor-facing structured information.
   *
   * The original six sections remain present. Additional relationship
   * sections expose the richer scientific graph.
   */
  sections:
    readonly ObservatoryInformationSection[];

  /*
   * Structured scientific relationships.
   *
   * These allow later React interfaces to build richer cards, links,
   * story panels and navigation without parsing presentation strings.
   */
  projects:
    readonly ObservatoryInformationProject[];

  targets:
    readonly string[];

  publications:
    readonly ObservatoryInformationPublication[];

  documents:
    readonly ObservatoryInformationDocument[];

  gallery:
    readonly ObservatoryInformationGalleryRecord[];

  tess:
    {
      targets:
        readonly ObservatoryInformationTessTarget[];

      sectors:
        readonly ObservatoryInformationTessSector[];

      timeline:
        readonly ObservatoryInformationTessTimelineRecord[];
    };

  /*
   * Provenance describes the Project Astra visual reconstruction.
   *
   * It does NOT describe the real facility itself as AI-generated.
   */
  provenance:
    ProvenanceRecord;
};


/*
 * ------------------------------------------------------------------
 * FACILITY-SPECIFIC PRESENTATION HELPERS
 * ------------------------------------------------------------------
 *
 * These helpers do not redefine scientific content.
 *
 * They provide concise visitor-facing wording based on the canonical
 * Observatory Registry and Scientific Relationship Engine.
 */

function createFacilitySummary(
  observatoryId:
    GroundObservatoryId,
) {
  switch (observatoryId) {
    case "ugmrt":
      return (
        "A distributed radio-interferometer array of 30 fully steerable 45-m antennas."
      );

    case "hct":
      return (
        "A 2.01-m optical telescope at the high-altitude Indian Astronomical Observatory in Hanle."
      );

    case "dot":
      return (
        "A 3.6-m optical telescope at Devasthal Observatory in the forested Himalayan region."
      );
  }
}


function createInstrumentSummary(
  observatoryId:
    GroundObservatoryId,
) {
  switch (observatoryId) {
    case "ugmrt":
      return (
        "The GMRT Wideband Backend processes digitized antenna signals for interferometric correlation and visibility generation."
      );

    case "hct":
      return (
        "HFOSC provides optical imaging and spectroscopy, including the Grism 7 and Grism 8 configurations used in Diya's work."
      );

    case "dot":
      return (
        "TANSPEC provides cross-dispersed optical and near-infrared spectroscopy for M-dwarf activity studies."
      );
  }
}


/*
 * ------------------------------------------------------------------
 * RELATIONSHIP PRESENTATION HELPERS
 * ------------------------------------------------------------------
 */

function createProjectItems(
  projects:
    readonly ObservatoryInformationProject[],
): string[] {
  return projects.map(
    (project) =>
      `${project.shortTitle} — ${project.target}`,
  );
}


function createPublicationItems(
  publications:
    readonly ObservatoryInformationPublication[],
): string[] {
  return publications.map(
    (publication) =>
      `${publication.year} · ${publication.title}`,
  );
}


function createGalleryItems(
  gallery:
    readonly ObservatoryInformationGalleryRecord[],
): string[] {
  return gallery.map(
    (record) =>
      record.title,
  );
}


function createTessItems(
  tessTargets:
    readonly ObservatoryInformationTessTarget[],
): string[] {
  return tessTargets.map(
    (target) => {
      if (
        target.sectorIds.length ===
        0
      ) {
        return (
          `${target.name} — verified TESS research connection`
        );
      }

      return (
        `${target.name} — TESS ${target.sectorIds
          .map(
            (sectorId) =>
              `Sector ${sectorId}`,
          )
          .join(", ")}`
      );
    },
  );
}


/*
 * ------------------------------------------------------------------
 * INFORMATION PROFILE BUILDER
 * ------------------------------------------------------------------
 */

export function createObservatoryInformationProfile(
  observatoryId:
    GroundObservatoryId,
): ObservatoryInformationProfile {
  const {
    profile,
    networkNode,
  } =
    getGroundObservatoryEntry(
      observatoryId,
    );

  const scienceChain =
    createObservatoryScienceChain(
      observatoryId,
    );


  if (!networkNode) {
    throw new Error(
      `Missing geographic network node for Observatory: ${observatoryId}`,
    );
  }


  /*
   * --------------------------------------------------------------
   * RESEARCH AREAS
   * --------------------------------------------------------------
   */

  const researchAreaTitles =
    scienceChain.researchAreas.map(
      (researchArea) =>
        researchArea.shortTitle,
    );


  /*
   * --------------------------------------------------------------
   * STRUCTURED RELATIONSHIPS
   * --------------------------------------------------------------
   */

  const projects:
    ObservatoryInformationProject[] =
    scienceChain.projects.map(
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
    );


  const publications:
    ObservatoryInformationPublication[] =
    scienceChain.publications.map(
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
    );


  const documents:
    ObservatoryInformationDocument[] =
    scienceChain.documents.map(
      (document) => ({
        publicationSlug:
          document.publicationSlug,

        publicationTitle:
          document.publicationTitle,

        pdfUrl:
          document.pdfUrl,
      }),
    );


  const gallery:
    ObservatoryInformationGalleryRecord[] =
    scienceChain.gallery.map(
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
    );


  const tessTargets:
    ObservatoryInformationTessTarget[] =
    scienceChain.tess.targets.map(
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
    );


  const tessSectors:
    ObservatoryInformationTessSector[] =
    scienceChain.tess.sectors.map(
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
    );


  const tessTimeline:
    ObservatoryInformationTessTimelineRecord[] =
    scienceChain.tess.timeline.map(
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
    );


  /*
   * --------------------------------------------------------------
   * VISITOR-FACING SECTION ITEMS
   * --------------------------------------------------------------
   */

  const projectItems =
    createProjectItems(
      projects,
    );

  const publicationItems =
    createPublicationItems(
      publications,
    );

  const galleryItems =
    createGalleryItems(
      gallery,
    );

  const tessItems =
    createTessItems(
      tessTargets,
    );


  return {
    observatoryId,

    shortName:
      networkNode.shortName,

    fullName:
      networkNode.fullName,

    location:
      networkNode.location,

    coordinates:
      networkNode.coordsLabel ??
      null,

    domain:
      networkNode.domain,

    environment:
      profile.destination
        .environmentLabel,


    /*
     * --------------------------------------------------------------
     * INFORMATION SECTIONS
     * --------------------------------------------------------------
     */

    sections: [

      /*
       * --------------------------------------------------------------
       * FACILITY
       * --------------------------------------------------------------
       */

      {
        id:
          "facility",

        label:
          "Facility",

        headline:
          profile.scientific
            .facilityLabel,

        summary:
          createFacilitySummary(
            observatoryId,
          ),

        items:
          profile.destination
            .environmentCues,
      },


      /*
       * --------------------------------------------------------------
       * INSTRUMENT / BACKEND
       * --------------------------------------------------------------
       */

      {
        id:
          "instrument",

        label:
          observatoryId === "ugmrt"
            ? "Backend"
            : "Instrument",

        headline:
          profile.scientific
            .instrumentLabel,

        summary:
          createInstrumentSummary(
            observatoryId,
          ),

        items: [
          profile.scientific
            .observingMode,
        ],
      },


      /*
       * --------------------------------------------------------------
       * DATA
       * --------------------------------------------------------------
       */

      {
        id:
          "data",

        label:
          "Data",

        headline:
          profile.scientific
            .dataProduct,

        summary:
          `Primary scientific data product associated with ${networkNode.shortName}.`,

        items: [
          profile.scientific
            .dataProduct,
        ],
      },


      /*
       * --------------------------------------------------------------
       * PIPELINE
       * --------------------------------------------------------------
       */

      {
        id:
          "pipeline",

        label:
          "Reduction & Analysis",

        headline:
          "Scientific processing workflow",

        summary:
          "The observation-to-science path used to transform raw measurements into scientifically interpretable results.",

        items:
          scienceChain
            .reductionPath,
      },


      /*
       * --------------------------------------------------------------
       * SCIENCE
       * --------------------------------------------------------------
       */

      {
        id:
          "science",

        label:
          "Science",

        headline:
          "Scientific objective",

        summary:
          scienceChain
            .scienceFocus,

        items:
          scienceChain
            .researchTargets,
      },


      /*
       * --------------------------------------------------------------
       * RESEARCH CONNECTION
       * --------------------------------------------------------------
       */

      {
        id:
          "research",

        label:
          "Research Connection",

        headline:
          "Connected research areas",

        summary:
          "Links this Observatory to the wider Project Astra research story.",

        items:
          researchAreaTitles,
      },


      /*
       * --------------------------------------------------------------
       * PROJECTS
       * --------------------------------------------------------------
       */

      {
        id:
          "projects",

        label:
          "Projects",

        headline:
          "Connected research projects",

        summary:
          projects.length > 0
            ? `${projects.length} verified project connection${projects.length === 1 ? "" : "s"} derived from the portfolio's canonical project records.`
            : "No direct project relationship is currently represented in the canonical project records.",

        items:
          projectItems,
      },


      /*
       * --------------------------------------------------------------
       * PUBLICATIONS
       * --------------------------------------------------------------
       */

      {
        id:
          "publications",

        label:
          "Publications",

        headline:
          "Connected scientific publications",

        summary:
          publications.length > 0
            ? `${publications.length} publication connection${publications.length === 1 ? "" : "s"} associated with this Observatory through verified facility and project records.`
            : "No direct publication relationship is currently represented in the canonical publication records.",

        items:
          publicationItems,
      },


      /*
       * --------------------------------------------------------------
       * GALLERY
       * --------------------------------------------------------------
       */

      {
        id:
          "gallery",

        label:
          "Gallery",

        headline:
          "Observing and facility archive",

        summary:
          gallery.length > 0
            ? `${gallery.length} related Gallery record${gallery.length === 1 ? "" : "s"} connect this Observatory to Diya's visual research archive.`
            : "No directly matched Gallery records are currently represented for this Observatory.",

        items:
          galleryItems,
      },


      /*
       * --------------------------------------------------------------
       * TESS
       * --------------------------------------------------------------
       */

      {
        id:
          "tess",

        label:
          "TESS Connection",

        headline:
          "Multi-wavelength research links",

        summary:
          tessTargets.length > 0
            ? `${tessTargets.length} verified target connection${tessTargets.length === 1 ? "" : "s"} link this Observatory to the existing TESS research system.`
            : "No direct TESS relationship is currently represented by the verified TESS target registry.",

        items:
          tessItems,
      },

    ],


    /*
     * --------------------------------------------------------------
     * STRUCTURED RELATIONSHIP DATA
     * --------------------------------------------------------------
     */

    projects,

    targets:
      scienceChain
        .researchTargets,

    publications,

    documents,

    gallery,

    tess: {
      targets:
        tessTargets,

      sectors:
        tessSectors,

      timeline:
        tessTimeline,
    },


    /*
     * --------------------------------------------------------------
     * REPRESENTATION PROVENANCE
     * --------------------------------------------------------------
     *
     * This is intentionally attached to the information profile so a
     * later visitor-facing panel can display the disclosure without
     * importing provenance rules directly.
     */

    provenance:
      ASTRA_OBSERVATORY_SIMULATION_PROVENANCE,
  };
}


/*
 * ------------------------------------------------------------------
 * COMPLETE INFORMATION REGISTRY
 * ------------------------------------------------------------------
 */

export const GROUND_OBSERVATORY_INFORMATION =
  Object.freeze(
    Object.fromEntries(
      GROUND_OBSERVATORY_IDS.map(
        (
          observatoryId,
        ) => [
          observatoryId,

          createObservatoryInformationProfile(
            observatoryId,
          ),
        ],
      ),
    ),
  ) as Readonly<
    Record<
      GroundObservatoryId,
      ObservatoryInformationProfile
    >
  >;


/*
 * ------------------------------------------------------------------
 * LOOKUP
 * ------------------------------------------------------------------
 */

export function getObservatoryInformation(
  observatoryId:
    GroundObservatoryId,
) {
  return GROUND_OBSERVATORY_INFORMATION[
    observatoryId
  ];
}


/*
 * ------------------------------------------------------------------
 * INFORMATION VALIDATION
 * ------------------------------------------------------------------
 *
 * This validates the visitor-facing scientific-information foundation.
 *
 * Empty optional relationship collections do not make a profile
 * invalid because the canonical source may legitimately expose no
 * direct record for a particular relationship.
 *
 * Core Observatory identity, scientific sections and provenance are
 * mandatory.
 */

export function validateObservatoryInformation() {
  return GROUND_OBSERVATORY_IDS.map(
    (
      observatoryId,
    ) => {
      const information =
        getObservatoryInformation(
          observatoryId,
        );

      return {
        observatoryId,

        valid:
          Boolean(
            information &&
            information.shortName &&
            information.fullName &&
            information.sections.length >= 6 &&
            information.provenance,
          ),

        sectionCount:
          information.sections.length,

        projectCount:
          information.projects.length,

        targetCount:
          information.targets.length,

        publicationCount:
          information.publications.length,

        documentCount:
          information.documents.length,

        galleryCount:
          information.gallery.length,

        tessTargetCount:
          information.tess.targets.length,

        tessSectorCount:
          information.tess.sectors.length,

        tessTimelineCount:
          information.tess.timeline.length,

        provenanceId:
          information.provenance.id,

        provenanceLabel:
          information.provenance.label,
      };
    },
  );
}