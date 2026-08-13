import {
  ASTRA_OBSERVATORY_SIMULATION_PROVENANCE,
  type ProvenanceRecord,
} from "@/data/provenance";

import {
  GROUND_OBSERVATORY_IDS,
  getGroundObservatoryEntry,
  type GroundObservatoryId,
} from "./observatory-registry";

import {
  getObservatoryInformation,
} from "./observatory-information";


/*
 * ------------------------------------------------------------------
 * PROJECT DIYA ASTRA
 * Cinematic Destination Profiles
 * ------------------------------------------------------------------
 *
 * Purpose:
 *
 * Define the reusable environment contract for the three ground
 * observatories before any procedural Three.js environment is built.
 *
 * This file remains:
 *
 * - data-only;
 * - rendering-engine independent;
 * - camera independent;
 * - React independent.
 *
 * It tells later environment builders WHAT each destination must feel
 * like and WHAT scientific/facility identity must remain visible.
 *
 * PROVENANCE RULE:
 *
 * The observatories represented here are real scientific facilities.
 *
 * The Project Astra destination environments are reconstructed
 * scientific visualisations.
 *
 * Therefore every destination carries explicit representation
 * provenance so visitor-facing systems can clearly distinguish:
 *
 * REAL FACILITY
 *
 * from:
 *
 * AI-ASSISTED / COMPUTER-GENERATED VISUAL REPRESENTATION.
 */


/*
 * ------------------------------------------------------------------
 * TYPES
 * ------------------------------------------------------------------
 */

export type ObservatoryLightingPhase =
  | "day"
  | "golden-hour"
  | "sunset"
  | "twilight"
  | "blue-hour"
  | "night";


export type ObservatoryTerrainProfile = {
  terrainClass:
    | "distributed-radio-array"
    | "cold-desert-plateau"
    | "forested-himalayan-ridges";

  elevationCharacter:
    string;

  vegetationCharacter:
    string;

  atmosphericCharacter:
    string;

  skyCharacter:
    string;
};


export type ObservatoryFacilityRepresentation = {
  type:
    | "radio-array"
    | "telescope-dome";

  primaryIdentity:
    string;

  representationRules:
    readonly string[];

  minimumRecognizableElements:
    readonly string[];
};


export type ObservatoryEnvironmentProfile = {
  observatoryId:
    GroundObservatoryId;

  environmentName:
    string;

  terrain:
    ObservatoryTerrainProfile;

  lightingSequence:
    readonly ObservatoryLightingPhase[];

  facility:
    ObservatoryFacilityRepresentation;

  scientificAnchor:
    string;

  informationHeadline:
    string;

  /*
   * Provenance belongs to the generated / reconstructed representation,
   * not to the real Observatory itself.
   */
  provenance:
    ProvenanceRecord;
};


/*
 * ------------------------------------------------------------------
 * uGMRT
 * ------------------------------------------------------------------
 */

const UGMRT_DESTINATION:
  ObservatoryEnvironmentProfile =
{
  observatoryId:
    "ugmrt",

  environmentName:
    "uGMRT Radio Array Landscape",

  terrain: {
    terrainClass:
      "distributed-radio-array",

    elevationCharacter:
      "Broad low-relief rural terrain with sufficient depth to communicate the physical scale of the array.",

    vegetationCharacter:
      "Sparse rural vegetation, agricultural-field character and open ground without dense mountain forest.",

    atmosphericCharacter:
      "Clear-to-light atmospheric haze supporting long-distance visibility across the array.",

    skyCharacter:
      "Large open sky emphasizing the spatial extent of the interferometer.",
  },

  lightingSequence: [
    "day",
    "golden-hour",
    "twilight",
  ],

  facility: {
    type:
      "radio-array",

    primaryIdentity:
      "The distributed 30 × 45-m antenna array.",

    representationRules: [
      "Do not represent uGMRT as a single isolated radio dish.",
      "Preserve a denser central-array impression.",
      "Preserve three extended Y-shaped arm directions.",
      "Use one optimized antenna master and instance it.",
      "Keep the array visually readable at both overview and closer facility scales.",
    ],

    minimumRecognizableElements: [
      "Multiple 45-m class dishes",
      "Central-array density",
      "Extended antenna distribution",
      "Three-arm geometry",
      "Large rural physical scale",
    ],
  },

  scientificAnchor:
    "GMRT Wideband Backend (GWB) → interferometric visibilities",

  informationHeadline:
    "30-antenna low-frequency radio interferometer",

  provenance:
    ASTRA_OBSERVATORY_SIMULATION_PROVENANCE,
};


/*
 * ------------------------------------------------------------------
 * HCT / HANLE
 * ------------------------------------------------------------------
 */

const HCT_DESTINATION:
  ObservatoryEnvironmentProfile =
{
  observatoryId:
    "hct",

  environmentName:
    "HCT Hanle High-Altitude Observatory",

  terrain: {
    terrainClass:
      "cold-desert-plateau",

    elevationCharacter:
      "High-altitude plateau surrounded by dry mountain forms and distant rocky relief.",

    vegetationCharacter:
      "Extremely sparse vegetation with exposed dry terrain.",

    atmosphericCharacter:
      "Thin, clear high-altitude atmosphere with restrained haze.",

    skyCharacter:
      "Large open observing sky with a strong sense of remoteness and altitude.",
  },

  lightingSequence: [
    "day",
    "golden-hour",
    "blue-hour",
    "night",
  ],

  facility: {
    type:
      "telescope-dome",

    primaryIdentity:
      "The 2.01-m Himalayan Chandra Telescope dome and observatory plateau.",

    representationRules: [
      "Keep the terrain visually distinct from Devasthal.",
      "Do not introduce dense Himalayan forest language.",
      "Preserve the isolated observatory-plateau character.",
      "The HCT dome must remain the primary facility landmark.",
      "Avoid generic alpine-resort visual language.",
    ],

    minimumRecognizableElements: [
      "HCT dome",
      "Observatory plateau",
      "Sparse rocky terrain",
      "Dry mountain background",
      "Large high-altitude sky",
    ],
  },

  scientificAnchor:
    "HFOSC → optical spectroscopy → chromospheric diagnostics",

  informationHeadline:
    "2.01-m optical telescope at Hanle",

  provenance:
    ASTRA_OBSERVATORY_SIMULATION_PROVENANCE,
};


