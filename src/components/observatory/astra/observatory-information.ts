import {
  GROUND_OBSERVATORY_IDS,
  getGroundObservatoryEntry,
  type GroundObservatoryId,
} from "./observatory-registry";

import {
  createObservatoryScienceChain,
} from "./observatory-relationships";


/*
 * ------------------------------------------------------------------
 * PROJECT DIYA ASTRA
 * Observatory Information System
 * ------------------------------------------------------------------
 *
 * Purpose:
 *
 * Convert the canonical Observatory Registry and Scientific
 * Relationship Engine into concise structured information that can be
 * consumed later by:
 *
 * - Observatory information panels;
 * - cinematic overlays;
 * - scientific cards;
 * - facility journey transitions;
 * - research-story connections.
 *
 * This module intentionally contains no React and no Three.js code.
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
  | "research";


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

  sections:
    readonly ObservatoryInformationSection[];
};


/*
 * ------------------------------------------------------------------
 * FACILITY-SPECIFIC PRESENTATION HELPERS
 * ------------------------------------------------------------------
 *
 * These helpers do not redefine the scientific content.
 *
 * They only provide concise visitor-facing wording based on the
 * canonical registry + relationship data.
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


  const researchAreaTitles =
    scienceChain.researchAreas.map(
      (researchArea) =>
        researchArea.shortTitle,
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

    ],
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