/*
 * ------------------------------------------------------------------
 * DOT / DEVASTHAL
 * ------------------------------------------------------------------
 */

const DOT_DESTINATION:
  ObservatoryEnvironmentProfile =
{
  observatoryId:
    "dot",

  environmentName:
    "DOT Devasthal Himalayan Observatory",

  terrain: {
    terrainClass:
      "forested-himalayan-ridges",

    elevationCharacter:
      "Multiple layered Himalayan ridge systems with visible valley depth and observatory-site elevation.",

    vegetationCharacter:
      "Forested mountain slopes with varied tree-density bands and open observatory clearings.",

    atmosphericCharacter:
      "Layered atmospheric haze increasing with distance to create deep Himalayan scale.",

    skyCharacter:
      "Clear mountain observing sky supporting daylight through blue-hour transitions.",
  },

  lightingSequence: [
    "day",
    "golden-hour",
    "sunset",
    "twilight",
    "blue-hour",
    "night",
  ],

  facility: {
    type:
      "telescope-dome",

    primaryIdentity:
      "The 3.6-m Devasthal Optical Telescope within the forested Devasthal mountain environment.",

    representationRules: [
      "The environment must read specifically as Devasthal rather than generic mountains.",
      "Use multiple ridge layers rather than one simple hill.",
      "Preserve strong forested-slope identity.",
      "Maintain deep-valley atmospheric perspective.",
      "Keep the DOT dome readable against the terrain.",
      "Allow the prepared daylight-to-blue-hour identity to guide later cinematic lighting.",
    ],

    minimumRecognizableElements: [
      "3.6-m DOT dome",
      "Forested Himalayan slopes",
      "Multiple ridge layers",
      "Deep valley depth",
      "Atmospheric distance haze",
    ],
  },

  scientificAnchor:
    "TANSPEC → optical / near-infrared spectroscopy",

  informationHeadline:
    "3.6-m optical / near-infrared telescope at Devasthal",

  provenance:
    ASTRA_OBSERVATORY_SIMULATION_PROVENANCE,
};


/*
 * ------------------------------------------------------------------
 * CANONICAL DESTINATION REGISTRY
 * ------------------------------------------------------------------
 */

export const GROUND_OBSERVATORY_DESTINATIONS =
  Object.freeze({
    ugmrt:
      UGMRT_DESTINATION,

    hct:
      HCT_DESTINATION,

    dot:
      DOT_DESTINATION,
  }) satisfies Readonly<
    Record<
      GroundObservatoryId,
      ObservatoryEnvironmentProfile
    >
  >;


/*
 * ------------------------------------------------------------------
 * LOOKUP
 * ------------------------------------------------------------------
 */

export function getObservatoryDestination(
  observatoryId:
    GroundObservatoryId,
): ObservatoryEnvironmentProfile {
  return GROUND_OBSERVATORY_DESTINATIONS[
    observatoryId
  ];
}


/*
 * ------------------------------------------------------------------
 * COMPLETE DESTINATION CONTRACT
 * ------------------------------------------------------------------
 *
 * Combines:
 *
 * - geographic identity;
 * - scientific identity;
 * - visitor information;
 * - procedural-environment contract;
 * - representation provenance.
 *
 * Later Three.js / React visitor-facing systems can consume this
 * without reaching directly into multiple unrelated datasets.
 */

export function getCompleteObservatoryDestination(
  observatoryId:
    GroundObservatoryId,
) {
  const {
    profile,
    networkNode,
  } =
    getGroundObservatoryEntry(
      observatoryId,
    );

  const information =
    getObservatoryInformation(
      observatoryId,
    );

  const destination =
    getObservatoryDestination(
      observatoryId,
    );

  if (!networkNode) {
    throw new Error(
      `Missing Observatory network node: ${observatoryId}`,
    );
  }

  return {
    observatoryId,

    networkNode,

    profile,

    information,

    destination,

    provenance:
      destination.provenance,
  };
}


/*
 * ------------------------------------------------------------------
 * VALIDATION
 * ------------------------------------------------------------------
 *
 * Validation now includes representation provenance.
 *
 * This protects Project Astra from silently introducing a generated
 * Observatory destination without the required transparency metadata.
 */

export function validateObservatoryDestinations() {
  return GROUND_OBSERVATORY_IDS.map(
    (
      observatoryId,
    ) => {
      const complete =
        getCompleteObservatoryDestination(
          observatoryId,
        );

      return {
        observatoryId,

        valid:
          Boolean(
            complete.networkNode &&
            complete.destination &&
            complete.information &&
            complete.provenance,
          ),

        terrainClass:
          complete.destination
            .terrain
            .terrainClass,

        facilityType:
          complete.destination
            .facility
            .type,

        scientificAnchor:
          complete.destination
            .scientificAnchor,

        provenanceId:
          complete.provenance
            .id,

        provenanceLabel:
          complete.provenance
            .label,
      };
    },
  );
}